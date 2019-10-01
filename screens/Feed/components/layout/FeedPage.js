import React, { Component } from 'react';
import {
  Dimensions, View,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
// import { Container } from 'native-base';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../../Search/actions';

// Components
import { DxContainer } from '../../../../styles/grid';
import FeedContainer from '../container/FeedContainer';
import HeaderNavigator from '../container/HeaderNavigator';
import Spinner from '../container/Spinner';

// Constants
import { headerForIphoneX } from '../../../../helpers';
import * as colors from '../../../../styles/variables';

const styles = {
  contentWrapperStyle: {
    flex: 1,
  },
  webViewStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
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
  popupImageStyle: {
    width: Dimensions.get('window').width,
    resizeMode: 'contain',
    height: '100%',
  },
  videoStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
};

class FeedPage extends Component {
  static propTypes = {
    goBack: PropTypes.func,
    ExperienceChannelGUID: PropTypes.string,
    expereinces: PropTypes.array,
    feed: PropTypes.object,
    addFeedToDownloadRequest: PropTypes.func,
    language: PropTypes.object,
    currentTab: PropTypes.string,
  };

  state={
    isSearchV2: false,
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSearch && nextProps.isSearch) {
      this.setState({ isSearchV2: true })
    }
  }

  handleSearchIconPress = () => {
    let type = 'FEED_SEARCH';
    if (this.props.searchToggle) {
      type = null;
    }

    this.props.toggleSearch(!this.props.searchToggle, type);
  }

  render() {
    const {
      currentTab,
      language,
      theme,
      feedChannel,
      history,
      isSearch
    } = this.props;

    const { isSearchV2 } = this.state;

    if (currentTab !== 'Feed') {
      return null;
    }

    const languageCheck = language || {};
    const feedLabels = languageCheck.FeedScreen ? languageCheck.FeedScreen : [];
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];
    const dxCardLabels = languageCheck.DxCard ? languageCheck.DxCard : [];
    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    // Destructing Labels for the page
    let postLabel;
    let searchLabel;
    let emptyLabel;
    let internetAccesssLabel;
    let videoNotAvailableLabel;
    let postByLabel;

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchLabel = label.Content;
      }
    });

    feedLabels.map((label) => {
      if (label.Type === 'POST') { postLabel = label.Content; }
      if (label.Type === 'EMPTY') { emptyLabel = label.Content; }
    });

    errorMessage.map((label) => {
      if (label.Type === 'REQUIRE_INTERNET_ACCESS') {
        internetAccesssLabel = label.Content;
      }
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    dxCardLabels.map((label) => {
      if (label.Type === 'POST') { postByLabel = label.Content; }
    });

    // console.log('Feed page');

    let preHistory = history.replace(new RegExp('[^,]+,$'), '');

    return (
      <DxContainer>
        <HeaderNavigator
          title={feedChannel && feedChannel.ChannelName}
          postLabel={postLabel}
          searchLabel={searchLabel}
          isFeedList={true}

          isSearchIcon={(currentTab === 'Feed' && !preHistory.includes('Feed')
          && !isSearch) || (currentTab === 'Feed' && !preHistory.includes('Feed') && isSearchV2)
          }
          isAddIcon={true}
          isBackIcon={true}
          channel={feedChannel}
          handleSearchIconPress={this.handleSearchIconPress}
        />
        <View style={[styles.contentWrapperStyle, { backgroundColor: theme.bgColor, }]}>
          <Spinner />
          <FeedContainer
            emptyContentLabel={emptyLabel}
            internetAccesssLabel={internetAccesssLabel}
            videoNotAvailableLabel={videoNotAvailableLabel}
            postByLabel={postByLabel}
          />
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  history: state.nav.history,
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
  feedChannel: state.feed.feedChannel,
  isSearch: state.search.isSearch,
  searchToggle: state.search.searchToggle,
});

const mapDispatchToProps = dispatch => ({
  toggleSearch: (toggle, type) => dispatch(searchActions.toggleSearch(toggle, type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedPage);
