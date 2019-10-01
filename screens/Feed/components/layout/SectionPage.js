import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';

// Libraries
import PropTypes from 'prop-types';
import {
  Icon,
} from 'native-base';

// Navigation
import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';
import { compose } from 'redux';
import { DxContainer } from '../../../../styles/grid';
import SectionContainer from '../container/SectionContainer';
import HeaderNavigator from '../container/HeaderNavigator';
import FooterNavigator from '../container/FooterNavigator';

// Redux
import actions from '../../actions';
import modalActions from '../../../../actions/Modal';
import searchActions from '../../../Search/actions';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

// Utils
import {
  getRootPath,
} from '../../../../utils/fileSystem';
import { headerForIphoneX } from '../../../../helpers';
import config from '../../../../config';


class SectionPage extends Component {
  static propTypes = {
    document: PropTypes.object,
    current_level_section: PropTypes.object,
    navigation: PropTypes.object,
    language: PropTypes.object,
  }

  static navigationOptions = {
    header: null,
  }

  state = {
    totalHeight: 0,
    layoutHeight: 0,
    clearId: null,

    scrollY: new Animated.Value(
      Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
    ),
    refreshing: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.current_level_section.ExperiencePageGUID
      !== nextProps.current_level_section.ExperiencePageGUID) {
      const clearId = setTimeout(() => {
        if (nextProps.current_level_section.IsSplash) {
          if (this._scrollView) {
            this._scrollView.getNode().scrollTo({
              y: -180,
              animated: true,
            });
          }
        } else if (this.refs._scrollView2) {
          this.refs._scrollView2.scrollTo({ y: 0 });
        }
      }, 100);
      this.setState({
        clearId,
      });
    }

    if (this.props.isArchived !== nextProps.isArchived && nextProps.isArchived) {
      if (this._scrollView) {
        this._scrollView.getNode().scrollTo({
          y: -180,
          animated: true,
        });
        this.props.setSectionResetArchive();
      } else {
        this.refs._scrollView2.scrollTo({
          y: 0,
        });
        this.props.setSectionResetArchive();
      }
    }
  }

  handleMenuToggle = () => {
    this.props.dx_section_toggle_menu(false);
  }

  handleToggleCardPress = () => {
    this.props.openModal('CARDPAGE');
  }

  handleArchivePress = () => {
    const {
      currentExperienceStreamGUID,
      experienceStreamWithChannelInfo,
      bookmark: {
        bookmarks: { sections },
      },
    } = this.props;
    this.props.dx_archive(currentExperienceStreamGUID, experienceStreamWithChannelInfo, sections);
  }

  handleLoadContent = (totalHeight) => {
    const {
      document,
      current_level_section,
    } = this.props;

    const {
      contentContainerStyle,
      completed_contentContainerStyle,
      splashContentContainerStyle,
      completed_splashContentContainerStyle,
    } = styles;

    let contentStyle;
    if (current_level_section.IsSplash) {
      if (document.IsCompleted && document.IsFeedbackCompleted) {
        contentStyle = completed_splashContentContainerStyle;
      } else {
        contentStyle = splashContentContainerStyle;
      }
    } else if (document.IsCompleted && document.IsFeedbackCompleted) {
      contentStyle = completed_contentContainerStyle;
    } else {
      contentStyle = contentContainerStyle;
    }

    const isCompleted = current_level_section.IsCompleted;
    let layoutHeight; let offset; let completion; let isBottom = false;
    layoutHeight = contentStyle.height;
    offset = 0;

    if (totalHeight > layoutHeight) {
      if (offset > 0) {
        completion = Number(((layoutHeight + offset) / totalHeight).toFixed(2));
      } else {
        completion = 0;
      }
    } else {
      completion = 1;
    }

    if (completion === 1) {
      isBottom = true;
    }
    if (!isCompleted) {
      completion = Math.min(0.9, completion);
    }
    this.setState({
      totalHeight,
      layoutHeight,
    });

    // progress bar
    // const defaultNumberOfSections = config.defaultNumberOfSections;
    // const {
    //   totalSections,
    //   currentPageIndex,
    // } = this.props;
    // if (totalSections <= (currentPageIndex + 1) * defaultNumberOfSections) {
    //   this.props.dx_scroll(completion, isBottom);
    // }
  }

  handleScrollView = (event) => {
    // clear auto scroll to top
    clearTimeout(this.state.clearId);

    // load more
    this.handleReachEnd(event);

    // progress bar
    // const defaultNumberOfSections = config.defaultNumberOfSections;
    // const {
    //   totalSections,
    //   currentPageIndex,
    // } = this.props;
    // if (totalSections <= (currentPageIndex + 1) * defaultNumberOfSections) {
    //   const {
    //     current_level_section,
    //   } = this.props;

    //   const isCompleted = current_level_section.IsCompleted;
    //   let totalHeight; let layoutHeight; let offset; let completion; let isBottom = false;

    //   totalHeight = this.state.totalHeight;
    //   layoutHeight = this.state.layoutHeight;
    //   offset = event.nativeEvent.contentOffset.y + (current_level_section.IsSplash ? HEADER_MAX_HEIGHT : 0);

    //   if (totalHeight > layoutHeight) {
    //     if (offset > 0) {
    //       completion = Number(((layoutHeight + offset) / totalHeight).toFixed(2));
    //     } else {
    //       completion = 0;
    //     }
    //   } else {
    //     completion = 1;
    //   }

    //   if (completion >= 1) {
    //     isBottom = true;
    //   }
    //   if (!isCompleted) {
    //     completion = Math.min(0.9, completion);
    //   }

    //   this.props.dx_scroll(completion, isBottom);
    // }
  }

  handleReachEnd = ({ nativeEvent }) => {
    const defaultNumberOfSections = config.defaultNumberOfSections;
    const {
      totalSections,
      currentPageIndex,
    } = this.props;
    const {
      layoutMeasurement,
      contentOffset,
      contentSize
    } = nativeEvent;

    const layoutHeight = layoutMeasurement.height;
    const offsetY = contentOffset.y;
    const totalHeight = contentSize.height;

    if (layoutHeight + offsetY >= totalHeight - (Dimensions.get('window').height)) {
      if (totalSections > (currentPageIndex + 1) * defaultNumberOfSections) {
        this.props.updateSectionPageNumber();
      }
    }
  }

  handleSearchIconPress = () => {
    let type = 'SECTION_SEARCH';
    
    this.props.toggleSearchSection(!this.props.searchToggleSection, type);
  }

  render() {
    const {
      mainContainerStyle,
      mainWrapperStyle,
      scrollViewContainerStyle,
      footerContainerStyle,
    } = styles;

    const {
      totalSections,
      currentPageIndex,
      document,
      currentTab,
      current_level_section,
      menuToggle,
      language,
      theme,
    } = this.props;

    if (currentTab != 'Section') {
      return null;
    }


    let scrollY; let headerTranslate; let imageOpacity; let imageTranslate; let fadeOpacity; let fadeTranslate; let
      fadeHideOpacity;
    if (current_level_section.IsSplash) {
      scrollY = Animated.add(
        this.state.scrollY,
        Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
      );
      headerTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -HEADER_SCROLL_DISTANCE],
        extrapolate: 'clamp',
      });
      imageOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
      });
      imageTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      });
      fadeOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
      });
      fadeTranslate = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 0],
        extrapolate: 'clamp',
      });
      const tmpOp = current_level_section && current_level_section.SplashOpacity / 100;
      fadeHideOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [tmpOp, tmpOp, 0],
        extrapolate: 'clamp',
      });
    }

    const languageCheck = language || {};
    const feedLabels = languageCheck.SectionScreen ? languageCheck.SectionScreen : [];
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];
    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    // Destructing Labels for the page
    let viewCardLabel;
    let startFromBeginningLabel;
    let scrollLabel;
    let continueReadingLabel;
    let completedLabel;
    let continueToFeedbackLabel;
    let videoNotAvailableLabel;
    let searchLabel;

    feedLabels.map((label) => {
      if (label.Type === 'VIEW_CARD') {
        viewCardLabel = label.Content;
      }
      if (label.Type === 'START_FROM_BEGINNING') { startFromBeginningLabel = label.Content; }
      if (label.Type === 'SCROLL') { scrollLabel = label.Content; }
      if (label.Type === 'CONTINUE_READING') {
        continueReadingLabel = label.Content;
      }
      if (label.Type === 'COMPLETED') {
        completedLabel = label.Content;
      }
      if (label.Type === 'CONTINUE_TO_FEEDBACK') {
        continueToFeedbackLabel = label.Content;
      }
    });

    errorMessage.map((label) => {
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchLabel = label.Content;
      }
    });


    const defaultNumberOfSections = config.defaultNumberOfSections;
    let displayProgressBar = totalSections <= (currentPageIndex + 1) * defaultNumberOfSections;

    return (
      <TouchableWithoutFeedback onPress={() => this.handleMenuToggle()}>
        <DxContainer
          style={[mainContainerStyle, { backgroundColor: theme.bgColor }]}
        >

          <View style={[mainWrapperStyle, (document.IsCompleted && document.IsFeedbackCompleted) ? null : { paddingBottom: 70 }]}>
            {
              current_level_section.IsSplash

                // splash header
                ? <View style={scrollViewContainerStyle}>
                  <Animated.ScrollView
                    ref={c => (this._scrollView = c)}
                    style={{ flex: 1 }}
                    scrollEventThrottle={1}
                    // onContentSizeChange={(width, height) => this.handleLoadContent(height)}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                      {
                        useNativeDriver: true,
                        listener: event => {
                          this.handleReachEnd(event);
                        }
                      },
                    )}
                    onMomentumScrollEnd={e => this.handleScrollView(e)}
                    onScrollEndDrag={e => this.handleScrollView(e)}
                    contentInset={{
                      top: HEADER_MAX_HEIGHT,
                    }}
                    contentOffset={{
                      y: -HEADER_MAX_HEIGHT,
                    }}
                  >
                    <SectionContainer
                      section_data={this.props.current_level_section}
                      videoNotAvailableLabel={videoNotAvailableLabel}
                      handlePressContent={() => this.handleMenuToggle()}
                    />
                  </Animated.ScrollView>

                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.header,
                      { transform: [{ translateY: headerTranslate }] },
                    ]}
                  >
                    <HeaderNavigator
                      imageOpacity={imageOpacity}
                      imageTranslate={imageTranslate}
                      searchLabel={searchLabel}

                      handleSearchIconPress={this.handleSearchIconPress}

                      title={current_level_section && current_level_section.Title}

                      isSplash={current_level_section && current_level_section.IsSplash}
                      splashContent={current_level_section && current_level_section.SplashContent}
                      splashColor={current_level_section && current_level_section.SplashColor}
                      splashOpacity={current_level_section && current_level_section.SplashOpacity / 100 && fadeHideOpacity}
                      splashOpacityColor={current_level_section && current_level_section.SplashOpacityColor}
                      splashImg={current_level_section && current_level_section.SplashImg ? `${getRootPath('downloadFeeds', this.props.userGUID, this.props.currentExperienceStreamGUID)}${current_level_section.SplashImg}.jpg` : ''}
                      imgBgType={current_level_section && current_level_section.ImgBgType}
                      imgBgColor={current_level_section && current_level_section.ImgBgColor}
                      isSplashImageEnabled={current_level_section && current_level_section.IsSplashImageEnabled}

                      isFeedList={false}
                      isBackIcon={true}
                      isSearchIcon = {true}
                      isHamburgerIcon={true}
                      displayHomeBack={!current_level_section.IsRoot}
                      displayToggleCard={true}
                      handlePressContent={() => this.handleMenuToggle()}
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        opacity: fadeOpacity,
                        transform: [{ translateY: fadeTranslate }],
                      },
                    ]}
                  >
                    <HeaderNavigator
                      title={current_level_section && current_level_section.Title}
                      isFeedList={false}
                      searchLabel={searchLabel}

                      isBackIcon={true}
                      isSearchIcon = {true}
                      isHamburgerIcon={true}
                      displayHomeBack={!current_level_section.IsRoot}
                      displayToggleCard={true}
                      handlePressContent={() => this.handleMenuToggle()}

                      handleSearchIconPress={this.handleSearchIconPress}
                    />
                  </Animated.View>
                </View>
                :
                // normal header
                <View style={scrollViewContainerStyle}>
                  <HeaderNavigator
                    title={current_level_section && current_level_section.Title}
                    isFeedList={false}
                    searchLabel={searchLabel}

                    isBackIcon={true}
                    isSearchIcon = {true}
                    isHamburgerIcon={true}
                    displayHomeBack={!current_level_section.IsRoot}
                    displayToggleCard={true}
                    handlePressContent={() => this.handleMenuToggle()}
                    handleSearchIconPress={this.handleSearchIconPress}
                  />
                  <ScrollView
                    ref='_scrollView2'
                    // onContentSizeChange={(width, height) => this.handleLoadContent(height)}
                    onScroll={e => this.handleScrollView(e)}
                  >
                    <SectionContainer
                      section_data={this.props.current_level_section}
                      videoNotAvailableLabel={videoNotAvailableLabel}
                      handlePressContent={() => this.handleMenuToggle()}
                    />
                  </ScrollView>
                </View>
            }

          </View>


          <View style={footerContainerStyle}>
            <FooterNavigator
              displayProgressBar={displayProgressBar}
              scrollLabel={scrollLabel}
              continueReadingLabel={continueReadingLabel}
              completedLabel={completedLabel}
              continueToFeedbackLabel={continueToFeedbackLabel}
            />
          </View>

          {
            menuToggle
              ? <View style={styles.menuContainerStyle}>

                <TouchableOpacity
                  style={Object.assign({}, styles.menuButtonStyle, {
                    flexDirection: 'row', alignItems: 'center', paddingLeft: 9, borderBottomWidth: 1, borderColor: colors.bgColor,
                  })}
                  onPress={() => this.handleToggleCardPress()}
                >
                  <Icon
                    style={Object.assign({}, { fontSize: 22, marginRight: 9 })}
                    name="eye"
                  />
                  <Text style={Object.assign({}, styles.menuButtonTextStyle, { fontSize: 14, paddingTop: 2 })}>
                    {viewCardLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={Object.assign({}, styles.menuButtonStyle, {
                    flexDirection: 'row', alignItems: 'center', paddingLeft: 9, paddingTop: 5,
                  })}
                  onPress={() => this.handleArchivePress()}
                >
                  <Icon
                    style={Object.assign({}, { fontSize: 22, marginRight: 9 })}
                    name="refresh"
                  />
                  <Text style={Object.assign({}, styles.menuButtonTextStyle, { fontSize: 14, paddingTop: 2 })}>{startFromBeginningLabel}</Text>
                </TouchableOpacity>
              </View>
              : null
          }

        </DxContainer>
      </TouchableWithoutFeedback>
    );
  }
}

const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 64;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const styles = {

  mainContainerStyle: {
  },
  mainWrapperStyle: {
    flex: 1,
  },
  contentStyle: {

  },
  contentContainerStyle: {
    height: Dimensions.get('window').height - 64 - 70,
  },
  completed_contentContainerStyle: {
    height: headerForIphoneX ? Dimensions.get('window').height - 64 - 38 : Dimensions.get('window').height - 64,
  },
  splashContentContainerStyle: {
    height: Platform.OS === 'ios' ? Dimensions.get('window').height - 180 - 70 : Dimensions.get('window').height - 180 - 90,
  },
  completed_splashContentContainerStyle: {
    height: Dimensions.get('window').height - 180,
  },
  footerContainerStyle: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
  },


  menuContainerStyle: {
    backgroundColor: colors.white,
    position: 'absolute',
    top: headerForIphoneX ? 75 : 56,
    right: 45,
    width: 200,
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 999,
    borderColor: 'transparent',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 3,
  },
  menuButtonStyle: {
    padding: 5,
  },
  menuButtonTextStyle: {
    fontSize: 12,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  scrollViewContainerStyle: {
    flex: 1,
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    overflow: 'hidden',
    height: HEADER_MAX_HEIGHT,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
  },
  bar: {
    backgroundColor: 'transparent',
    height: 64,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
};

const stateToProps = state => ({

  currentPageIndex: state.feed.currentPageIndex,
  totalSections: state.feed.totalSections,

  currentTab: state.nav.currentTab,
  menuToggle: state.feed.menuToggle,
  document: state.feed.document,
  current_level_section: state.feed.current_level_section,

  bookmark: state.bookmark,
  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,


  current_suggest_section: state.feed.current_suggest_section,
  current_experience_card: state.feed.current_experience_card,
  feed: state.feed,
  language: state.deviceInfo.language,
  isArchived: state.feed.isArchived,

  userGUID: state.user.userGUID,

  theme: state.setting.theme,
  searchToggleSection: state.search.searchToggleSection,
});

const dispatchToProps = dispatch => ({
  dx_section_toggle_menu: toggle => dispatch(actions.dx_section_toggle_menu(toggle)),
  openModal: type => dispatch(modalActions.openModal(type)),
  dx_archive: (experienceStreamGUID, experienceStreamWithChannelInfo, bookmarks) => dispatch(actions.dx_archive(experienceStreamGUID, experienceStreamWithChannelInfo, bookmarks)),

  dx_section_browser: (current_level_section, bookmarks) => dispatch(actions.dx_section_browser(current_level_section, bookmarks)),
  dx_scroll: (completion, isBottom) => dispatch(actions.dx_scroll(completion, isBottom)),
  setSectionResetArchive: () => dispatch(actions.setSectionResetArchive()),

  updateSectionPageNumber: () => dispatch(actions.updateSectionPageNumber()),
  toggleSearchSection: (toggle, type) => dispatch(searchActions.toggleSearchSection(toggle, type)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(SectionPage);
