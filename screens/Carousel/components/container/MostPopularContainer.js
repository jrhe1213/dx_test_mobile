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

// Utils

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
  titleStyle: {
    color: colors.greyColor,
    fontSize: 14,
    marginRight: 3,
    fontFamily: fonts.light,
    letterSpacing: 2,
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
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  rightsideDeleteButton: {
    height: '100%',
    paddingBottom: 2,
  },
  deleteButtonStyle: {
    fontSize: 30,
  },
  videoStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
};


class MostPopularContainer extends Component {
  static propTypes = {
    previousTab: PropTypes.string,
    previousEmbedTab: PropTypes.string,
    currentTab: PropTypes.string,
    paginationMostPopular: PropTypes.array,
    isConnected: PropTypes.bool,
    currentMostPopularExperienceStreamGUID: PropTypes.string,
    totalMostPopularRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pullUpRefresh: PropTypes.bool,
    languageGUID: PropTypes.string,
    isUpdating: PropTypes.bool,
    isLoading: PropTypes.bool,
    userGUID: PropTypes.string,
    updatePageNumber: PropTypes.func,
    deleteBookmarkRequest: PropTypes.func,
    getMostPopularRequest: PropTypes.func,
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
      isConnected,
      currentMostPopularExperienceStreamGUID,
      paginationMostPopular,
    } = this.props;

    if (previousTab != 'Section' && previousEmbedTab != 'Video') {
      if (isConnected) {
        this.getMostPopularList(false, 1);
      }
    } else {
      if (this.refs._flatListView) {
        // Auto locate experience stream
        setTimeout(() => {
          if (currentMostPopularExperienceStreamGUID) {
            paginationMostPopular.map((item, index) => {
              if (item.ExperienceStreamGUID == currentMostPopularExperienceStreamGUID) {
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
      totalMostPopularRecords,
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
      this.getMostPopularList(nextProps.pullUpRefresh, nextProps.pageNumber);
    }
    if (isConnected) {
      if (pageNumber !== nextProps.pageNumber) {
        if ((totalMostPopularRecords > (pageNumber) * limit) && totalMostPopularRecords > 4) {
          this.getMostPopularList(nextProps.pullUpRefresh, nextProps.pageNumber);
        }
      }
    }
  }

  handleLoadMore = (pullUpRefresh) => {
    const {
      isUpdating,
      totalMostPopularRecords,
      pageNumber,
      isConnected,
    } = this.props;

    const {
      limit,
    } = this.state;

    if (isConnected) {
      if (!isUpdating && totalMostPopularRecords > 4 && totalMostPopularRecords > pageNumber * limit) {
        this.props.updatePageNumber(pullUpRefresh);
      }
    }
  };

  getMostPopularList = (pullUpRefresh, pageNumber) => {
    const {
      download,
      userGUID,
      languageGUID,
    } = this.props;

    const { limit } = this.state;
    const offsetCalc = limit * (pageNumber - 1);

    const mostPopularParams = {
      UserGUID: userGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      ChannelLanguageGUID: languageGUID,
      Extra: {
        SearchType: 'EXPERIENCE_NAME',
        SearchField: '',
        SortType: 'POPULAR',
      },
      pageNumber,
    };

    this.props.getMostPopularRequest(mostPopularParams, download.storageDownloads, pullUpRefresh);
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
      currentTab,
      isRequesting
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
      currentTab,
      isRequesting
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

  renderExperienceStream = (mostPopuarItem, userGUID) => {
    const {
      isConnected, internetAccesssLabel, videoNotAvailableLabel, postByLabel, theme, isNightMode,
    } = this.props;

    return (
      <View style={{ marginBottom: 8, }}>
        <SwipeRow
          key={mostPopuarItem.ExperienceStreamGUID}
          style={[styles.swipeBodyStyle, Platform.OS == 'android' ? { marginTop: 3, marginBottom: 0 } : null]}
          stopLeftSwipe
          rightOpenValue={-100}
          body={
            <View style={{ paddingBottom: 0, marginBottom: 0, overflow: 'hidden', width: '100%' }}>
              <ContentCard
                experience={mostPopuarItem}
                fullWidth
                localData={mostPopuarItem.isDownloaded}
                folderName={mostPopuarItem.ExperienceStreamGUID}
                isContentUpdated={mostPopuarItem.isContentUpdated}
                handlePressCard={() => this.handlePressCard(mostPopuarItem)}
                handleChannelNameClick={this.handleChannelNameClick}
                disabled={!mostPopuarItem.isDownloaded && !isConnected}
                type="FEEDSPAGE_CARD"
                postByLabel={postByLabel}
                internetAccesssLabel={internetAccesssLabel}
                videoNotAvailableLabel={videoNotAvailableLabel}
                isConnected={isConnected}
                userGUID={userGUID}
                theme={theme}
                isNightMode={isNightMode}
                showChannelName={true}
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
                !mostPopuarItem.isBookmarked
                  ? () => this.handleBookmark(mostPopuarItem)
                  : () => this.handleUnBookmark(mostPopuarItem)
              }>
                <Icon active name={mostPopuarItem.isBookmarked ? 'ios-bookmark' : 'ios-bookmark'} />
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
      paginationMostPopular,
      userGUID,
      currentTab,
      theme,
    } = this.props;

    if (currentTab !== 'MostPopular') {
      return null;
    }

    // console.log('MOst Popular container');

    return (
      <View style={contentStyle}>
        {
          paginationMostPopular.length > 0
            ? <FlatList
              ref='_flatListView'
              keyExtractor={this._keyExtractor}
              data={paginationMostPopular}
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
  languageGUID: state.deviceInfo.languageGUID,
  storageDownloads: state.download.storageDownloads,
  isConnected: state.deviceInfo.internetInfo.isConnected,

  bookmarks: state.bookmark.bookmarks,

  currentMostPopularExperienceStreamGUID: state.carousel.currentMostPopularExperienceStreamGUID,
  totalMostPopularRecords: state.carousel.totalMostPopularRecords,
  paginationMostPopular: state.carousel.paginationMostPopular,
  isLoading: state.carousel.isLoading,
  isFirstLoading: state.carousel.isFirstLoading,
  isUpdating: state.carousel.isUpdating,
  pageNumber: state.carousel.pageNumber,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,

  isRequesting: state.deviceInfo.isRequesting,

  download: state.download,
  pullUpRefresh: state.carousel.pullUpRefresh,
});

const dispatchToProps = dispatch => ({
  getMostPopularRequest: (featuredParameters, downloads, pullUpRefresh) => dispatch(homeActions.getMostPopularRequest(featuredParameters, downloads, pullUpRefresh)),

  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),

  updatePageNumber: pullUpRefresh => dispatch(actions.updatePageNumber(pullUpRefresh)),

  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
  ),

  addBookmarkRequest: data => dispatch(bookmarkActions.addBookmarkRequest(data)),
  deleteBookmarkRequest: data => dispatch(bookmarkActions.deleteBookmarkRequest(data)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(MostPopularContainer);
