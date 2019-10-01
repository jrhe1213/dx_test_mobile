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

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import { compose } from 'redux';
import searchActions from '../../../Search/actions';
import channelActions from '../../../Channel/actions';
import feedActions from '../../../Feed/actions';

// Libraries
import _ from 'lodash';

// Components
import ContentCard from '../../../Search/components/presentation/ContentCard';
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

class TagContainer extends Component {
  static propTypes = {
  };

  state = {
    limit: 5,
  }

  componentWillReceiveProps(nextProps) {
    const { pageNumberTagExp} = this.props;

    if (nextProps.isConnected && nextProps.previousTab !== "Feed") {
      // LOADMORE
      if (pageNumberTagExp < nextProps.pageNumberTagExp) {
        this.handleTagExpList(nextProps.pageNumberTagExp, false);
      }
    }
  }

  handleTagExpList = (pageNumberTagExp, isFirstLoading) => {
    const { languageGUID, clickedTag } = this.props;
    const { limit } = this.state;

    let offsetCalc = (limit * (pageNumberTagExp - 1));

    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "TAG_NAME",
        SearchField: clickedTag.TagName,
        FilterType: "",
        FilterField: "",
      }
    }
    this.props.getTagExpRequest(formmattedParam, clickedTag, isFirstLoading);
  }

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
          handleChannelNameClick={(channel) => this.handleChannelNameClick(channel)}
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
    };

    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  handleChannelNameClick = (channel) => {
    this.props.openClickedChannelExpV2(channel, true, true);
  }
  
  handleLoadMore = () => {
    const { isUpdating, totalTagExpRecord, pageNumberTagExp } = this.props;
    const { limit } = this.state;
  
    if (!isUpdating && totalTagExpRecord > limit && totalTagExpRecord > pageNumberTagExp * limit) {
      this.props.updateTagExpListPageNumber();
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
      tagExpList,
      isLoadingTagExp,
      pageNumberTagExp,
      contentNotFoundLabel,
      isFirstLoadingTagExp,
    } = this.props;

    return (
      <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor }]}>
        { 
          isFirstLoadingTagExp ?
          <Spinner isLoading={isFirstLoadingTagExp} theme={theme} />
          :
          tagExpList && tagExpList.length > 0
          ?
          <FlatList
            ref="_flatListView"
            contentContainerStyle={{  paddingTop: 12, paddingBottom: 16, paddingLeft: 12, paddingRight: 12 }}
            keyExtractor={this.keyExtractor}
            data={tagExpList}
            renderItem={({ item }) => this.renderItem(item)}
            onScrollToIndexFailed={() => { }}
            ListFooterComponent={isLoadingTagExp && <ActivityIndicator size="small" animating />}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd < -100 && pageNumberTagExp === 1) {
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
  userGUID: state.user.userGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  isRequesting: state.deviceInfo.isRequesting,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  
  tagExpList: state.search.tagExpList,
  totalTagExpRecord: state.search.totalTagExpRecord,
  isLoadingTagExp: state.search.isLoadingTagExp,
  isFirstLoadingTagExp: state.search.isFirstLoadingTagExp,
  pageNumberTagExp: state.search.pageNumberTagExp,
  isUpdating: state.search.isUpdating,
  clickedTag: state.search.clickedTag,
  previousTab: state.nav.previousTab,
});

const dispatchToProps = dispatch => ({
  getTagExpRequest: (params, clickedTag, isFirstLoading) => dispatch(searchActions.getTagExpRequest(params, clickedTag, isFirstLoading)),
  updateTagExpListPageNumber: params => dispatch(searchActions.updateTagExpListPageNumber(params)),
  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
    ),
    postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
    openClickedChannelExpV2: (channel, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExpV2(channel, isSearch, isNavigate)),
});

export default compose(connect(mapStateToProps, dispatchToProps), withNavigation)(TagContainer);