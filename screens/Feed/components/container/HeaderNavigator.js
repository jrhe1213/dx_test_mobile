import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Redux
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import actions from '../../actions';
import modalActions from '../../../../actions/Modal';
import searchActions from '../../../Search/actions';
import homeActions from '../../../Home/actions'

// Config
import config from '../../../../config';

// Components
import { Header } from '../../../../components';
import { handleAndroidBackButton, removeAndroidBackButtonHandler } from '../../../../components/AndroidBackButton';

const maxWidth = 260;
const maxHeight = 175;

class HeaderNavigator extends Component {
  static propTypes = {
    isBackIcon: PropTypes.bool,
    isSearchIcon: PropTypes.bool,
    isAddIcon: PropTypes.bool,
    channel: PropTypes.object,
    current_level_section: PropTypes.object,
    dx_section_browser_back: PropTypes.func,
    dx_browser_back: PropTypes.func,
    navigation: PropTypes.object,
    dx_browse_to_channel: PropTypes.func,
    handlePressContent: PropTypes.func,
    postLabel: PropTypes.string,
    searchLabel: PropTypes.string,
    currentTab: PropTypes.string,
    updateFeedInput: PropTypes.func,
  }

  state = {
    limit: 5,
  };

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    const {
      currentTab,
    } = this.props;
    if (currentTab == 'Feedback') {
      BackHandler.exitApp();
      return true;
    }
    this.handleBackNavigate();
    return true;
  }

  handleBackNavigate = () => {
    const {
      currentExperienceStreamGUID,
      experienceStreamWithChannelInfo,
      current_level_section,
      currentTab,
      bookmark: {
        bookmarks: {
          sections,
        },
      },
      history,
      isTagEnable,
    } = this.props;

    if (current_level_section.IsRoot === true) {
      // Back to feed list
      this.props.dx_browser_back(currentExperienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable);
    }
    else if (currentTab == 'Feed') {
      this.props.dx_browse_to_previous_tab(history);
    }
    else if (currentTab == 'Section') {
      this.props.dx_section_browser_back(sections);
    }

  }

  handleHomeBackNavigate = () => {
    const {
      currentExperienceStreamGUID,
      experienceStreamWithChannelInfo,
      current_level_section,
      isTagEnable,
    } = this.props;
    this.props.dx_home_browser_back(currentExperienceStreamGUID, experienceStreamWithChannelInfo, current_level_section.ExperiencePageGUID,
    isTagEnable);
  }

  handleChangeInput = (value) => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
      currentTab,
    } = this.props;
    if (!isConnected && currentTab === 'Feed') {
      return;
    }

    if (currentTab === 'Section') {
      this.props.updateInputSection(value);
    } else {
      this.props.updateInput(value);
    }
  }

  handleClearSearch = () => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
      currentTab,
    } = this.props;
    if (!isConnected) {
      return;
    }

    if (currentTab === 'Section') {
      this.props.updateInputSection(null);
    } else {
      this.props.updateInput(null);
    }
  }

  handleHomeBackPress = () => {
    const {
      bookmark: {
        bookmarks: {
          sections,
        },
      },
    } = this.props;
    this.props.dx_home_back(sections);
  }

  handleSearchIconPress = () => {
    this.props.handleSearchIconPress();
  }

  handleToggleMenu = () => {
    this.props.dx_section_toggle_menu(!this.props.menuToggle);
  }

  render() {
    const {
      menuToggle,
      isBackIcon,
      isSearchIcon,
      isHamburgerIcon,
      displayHomeBack,
      displayToggleCard,
      channel,
      title,

      isSplash,
      splashContent,
      splashColor,
      splashOpacity,
      splashOpacityColor,
      splashImg,
      imgBgType,
      imgBgColor,
      isSplashImageEnabled,

      isFeedList,
      postLabel,
      searchLabel,
      feedbackLabel,
      isFirstLoading,
      currentTab,
      theme,
      isClose,
      closeDownloadPage,
      handleCloseFeedbackPage,
    } = this.props;

    return (
      <Header
        menuToggle={menuToggle}
        currentTab={currentTab}

        imageOpacity={this.props.imageOpacity}
        imageTranslate={this.props.imageTranslate}

        isClose={isClose}
        handleCloseFeedbackPage={handleCloseFeedbackPage}

        handleClosePage={closeDownloadPage}
        title={title === 'FEEDBACK' ? feedbackLabel : title}
        isSplash={isSplash}
        splashContent={splashContent}
        splashColor={splashColor}
        splashOpacity={splashOpacity}
        splashOpacityColor={splashOpacityColor}
        splashImg={splashImg}
        imgBgType={imgBgType}
        imgBgColor={imgBgColor}
        isSplashImageEnabled={isSplashImageEnabled}

        isFeedList={isFeedList}
        isFeedlistLoading={isFirstLoading}

        channelColor={channel && channel.ChannelColor}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}
        isSearch={currentTab !== 'Section' ? this.props.searchToggle : this.props.searchToggleSection}
        isHamburgerIcon={isHamburgerIcon}
        displayHomeBack={displayHomeBack}
        displayToggleCard={displayToggleCard}
        totalExpRecords={0}
        postLabel={postLabel}
        inputPlaceholder={searchLabel}
        inputValue={currentTab === 'Section' ? this.props.searchValueSection : this.props.searchValue}
        hiddenUserIcon={(this.props.nav.currentTab == 'Feedback' || this.props.document)}
        handleBackIconPress={() => this.handleBackNavigate()}
        handleHomeBackIconPress={() => this.handleHomeBackNavigate()}
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        handleToggleMenu={toggle => this.handleToggleMenu(toggle)}
        handlePressContent={() => this.props.handlePressContent()}
        handleHomeBackPress={() => this.handleHomeBackPress()}

        theme={theme}
      />
    );
  }
}

const stateToProps = state => ({
  deviceInfo: state.deviceInfo,
  nav: state.nav,
  history: state.nav.history,
  feed: state.feed,
  document: state.feed.document,
  download: state.download,
  bookmark: state.bookmark,
  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  current_level_section: state.feed.current_level_section,
  menuToggle: state.feed.menuToggle,
  currentTab: state.nav.currentTab,
  previousTab: state.nav.previousTab,
  languageGUID: state.deviceInfo.languageGUID,
  pageNumber: state.feed.pageNumber,
  isFirstLoading: state.feed.isFirstLoading,
  totalExpRecords: state.feed.totalExpRecords,
  theme: state.setting.theme,
  searchToggle: state.search.searchToggle,
  searchToggleSection: state.search.searchToggleSection,
  searchValue: state.search.searchValue,
  searchValueSection: state.search.searchValueSection,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  postStreamExperienceRequest: (data, pullupRefresh) => dispatch(actions.postStreamExperienceRequest(data, pullupRefresh)),
  dx_browser_back: (experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable) => dispatch(actions.dx_browser_back(experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable)),
  dx_browse_to_channel: () => dispatch(actions.dx_browse_to_channel()),
  dx_browse_to_previous_tab: (history) => dispatch(actions.dx_browse_to_previous_tab(history)),
  dx_section_browser_back: bookmarks => dispatch(actions.dx_section_browser_back(bookmarks)),
  dx_archive: (experienceStreamGUID, experienceStreamWithChannelInfo, bookmarks) => dispatch(actions.dx_archive(experienceStreamGUID, experienceStreamWithChannelInfo, bookmarks)),

  dx_home_browser_back: (experienceStreamGUID, experienceStreamWithChannelInfo, currentLevelExperiencePageGUID, isTagEnable) => dispatch(actions.dx_home_browser_back(experienceStreamGUID, experienceStreamWithChannelInfo, currentLevelExperiencePageGUID , isTagEnable)),
  dx_home_back: bookmarks => dispatch(actions.dx_home_back(bookmarks)),

  updateInput: val => dispatch(searchActions.updateInput(val)),
  updateInputSection: val => dispatch(searchActions.updateInputSection(val)),

  dx_section_toggle_menu: toggle => dispatch(actions.dx_section_toggle_menu(toggle)),

  openModal: type => dispatch(modalActions.openModal(type)),

  dx_my_channel_back: () => dispatch(homeActions.dx_my_channel_back()),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(HeaderNavigator);
