import React, { Component } from 'react';
import {
  Dimensions, View, Text, FlatList, ActivityIndicator, Platform
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button, Icon } from 'native-base';
import { SwipeRow } from 'react-native-swipe-list-view';

import { connect } from 'react-redux';

// Components
import ContentCard from '../../../Search/components/presentation/ContentCard';

// Redux
import actions from '../../actions';
import channelActions from '../../../Channel/actions';
import bookmarkActions from '../../../Bookmark/actions';


// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  titleContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 12,
  },
  iconStyle: {
    fontSize: 18,
    paddingLeft: 6,
    paddingRight: 6,
  },
  titleStyle: {
    color: colors.greyColor,
  },
  errorMessageStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 48,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  swipeRowContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
    width: Dimensions.get('window').width
  },
  rightsideDeleteButton: {
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    paddingBottom: 0,
    paddingTop: Platform.OS == 'android' ? 3 : 0,
  },
};

class FeedContainer extends Component {
  static propTypes = {
    // experiences: PropTypes.array.isRequired,
    errors: PropTypes.object,
    postChannelSubscribeRequest: PropTypes.func,
    postStreamCardContentRequest: PropTypes.func,
    handlePressCard: PropTypes.func,
    addBookmarkRequest: PropTypes.func,
    deleteBookmarkRequest: PropTypes.func,
    totalExpRecords: PropTypes.number,
    isFirstLoading: PropTypes.bool,
    emptyContentLabel: PropTypes.string,
    pageNumber: PropTypes.number,
    updatePageNumber: PropTypes.func,
    postStreamExperienceRequest: PropTypes.func,
    previousTab: PropTypes.string,
    previousEmbedTab: PropTypes.string,
    currentTab: PropTypes.string,
    currentExperienceStreamGUID: PropTypes.string,
    experiences: PropTypes.array,
    pullUpRefresh: PropTypes.bool,
    isUpdating: PropTypes.bool,
    isLoading: PropTypes.bool,
    storageDownloads: PropTypes.array,
    bookmarks: PropTypes.object,
    internetAccesssLabel: PropTypes.string,
    videoNotAvailableLabel: PropTypes.string,
    postByLabel: PropTypes.string,
    userGUID: PropTypes.string,
    languageGUID: PropTypes.string,
    isConnected: PropTypes.bool,
  };

  state = {
    limit: 5,
  };

  componentDidMount = () => {
    const {
      currentTab,
      currentExperienceStreamGUID,
      experiences,

      feedChannel,
      previousTab,
      previousEmbedTab,
      isSearch,
    } = this.props;

    if (currentTab == 'Feed') {
      if (previousTab != 'Section' && previousEmbedTab != 'Video') {
        if (feedChannel) {
          this.getExperienceStreams(false, 1, feedChannel);
        }
      }


      if (this.refs._flatListView) {
        // Auto locate experience stream
        setTimeout(() => {
          if (currentExperienceStreamGUID && experiences.length) {
            experiences.map((item, index) => {
              if (item.ExperienceStreamGUID == currentExperienceStreamGUID) {
                this.refs._flatListView.scrollToIndex({ animated: true, index });
              }
            });
          }
        }, 500);
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    const {

      isRequesting,

      previousTab,
      previousEmbedTab,

      totalExpRecords,
      pageNumber,
      pullUpRefresh,
      isConnected,
      feedChannel,
    } = this.props;
    const { limit } = this.state;

    if (isConnected) {
      if (
        this.props.feedChannel !== nextProps.feedChannel
        ||
        (this.props.feedChannel && nextProps.feedChannel && this.props.feedChannel.ExperienceChannelGUID !== nextProps.feedChannel.ExperienceChannelGUID)
      ) {
        if (nextProps.previousTab != 'Section' && previousEmbedTab != 'Video') {
          this.getExperienceStreams(false, 1, nextProps.feedChannel);
        }
      }

      if (!isRequesting) {
        if (pageNumber !== nextProps.pageNumber) {
          if ((totalExpRecords > (pageNumber) * limit) && totalExpRecords > 5) {
            this.getExperienceStreams(nextProps.pullUpRefresh || pullUpRefresh, nextProps.pageNumber, feedChannel);
          }
        }
      }
    }
  }

  handleLoadMore = (pullUpRefresh) => {
    const {
      isUpdating,
      totalExpRecords,
      pageNumber,
      isConnected,
    } = this.props;
    const { limit } = this.state;

    if (isConnected) {
      if (!isUpdating && totalExpRecords > 5 && totalExpRecords > pageNumber * limit) {
        this.props.updatePageNumber(pullUpRefresh);
      }
    }
  };

  getExperienceStreams = (pullUpRefresh, pageNumber, feedChannel) => {
    const {
      isLoading,
      storageDownloads,
      bookmarks,
      languageGUID,
    } = this.props;

    if (!feedChannel) {
      return;
    }

    const {
      ExperienceChannelGUID
    } = feedChannel

    const { limit } = this.state;
    const offsetCalc = limit * (pageNumber - 1);

    const data = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        ExperienceChannelGUID,
        SearchType: 'EXPERIENCE_NAME',
        SearchField: "",
      },
      downloads: storageDownloads,
      bookmarks,
      pageNumber,
    };

    if (!isLoading) {
      this.props.postStreamExperienceRequest(data, pullUpRefresh);
    }
  };

  renderExperienceStream = (stream) => {
    const {
      isConnected, internetAccesssLabel, videoNotAvailableLabel, postByLabel, userGUID, isNightMode, theme, currentTab
    } = this.props;

    return (
      <View style={{ marginBottom: 12, }}>
        <SwipeRow
          key={stream.ExperienceStreamGUID}
          style={[styles.swipeRowContainer, Platform.OS == 'android' ? { marginTop: 3, marginBottom: 0 } : null]}
          disableRightSwipe={true}
          rightOpenValue={-100}
        >
          <View style={styles.rightsideDeleteButton}>
            <Button
              style={{
                shadowOffset: {
                  height: 0,
                  width: 0,
                },
                shadowOpacity: 0,
                elevation: 0,
                height: '100%',
                width: 100,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              light
              onPress={
                !stream.isBookmarked
                  ? () => this.handleBookmark(stream)
                  : () => this.handleUnBookmark(stream)
              }
            >
              <Icon active name={stream.isBookmarked ? 'ios-star' : 'ios-star-outline'} />
            </Button>
          </View>
          <View style={{ paddingBottom: 0, marginBottom: 0, overflow: 'hidden', width: '100%' }}>
            <ContentCard
              key={stream.ExperienceStreamGUID}
              experience={stream}
              localData={stream.isDownloaded}
              isContentUpdated={stream.isContentUpdated}
              folderName={stream.ExperienceStreamGUID}
              disabled={!stream.isDownloaded && !isConnected}
              fullWidth
              handlePressCard={() => this.handlePressCard(stream)}
              type="FEEDSPAGE_CARD"
              internetAccesssLabel={internetAccesssLabel}
              videoNotAvailableLabel={videoNotAvailableLabel}
              isConnected={isConnected}
              userGUID={userGUID}
              theme={theme}
              isNightMode={isNightMode}
              currentTab={currentTab}
              showChannelNam={false}
            />
          </View>
        </SwipeRow>
      </View>
    );
  };

  _keyExtractor = item => item.ExperienceStreamGUID;

  // Handle bookmark
  handleBookmark = (stream) => {
    const {
      isRequesting
    } = this.props;
    const data = {
      type: 'cards',
      stream,
    };
    if (!isRequesting) {
      this.props.addBookmarkRequest(data);
    }
  };

  // Handle un-bookmark
  handleUnBookmark = (stream) => {
    const {
      isRequesting
    } = this.props;
    const data = {
      type: 'cards',
      stream,
    };
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  };

  // Hard subscribe
  handleHardSubscribe = () => {
    const { feedChannel } = this.props;
    if (feedChannel.IsHardInterest === 0) {
      this.props.postChannelSubscribeRequest(
        this.props.userGUID,
        feedChannel.ExperienceChannelGUID,
        '1',
      );
    }
  };

  handlePressCard = (item) => {
    if (!item.isDownloaded) {
      this.handleHardSubscribe();
    }
    this.handleStreamContent(item);
  };

  handleStreamContent = (item) => {
    const {
      isRequesting,
      isConnected,
      searchType,
    } = this.props;

    let tempSearchType = false;

    if (searchType === 'HOME_SEARCH' || searchType === 'CHANNEL_SEARCH' || searchType === 'FEED_SEARCH') {
      tempSearchType = true;
    }

    const formattedParams = {
      stream: item,
      offline: !isConnected,
      isSearch: tempSearchType
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  render() {
    const { errorMessageTextStyle, errorMessageStyle } = styles;

    const {
      experiences,
      emptyContentLabel,
      isLoading,
      pageNumber,
      theme,
    } = this.props;

    // console.log('feed container:', experiences);

    return (
      <View style={{ flex: 1, alignItems: 'center' }}>

        {experiences.length ? (
          <FlatList
            ref="_flatListView"
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            keyExtractor={this._keyExtractor}
            data={experiences}
            renderItem={({ item }) => this.renderExperienceStream(item)}
            onScrollToIndexFailed={() => { }}

            ListFooterComponent={isLoading && <ActivityIndicator size="small" animating />}
            onEndReached={
              ({ distanceFromEnd }) => {
                if (distanceFromEnd < -40 && pageNumber === 1) {
                  return;
                }
                this.handleLoadMore(false);
              }}
            onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
            // scrollEventThrottle={1000}
            // ListHeaderComponent={isLoading && <ActivityIndicator size="small" animating />}
            refreshing={isLoading}
            onRefresh={() => this.handleLoadMore(true)}
          />
        ) : (
            <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>{emptyContentLabel}</Text>
            </View>
          )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  previousTab: state.nav.previousTab,
  previousEmbedTab: state.nav.previousEmbedTab,
  currentTab: state.nav.currentTab,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,

  isConnected: state.deviceInfo.internetInfo.isConnected,
  feedChannel: state.feed.feedChannel,
  experiences: state.feed.experiences,
  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,

  storageDownloads: state.download.storageDownloads,
  bookmarks: state.bookmark.bookmarks,
  totalExpRecords: state.feed.totalExpRecords,
  isFirstLoading: state.feed.isFirstLoading,
  pageNumber: state.feed.pageNumber,

  isUpdating: state.feed.isUpdating,
  isLoading: state.feed.isLoading,
  pullUpRefresh: state.feed.pullUpRefresh,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,

  isRequesting: state.deviceInfo.isRequesting,

  searchType: state.search.searchType,
  isSearch: state.search.isSearch,
});

const dispatchToProps = dispatch => ({
  postStreamExperienceRequest: (data, pullupRefresh) => dispatch(actions.postStreamExperienceRequest(data, pullupRefresh)),

  addBookmarkRequest: data => dispatch(bookmarkActions.addBookmarkRequest(data)),
  deleteBookmarkRequest: data => dispatch(bookmarkActions.deleteBookmarkRequest(data)),

  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
  ),
  postStreamCardContentRequest: data => dispatch(actions.postStreamCardContentRequest(data)),
  updatePageNumber: pullUpRefresh => dispatch(actions.updatePageNumber(pullUpRefresh)),
});

export default connect(
  mapStateToProps,
  dispatchToProps,
)(FeedContainer);
