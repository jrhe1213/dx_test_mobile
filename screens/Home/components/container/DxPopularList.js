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

class DxPopularList extends Component {
  static propTypes = {
    userGUID: PropTypes.string,
    languageGUID: PropTypes.string,
    getMostPopularRequest: PropTypes.func,
    download: PropTypes.object,
    deviceInfo: PropTypes.object,
    navigation: PropTypes.object,
    mostPopular: PropTypes.array,
    emptyLabel: PropTypes.string,
    postStreamCardContentRequest: PropTypes.func,
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
      this.getMostpopularContent(storageDownloads);
    }
  }

  componentWillReceiveProps(nextProps) {
    // #1 login
    if (!this.props.isUserInfoFetched && nextProps.isUserInfoFetched && !nextProps.mostPopular.length) {
      const { isConnected } = this.props.deviceInfo.internetInfo;
      const { storageDownloads } = this.props.download;
      if (isConnected) this.getMostpopularContent(storageDownloads);
    }

    // #2 change language
    if ((this.props.deviceInfo.languageGUID != nextProps.deviceInfo.languageGUID) && nextProps.deviceInfo.languageGUID) {
      const { isConnected } = nextProps.deviceInfo.internetInfo;
      const { storageDownloads } = nextProps.download;
      if (isConnected) this.getMostpopularContent(storageDownloads);
    }

    // #3 change tab
  }

  getMostpopularContent = (storageDownloads) => {
    const {
      userGUID, languageGUID,
    } = this.props;
    const mostPopularParameters = {
      // UserGUID: userGUID,
      Limit: '10',
      Offset: '0',
      ChannelLanguageGUID: languageGUID,
      Extra: {
        SearchType: '',
        SearchField: '',
        SortType: 'POPULAR',
      },
    };
    this.props.getMostPopularRequest(mostPopularParameters, storageDownloads, false);
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

  renderItem = (slideItem, deviceInfo) => (
    <SlideItem
      slide={slideItem}
      currentTab="Home"
      deviceInfo={deviceInfo}
      handlePressCard={this.handlePressCard}
      handleChannelNameClick={this.handleChannelNameClick}
      userGUID={this.props.userGUID}
      cardTitleColor={this.props.theme.textColor}
      isNightMode={this.props.isNightMode}
    />
  )

  renderPlaceholder = () => <View style={{ marginLeft: 24 }}><DxCardPlaceholder /></View>

  render() {
    const {
      isLoadingMostPopular,
      mostPopular,
      emptyLabel,
      deviceInfo,
      theme,
    } = this.props;

    const screenWidth = Dimensions.get('window').width;
    return null;
    // return (
    //   <View>
    //     {
    //       isLoadingMostPopular ?
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
    //             width: mostPopular.length * (145 + 7 * 2) + 24,
    //             minWidth: Dimensions.get('window').width
    //           }}
    //         /> :
    //         mostPopular && mostPopular.length > 0
    //           ? <Carousel
    //             ref={(c) => { this._carousel = c; }}
    //             data={mostPopular || []}
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
    //               width: mostPopular.length * (145 + 7 * 2) + 24,
    //               minWidth: Dimensions.get('window').width
    //             }}
    //           />
    //           : null
    //     }
    //     {
    //       mostPopular && mostPopular.length == 0 && !isLoadingMostPopular
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
  isLoadingMostPopular: state.explore.isLoadingMostPopular,
  isUserInfoFetched: state.deviceInfo.isUserInfoFetched,
  mostPopular: state.explore.mostPopular,
  deviceInfo: state.deviceInfo,
  download: state.download,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
});

const dispatchToProps = dispatch => ({
  getMostPopularRequest: (mostPopularParameters, downloads, pullUpRefresh) => dispatch(actions.getMostPopularRequest(mostPopularParameters, downloads, pullUpRefresh)),
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(withNavigation(DxPopularList));
