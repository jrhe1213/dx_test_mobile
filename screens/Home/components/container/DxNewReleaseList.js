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

class DxNewReleaseList extends Component {
  static propTypes = {
    userGUID: PropTypes.string,
    languageGUID: PropTypes.string,
    getNewReleaseRequest: PropTypes.func,
    download: PropTypes.object,
    deviceInfo: PropTypes.object,
    navigation: PropTypes.object,
    newReleases: PropTypes.array,
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
      this.getNewReleasesContent(storageDownloads);
    }
  }

  componentWillReceiveProps(nextProps) {
    // #1 login
    if (!this.props.isUserInfoFetched && nextProps.isUserInfoFetched && !nextProps.newReleases.length) {
      const { isConnected } = this.props.deviceInfo.internetInfo;
      const { storageDownloads } = this.props.download;
      if (isConnected) this.getNewReleasesContent(storageDownloads);
    }

    // #2 change language
    if ((this.props.deviceInfo.languageGUID != nextProps.deviceInfo.languageGUID) && nextProps.deviceInfo.languageGUID) {
      const { isConnected } = nextProps.deviceInfo.internetInfo;
      const { storageDownloads } = nextProps.download;
      if (isConnected) this.getNewReleasesContent(storageDownloads);
    }

    // #3 change tab
  }

  getNewReleasesContent = (storageDownloads) => {
    const {
      userGUID, languageGUID,
    } = this.props;
    const newReleasesParameters = {
      // UserGUID: userGUID,
      Limit: '10',
      Offset: '0',
      ChannelLanguageGUID: languageGUID,
      Extra: {
        SearchType: '',
        SearchField: '',
        SortType: 'NEW_RELEASE',
      },
    };
    this.props.getNewReleaseRequest(newReleasesParameters, storageDownloads, false);
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
      newReleases,
      emptyLabel,
      deviceInfo,
      theme,
      isLoadingNewReleases,
    } = this.props;

    const screenWidth = Dimensions.get('window').width;

    return null;
    // return (
    //   <View>
    //     {
    //       isLoadingNewReleases ?
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
    //             width: newReleases.length * (145 + 7 * 2) + 24,
    //             minWidth: Dimensions.get('window').width
    //           }}
    //         /> :
    //         newReleases && newReleases.length > 0
    //           ? <Carousel
    //             ref={(c) => { this._carousel = c; }}
    //             data={newReleases || []}
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
    //               width: newReleases.length * (145 + 7 * 2) + 24,
    //               minWidth: Dimensions.get('window').width
    //             }}
    //           />
    //           : null
    //     }
    //     {
    //       newReleases && newReleases.length == 0 && !isLoadingNewReleases
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
  isLoadingNewReleases: state.explore.isLoadingNewReleases,
  isUserInfoFetched: state.deviceInfo.isUserInfoFetched,
  newReleases: state.explore.newReleases,
  deviceInfo: state.deviceInfo,
  download: state.download,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
});

const dispatchToProps = dispatch => ({
  getNewReleaseRequest: (newReleasesParameters, downloads, pullUpRefresh) => dispatch(actions.getNewReleaseRequest(newReleasesParameters, downloads, pullUpRefresh)),
  postStreamCardContentRequest: data => dispatch(feedActions.postStreamCardContentRequest(data)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default connect(mapStateToProps, dispatchToProps)(withNavigation(DxNewReleaseList));
