import React, { Component } from 'react';
import {
  View, Text, FlatList, Dimensions, ActivityIndicator, Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries

// Redux
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import actions from '../../actions';
import modalActions from '../../../../actions/Modal';

// Navigation

// Component
import DiscoveryCard from '../presentation/DiscoveryCard';
import DxChannelCardPlaceholder from '../../../../components/DxChannelCardPlaceholder';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

// Helpers
import * as helpers from '../../../../helpers';

const styles = {
  contentWrapperStyle: {
    flex: 1,
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
  discoveryContainerStyle: {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
  },
  promoCodeContainerStyle: {
    height: 48,
    marginBottom: 8,
  },
  discoveryWrapperStyle: {
    flex: 1,
  },
};

class ChannelContainer extends Component {
  static propTypes = {
    postChannelListRequest: PropTypes.func.isRequired,
    postChannelSubscribeRequest: PropTypes.func.isRequired,
    navigation: PropTypes.object,
    userGUID: PropTypes.string,
    emptyChannelLabel: PropTypes.string,
    readMoreLabel: PropTypes.string,
    showLessLabel: PropTypes.string,
    noDescLabel: PropTypes.string,
    channels: PropTypes.array,
    currentExperienceChannelGUID: PropTypes.string,
    updateChannelsPageNumber: PropTypes.func,
    openInfoModal: PropTypes.func,
  };

  state = {
    limit: 6,
  };

  componentDidMount() {
    const { channels, isHeartBeatDone } = this.props;
    if (!channels.length && isHeartBeatDone) {
      this.handlePostChannelList(false, 1, true);
    }
  }

  keyExtractor = (item) => {
    let key;
    item.forEach((i) => {
      key = `${i.ExperienceChannelGUID}-`;
    });
    return key;
  }

  keyExtractorV2 = (item) => {
    return item.toString();
  }

  componentWillReceiveProps(nextProps) {
    const {
      pullUpRefresh,
      pageNumber,
      isConnected,
      languageGUID,
      totalExpRecords,
      isHeartBeatDone,
      channels,
    } = this.props;
    const { limit } = this.state;

    // Language Change
    if (languageGUID != nextProps.languageGUID && nextProps.languageGUID) {
      // console.log('Channel fetch due to language changed');
      this.handlePostChannelList(false, 1, true);
    }

    // Internet reconnect
    if (!isConnected && nextProps.isConnected) {
      // console.log('Channel fetch due to internet come back');
      this.handlePostChannelList(false, 1, true);
    }

    // Search channels
    if (pageNumber !== nextProps.pageNumber) {
      // console.log('Something CHnage');
      if (totalExpRecords > pageNumber * limit && totalExpRecords > 6) {
        this.handlePostChannelList(nextProps.pullUpRefresh || pullUpRefresh, nextProps.pageNumber, false);
      }
    }

    // Heartbeat done
    if (!isHeartBeatDone && nextProps.isHeartBeatDone && !channels.length) {
      this.handlePostChannelList(false, 1, true);
    }
  }

  handleLoadMore = (pullUpRefresh) => {
    const { isUpdating, totalExpRecords, pageNumber } = this.props;

    const { limit } = this.state;

    if (!isUpdating && totalExpRecords > 6 && totalExpRecords > pageNumber * limit) {
      this.props.updateChannelsPageNumber(pullUpRefresh);
    }
  };

  pullupRefreshMore = (pullUpRefresh) => {
    this.handlePostChannelList(pullUpRefresh);
  }

  handlePostChannelList = (pullUpRefresh, pageNumber, isFirstFetch) => {
    const {
      isRquesting,
      userGUID,
      languageGUID,
      isLoading,
    } = this.props;

    const { limit } = this.state;
    const offsetCalc = limit * (pageNumber - 1);
    const pageData = {
      UserGUID: userGUID,
      ChannelLanguageGUID: languageGUID,
      Limit: pullUpRefresh ? "-1" : limit.toString(),
      Offset: pullUpRefresh ? "0" : offsetCalc.toString(),
      Extra: {
        SearchType: 'CHANNEL_NAME',
        SearchField: "",
        Type: pullUpRefresh ? 'REFRESH' : 'LOADMORE',
      },
      pageNumber,
      isFirstFetch,
    };

    if (!isRquesting) {
      if (!isLoading) {
        this.props.postChannelListRequest(pageData, pullUpRefresh);
      }
    }
  };

  formatChannels = (channels) => {
    if (!channels.length) {
      return;
    }
    const tempChannels = Object.assign([], channels);
    const output = [[]];
    this.assembleArr(output, tempChannels);
    return output;
  };

  assembleArr = (arr, channels) => {
    if (!channels.length) {
      return arr;
    }
    const channel = channels[0];
    channels.splice(0, 1);
    let isAppended = false;
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      // 1. item length is 0
      if (!item.length) {
        isAppended = true;
        item.push(channel);
      } else if (item.length == 1) {
        if (item[0].ChannelName.length < 18
          && channel.ChannelName.length < 18) {
          // 2. item length is 1 and item is small
          isAppended = true;
          arr[i].push(channel);
        }
      }
    }
    if (!isAppended) {
      arr.push([channel]);
    }
    this.assembleArr(arr, channels);
  }

  handleInfoModalOpen = (channelInfo) => {
    this.props.openInfoModal(channelInfo);
  }

  renderItem = (item) => {
    const {
      navigation,
      readMoreLabel,
      showLessLabel,
      noDescLabel,
      theme,
      isNightMode,
      contentLabel,
    } = this.props;

    if (item.length == 1) {
      const channel = item[0];
      return (
        <DiscoveryCard
          key={channel.ExperienceChannelGUID}
          feedLabel={contentLabel}
          UserGUID={this.props.userGUID}
          IsHardInterest={channel.IsHardInterest}
          channelType={channel.ChannelType}
          channelName={channel.ChannelName}
          channelLastView={channel.CreatedAt}
          channelColor={channel.ChannelColor}
          NumberOfStreams={channel.NumberOfStreams}
          channelDescription={channel.ChannelDescription}
          fullSizeCard={true}
          numberOfStream={channel.NumberOfStreams}
          navigation={() => this.props.openClickedChannelExp(channel, false, false)}
          handleSubscribe={() => this.props.postChannelSubscribeRequest(this.props.userGUID, channel.ExperienceChannelGUID, "1")
          }
          readMoreLabel={readMoreLabel}
          showLessLabel={showLessLabel}
          noDescLabel={noDescLabel}
          theme={theme}
          isNightMode={isNightMode}
          handleInfoModalOpen={
            channelInfo => this.handleInfoModalOpen(channelInfo)
          }
        />
      );
    } if (item.length == 2) {
      const channel1 = item[0];
      const channel2 = item[1];
      return (
        <View style={{ flexDirection: 'row' }}>
          <DiscoveryCard
            key={channel1.ExperienceChannelGUID}
            feedLabel={contentLabel}
            UserGUID={this.props.userGUID}
            IsHardInterest={channel1.IsHardInterest}
            channelType={channel1.ChannelType}
            channelName={channel1.ChannelName}
            channelLastView={channel1.CreatedAt}
            channelColor={channel1.ChannelColor}
            channelDescription={channel1.ChannelDescription}
            fullSizeCard={false}
            numberOfStream={channel1.NumberOfStreams}
            navigation={() => this.props.openClickedChannelExp(channel1, false, false)}
            handleSubscribe={() => this.props.postChannelSubscribeRequest(this.props.userGUID, channel1.ExperienceChannelGUID, "1")}
            readMoreLabel={readMoreLabel}
            showLessLabel={showLessLabel}
            noDescLabel={noDescLabel}
            theme={theme}
            isNightMode={isNightMode}
            handleInfoModalOpen={channelInfo => this.handleInfoModalOpen(channelInfo)}
          />
          <DiscoveryCard
            key={channel2.ExperienceChannelGUID}
            feedLabel={contentLabel}
            UserGUID={this.props.userGUID}
            IsHardInterest={channel2.IsHardInterest}
            channelType={channel2.ChannelType}
            channelName={channel2.ChannelName}
            channelLastView={channel2.CreatedAt}
            channelColor={channel2.ChannelColor}
            channelDescription={channel2.ChannelDescription}
            fullSizeCard={false}
            numberOfStream={channel2.NumberOfStreams}
            navigation={() => this.props.openClickedChannelExp(channel2, false, false)}
            handleSubscribe={() => this.props.postChannelSubscribeRequest(this.props.userGUID, channel2.ExperienceChannelGUID, 
            "1")}
            readMoreLabel={readMoreLabel}
            showLessLabel={showLessLabel}
            noDescLabel={noDescLabel}
            theme={theme}
            isNightMode={isNightMode}
            handleInfoModalOpen={channelInfo => this.handleInfoModalOpen(channelInfo)}
          />
        </View>
      );
    }
    return null;
  };

  renderPlaceholderItem = () => {
    return (
      <DxChannelCardPlaceholder />
    )
  };


  render() {
    const {
      channels, emptyChannelLabel, isLoading, pageNumber, theme, isHeartBeatDone
    } = this.props;

    const {
      contentWrapperStyle,
      errorMessageStyle,
      errorMessageTextStyle,
      discoveryContainerStyle,
    } = styles;

    const formattedChannels = this.formatChannels(channels);
  
    return (
      <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor }]}>
        {
          isLoading || !isHeartBeatDone ?
          (
            <View style={discoveryContainerStyle}>
              <FlatList
                ref="_flatListView"
                style={{ paddingTop: 12 }}
                keyExtractor={this.keyExtractorV2}
                data={[1, 2,]}
                renderItem={() => this.renderPlaceholderItem()}
                onScrollToIndexFailed={() => { }}
              />
            </View>
          )
          : 
          formattedChannels && formattedChannels.length > 0 ? (
            <View style={discoveryContainerStyle}>
              <FlatList
                ref="_flatListView"
                style={{ paddingTop: 12 }}
                keyExtractor={this.keyExtractor}
                data={formattedChannels}
                renderItem={({ item }) => this.renderItem(item)}
                onScrollToIndexFailed={() => { }}
                ListFooterComponent={isLoading && <ActivityIndicator size="small" animating />}
                onEndReached={({ distanceFromEnd }) => {
                  if (distanceFromEnd < -100 && pageNumber === 1) {
                    return;
                  }
                  this.handleLoadMore(false);
                }}
                onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
                // scrollEventThrottle={1000}
                refreshing={isLoading}
                onRefresh={() => this.pullupRefreshMore(true)}
              />
            </View>
          ) : (
            <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {emptyChannelLabel}
              </Text>
            </View>
          )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isConnected: state.deviceInfo.internetInfo.isConnected,
  userGUID: state.user.userGUID,
  channels: state.channel.channels,
  languageGUID: state.deviceInfo.languageGUID,
  currentExperienceChannelGUID: state.feed.currentExperienceChannelGUID,
  pageNumber: state.channel.pageNumber,
  totalExpRecords: state.channel.totalExpRecords,
  pullUpRefresh: state.channel.pullUpRefresh,
  isUpdating: state.channel.isUpdating,
  isLoading: state.channel.isLoading,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  isHeartBeatDone: state.deviceInfo.isHeartBeatDone,

  isRquesting: state.deviceInfo.isRquesting
});

const mapDispatchToProps = dispatch => ({
  postChannelListRequest: (data, pullupRefresh) => dispatch(actions.postChannelListRequest(data, pullupRefresh)),
  postChannelSubscribeRequest: (UserGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(actions.postChannelSubscribeRequest(UserGUID, ExperienceChannelGUID, IsHardInterest)),

  updateChannelsPageNumber: () => dispatch(actions.updateChannelsPageNumber()),

  openInfoModal: channelInfo => dispatch(modalActions.openInfoModal(channelInfo)),

  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(actions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withNavigation,
)(ChannelContainer);
