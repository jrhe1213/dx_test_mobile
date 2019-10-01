import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Components

// Libraries
import {
  Icon,
  SwipeRow,
  Button,
} from 'native-base';

// Redux
import { compose } from 'redux';
import { connect } from 'react-redux';
import ContentCard from '../../../Search/components/presentation/ContentCard';
import actions from '../../actions';
import feedActions from '../../../Feed/actions';
import homeActions from '../../../Home/actions';
import bookmarkActions from '../../../Bookmark/actions';
import channelActions from '../../../Channel/actions';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  contentStyle: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 24,
  },
  titleContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  swipeBodyStyle: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 2,
  },
  errorMessageStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 48,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  rightsideDeleteButton: {
    height: '100%',
    paddingBottom: 2,
    // paddingTop: Platform.OS == 'android' ? 9 : 7,
    // paddingRight: Platform.OS == 'android' ? 3 : 2,
  },
  deleteButtonStyle: {
    fontSize: 30,
  },
  videoStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
};

class FeaturedContainer extends Component {
  static propTypes = {
    previousTab: PropTypes.string,
    previousEmbedTab: PropTypes.string,
    currentTab: PropTypes.string,
    paginationFeatured: PropTypes.array,
    isConnected: PropTypes.bool,
    currentFeaturedExperienceStreamGUID: PropTypes.string,
    totalFeaturedRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pullUpRefresh: PropTypes.bool,
    languageGUID: PropTypes.string,
    isUpdating: PropTypes.bool,
    isLoading: PropTypes.bool,
    userGUID: PropTypes.string,
    updatePageNumber: PropTypes.func,
    deleteBookmarkRequest: PropTypes.func,
    getFeaturedCardsRequest: PropTypes.func,
    postChannelSubscribeRequest: PropTypes.func,
    postStreamCardContentRequest: PropTypes.func,
    addBookmarkRequest: PropTypes.func,
    navigation: PropTypes.object,
  }

  state = {
    limit: 4,
  };

  componentDidMount() {
    const {
      previousTab,
      previousEmbedTab,
      paginationFeatured,
      isConnected,
      currentFeaturedExperienceStreamGUID,
    } = this.props;

    if (previousTab != 'Section' && previousEmbedTab != 'Video') {
      if (isConnected) {
        this.getFeaturedList(false, 1);
      }
    } else {
      if (this.refs._flatListView) {
        // Auto locate experience stream
        setTimeout(() => {
          if (currentFeaturedExperienceStreamGUID) {
            paginationFeatured.map((item, index) => {
              if (item.ExperienceStreamGUID == currentFeaturedExperienceStreamGUID) {
                this.refs._flatListView.scrollToIndex({ animated: true, index });
              }
            });
          }
        }, 500);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      isRequesting,
      totalFeaturedRecords,
      pageNumber,
      pullUpRefresh,
      languageGUID,
    } = this.props;

    const {
      isConnected,
    } = nextProps;

    const {
      limit,
    } = this.state;

    if ((languageGUID != nextProps.languageGUID) && nextProps.languageGUID) {
      this.getFeaturedList(nextProps.pullUpRefresh, nextProps.pageNumber);
    }

    if (!isRequesting) {
      if (isConnected) {
        if (pageNumber !== nextProps.pageNumber) {
          if ((totalFeaturedRecords > (pageNumber) * limit) && totalFeaturedRecords > 4) {
            this.getFeaturedList(nextProps.pullUpRefresh, nextProps.pageNumber);
          }
        }
      }
    }
  }

  handleLoadMore = (pullUpRefresh) => {
    const {
      isUpdating,
      totalFeaturedRecords,
      pageNumber,
      isConnected,
    } = this.props;

    const {
      limit,
    } = this.state;

    if (isConnected) {
      if (!isUpdating && totalFeaturedRecords > 4 && totalFeaturedRecords > pageNumber * limit) {
        this.props.updatePageNumber(pullUpRefresh);
      }
    }
  };

  getFeaturedList = (pullUpRefresh, pageNumber) => {
    const {
      download,
      userGUID,
      languageGUID,
    } = this.props;

    const { limit } = this.state;
    const offsetCalc = limit * (pageNumber - 1);

    const featuredParameters = {
      UserGUID: userGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      ChannelLanguageGUID: languageGUID,
      Extra: {
        FilterType: 'CHANNEL_TYPE',
        FilterField: 'GENERAL',
        SearchType: 'EXPERIENCE_NAME',
        SearchField: '',
      },
      pageNumber,
    };

    this.props.getFeaturedCardsRequest(featuredParameters, download.storageDownloads, pullUpRefresh);
  };

  // Hard subscribe
  handleHardSubscribe = (item) => {
    if (item.IsHardInterest === 0) {
      this.props.postChannelSubscribeRequest(
        this.props.userGUID,
        item.ExperienceChannelGUID,
        '1',
      );
    }
  };

  handlePressCard = (item) => {
    if (!item.isDownloaded) {
      this.handleHardSubscribe(item);
    }
    this.handleStreamContent(item);
  };

  handleStreamContent = (item) => {
    const {
      isRequesting,
      isConnected,
      currentTab,
    } = this.props;
    const formattedParams = {
      stream: item,
      offline: !isConnected,
      currentTab,
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  handleChannelNameClick = (channel) => {
    // this.props.navigation.navigate('Feed', {
    //   channel,
    //   UserGUID: this.props.userGUID,
    // });
    this.props.openClickedChannelExp(channel, false, false)
  };

  // Handle bookmark
  handleBookmark = (stream) => {
    const {
      isRequesting,
      currentTab
    } = this.props;
    const data = {
      type: 'cards',
      stream,
      currentTab,
    };
    if (!isRequesting) {
      this.props.addBookmarkRequest(data);
    }
  };

  // Handle un-bookmark
  handleUnBookmark = (stream) => {
    const {
      isRequesting,
      currentTab
    } = this.props;
    const data = {
      type: 'cards',
      stream,
      currentTab,
    };
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  };

  renderExperienceStream = (featuredItem, userGUID) => {
    const {
      isConnected, internetAccesssLabel, videoNotAvailableLabel, postByLabel, theme, isNightMode,
    } = this.props;

    return (
      <View style={{ marginBottom: 8, }}>
        <SwipeRow
          key={featuredItem.ExperienceStreamGUID}
          style={[styles.swipeBodyStyle, Platform.OS == 'android' ? { marginTop: 3, marginBottom: 0 } : null]}
          stopLeftSwipe
          rightOpenValue={-100}
          body={
            <View style={{ paddingBottom: 0, marginBottom: 0, overflow: 'hidden', width: '100%' }}>
              <ContentCard
                type="FEEDSPAGE_CARD"
                experience={featuredItem}
                fullWidth
                localData={featuredItem.isDownloaded}
                folderName={featuredItem.ExperienceStreamGUID}
                isContentUpdated={featuredItem.isContentUpdated}
                handlePressCard={() => this.handlePressCard(featuredItem)}
                disabled={!featuredItem.isDownloaded && !isConnected}
                handleChannelNameClick={this.handleChannelNameClick}
                postByLabel={postByLabel}
                internetAccesssLabel={internetAccesssLabel}
                videoNotAvailableLabel={videoNotAvailableLabel}
                isConnected={isConnected}
                userGUID={userGUID}
                theme={theme}
                isNightMode={isNightMode}
                currentTab="Featured"
                showChannelName={false}
              />
            </View>
          }
          right={
            <View style={styles.rightsideDeleteButton}>
              <Button style={{
                shadowOffset: {
                  height: 0,
                  width: 0,
                },
                shadowOpacity: 0,
                elevation: 0,
              }} light onPress={
                !featuredItem.isBookmarked
                  ? () => this.handleBookmark(featuredItem)
                  : () => this.handleUnBookmark(featuredItem)
              }>
                <Icon active name={featuredItem.isBookmarked ? 'ios-bookmark' : 'ios-bookmark'} />
              </Button>
            </View>
          }
        />
      </View>
    );
  }

  _keyExtractor = item => item.ExperienceStreamGUID;

  render() {
    const {
      contentStyle,
      errorMessageStyle,
      errorMessageTextStyle,
    } = styles;

    const {
      emptyLabel,
      pageNumber,
      isLoading,
      paginationFeatured,
      userGUID,
      currentTab,
      theme,
    } = this.props;

    if (currentTab !== 'Featured') {
      return null;
    }

    // console.log('featured container');

    return (
      <View style={contentStyle}>
        {
          paginationFeatured.length > 0
            ? <FlatList
              ref='_flatListView'
              keyExtractor={this._keyExtractor}
              data={paginationFeatured}
              contentContainerStyle={{  paddingTop: 12, paddingBottom: 20 }}
              renderItem={({ item }) => this.renderExperienceStream(item, userGUID)}
              onScrollToIndexFailed={() => { }}

              ListFooterComponent={isLoading && <ActivityIndicator size="small" animating />}
              onEndReached={
                ({ distanceFromEnd }) => {
                  if (distanceFromEnd < -100 && pageNumber === 1) {
                    return;
                  }
                  this.handleLoadMore(false);
                }}
              onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
              // scrollEventThrottle={1000}
              refreshing={isLoading}
              onRefresh={() => this.handleLoadMore(true)}
            />
            : <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {emptyLabel}
              </Text>
            </View>
        }
      </View>
    );
  }
}

const stateToProps = state => ({
  download: state.download,
  previousTab: state.nav.previousTab,
  previousEmbedTab: state.nav.previousEmbedTab,
  currentTab: state.nav.currentTab,

  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,

  bookmarks: state.bookmark.bookmarks,

  currentFeaturedExperienceStreamGUID: state.carousel.currentFeaturedExperienceStreamGUID,
  totalFeaturedRecords: state.carousel.totalFeaturedRecords,
  paginationFeatured: state.carousel.paginationFeatured,
  isLoading: state.carousel.isLoading,
  isFirstLoading: state.carousel.isFirstLoading,
  pageNumber: state.carousel.pageNumber,
  isUpdating: state.carousel.isUpdating,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,

  isRequesting: state.deviceInfo.isRequesting,
  pullUpRefresh: state.carousel.pullUpRefresh,
});

const dispatchToProps = dispatch => ({
  getFeaturedCardsRequest: (featuredParameters, downloads, pullUpRefresh) => dispatch(homeActions.getFeaturedCardsRequest(featuredParameters, downloads, pullUpRefresh)),

  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),

  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
  ),

  addBookmarkRequest: data => dispatch(bookmarkActions.addBookmarkRequest(data)),
  deleteBookmarkRequest: data => dispatch(bookmarkActions.deleteBookmarkRequest(data)),

  updatePageNumber: pullUpRefresh => dispatch(actions.updatePageNumber(pullUpRefresh)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(FeaturedContainer);
