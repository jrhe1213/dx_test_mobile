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
import Moment from 'react-moment';
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
import channelActions from '../../../Channel/actions';

// Utils
import { headerForIphoneX, getUtcCurrentDateTime } from '../../../../helpers';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  contentStyle: {
    flex: 1,
  },
  titleContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 12
  },
  titleStyle: {
    fontSize: 14,
    marginRight: 3,
    fontFamily: fonts.light,
    letterSpacing: 2,
  },
  swipeBodyStyle: {
    width: '100%',
    borderBottomWidth: 0,
    // marginBottom: 6,
    marginRight: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
    paddingBottom: 0,
    paddingTop: 0,
    // paddingRight: 2,
  },
  deleteButtonStyle: {
    fontSize: 30,
  },
  webViewContainerStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
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
  videoStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
};

const sortDownloadDataByRecentlyViewedAt = (array) => {
  // check for recently viewed at
  let recentlyViewedAt = array.filter(item => item.recentlyViewedAt);
  const downloadedAt = array.filter(item => !item.recentlyViewedAt);

  if (recentlyViewedAt.length) recentlyViewedAt.sort((a, b) => new Date(b.recentlyViewedAt) - new Date(a.recentlyViewedAt));
  if (downloadedAt.length) downloadedAt.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  recentlyViewedAt = recentlyViewedAt.concat(downloadedAt);
  return recentlyViewedAt;
};


class DownloadContainer extends Component {
  static propTypes = {
    download: PropTypes.object,
    downloads: PropTypes.array,
    handlePressCard: PropTypes.func,
    deleteDownloadRequest: PropTypes.func,
    postStreamCardContentRequest: PropTypes.func,
  }

  componentDidMount() {
    const {
      previousTab,
      previousEmbedTab,
      currentTab,
      currentExperienceStreamGUID,
      paginationDownloads,
      totalDownloadRecords,
    } = this.props;

    if (previousTab != 'Section' && previousEmbedTab != 'Video') {
      // console.log('fetch downloads');
      this.getDownloadsList(false, 1);
    } else if (currentTab == 'Download') {
      if (this.refs._flatListView) {
        // Auto locate experience stream
        setTimeout(() => {
          if (currentExperienceStreamGUID) {
            let formattedStroageDownloads = [];
            formattedStroageDownloads = sortDownloadDataByRecentlyViewedAt(paginationDownloads);

            formattedStroageDownloads.map((item, index) => {
              if (item.ExperienceStreamGUID == currentExperienceStreamGUID) {
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
      totalDownloadRecords,
      pageNumber,
      searchValue,
      pullUpRefresh,
      limit,
      isSearchingDownloads,
    } = this.props;

    // delete and fetch more
    if (!nextProps.isUpdating && !isSearchingDownloads && nextProps.paginationDownloads.length < limit) {
      this.handleLoadMore(false, true);
    }

    // common fetch exp
    if (searchValue == nextProps.searchValue && pageNumber < nextProps.pageNumber) {
      this.getDownloadsList(nextProps.pullUpRefresh || pullUpRefresh, nextProps.pageNumber, nextProps.reduceOffsetWhenWeDelete);
    }
  }

  handleLoadMore = (pullUpRefresh, reduceOffsetWhenWeDelete) => {
    const {
      isUpdating,
      totalDownloadRecords,
      pageNumber,
      paginationDownloads,
    } = this.props;

    if (!isUpdating
      && totalDownloadRecords > paginationDownloads.length) {
      // console.log('Hit inside loadmore');
      this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
    }
  };

  getDownloadsList = (pullUpRefresh, pageNumber, reduceOffsetWhenWeDelete) => {
    const {
      searchValue,
      limit,
    } = this.props;

    let offsetCalc = (limit * (pageNumber - 1));

    if (reduceOffsetWhenWeDelete) {
      offsetCalc -= 1;
    }

    const data = {
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      searchValue,
    };

    this.props.getDownloadsDirectoryRequest(data, pullUpRefresh);
  };


  handlePressCard = (item) => {
    this.handleStreamContent(item);
  };

  handleStreamContent = (item) => {
    const {
      isRequesting,
      isConnected
    } = this.props;
    const formattedParams = {
      stream: item,
      offline: !isConnected,
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  renderExperienceStream = (download, userGUID) => {
    const {
      current_level_section: {
        ExperiencePageGUID,
      },
      isConnected,
      isNightMode,
      theme,
    } = this.props;

    const {
      titleContainerStyle,
      titleStyle,
    } = styles;

    const tmpDate = getUtcCurrentDateTime();

    return (
      <View style={[{ marginBottom: 12 }, Platform.OS == 'android' ? { marginTop: 12, marginBottom: 0 } : null]}>
        <SwipeRow
          key={download.ExperienceStreamGUID}
          style={[styles.swipeBodyStyle, { backgroundColor: theme.bgColor2 }]}
          stopLeftSwipe
          rightOpenValue={-100}
          body={
            <View style={[{
              width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, margin: 0}]}>
              <View style={titleContainerStyle}>
                <Moment element={Text} format="YYYY-MM-DD h:mm a" style={[titleStyle, { color: theme.textColor2 }]}>{download.downloadedAt ? download.downloadedAt : tmpDate}</Moment>
              </View>
              {
                !ExperiencePageGUID
                  ? <ContentCard
                    type="FEEDSPAGE_CARD"
                    experience={download}
                    fullWidth
                    localData={true}
                    folderName={download.ExperienceStreamGUID}
                    handlePressCard={() => this.handlePressCard(download)}
                    postByLabel={this.props.postByLabel}
                    videoNotAvailableLabel={this.props.videoNotAvailableLabel}
                    isConnected={isConnected}
                    userGUID={userGUID}
                    isNightMode={isNightMode}
                    theme={theme}
                    currentTab="Download"
                    handleChannelNameClick={(channel) => this.handleChannelNameClick(channel)}
                    showChannelName={true}
                  />
                  : null
              }
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
              }} danger onPress={() => this.handleDeleteDownload(download)}>
                <Icon active name="ios-trash" />
              </Button>
            </View>
          }
        />
      </View>
    );
  }

  handleChannelNameClick = (channel) => {
    // this.props.navigation.navigate('Feed', {
    //   channel,
    //   UserGUID: this.props.userGUID,
    // });
    this.props.openClickedChannelExp(channel, false, false)
  };

  _keyExtractor = item => item.ExperienceStreamGUID;

  handleDeleteDownload = (download) => {
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.deleteDownloadRequest(download.ExperienceStreamGUID);
    }
  }

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
      paginationDownloads,
      userGUID,
      theme,
    } = this.props;

    let formattedStroageDownloads = [];

    formattedStroageDownloads = sortDownloadDataByRecentlyViewedAt(paginationDownloads);

    // console.log('download container');

    return (
      <View style={contentStyle}>
        {
          formattedStroageDownloads.length > 0
            ? <FlatList
              ref='_flatListView'
              keyExtractor={this._keyExtractor}
              data={formattedStroageDownloads}
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
  previousTab: state.nav.previousTab,
  previousEmbedTab: state.nav.previousEmbedTab,
  currentTab: state.nav.currentTab,
  userGUID: state.user.userGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  feed: state.feed,
  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  current_level_section: state.feed.current_level_section,
  download: state.download,
  isSearchingDownloads: state.download.isSearchingDownloads,

  isFirstLoading: state.download.isFirstLoading,
  pageNumber: state.download.pageNumber,
  searchValue: state.download.searchValue,

  isUpdating: state.download.isUpdating,
  isLoading: state.download.isLoading,
  pullUpRefresh: state.download.pullUpRefresh,
  paginationDownloads: state.download.paginationDownloads,
  totalDownloadRecords: state.download.totalDownloadRecords,
  isSearchingBookmarks: state.download.isSearchingBookmarks,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  limit: state.download.limit,
  reduceOffsetWhenWeDelete: state.download.reduceOffsetWhenWeDelete,

  isRequesting: state.deviceInfo.isRequesting,
});

const dispatchToProps = dispatch => ({
  getDownloadsDirectoryRequest: (data, pullUpRefresh) => dispatch(actions.getDownloadsDirectoryRequest(data, pullUpRefresh)),
  deleteDownloadRequest: experienceStreamGUID => dispatch(actions.deleteDownloadRequest(experienceStreamGUID)),
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
  updatePageNumber: (pullUpRefresh, reduceOffsetWhenWeDelete) => dispatch(actions.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(DownloadContainer);
