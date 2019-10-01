import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  FlatList,
  Platform,
  ActivityIndicator
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../../Search/actions';
import modalActions from '../../../../actions/Modal';
import channelActions from '../../../Channel/actions';

// Libraries
import _ from 'lodash';

// Components
import DiscoveryCard from '../../../Channel/components/presentation/DiscoveryCard';
import Spinner from './Spinner';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

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
};

class ChannelsTabContainer extends Component {
  static propTypes = {
  };

  state = {
    limit: 5,
  }

  componentWillReceiveProps(nextProps) {
    const { searchValue, pageNumberChannels, currentIndex, isConnected } = this.props;

    let tempIndex = !nextProps.isTagEnable ? 0 : 1;

    if (nextProps.isConnected) {
      // Switching Tags search
      if (searchValue && (currentIndex !== nextProps.currentIndex) && (nextProps.currentIndex == 1)) {
        this.searchChannelList(nextProps.searchValue, true);
      }
      // Search Tags
      if (searchValue !== nextProps.searchValue && (nextProps.currentIndex == tempIndex)) {
        this.searchChannelList(nextProps.searchValue, true);
      }
  
      // LOADMORE
      if (searchValue === nextProps.searchValue && pageNumberChannels < nextProps.pageNumberChannels) {
        this.handleChannelList(nextProps.pageNumberChannels, false, nextProps.searchValue);
      }
    }

    // Internet reconnect
    if (!isConnected && nextProps.isConnected && searchValue) {
      this.searchChannelList(nextProps.searchValue, true);
    }
  }

  handleChannelList = (pageNumberChannels, isFirstLoading, searchValue) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;

    let offsetCalc = (limit * (pageNumberChannels - 1));

    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "CHANNEL_NAME",
        SearchField: searchValue
      }
    }
    this.props.getChannelListRequest(formmattedParam, isFirstLoading);
  }

  searchChannelList = _.debounce((searchValue, isFirstLoading) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;
    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: "0",
      Extra: {
        SearchType: "CHANNEL_NAME",
        SearchField: searchValue.trim(),
      },
      isSearch: true,
    }
    this.props.getChannelListRequest(formmattedParam, isFirstLoading);
  }, 1000);

  keyExtractor = (item) => (item.ExperienceChannelGUID);

  renderItem = (channel) => {
    const { theme, isNightMode, language } = this.props;
    const languageCheck = language || {};
    const channelLabels = languageCheck.ExploreScreen ? languageCheck.ExploreScreen : [];

    // Destructing Labels for the page
    let readMoreLabel;
    let showLessLabel;
    let noDescLabel;
    let contentLabel;

    channelLabels.map((label) => {
      if (label.Type === 'READ_MORE') { readMoreLabel = label.Content; }
      if (label.Type === 'SHOW_LESS') { showLessLabel = label.Content; }
      if (label.Type === 'NO_DESC') { noDescLabel = label.Content; }
      if (label.Type === 'CONTENT') { contentLabel = label.Content; }
    });

    return <View>
      <DiscoveryCard
        cardType="searchCard"
        IsHardInterest={channel.IsHardInterest}
        channelType={channel.ChannelType}
        channelName={channel.ChannelName}
        channelLastView={channel.CreatedAt}
        channelColor={channel.ChannelColor}
        NumberOfStreams={channel.NumberOfStreams}
        channelDescription={channel.ChannelDescription}
        fullSizeCard={true}
        numberOfStream={channel.NumberOfStreams}
        navigation={() => this.props.openClickedChannelExpV2(channel, true, false)}
        handleSubscribe={() => this.props.postChannelSubscribeRequest(this.props.userGUID, channel.ExperienceChannelGUID, "1")
        }
        feedLabel={contentLabel}
        readMoreLabel={readMoreLabel}
        showLessLabel={showLessLabel}
        noDescLabel={noDescLabel}
        theme={theme}
        isNightMode={isNightMode}
        handleInfoModalOpen={
          channelInfo => this.handleInfoModalOpen(channelInfo)
        }
      />
    </View>
  }

  handleInfoModalOpen = (channelInfo) => {
    this.props.openInfoModal(channelInfo);
  }

  handleLoadMore = () => {
    const { isUpdating, totalChannelsRecord, pageNumberChannels } = this.props;
    const { limit } = this.state;
  
    if (!isUpdating && totalChannelsRecord > 5 && totalChannelsRecord > pageNumberChannels * limit) {
      this.props.updateChannelListPageNumber();
    }
  }
  

  render() {
    const {
      contentWrapperStyle,
      errorMessageStyle,
      errorMessageTextStyle
    } = styles;

    const {
      theme,
      channelList,
      isLoadingChannels,
      pageNumberChannels,
      currentIndex,
      channelNotFoundLabel,
      isFirstLoadingChannels,
      isTagEnable,
    } = this.props;

    let tempIndex = !isTagEnable ? 0 : 1;
   
    if (currentIndex != tempIndex) {
      return null;
    };

    return (
      <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor2 }]}>
        {
          isFirstLoadingChannels ?
          <Spinner isLoading={isFirstLoadingChannels} theme={theme} />
          :
          channelList && channelList.length > 0
          ?
          <FlatList
            ref="_flatListView"
            contentContainerStyle={{  paddingTop: 12, paddingBottom: 16, paddingLeft: 6, paddingRight: 6 }}
            keyExtractor={this.keyExtractor}
            data={channelList}
            renderItem={({ item }) => this.renderItem(item)}
            onScrollToIndexFailed={() => { }}
            ListFooterComponent={isLoadingChannels && <ActivityIndicator size="small" animating />}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd < -100 && pageNumberChannels === 1) {
                return;
              }
              this.handleLoadMore();
            }}
            onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
            // scrollEventThrottle={1000}
          /> 
          : 
          (
            <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {channelNotFoundLabel}
              </Text>
            </View>
          )
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  languageGUID: state.deviceInfo.languageGUID,
  language: state.deviceInfo.language,
  currentIndex: state.search.currentIndex,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  
  searchValue: state.search.searchValue,
  channelList: state.search.channelList,
  totalChannelsRecord: state.search.totalChannelsRecord,
  isLoadingChannels: state.search.isLoadingChannels,
  isFirstLoadingChannels: state.search.isFirstLoadingChannels,
  pageNumberChannels: state.search.pageNumberChannels,
  isUpdating: state.search.isUpdating,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  getChannelListRequest: (params, isFirstLoading) => dispatch(searchActions.getChannelListRequest(params, isFirstLoading)),
  updateChannelListPageNumber: params => dispatch(searchActions.updateChannelListPageNumber(params)),
  openInfoModal: channelInfo => dispatch(modalActions.openInfoModal(channelInfo)),
  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
     channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
   ),
  openClickedChannelExpV2: (channel, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExpV2(channel, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(ChannelsTabContainer);
