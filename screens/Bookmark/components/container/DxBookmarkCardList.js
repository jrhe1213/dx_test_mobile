import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import actions from '../../actions';
import videoActions from '../../../../actions/VideoScreen';
import channelActions from '../../../Channel/actions';

// Components
import SlideItem from '../../../Home/components/presentation/SlideItem';

// fonts
import fonts from '../../../../styles/fonts';

function compare(a, b) {
  if (new Date(a.bookmarkedAt) < new Date(b.bookmarkedAt)) {
    return 1;
  }
  if (new Date(a.bookmarkedAt) > new Date(b.bookmarkedAt)) {
    return -1;
  }
  return 0;
}

class DxBookmarkCardList extends Component {
  static propTypes = {
    storageDownloads: PropTypes.array,
    download: PropTypes.object,
    userGUID: PropTypes.string,
    deviceInfo: PropTypes.object,
    postStreamCardContentRequest: PropTypes.func,
    navigation: PropTypes.object,
    emptyLabel: PropTypes.string,
    bookmarkCards: PropTypes.array,
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
    // this.props.navigation.navigate('Feed', {
    //   channel,
    //   UserGUID: this.props.userGUID,
    // });
    this.props.openClickedChannelExp(channel, false, false)
  };

  handleVideoClick = (data, experienceType) => {
    this.props.redirectVideoScreen(data, experienceType);
  };

  renderItem = (slideItem, deviceInfo) => <SlideItem
    slide={slideItem}
    currentTab="Bookmark"
    deviceInfo={deviceInfo}
    handlePressCard={this.handlePressCard}
    handleChannelNameClick={this.handleChannelNameClick}
    userGUID={this.props.userGUID}
    cardTitleColor={this.props.theme.textColor}
    isNightMode={this.props.isNightMode}
    storageDownloads={this.props.storageDownloads}
    redirectVideoScreen={(data, experienceType) => this.handleVideoClick(data, experienceType)}
  />

  render() {
    const {
      emptyLabel,
      deviceInfo,
      bookmarkCards,
      bookmarkSections,
      theme,
    } = this.props;
    const screenWidth = Dimensions.get('window').width;

    const formattedBookmarkCards = bookmarkCards.length ? bookmarkCards : [];
    const formattedBookmarkSections = bookmarkSections.length ? bookmarkSections : [];
    let combinedBookmarks = [];
    combinedBookmarks = [...formattedBookmarkCards, ...formattedBookmarkSections];

    combinedBookmarks = combinedBookmarks.sort(compare);

    return (
      <View style={{ minHeight: 180 }}>
        {
          combinedBookmarks && combinedBookmarks.length > 0
            ? <Carousel
              ref={(c) => { this._carousel = c; }}
              data={combinedBookmarks}
              renderItem={item => this.renderItem(item, deviceInfo)}
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
                width: combinedBookmarks.length * (145 + 7 * 2) + 24,
                minWidth: Dimensions.get('window').width
              }}
            />
            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.light, letterSpacing: 1, color: theme.textColor2 }}>{emptyLabel}</Text>
            </View>
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  download: state.download,
  userGUID: state.user.userGUID,
  storageDownloads: state.download.storageDownloads,

  bookmarkCards: state.bookmark.bookmarks.cards,
  bookmarkSections: state.bookmark.bookmarks.sections,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
});

const dispatchToProps = dispatch => ({
  postStreamCardContentRequest: data => dispatch(actions.postStreamCardContentRequest(data)),
  redirectVideoScreen: (data, experienceType) => dispatch(videoActions.redirectVideoScreen(data, experienceType)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(withNavigation(DxBookmarkCardList));
