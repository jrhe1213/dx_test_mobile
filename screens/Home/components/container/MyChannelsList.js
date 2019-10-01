import React, { Component } from 'react';
import {
  Dimensions, View, Text, TouchableOpacity, Platform, FlatList, ActivityIndicator
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import actions from '../../actions';
import feedActions from '../../../Feed/actions';
import carouselActions from '../../../Carousel/actions';
import downloadActions from '../../../Download/actions';
import channelActions from '../../../Channel/actions';

// Libraries
import {
  Button, Left, Icon, Spinner
} from 'native-base';
import Carousel from 'react-native-snap-carousel';

// Components
import SlideItem from '../presentation/SlideItem';
import { TextSize } from '../../../../styles/types';
import DxCardPlaceholder from '../../../../components/DxCardPlaceholder';

// fonts
import fonts from '../../../../styles/fonts';

// Colors
import * as colors from '../../../../styles/variables';

class MyChannelsList extends Component {
  static propTypes = {
  }

  state = {
    limit: '5',
  }

  componentDidMount() {
    const {
      isConnected, isUserInfoFetched, isMyChannelEnable
    } = this.props;
    if (isConnected && isUserInfoFetched && isMyChannelEnable) {
      this.handleGetMyChannelsListRequest(1);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const { pageNumber, totalMyChannelsRecords, isMyChannelEnable } = this.props;
    const { limit } = this.state;

    if (isMyChannelEnable) {
      // Login
      if (!this.props.isUserInfoFetched && nextProps.isUserInfoFetched && nextProps.isConnected) {
        this.handleGetMyChannelsListRequest(1);
      }

      // Loadmore
      if (pageNumber !== nextProps.pageNumber) {
        if (totalMyChannelsRecords > pageNumber * limit && totalMyChannelsRecords > 5) {
          if (nextProps.isConnected) this.handleGetMyChannelsListRequest(nextProps.pageNumber);
        }
      }

      // #2 change language
      if ((this.props.languageGUID != nextProps.languageGUID) && nextProps.languageGUID) {
        if (nextProps.isConnected) this.handleGetMyChannelsListRequest(1);
      }
    }
  }

  handleGetMyChannelsListRequest = (pageNumber) => {
    const {
      languageGUID,
      userGUID,
    } = this.props;
    const { limit } = this.state;
    const offsetCalc = limit * (pageNumber - 1);

    const formattedData = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "CHANNEL_NAME",
        SearchField: '',
        UserGUID: userGUID,
        IsSubscribed: true
      }
    };

    this.props.getMyChannelsListRequest(formattedData)
  }

  handlePressCard = (item) => {
    this.handleStreamContent(item);
  };

  handleStreamContent = (item) => {
    const {
      deviceInfo: {
        isRequesting,
        internetInfo: { isConnected },
      },
    } = this.props;
    const formattedParams = {
      stream: item,
      offline: !isConnected,
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  handleChannelNameClick = (channel) => {
    if (channel.Type === 'Fixed') {
      if (channel.Title === 'Downloads') {
        this.props.openDownloadPage();
        return;
      } else if (channel.Title === 'Featured') {
        this.props.openFeaturedPage('Featured');
        return;
      } else if (channel.Title === 'Most popular') {
        this.props.openMostPopularPage('MostPopular');
        return;
      } else if (channel.Title === 'New Releases') {
        this.props.openNewReleasesPage('NewReleases');
        return;
      } else if (channel.Title === 'Trending') {
        this.props.openTrendingPage('Trending');
        return;
      }
    } else {
      this.props.openClickedChannelExp(channel, false, false);
    }
  };

  handleLoadMore = () => {
    const { isUpdating, totalMyChannelsRecords, pageNumber } = this.props;

    const { limit } = this.state;
    if (!isUpdating && totalMyChannelsRecords > 6 && totalMyChannelsRecords > pageNumber * limit) {
      this.props.updateMyChannelsPageNumber();
    }
  };

  renderPlaceholder = () => <View style={{ marginLeft: 24 }}><DxCardPlaceholder /></View>

  renderChannelStreams = (channelExpStreamList, title) => {
    const screenWidth = Dimensions.get('window').width;
    const {
      theme,
      emptyLabel,
      pageNumber,
      isFeaturedEnable,
      isMostPopularEnable,
      isNewReleaseEnable,
      isTrendingEnable,
      isMyChannelEnable,

      isLoadingFeatured,
      isLoadingMyChannels,
      isLoadingMostPopular,
      isLoadingNewReleases,
      isLoadingTrending,
    } = this.props;

    let loader;

    if (isFeaturedEnable) {
      loader = isLoadingFeatured;
    } else if (isMostPopularEnable) {
      loader = isLoadingMostPopular;
    } else if (isNewReleaseEnable) {
      loader = isLoadingNewReleases;
    } else if (isTrendingEnable) {
      loader = isLoadingTrending;
    } else if (isMyChannelEnable) {
      loader = isLoadingMyChannels;
    }

    return <View>
      {
        loader && pageNumber === 1 && title !== 'Downloads' ?
          <Carousel
            ref={(c) => { this._carousel = c; }}
            data={[1, 2]}
            renderItem={() => this.renderPlaceholder()}
            sliderWidth={screenWidth + 5 * 2}
            itemWidth={145 + 7 * 2}
            loop={false}
            inactiveSlideOpacity={1}
            inactiveSlideScale={1}
            layout={'default'}
            activeSlideAlignment={'start'}
            enableSnap={false}
            contentContainerCustomStyle={{
              overflow: 'hidden',
              width: channelExpStreamList && channelExpStreamList.length * (145 + 7 * 2) + 24,
              minWidth: Dimensions.get('window').width,
            }}
          /> :
          channelExpStreamList && channelExpStreamList.length > 0
            ? <Carousel
              ref={(c) => { this._carousel = c; }}
              data={channelExpStreamList || []}
              renderItem={item => this.renderChannelExpItem(item)}
              sliderWidth={screenWidth + 5 * 2}
              itemWidth={145 + 7 * 2}
              loop={false}
              inactiveSlideOpacity={1}
              inactiveSlideScale={1}
              layout={'default'}
              activeSlideAlignment={'start'}
              enableSnap={false}
              contentContainerCustomStyle={{
                overflow: 'hidden',
                width: channelExpStreamList && channelExpStreamList.length * (145 + 7 * 2) + 24,
                minWidth: Dimensions.get('window').width
              }}
            />
            : null
      }
      {
        channelExpStreamList && channelExpStreamList.length == 0 && !loader
          ? <Text style={{ fontFamily: fonts.light, letterSpacing: 1, color: theme.textColor }}>{emptyLabel}</Text>
          : null
      }
    </View>
  }


  renderChannelExpItem = slideItem => (
    <SlideItem
      slide={slideItem}
      currentTab="Home"
      deviceInfo={this.props.deviceInfo}
      handlePressCard={this.handlePressCard}
      handleChannelNameClick={this.handleChannelNameClick}
      userGUID={this.props.userGUID}
      cardTitleColor={this.props.theme.textColor}
      isNightMode={this.props.isNightMode}
    />
  );

  renderItem = (item) => {

    if (item.Title == 'Downloads' && !item.ExperienceStreams.length) {
      return null;
    }

    const {
      isConnected,
      theme,
      isLoadingMyChannels,
      seeAllLabel,
      pageNumber,

      featuredLabel,
      mostPopularLabel,
      trendingLabel,
      newReleaseLabel,
      continueReadingLabel,
      offlineReadyLabel,

      isFeaturedEnable,
      isMostPopularEnable,
      isNewReleaseEnable,
      isTrendingEnable,
    } = this.props;

    const {
      headerContainer,
      continueReadingStyle,
      headerStyle,
      seeAllButtonStyle,
      seeAllButtonTextStyle,
      seeAllIconStyle,
      sliderContainer,
      preheaderStyle,
    } = styles;

    // lables based on  channelName
    let formattedChannelName;

    if (item.Type === 'Fixed' && !item.ChannelName) {
      if (item.Title === 'Downloads') {
        formattedChannelName = continueReadingLabel;
      } else if (item.Title === 'Featured') {
        formattedChannelName = featuredLabel;
      } else if (item.Title === 'Most popular') {
        formattedChannelName = mostPopularLabel;
      } else if (item.Title === 'New Releases') {
        formattedChannelName = newReleaseLabel;
      } else if (item.Title === 'Trending') {
        formattedChannelName = trendingLabel;
      }
    } else {
      formattedChannelName = item.ChannelName
    }

    return (
      <View style={sliderContainer}>
        {
          item.SubHeader ? <Text style={[preheaderStyle, { color: theme.textColor2 }, Dimensions.get('window').width <= 320 ? { fontSize: 14 } : null]}>{offlineReadyLabel}</Text> : null
        }
        <View style={headerContainer}>
          <View style={continueReadingStyle}>
            <TouchableOpacity
              onPress={isConnected ? () => this.handleChannelNameClick(item) : null}
              style={{ paddingRight: 6 }}
            >
              <Text
                style={
                  [headerStyle, {
                    color: theme.textColor,
                    flexShrink: 1,
                  }, Dimensions.get('window').width <= 320 ? {
                    fontSize: 16,
                  } : null]
                }
                numberOfLines={1}
                ellipsizeMode={'tail'}
              > {
                  formattedChannelName
                } </Text>
            </TouchableOpacity>
          </View>

          {
            isLoadingMyChannels && pageNumber === 1 && item.Title !== 'Downloads'
              ?
              null
              :
              (item.ExperienceStreams && item.ExperienceStreams.length)
                ?
                <Button
                  iconRight
                  transparent
                  small
                  style={seeAllButtonStyle}
                  onPress={isConnected ? () => this.handleChannelNameClick(item) : null}
                >
                  <TextSize xSmall style={[seeAllButtonTextStyle, { color: theme.textColor2 }, Dimensions.get('window').width <= 320 ? { fontSize: 10 } : null]}>
                    {seeAllLabel}
                  </TextSize>
                  <Icon style={[seeAllIconStyle, { color: theme.textColor2 }, Platform.OS == 'android' ? { marginTop: 1 } : null]} name="arrow-forward" />
                </Button>
                :
                null
          }
        </View>
        <Left style={{ minHeight: 186 }}>
          {this.renderChannelStreams(item.ExperienceStreams, item.Title)}
        </Left>
      </View>
    );
  }

  keyExtractor = (item) => {
    return item.ExperienceChannelGUID;
  }

  render() {
    let {
      mychannelsList, isLoadingMyChannels, pageNumber, formattedList,
      isMyChannelEnable, isUpdating
    } = this.props;

    let formmattedArray = [...formattedList];

    if (isMyChannelEnable) {
      formmattedArray.push(...mychannelsList);
    }

    return (
      <FlatList
        ref="_flatListView"
        style={{ minHeight: '100%' }}
        keyExtractor={this.keyExtractor}
        data={formmattedArray}
        renderItem={({ item }) => this.renderItem(item)}
        onScrollToIndexFailed={() => { }}
        ListFooterComponent={isUpdating && <ActivityIndicator size="small" animating />}
        onEndReached={({ distanceFromEnd }) => {
          if (distanceFromEnd < -100 && pageNumber === 1) {
            return;
          }
          this.handleLoadMore();
        }}
        onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
      // scrollEventThrottle={1000}
      />
    )
  }
}

const styles = {
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  continueReadingStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36
  },
  headerStyle: {
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: '#000',
    fontSize: 18,
  },
  seeAllButtonStyle: {
    marginTop: 3,
    alignItems: 'center',
  },
  seeAllButtonTextStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    color: '#000',
  },
  seeAllIconStyle: {
    color: '#000',
    marginTop: -3,
    fontSize: 14,
    marginLeft: 3,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  preheaderStyle: {
    fontFamily: fonts.light,
    letterSpacing: 1,
    color: '#000',
    fontSize: 12,
    paddingLeft: 14,
    marginTop: 10,
  },
}

const mapStateToProps = state => ({
  theme: state.setting.theme,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  deviceInfo: state.deviceInfo,
  languageGUID: state.deviceInfo.languageGUID,
  userGUID: state.user.userGUID,
  isUserInfoFetched: state.deviceInfo.isUserInfoFetched,
  mychannelsList: state.explore.mychannelsList,
  isLoadingMyChannels: state.explore.isLoadingMyChannels,
  pageNumber: state.explore.pageNumber,
  totalMyChannelsRecords: state.explore.totalMyChannelsRecords,
  isUpdating: state.explore.isUpdating,
  isNightMode: state.setting.isNightMode,

  isMyChannelEnable: state.deviceInfo.isMyChannelEnable,
  isFeaturedEnable: state.deviceInfo.isFeaturedEnable,
  isMostPopularEnable: state.deviceInfo.isMostPopularEnable,
  isNewReleaseEnable: state.deviceInfo.isNewReleaseEnable,
  isTrendingEnable: state.deviceInfo.isTrendingEnable,

  isLoadingFeatured: state.explore.isLoadingFeatured,
  isLoadingNewReleases: state.explore.isLoadingNewReleases,
  isLoadingMostPopular: state.explore.isLoadingMostPopular,
  isLoadingTrending: state.explore.isLoadingTrending,
  isLoadingMyChannels: state.explore.isLoadingMyChannels,

});

const dispatchToProps = dispatch => ({
  getMyChannelsListRequest: data => dispatch(actions.getMyChannelsListRequest(data)),
  updateMyChannelsPageNumber: () => dispatch(actions.updateMyChannelsPageNumber()),
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),

  openDownloadPage: pageType => dispatch(downloadActions.openDownloadPage(pageType)),
  openFeaturedPage: pageType => dispatch(carouselActions.openFeaturedPage(pageType)),
  openTrendingPage: pageType => dispatch(carouselActions.openTrendingPage(pageType)),
  openNewReleasesPage: pageType => dispatch(carouselActions.openNewReleasesPage(pageType)),
  openMostPopularPage: pageType => dispatch(carouselActions.openMostPopularPage(pageType)),

  openClickedChannelExp: (channel, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channel, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(MyChannelsList);
