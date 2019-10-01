
import React, { Component } from 'react';
import {
  Dimensions,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native';

// Libraries
import {
  Icon
} from 'native-base';
import Swipeable from 'react-native-swipeable';

// Redux
import { connect } from 'react-redux';
import actions from '../../actions';
import videoActions from '../../../../actions/VideoScreen';
import bookmarkActions from '../../../Bookmark/actions';
import modalActions from '../../../../actions/Modal';

// Components
import {
  DxTextContent,
  DxImage,
  DxHtmlReader,
  DxLink,
  DxPdf,
  DxVideoThumbnail,
  DxH5P,
  DxAccordion,
  DxAudio
} from '../../../../components';
import {
  DxButton,
  DxAdButton,
  DxAdButton2,
} from '../../../../components/CardButtons';

// Utils
import {
  getRootPath,
} from '../../../../utils/fileSystem';
import {
  headerForIphoneX,
} from '../../../../helpers';

// Constants
import config from '../../../../config';

const androidPadding = 24;

class SectionContainer extends Component {
  static propTypes = {

  }

  state = {

  };

  // Navigate between the nested pages
  handleNavigate = (section) => {
    const { bookmarks } = this.props;
    // if no connected pages
    if (section.ExperiencePageGUID) {
      this.props.dx_section_browser(section, bookmarks.sections);
    }
  }

  // Handle bookmark
  handleBookmark = (section) => {
    section.ExperienceStreamGUID = this.props.experienceStreamWithChannelInfo.ExperienceStreamGUID;
    section.ExperienceGUID = this.props.experienceStreamWithChannelInfo.Experience.ExperienceGUID;
    const data = {
      type: 'sections',
      section,
    };
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.addBookmarkRequest(data);
    }
  }

  // Handle unBookmark
  handleUBookmark = (section) => {
    section.ExperienceStreamGUID = this.props.experienceStreamWithChannelInfo.ExperienceStreamGUID;
    const data = {
      type: 'sections',
      section,
    };
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  }

  renderSection = (section, index) => {
    return (
      section.Type === 'BUTTON'
        || section.Type === 'AD_BUTTON'
        || section.Type === 'AD_BUTTON_2'
        ?
        <View
          key={section.SectionGUID}
          style={{ backgroundColor: 'white', marginBottom: 3 }}
        >
          {
            section.IsContent
              ? section.Type === 'EDITOR'
                ? <View style={{ minHeight: 50, width: Dimensions.get('window').width }}>
                  {
                    this.renderContent(section, index)
                  }
                </View>
                : this.renderContent(section, index)
              : (
                this.renderListItem(section)
              )
          }
        </View>
        :
        <Swipeable
          rightButtonWidth={125}
          key={section.SectionGUID}
          style={{ backgroundColor: 'white', marginBottom: 3 }}
          rightButtons={[
            (
              <TouchableOpacity style={{
                paddingBottopm: 0,
                borderRadius: 0,
                margin: 0,
                width: 125,
                height: '100%',
                backgroundColor: '#F6F6F6'
              }}
                light
                onPress={!section.isBookmarked ? () => this.handleBookmark(section) : () => this.handleUBookmark(section)}
              >
                <View style={{
                  width: 125,
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Icon
                    active
                    style={{ fontSize: 25 }}
                    name={section.isBookmarked ? 'ios-bookmark' : 'ios-bookmark'}
                  />
                </View>
              </TouchableOpacity>
            )]}
          onPress={() => this.handleNavigate()}
        >
          <View>
            {
              section.IsContent
                ? section.Type === 'EDITOR'
                  ? <View style={{ minHeight: 50, width: Dimensions.get('window').width }}>
                    {
                      this.renderContent(section, index)
                    }
                  </View>
                  : this.renderContent(section, index)
                : (
                  this.renderListItem(section)
                )
            }
          </View>
        </Swipeable>
    )
  }

  renderListItem = (section) => {
    const {
      currentExperienceStreamGUID, theme, isNightMode,
    } = this.props;

    switch (section.Type) {
      // case 'BUTTON':
      //   return (<DxButton
      //     key={section.SectionGUID}
      //     btnContent={section.BtnContent}
      //     section={section}
      //     handleNavigate={this.handleNavigate}
      //     isCompleted={section.IsCompleted}
      //     isRecommended={section.IsRecommended}
      //     contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
      //   />);

      // case 'AD_BUTTON':
      //   return (
      //     <DxAdButton
      //       key={section.SectionGUID}
      //       uri={`${getRootPath('downloadFeeds', currentExperienceStreamGUID)}${section.AdBtnImg}.jpg`}
      //       adBtnColor={section.AdBtnColor}
      //       btnContent={section.BtnContent}
      //       section={section}
      //       handleNavigate={this.handleNavigate}
      //       isCompleted={section.IsCompleted}
      //       isRecommended={section.IsRecommended}
      //       contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
      //     />
      //   );

      case 'AD_BUTTON_2':
        return (
          <DxAdButton2
            key={section.SectionGUID}
            adBtnBgColor={section.AdBtnBgColor}
            adBtnColor={section.AdBtnColor}
            btnContent={section.BtnContent}
            section={section}
            handleNavigate={this.handleNavigate}
            isCompleted={section.IsCompleted}
            isRecommended={section.IsRecommended}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
            isNightMode={isNightMode}
            theme={theme}
          />
        );

      default:
        return null;
    }
  }

  renderContent = (section, index) => {
    const {
      currentExperienceStreamGUID,
      isConnected,
      videoNotAvailableLabel,
      userGUID,
      theme,
      isNightMode,
    } = this.props;

    if (!section) {
      return null;
    }

    switch (section.Type) {
      case 'EMBED_PDF':
        return (
          <DxPdf
            key={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Pdf}.pdf`}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            pdfLabel={section.PdfLabel}
            pdfBgColor={section.PdfBgColor}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
          />
        );

      case 'EDITOR':
        return (
          <View>
            <DxHtmlReader
              key={section.SectionGUID}
              currentTab="Section"
              isBigImg={true}
              source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Html}.html`}
              acceptedUpdate={this.props.acceptedUpdate}
              handlePressContent={() => this.props.handlePressContent()}
              openEmbeddedLinkModal={link => this.props.openEmbeddedLinkModal(link)}
            />
          </View>
        );

      case 'VIDEO':
        return (
          <DxVideoThumbnail
            videoLink={section.VideoUrl}
            handleVideoPress={() => this.props.redirectVideoScreen(section.VideoUrl, '0')}
            isConnected={isConnected}
            videoNotAvailableLabel={videoNotAvailableLabel}
            currentTab="Section"
          />
        );

      case 'TEXT':
        return (
          <DxTextContent
            key={section.SectionGUID}
            content={section.Content}
          />
        );

      case 'IMAGE':
        return (
          <DxImage
            key={section.SectionGUID}
            index={index}
            section={section}
            targetSectionGUID={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Img}.jpg`}
            blurSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Img}_blur.jpg`}
            currentTab="Section"
          />
        );

      case 'LINK':
        return (
          <DxLink
            key={section.SectionGUID}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            link={section.Link}
            linkLabel={section.LinkLabel}
            linkColor={section.LinkColor}
            linkBgColor={section.LinkBgColor}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
          />
        );

      case 'H5P':
        return (
          <DxH5P
            key={section.SectionGUID}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            h5p={section.H5p}
            h5pLabel={section.H5pLabel}
            h5pBgColor={section.H5pBgColor}
            h5pFilename={section.H5pFileName}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
          />
        );

      case 'ACCORDION':
        return (
          <DxAccordion
            key={section.SectionGUID}
            accordionData={section.AccordionArr}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
          />
        );

      case 'AUDIO':
        return (
          <DxAudio
            key={section.SectionGUID}
            section={section}
            isImageCover={section.IsImgCover}
            targetSectionGUID={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Audio}.mp3`}
            audioLabel={section.AudioLabel}
            audioBgColor={section.AudioBgColor}
            audioFilename={section.AudioFileName}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 170);`}
            currentTab="Section"
            imgSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.AudioImg}.jpg`}
            blurImageSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.AudioImg}_blur.jpg`}
          />
        );

      // case 'BUTTON':
      //   return (<DxButton
      //     key={section.SectionGUID}
      //     btnContent={section.BtnContent}
      //     section={section}
      //     handleNavigate={this.handleNavigate}
      //     isCompleted={section.IsCompleted}
      //     isRecommended={section.IsRecommended}
      //     contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
      //   />);

      // case 'AD_BUTTON':
      //   return (
      //     <DxAdButton
      //       key={section.SectionGUID}
      //       uri={`${getRootPath('downloadFeeds', currentExperienceStreamGUID)}${section.AdBtnImg}.jpg`}
      //       adBtnColor={section.AdBtnColor}
      //       btnContent={section.BtnContent}
      //       section={section}
      //       handleNavigate={this.handleNavigate}
      //       isCompleted={section.IsCompleted}
      //       isRecommended={section.IsRecommended}
      //       contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
      //     />
      //   );

      case 'AD_BUTTON_2':
        return (
          <DxAdButton2
            key={section.SectionGUID}
            adBtnBgColor={section.AdBtnBgColor}
            adBtnColor={section.AdBtnColor}
            btnContent={section.BtnContent}
            section={section}
            handleNavigate={this.handleNavigate}
            isCompleted={section.IsCompleted}
            isRecommended={section.IsRecommended}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 48px);`}
            isNightMode={isNightMode}
            theme={theme}
          />
        );

      default:
        return null;
    }
  }

  render() {
    const {
      currentPageIndex,
      section_data: { Sections = [] },
      current_level_section: {
        IsSplash,
        ExperiencePageGUID,
      },
      theme,
    } = this.props;

    // console.log('section container');

    let formattedSections = [];
    let tempSections = Object.assign([], Sections);
    if (ExperiencePageGUID && Sections.length > 0) {
      const defaultNumberOfSections = config.defaultNumberOfSections;
      formattedSections = tempSections.splice(0, ((currentPageIndex + 1) * defaultNumberOfSections));
    }

    return (
      <View style={[styles.mainContainerStyle, { backgroundColor: theme.bgColor }]}>
        {
          Platform.OS === 'android' && IsSplash
            ? <View style={{ height: 180 }}></View>
            : null
        }
        {
          ExperiencePageGUID && formattedSections.length > 0
            ? (
              (formattedSections || [])
              && formattedSections.map((section, index) => {
                return this.renderSection(section, index)
              })
            )
            : null
        }
        {
          Platform.OS === 'android' || headerForIphoneX
            ? <View style={{ height: androidPadding }}></View>
            : null
        }
      </View>
    );
  }
}

const styles = {

  mainContainerStyle: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  swipeRowContainer: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 3,
    borderBottomWidth: 0,
  },
  webViewContainerStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  popupImageStyle: {
    width: Dimensions.get('window').width,
    resizeMode: 'contain',
    height: '100%',
  },

  appendCardContainerStyle: {
    paddingBottom: 1,
    position: 'relative',
  },
  appendClostBtnContainerStyle: {
    elevation: 3,
    position: 'absolute',
    right: 0,
    top: 3,
    height: 30,
    width: 24,
    zIndex: 9999,
    alignItems: 'center',
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: headerForIphoneX ? 40 : 24,
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

const stateToProps = state => ({
  currentPageIndex: state.feed.currentPageIndex,

  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  document: state.feed.document,
  current_level_section: state.feed.current_level_section,
  current_suggest_section: state.feed.current_suggest_section,
  current_experience_card: state.feed.current_experience_card,
  bookmarks: state.bookmark.bookmarks,
  feed: state.feed,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  userGUID: state.user.userGUID,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,

  isRequesting: state.deviceInfo.isRequesting,
  acceptedUpdate: state.feed.acceptedUpdate
});

const dispatchToProps = dispatch => ({
  dx_section_browser: (current_level_section, bookmarks) => dispatch(actions.dx_section_browser(current_level_section, bookmarks)),
  addBookmarkRequest: data => dispatch(bookmarkActions.addBookmarkRequest(data)),
  deleteBookmarkRequest: data => dispatch(bookmarkActions.deleteBookmarkRequest(data)),
  redirectVideoScreen: (data, experienceType, isFirstOpen) => dispatch(videoActions.redirectVideoScreen(data, experienceType, isFirstOpen)),
  openEmbeddedLinkModal: link => dispatch(modalActions.openEmbeddedLinkModal(link)),
});

export default connect(stateToProps, dispatchToProps)(SectionContainer);
