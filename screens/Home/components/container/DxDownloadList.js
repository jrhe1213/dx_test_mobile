import React, { Component } from 'react';
import {
  Dimensions,
  View, Text,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import feedActions from '../../../Feed/actions';
import channelActions from '../../../Channel/actions';

// Components
import SlideItem from '../presentation/SlideItem';

// fonts
import fonts from '../../../../styles/fonts';

const sortDownloadDataByRecentlyViewedAt = (array) => {
  // check for recently viewed at
  let recentlyViewedAt = array.filter(item => item.recentlyViewedAt);
  const downloadedAt = array.filter(item => !item.recentlyViewedAt);

  if (recentlyViewedAt.length) recentlyViewedAt.sort((a, b) => new Date(b.recentlyViewedAt) - new Date(a.recentlyViewedAt));
  if (downloadedAt.length) downloadedAt.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  recentlyViewedAt = recentlyViewedAt.concat(downloadedAt);
  return recentlyViewedAt;
};

class DxDownloadList extends Component {
  static propTypes = {
    deviceInfo: PropTypes.object,
    navigation: PropTypes.object,
    postStreamCardContentRequest: PropTypes.func,
    userGUID: PropTypes.string,
    download: PropTypes.object,
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

  renderItem = slideItem => (
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
  )

  render() {

    return null;
    
    // return (
    //   <View style={{ position: 'relative'}}>
    //     {
    //       searchValue && searchStroageDownloads
    //         ? <Carousel
    //           ref={(c) => { this._carousel = c; }}
    //           data={formattedDownloadArr || []}
    //           renderItem={this.renderItem}
    //           sliderWidth={screenWidth + 5 * 2}
    //           itemWidth={145 + 7 * 2}
    //           loop={false}
    //           inactiveSlideOpacity={1}
    //           layout={'default'}
    //           activeSlideAlignment={'start'}
    //           enableSnap={false}
    //           contentContainerCustomStyle={{
    //             overflow: 'hidden',
    //             width: (formattedDownloadArr.length) * (145 + 7 * 2) + 24,
    //             minWidth: Dimensions.get('window').width,
    //           }}
    //         />
    //         : null
    //     }
    //     {
    //       !searchValue && storageDownloads
    //         ? <Carousel
    //           ref={(c) => { this._carousel = c; }}
    //           data={formattedDownloadArr || []}
    //           renderItem={this.renderItem}
    //           sliderWidth={screenWidth + 5 * 2}
    //           itemWidth={145 + 7 * 2}
    //           loop={false}
    //           inactiveSlideOpacity={1}
    //           inactiveSlideScale={1}
    //           layout={'default'}
    //           activeSlideAlignment={'start'}
    //           enableSnap={false}
    //           contentContainerCustomStyle={{
    //             overflow: 'hidden',
    //             width: (formattedDownloadArr.length) * (145 + 7 * 2) + 24,
    //             minWidth: Dimensions.get('window').width,
    //           }}
    //         />
    //         : <Text style={{
    //           fontFamily: fonts.light, letterSpacing: 1, color: theme.textColor, position: 'absolute', top: 0, left: 24,
    //         }}>{emptyLabel}</Text>
    //     }
    //     {/* {
    //       (searchValue && searchStroageDownloads && searchStroageDownloads.length == 0)
    //         ? <Text style={{
    //           fontFamily: fonts.light, letterSpacing: 1, alignSelf: 'center', color: theme.textColor,
    //         }}>{emptyLabel}</Text>
    //         : null
    //     } */}
    //   </View>
    // );
  }
}

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  userGUID: state.user.userGUID,
  storageDownloads: state.download.storageDownloads,
  searchStroageDownloads: state.download.searchStroageDownloads,
  theme: state.setting.theme,

  isNightMode: state.setting.isNightMode,
});

const dispatchToProps = dispatch => ({
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(withNavigation(DxDownloadList));
