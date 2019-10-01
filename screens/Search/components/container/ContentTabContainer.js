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
import channelActions from '../../../Channel/actions';
import feedActions from '../../../Feed/actions';

// Libraries
import _ from 'lodash';

// Components
import ContentCard from '../presentation/ContentCard';
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

class ContentTabContainer extends Component {
  static propTypes = {
  };

  state = {
    limit: 5,
  }

  componentWillReceiveProps(nextProps) {
    const { searchValue, pageNumberContent, currentIndex, isConnected } = this.props;

    let tempIndex = !nextProps.isTagEnable ? 1 : 2;

    if (nextProps.isConnected) {
      // Switching Tags search
      if (searchValue && (currentIndex !== nextProps.currentIndex) && (nextProps.currentIndex == 2)) {
        this.searchContentList(nextProps.searchValue, true);
      }
  
      // Search Tags
      if (searchValue !== nextProps.searchValue && (nextProps.currentIndex == tempIndex)) {
        this.searchContentList(nextProps.searchValue, true);
      }
  
      // LOADMORE
      if (searchValue === nextProps.searchValue && pageNumberContent < nextProps.pageNumberContent) {
        this.handleContentList(nextProps.pageNumberContent, false, nextProps.searchValue);
      }
    } 

     // Internet reconnect
    if (!isConnected && nextProps.isConnected && searchValue) {
      this.searchContentList(nextProps.searchValue, true);
    }
  }

  handleContentList = (pageNumberContent, isFirstLoading, searchValue) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;

    let offsetCalc = (limit * (pageNumberContent - 1));

    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "EXPERIENCE_NAME",
        SearchField: searchValue,
        FilterType: "",
        FilterField: ""
      }
    }
    this.props.getContentListRequest(formmattedParam, isFirstLoading);
  }

  searchContentList = _.debounce((searchValue, isFirstLoading) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;
    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: "0",
      Extra: {
        SearchType: "EXPERIENCE_NAME",
        SearchField: searchValue,
        FilterType: "",
        FilterField: ""
      },
      isSearch: true,
    }
    this.props.getContentListRequest(formmattedParam, isFirstLoading);
  }, 1000);

  keyExtractor = (item) => (item.ExperienceStreamGUID);

  renderItem = (experience) => {
    const {
      theme,
      isNightMode,
      language,
      currentTab,
      userGUID,
      isConnected,
    } = this.props;
    const languageCheck = language || {};
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let internetAccesssLabel;
    let videoNotAvailableLabel;

    errorMessage.map((label) => {
      if (label.Type === 'REQUIRE_INTERNET_ACCESS') {
        internetAccesssLabel = label.Content;
      }
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });
    return (
      <View style={{ marginBottom: 12 }}>
        <ContentCard 
          type="SEARCH_CARD"
          currentTab={currentTab} 
          experience={experience} 
          isNightMode={isNightMode}
          theme={theme}
          userGUID={userGUID}
          isConnected={isConnected}
          handleChannelNameClick={(experience) => this.handleChannelNameClick(experience)}
          handlePressCard={(experience) => this.handlePressCard(experience)}
          internetAccesssLabel={internetAccesssLabel}
          videoNotAvailableLabel={videoNotAvailableLabel}
          showChannelName={true}
        />
      </View>
    )
  }

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
      isSearch: true
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  handleChannelNameClick = (experience) => {
    this.props.openClickedChannelExpV2(experience, true, false)
  }
  
  handleLoadMore = () => {
    const { isUpdating, totalContentRecord, pageNumberContent } = this.props;
    const { limit } = this.state;
  
    if (!isUpdating && totalContentRecord > 5 && totalContentRecord > pageNumberContent * limit) {
      this.props.updateContentListPageNumber();
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
      contentList,
      isLoadingContent,
      pageNumberContent,
      currentIndex,
      contentNotFoundLabel,
      isFirstLoadingContent,
      isTagEnable,
    } = this.props;

    let tempIndex = !isTagEnable ? 1 : 2;
   
    if (currentIndex != tempIndex) {
      return null;
    }

    return (
      <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor2 }]}>
        {
          isFirstLoadingContent ?
          <Spinner isLoading={isFirstLoadingContent} theme={theme} />
          :
          contentList && contentList.length > 0
          ?
          <FlatList
            ref="_flatListView"
            contentContainerStyle={{  paddingTop: 12, paddingBottom: 16, paddingLeft: 12, paddingRight: 12 }}
            keyExtractor={this.keyExtractor}
            data={contentList}
            renderItem={({ item }) => this.renderItem(item)}
            onScrollToIndexFailed={() => { }}
            ListFooterComponent={isLoadingContent && <ActivityIndicator size="small" animating />}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd < -100 && pageNumberContent === 1) {
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
                {contentNotFoundLabel}
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
  isRequesting: state.deviceInfo.isRequesting,
  currentIndex: state.search.currentIndex,
  userGUID: state.user.userGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  
  searchValue: state.search.searchValue,
  contentList: state.search.contentList,
  totalContentRecord: state.search.totalContentRecord,
  isLoadingContent: state.search.isLoadingContent,
  isFirstLoadingContent: state.search.isFirstLoadingContent,
  pageNumberContent: state.search.pageNumberContent,
  isUpdating: state.search.isUpdating,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  getContentListRequest: (params, isFirstLoading) => dispatch(searchActions.getContentListRequest(params, isFirstLoading)),
  updateContentListPageNumber: params => dispatch(searchActions.updateContentListPageNumber(params)),
  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
    ),
    postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
    openClickedChannelExpV2: (channel, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExpV2(channel, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(ContentTabContainer);
