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
import feedActions from '../../../Feed/actions';
import channelActions from '../../../Channel/actions';

// Components
import SlideItem from '../presentation/SlideItem';
import DxCardPlaceholder from '../../../../components/DxCardPlaceholder';

// fonts
import fonts from '../../../../styles/fonts';

class DxFeaturedList extends Component {
  static propTypes = {
    storageDownloads: PropTypes.array,
    download: PropTypes.object,
    getFeaturedCardsRequest: PropTypes.func,
    userGUID: PropTypes.string,
    deviceInfo: PropTypes.object,
    postStreamCardContentRequest: PropTypes.func,
    navigation: PropTypes.object,
    featured: PropTypes.array,
    emptyLabel: PropTypes.string,
  }

  componentDidMount() {
    const { isConnected } = this.props.deviceInfo.internetInfo;
    const {
      isUserInfoFetched,
      download: {
        storageDownloads
      }
    } = this.props;
    if (isConnected && isUserInfoFetched) {
      this.getFeaturedContent(storageDownloads);
    }
  }

  componentWillReceiveProps(nextProps) {
    // #1 login
    if (!this.props.isUserInfoFetched && nextProps.isUserInfoFetched && !nextProps.featured.length) {
      const { isConnected } = this.props.deviceInfo.internetInfo;
      const { storageDownloads } = this.props.download;
      if (isConnected) this.getFeaturedContent(storageDownloads);
    }

    // #2 change language
    if ((this.props.deviceInfo.languageGUID != nextProps.deviceInfo.languageGUID) && nextProps.deviceInfo.languageGUID) {
      const { isConnected } = nextProps.deviceInfo.internetInfo;
      const { storageDownloads } = nextProps.download;
      if (isConnected) this.getFeaturedContent(storageDownloads);
    }
  }

  getFeaturedContent = (storageDownloads) => {
    const {
      userGUID, deviceInfo: { languageGUID },
    } = this.props;
    const featuredParameters = {
      // UserGUID: userGUID,
      Limit: '10',
      Offset: '0',
      ChannelLanguageGUID: languageGUID,
      Extra: {
        FilterType: 'CHANNEL_TYPE',
        FilterField: 'GENERAL',
      },
    };
    this.props.getFeaturedCardsRequest(featuredParameters, storageDownloads, false);
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

  renderItem = (slideItem, deviceInfo) => <SlideItem
    slide={slideItem}
    currentTab="Home"
    deviceInfo={deviceInfo}
    handlePressCard={this.handlePressCard}
    handleChannelNameClick={this.handleChannelNameClick}
    userGUID={this.props.userGUID}
    cardTitleColor={this.props.theme.textColor}
    isNightMode={this.props.isNightMode}
  />

  renderPlaceholder = () => <View style={{ marginLeft: 24 }}><DxCardPlaceholder /></View>

  render() {
    const {
      isLoadingFeatured,
      featured,
      emptyLabel,
      deviceInfo,
      theme,
    } = this.props;

    const screenWidth = Dimensions.get('window').width;
    return null;
    // return (
    //   <View>
    //     {
    //       isLoadingFeatured ?
    //         <Carousel
    //           ref={(c) => { this._carousel = c; }}
    //           data={[1, 2]}
    //           renderItem={() => this.renderPlaceholder()}
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
    //             width: featured.length * (145 + 7 * 2) + 24,
    //             minWidth: Dimensions.get('window').width,
    //           }}
    //         />
    //         :
    //         featured && featured.length > 0
    //           ? <Carousel
    //             ref={(c) => { this._carousel = c; }}
    //             data={featured || []}
    //             renderItem={item => this.renderItem(item, deviceInfo)}
    //             sliderWidth={screenWidth + 5 * 2}
    //             itemWidth={145 + 7 * 2}
    //             loop={false}
    //             inactiveSlideOpacity={1}
    //             inactiveSlideScale={1}
    //             layout={'default'}
    //             activeSlideAlignment={'start'}
    //             enableSnap={false}
    //             contentContainerCustomStyle={{
    //               overflow: 'hidden',
    //               width: featured.length * (145 + 7 * 2) + 24,
    //               minWidth: Dimensions.get('window').width,
    //             }}
    //           />
    //           : null
    //     }
    //     {
    //       featured && featured.length == 0 && !isLoadingFeatured
    //         ? <View style={{ width: Dimensions.get('window').width, paddingLeft: 16 }}>
    //             <Text style={{ fontFamily: fonts.light, letterSpacing: 1, color: theme.textColor }}>{emptyLabel}</Text>
    //           </View>
    //         : null
    //     }
    //   </View>
    // );
  }
}

const mapStateToProps = state => ({
  isLoadingFeatured: state.explore.isLoadingFeatured,
  isUserInfoFetched: state.deviceInfo.isUserInfoFetched,
  featured: state.explore.featured,
  deviceInfo: state.deviceInfo,
  download: state.download,
  userGUID: state.user.userGUID,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
});

const dispatchToProps = dispatch => ({
  getFeaturedCardsRequest: (featuredParameters, downloads, pullUpRefresh) => dispatch(actions.getFeaturedCardsRequest(featuredParameters, downloads, pullUpRefresh)),
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(withNavigation(DxFeaturedList));
