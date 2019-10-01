import React, { Component } from 'react';
import {
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  View,
  Image,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import NetInfo from "@react-native-community/netinfo";

// Libraries
import FastImage from 'react-native-fast-image'

// Redux
import { connect } from 'react-redux';
import ImageZoom from 'react-native-image-pan-zoom';
import {
  Button,
} from 'native-base';
import videoActions from './actions/VideoScreen';
import modalActions from './actions/Modal';
import channelActions from './screens/Channel/actions';
import deviceInfoActions from './actions/DeviceInfo';
import loginActions from './screens/Login/actions';
import feedActions from './screens/Feed/actions';
import bookmarkActions from './screens/Bookmark/actions';

// Config
import config from './config';

// Navigator
import { AppNavigator } from './navigators/AppNavigator';

// Component
import DxModal from './components/DxModal';
import DownloadModal from './components/DownloadModal';
import PromoModal from './components/PromoModal';
import AppVersionModal from './components/AppVersionModal';
import LanguageModalContainer from './screens/Language/components/container/LanguageModalContainer';
import BackgroundTextModal from './components/BackgroundTextModal';
import BackgroundImageTextModal from './components/BackgroundImageTextModal';
import BackgroundImageTextModal2 from './components/BackgroundImageTextModal2';
import UserConsentModal from './modals/UserConsentModal';
import UpdateUserSyncConsentModal from './modals/UpdateUserSyncConsentModal';
import UserSyncModal from './modals/UserSyncModal';
import ChannelInfoModal from './components/ChannelInfoModal';
import EmbeddedLinkModal from './components/EmbeddedLinkModal';
import SearchScreen from './screens/Search/SearchScreen';
import SectionSearch from './screens/Search/components/layout/SectionSearch';

import { TextSize } from './styles/types';

// Utils
import { getRootPath } from './utils/fileSystem';
import * as helpers from './helpers';

const maxPopupWidth = Dimensions.get('window').width;
const maxPopupHeight = Dimensions.get('window').width;

class AppContainer extends Component {
  static propTypes = {
    fetchUserInfoRequest: PropTypes.func,
    deviceInfo: PropTypes.object,
    storeConfig: PropTypes.object,
    heartbeatRequest: PropTypes.func,
    isAppInfoFetched: PropTypes.bool,
    languageModalOpen: PropTypes.func,
    modal: PropTypes.object,
    modalOpen: PropTypes.bool,
    modalType: PropTypes.string,
    closeModal: PropTypes.func,
    minimizeAppActionRequest: PropTypes.func,
    isConnected: PropTypes.bool,
    fetchAppInfoRequest: PropTypes.func,
    isAuthenticated: PropTypes.bool,
    languageGUID: PropTypes.string,
    languages: PropTypes.array,
    language: PropTypes.object,
    isHeartBeatV0Done: PropTypes.bool,
    isHeartBeatDone: PropTypes.bool,
    heartbeatV0Request: PropTypes.func,
    currentAppVersion: PropTypes.string,
    selectedLanguage: PropTypes.object,
    links: PropTypes.array,
    newAppVersion: PropTypes.string,
    userGUID: PropTypes.string,
    isLoggingIn: PropTypes.bool,
    isLanguageSetSuccess: PropTypes.bool,
    isUserInfoFetched: PropTypes.bool,
    numberOfClicks: PropTypes.string,
    IsMenuClick: PropTypes.bool,
    ExperienceStreamGUID: PropTypes.string,
  }

  componentDidMount() {
    const { appVersion } = config;
    const userData = {
      appVersion,
    };
    // Get App Info
    this.props.fetchAppInfoRequest(userData);

    // Login Flow
    Linking.addEventListener('url', this.handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink({
          url,
        });
      }
    });
  }

  componentWillReceiveProps = async (nextProps) => {
    const {
      currentTab,
      isFetchFirstLoadDone,
      deviceInfo,
      isHeartBeatDone,
      isHeartBeatV0Done,
      isAppInfoFetched,
      isConnected,
      isAuthenticated,
      isLoggingIn,
      isLanguageSetSuccess,
      isUserInfoFetched,
      isFirstGetIn
    } = this.props;

    const { appVersion } = config;

    if (!isFirstGetIn && nextProps.isFirstGetIn) {
      const formattedParams = {
        stream: nextProps.experienceStreamWithChannelInfo,
        offline: !isConnected,
        currentTab,
      };
      if (nextProps.previousTab == 'Bookmark'
        || nextProps.previousTab == 'BookmarkCardPage'
        || nextProps.previousTab == 'PAGES') {
        this.props.postBookmarkStreamCardContentV2Request(formattedParams);
      } else {
        this.props.postStreamCardContentV2Request(formattedParams);
      }
    }

    // offline already logged in
    if (Platform.OS == 'ios') {
      if (!isConnected) {
        if (!isAuthenticated
          && nextProps.isAuthenticated
          && nextProps.reopenApp) {
          if (nextProps.offlineReopenApp && nextProps.offlineUserGUID) {
            this.props.fetchLoadFirstRequest(); // Load first flow
          }
        }
      }
    }
    if (Platform.OS == 'android') {
      if (!isAuthenticated
        && nextProps.isAuthenticated
        && nextProps.reopenApp) {
        const checkInternetRes = await checkInternet();
        if (!checkInternetRes) {
          if (nextProps.offlineReopenApp && nextProps.offlineUserGUID) {
            this.props.fetchLoadFirstRequest(); // Load first flow
          }
        }
      }
    }

    if (isConnected) {

      const checkInternetRes = await checkInternet();

      // 1. not login & isAppInfoFetched
      // 2. before login & mini app & cancel on keycloak
      if (
        (!isAuthenticated && !nextProps.isAuthenticated && !isAppInfoFetched && nextProps.isAppInfoFetched)
        || (isAppInfoFetched && nextProps.deviceInfo.appState !== deviceInfo.appState && nextProps.deviceInfo.appState === 'active' && !isLoggingIn)
      ) {
        if (!isAuthenticated) {
          if (checkInternetRes) this.props.heartbeatV0Request(appVersion);
        }
      }

      // login flow  OR Loggedin reopen
      if (!isAuthenticated && nextProps.isAuthenticated) {
        if (checkInternetRes) {
          this.props.fetchLoadFirstRequest(); // Load first flow
        }
      }

      // After first load done
      if (!isFetchFirstLoadDone && nextProps.isFetchFirstLoadDone) {
        if (checkInternetRes) {
          this.props.heartbeatRequest(appVersion);
        }
      }

      // After loggined, minimize heartbeat
      if (nextProps.deviceInfo.appState !== deviceInfo.appState && nextProps.deviceInfo.appState === 'active' && isAuthenticated) {
        if (checkInternetRes) this.props.heartbeatRequest(appVersion);
      }

      // Before Login heartbeat open language modal
      if (!isHeartBeatV0Done && nextProps.isHeartBeatV0Done
        && !nextProps.languageGUID && nextProps.languages.length > 1
      ) {
        this.props.languageModalOpen();
      }

      // After Login heartbeat
      if (!isHeartBeatDone && nextProps.isHeartBeatDone) {
        // Language Modal
        if (!nextProps.languageGUID && nextProps.languages.length > 1) {
          this.props.languageModalOpen();
        } else if (!isUserInfoFetched) {
          // Get UserInfo
          this.props.fetchUserInfoRequest(nextProps.userGUID);
        } else if (isUserInfoFetched) {
          // Get UserInfo - new flow for data sync
          this.props.fetchUserInfoRequest(nextProps.userGUID);
        }
      }

      // auto skip login
      if (!isHeartBeatV0Done && nextProps.isHeartBeatV0Done && nextProps.languageGUID) {
        if (!nextProps.isLoginRequired && nextProps.isAnonymous) {
          if (checkInternetRes) this.props.anonymousLoginRequest();
        }
      }
      if (!isLanguageSetSuccess && nextProps.isLanguageSetSuccess && !isUserInfoFetched && !isAuthenticated) {
        if (!nextProps.isLoginRequired && nextProps.isAnonymous) {
          if (checkInternetRes) this.props.anonymousLoginRequest();
        }
      }
      if (isAuthenticated && !nextProps.isAuthenticated) {
        if (!nextProps.isLoginRequired && nextProps.isAnonymous && nextProps.isHeartBeatDone) {
          if (checkInternetRes) this.props.anonymousLoginRequest();
        }
      }

      // auto skip login
      // If language set success fetch userInfo again
      if (!isLanguageSetSuccess && nextProps.isLanguageSetSuccess && !isUserInfoFetched && isAuthenticated) {
        this.props.fetchUserInfoRequest(nextProps.userGUID);
      }

      // Minimize App action
      if (nextProps.deviceInfo.appState !== deviceInfo.appState
        && ((nextProps.deviceInfo.appState == 'inactive' && Platform.OS == 'ios')
          || (nextProps.deviceInfo.appState == 'background' && Platform.OS == 'android'))
      ) {
        this.props.minimizeAppActionRequest();
      }

      // Logout
      if (isAuthenticated && !nextProps.isAuthenticated) {
        if (!nextProps.isHeartBeatDone) {
          if (checkInternetRes) this.props.heartbeatV0Request(appVersion);
        }
      }

    }

    // reconnect internet heartbeat
    if (!isConnected && nextProps.isConnected && nextProps.isAuthenticated) {
      this.props.heartbeatRequest(appVersion);
    }

    if (!isConnected && nextProps.isConnected && !nextProps.isAuthenticated) {
      this.props.heartbeatV0Request(appVersion);
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleDeepLink);
  }

  handleDeepLink = ({ url }) => {
    // #1 Login redirect with code to get tokens
  }

  handleCloseModal = () => {
    this.props.closeModal();
  }

  handleCloseModalV2 = () => {
    const {
      isRequesting,
      isTagEnable,
    } = this.props;
    if (!isRequesting) {
      this.props.closeCardOnlyModalRequest(isTagEnable);
    }
  }

  renderPopup = () => {
    const {
      currentTab,
      isSyncing,
      isSkipLoginSuccess,
      modal: {
        modalOpen,
        modalType,
        modalData,
        embeddedLinkModalOpen,
        embeddedLinkModalType,
      },
      languages,
      selectedLanguage,
      links,
      newAppVersion,
      language,
      theme,
      experienceStreamWithChannelInfo: {
        Experience
      }
    } = this.props;

    if (!modalOpen && !isSyncing && !embeddedLinkModalOpen) {
      return null;
    }

    if (isSyncing) {
      if (isSkipLoginSuccess) {
        return null;
      }
      return (
        <DxModal modalOpen={isSyncing}>
          <UserSyncModal />
        </DxModal>
      );
    }

    const languageCheck = language || {};
    const promoLabels = languageCheck.ExploreScreen ? languageCheck.ExploreScreen : [];

    const downloadModalLabels = languageCheck.Loader ? languageCheck.Loader : [];

    const languageScreenLabels = selectedLanguage ? selectedLanguage.FirstInstall : [];

    let passcodeTitleLabel;
    let passcodeDescLabel;
    let passcodeLabel;
    let passcodeSubmitLabel;
    let loadingContentLabel;
    let loadingDescLabel;
    let updateApplicationLabel;
    let updateApplicationDescLabel;
    let selectLanguageLabel;

    promoLabels.map((label) => {
      if (label.Type === 'PASS_CODE_TITLE') { passcodeTitleLabel = label.Content; }
      if (label.Type === 'PASS_CODE_DESC') { passcodeDescLabel = label.Content; }
      if (label.Type === 'PASS_CODE') { passcodeLabel = label.Content; }
      if (label.Type === 'PASS_CODE_SUBMIT') { passcodeSubmitLabel = label.Content; }
    });

    downloadModalLabels.map((label) => {
      if (label.Type === 'LOADER') { loadingContentLabel = label.Content; }
      if (label.Type === 'LOADER_DESC') { loadingDescLabel = label.Content; }
    });

    languageScreenLabels.map((label) => {
      if (label.Type === 'SELECT_LANGUAGE') {
        selectLanguageLabel = label.Content;
      }
      if (label.Type === 'UPDATE_APPLICATION') { updateApplicationLabel = label.Content; }
      if (label.Type === 'UPDATE_APPLICATION_MESSAGE') {
        updateApplicationDescLabel = label.Content;
      }
    });


    if (modalType == 'CARDONLY'
      || modalType == 'CARDPAGE'
    ) {
      return this.renderPopupForCard();
    }

    if (embeddedLinkModalType == 'EMBEDDEDLINK' && !modalType) {
      return this.renderPopupForEmbedLink();
    }

    if (
      modalType == 'DOWNLOAD'
      || modalType == 'PROMO'
      || modalType == 'APPVERSION'
      || modalType == 'LANGUAGESELECT'
      || modalType == 'UPDATEUSERCONSENT'
      || modalType == 'UPDATEUSERSYNC'
      || modalType == 'CHANNELINFO'
    ) {
      let modal;
      if (modalType == 'DOWNLOAD') {
        modal = (
          <DownloadModal loadingContentLabel={loadingContentLabel} loadingDescLabel={loadingDescLabel} />
        );
      } else if (modalType == 'LANGUAGESELECT') {
        modal = (
          <LanguageModalContainer languages={languages} selectedLanguage={selectedLanguage} selectLanguageLabel={selectLanguageLabel} />
        );
      } else if (modalType == 'APPVERSION') {
        modal = (
          <AppVersionModal links={links} newAppVersion={newAppVersion} updateApplicationLabel={updateApplicationLabel}
            updateApplicationDescLabel={updateApplicationDescLabel} theme={theme} />
        );
      } else if (modalType == 'UPDATEUSERCONSENT' && Experience && (currentTab == 'Section' || currentTab == 'Video')) {
        modal = (
          <UserConsentModal theme={theme} />
        );
      } else if (modalType == 'UPDATEUSERSYNC' && Experience && (currentTab == 'Section' || currentTab == 'Video')) {
        modal = (
          <UpdateUserSyncConsentModal theme={theme} />
        );
      } else if (modalType == 'CHANNELINFO') {
        modal = (
          <ChannelInfoModal theme={theme} channelInfo={modalData} handleCloseModal={this.handleCloseModal} />
        );
      } else if (modalType === 'PROMO') {
        modal = (
          <View style={styles.promoContainerStyle}>
            <KeyboardAvoidingView
              behavior={(Platform.OS === 'ios') ? 'padding' : null}
              enabled
            >
              <PromoModal
                handleCloseModal={this.handleCloseModal}
                handleSubmitPress={this.handleSubmitPress}
                passcodeTitleLabel={passcodeTitleLabel}
                passcodeDescLabel={passcodeDescLabel}
                passcodeLabel={passcodeLabel}
                passcodeSubmitLabel={passcodeSubmitLabel}
                theme={theme}
              />
            </KeyboardAvoidingView>
          </View>
        );
      }
      return (
        <DxModal
          modalOpen={modalOpen}
          transparent={
            modalType == 'PROMO'
            || modalType == 'APPVERSION'
            || (modalType == 'UPDATEUSERCONSENT' && Experience && Experience.ExperienceType == '1')
            || modalType == 'UPDATEUSERSYNC'
            || modalType == 'CHANNELINFO'
          }
          center={
            modalType == 'APPVERSION'
            || modalType == 'UPDATEUSERCONSENT'
            || modalType == 'UPDATEUSERSYNC'
            || modalType == 'CHANNELINFO'
          }
        >
          {modal}
        </DxModal>
      );
    }
  }

  // handling popup
  renderPopupForCard = () => {
    const {
      deviceInfo,
      currentTab,
    } = this.props;
    const modalLabels = deviceInfo.language ? deviceInfo.language.DxModal : [];

    let continueLabel;
    let goBacklabel;
    let goTohomepageLabel;

    modalLabels.map((label) => {
      if (label.Type === 'CONTINUE') { continueLabel = label.Content; }
      if (label.Type === 'GO_TO_HOMEPAGE') { goTohomepageLabel = label.Content; }
      if (label.Type === 'GO_BACK') { goBacklabel = label.Content; }
    });

    if (!this.props.experienceStreamWithChannelInfo) {
      return null;
    }

    const {
      modalOpen,
    } = this.props.modal;

    const {
      numberOfClicks,
      IsMenuClick,
      ExperienceStreamGUID,
      Experience: {
        ExperienceCard,
        ExperienceType,
      },
    } = this.props.experienceStreamWithChannelInfo;
    const { userGUID } = this.props;

    if (ExperienceCard.Type == 'IMAGE') {
      const picValue = ExperienceCard.Settings[0].Default ? ExperienceCard.Settings[0].Default : ExperienceCard.Settings[0].Value;
      const imageSrc = `${getRootPath('downloadFeeds', userGUID, ExperienceStreamGUID)}${picValue}.jpg`;
      const { Width, Height } = ExperienceCard.Settings[0];

      const formattedWidth = Number(Width) || config.defaultCardImageWidth;
      const formattedHeight = Number(Height) || config.defaultCardImageHeight;
      const { tmpWidth, tmpHeight } = helpers.imageAlg(formattedWidth, formattedHeight, maxPopupWidth, maxPopupHeight);

      return (
        <DxModal
          modalOpen={modalOpen}
        >
          <View style={styles.webViewContainerStyle}>
            {
              ExperienceType == '0'
                ? <View style={styles.closeButtonContainerStyle}>
                  <Button
                    style={styles.closeButtonStyle}
                    transparent
                    onPress={this.handleCloseModalV2}
                  >
                    <FastImage
                      style={styles.closeImgStyle}
                      source={require('./assets/images/Icons/closeIcon.png')}
                    />
                  </Button>
                </View>
                : null
            }
            <ImageZoom
              cropWidth={Dimensions.get('window').width}
              cropHeight={Dimensions.get('window').height - (ExperienceType == '0' ? 0 : 70) - (Platform.OS == 'android' ? StatusBar.currentHeight : 0)}
              imageWidth={tmpWidth}
              imageHeight={tmpHeight}
              style={styles.imageZoomStyle}
            >
              <FastImage
                source={{ uri: imageSrc }}
                style={styles.imageStyle}
              />
            </ImageZoom>
            {
              ExperienceType == '1'
                ? <View style={styles.bottomBtnContainerStyle}>
                  <TouchableOpacity
                    style={styles.bottomBtnWrapperStyle}
                    onPress={this.handleCloseModal}
                  >
                    <View style={styles.bottomBtnLabelStyle}>
                      <TextSize small style={styles.titleStyle}>{continueLabel}</TextSize>
                      <TextSize
                        small
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={Object.assign({}, styles.subtitleStyle, {
                          flexShrink: 1,
                        })}
                      >
                        {numberOfClicks == 1 && !IsMenuClick ? goTohomepageLabel : goBacklabel}
                      </TextSize>
                    </View>
                  </TouchableOpacity>
                </View>
                : null
            }
          </View>
        </DxModal>
      );
    }
    if (ExperienceCard.Type === 'VIDEO') {
      if (deviceInfo.appState != 'inactive' && deviceInfo.appState != 'background' && currentTab != 'Video') {
        this.props.redirectVideoScreen(ExperienceCard.Content, ExperienceType, numberOfClicks == 1 && !IsMenuClick);
      }
      return null;
    }
    if (ExperienceCard.Type === 'BACKGROUND_TEXT') {
      return (
        <DxModal
          modalOpen={modalOpen}
        >
          <BackgroundTextModal
            experienceCard={ExperienceCard}
            type={ExperienceType}
            title={continueLabel}
            subtitle={numberOfClicks == 1 && !IsMenuClick ? goTohomepageLabel : goBacklabel}
            handleCloseModal={ExperienceType == '1' ? this.handleCloseModal : this.handleCloseModalV2}
            userGUID={this.props.userGUID}
          />
        </DxModal>
      );
    }
    if (ExperienceCard.Type === 'BACKGROUND_IMAGE_TEXT') {
      return (
        <DxModal
          modalOpen={modalOpen}
        >
          <BackgroundImageTextModal
            experienceCard={ExperienceCard}
            experienceStreamGUID={ExperienceStreamGUID}
            type={ExperienceType}
            title={continueLabel}
            subtitle={numberOfClicks == 1 && !IsMenuClick ? goTohomepageLabel : goBacklabel}
            handleCloseModal={ExperienceType == '1' ? this.handleCloseModal : this.handleCloseModalV2}
            userGUID={this.props.userGUID}
          />
        </DxModal>
      );
    }
    if (
      ExperienceCard.Type === 'RIGHT_IMAGE_TEXT'
      || ExperienceCard.Type === 'LEFT_IMAGE_TEXT'
    ) {
      return (
        <DxModal
          modalOpen={modalOpen}
        >
          <BackgroundImageTextModal2
            experienceCard={ExperienceCard}
            experienceStreamGUID={ExperienceStreamGUID}
            type={ExperienceType}
            title={continueLabel}
            subtitle={numberOfClicks == 1 && !IsMenuClick ? goTohomepageLabel : goBacklabel}
            handleCloseModal={ExperienceType == '1' ? this.handleCloseModal : this.handleCloseModalV2}
            userGUID={this.props.userGUID}
          />
        </DxModal>
      );
    }
    // console.log('un-support card type');
    return null;
  }

  handleSubmitPress = (promo) => {
    const {
      isConnected,
    } = this.props;

    if (!isConnected) {
      return;
    }

    const data = {
      UserGUID: this.props.userGUID,
      ChannelCode: promo,
    };
    this.props.postSubscribeInviteChannelRequest(data);
  }

  // Popup for embeded link
  renderPopupForEmbedLink = () => {
    const { modal: { modalData, embeddedLinkModalOpen } } = this.props;
    return <DxModal
      modalOpen={embeddedLinkModalOpen}
    >
      <EmbeddedLinkModal link={modalData} handleCloseModal={() => this.props.closeEmbeddedLinkModal()} />
    </DxModal>;
  }

  // Toggle search bar
  handleSearchBar = () => {
    const { searchToggle, searchToggleSection, searchType } = this.props;
    if (searchToggle && searchType) {
      return <SearchScreen />
    } else if (searchToggleSection) {
      return <SectionSearch />
    }
  }

  render() {
    const { theme } = this.props;
    return (
      <View style={[styles.mainContainerStyle, { backgroundColor: theme.bgColor }]}>
        <AppNavigator />
        {/* Global popup handler */}
        {this.renderPopup()}
        {/* Open search bar */}
        {this.handleSearchBar()}
      </View>
    );
  }
}

const styles = {
  mainContainerStyle: {
    flex: 1,
  },
  webViewContainerStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - (Platform.OS == 'android' ? StatusBar.currentHeight : 0),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: helpers.headerForIphoneX ? 40 : 24,
    right: 12,
    height: 36,
    width: 36,
    zIndex: 99,
  },
  closeButtonStyle: {
    height: 36,
    width: 36,
  },
  closeImgStyle: {
    height: 36,
    width: 36,
  },
  imageZoomStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  promoContainerStyle: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomBtnContainerStyle: {
    height: 70,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  bottomBtnWrapperStyle: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  bottomBtnLabelStyle: {
    flex: 8,
    display: 'flex',
    flexDirection: 'column',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    color: '#000000',
  },
  subtitleStyle: {
    color: '#C3C9CE',
  },
};

const mapStateToProps = state => ({
  isFetchFirstLoadDone: state.deviceInfo.isFetchFirstLoadDone,

  currentTab: state.nav.currentTab,
  previousTab: state.nav.previousTab,

  isSyncing: state.deviceInfo.isSyncing,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  deviceInfo: state.deviceInfo,
  currentAppVersion: state.deviceInfo.currentAppVersion,
  newAppVersion: state.deviceInfo.newAppVersion,
  languageGUID: state.deviceInfo.languageGUID,
  languages: state.deviceInfo.languages,
  language: state.deviceInfo.language,
  selectedLanguage: state.deviceInfo.selectedLanguage,
  isHeartBeatV0Done: state.deviceInfo.isHeartBeatV0Done,
  isHeartBeatDone: state.deviceInfo.isHeartBeatDone,
  isAppInfoFetched: state.deviceInfo.isAppInfoFetched,
  isAuthenticated: state.deviceInfo.isAuthenticated,
  isLoggingIn: state.deviceInfo.isLoggingIn,
  links: state.deviceInfo.links,
  userGUID: state.user.userGUID,
  modal: state.modal,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  isLanguageSetSuccess: state.deviceInfo.isLanguageSetSuccess,
  isUserInfoFetched: state.deviceInfo.isUserInfoFetched,

  theme: state.setting.theme,
  isAnonymous: state.deviceInfo.isAnonymous,
  isLoginRequired: state.deviceInfo.isLoginRequired,
  isSelfRegister: state.deviceInfo.isSelfRegister,
  isSkipLoginSuccess: state.deviceInfo.isSkipLoginSuccess,
  loginType: state.deviceInfo.loginType,
  reopenApp: state.deviceInfo.reopenApp,

  isRequesting: state.deviceInfo.isRequesting,
  offlineReopenApp: state.deviceInfo.offlineReopenApp,
  offlineUserGUID: state.deviceInfo.offlineUserGUID,

  isFirstGetIn: state.feed.isFirstGetIn,

  searchToggle: state.search.searchToggle,
  searchToggleSection: state.search.searchToggleSection,
  searchType: state.search.searchType,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({

  redirectVideoScreen: (data, experienceType, isFirstOpen) => dispatch(videoActions.redirectVideoScreen(data, experienceType, isFirstOpen)),
  postSubscribeInviteChannelRequest: data => dispatch(channelActions.postSubscribeInviteChannelRequest(data)),
  closeModal: () => dispatch(modalActions.closeModal()),
  closeCardOnlyModalRequest: (isTagEnable) => dispatch(modalActions.closeCardOnlyModalRequest(isTagEnable)),

  fetchAppInfoRequest: userData => dispatch(deviceInfoActions.fetchAppInfoRequest(userData)),
  heartbeatV0Request: appVersion => dispatch(deviceInfoActions.heartbeatV0Request(appVersion)),

  heartbeatRequest: appVersion => dispatch(deviceInfoActions.heartbeatRequest(appVersion)),
  fetchUserInfoRequest: userGUID => dispatch(deviceInfoActions.fetchUserInfoRequest(userGUID)),


  languageModalOpen: () => dispatch(deviceInfoActions.languageModalOpen()),
  minimizeAppActionRequest: () => dispatch(deviceInfoActions.minimizeAppActionRequest()),

  anonymousLoginRequest: () => dispatch(loginActions.anonymousLoginRequest()),
  closeEmbeddedLinkModal: () => dispatch(modalActions.closeEmbeddedLinkModal()),


  fetchLoadFirstRequest: () => dispatch(deviceInfoActions.fetchLoadFirstRequest()),
  postStreamCardContentV2Request: data => dispatch(feedActions.postStreamCardContentV2Request(data)),
  postBookmarkStreamCardContentV2Request: data => dispatch(bookmarkActions.postStreamCardContentV2Request(data)),
});

export default connect(mapStateToProps, dispatchToProps)(AppContainer);

const checkInternet = () => new Promise((resolve, reject) => {
  NetInfo.getConnectionInfo().then((connectionInfo) => {
    const {
      type
    } = connectionInfo;
    if (type == 'none') {
      resolve(false);
    } else {
      resolve(true);
    }
  });
});
