import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Dimensions, Text, TouchableOpacity, Platform, 
} from 'react-native';

// Navigation
import { withNavigation } from 'react-navigation';

// Libraries
import {
  Content, Button, Left, Container, Icon, Spinner
} from 'native-base';

// Redux
import { compose } from 'redux';
import { connect } from 'react-redux';
import carouselActions from '../../../Carousel/actions';
import downloadActions from '../../../Download/actions';
import actions from '../../actions';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

// Components
import { TextSize } from '../../../../styles/types';
import DxDownloadList from './DxDownloadList';
import DxFeaturedList from './DxFeaturedList';
import DxPopularList from './DxPopularList';
import DxNewReleaseList from './DxNewReleaseList';
import DxTrendingList from './DxTrendingList';
import MyChannelsList from './MyChannelsList';

// Utils
import { headerForIphoneX } from '../../../../helpers';

const styles = {
  pageContent: {
  },
  sliderContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 6,
  },
  continueReadingStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36
  },
  headerStyle: {
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: '#000',
    fontSize: 18,
  },
  preheaderStyle: {
    fontFamily: fonts.light,
    letterSpacing: 1,
    color: '#000',
    fontSize: 12,
    marginLeft: 7,
    marginTop: 10,
  },
  seeAllButtonStyle: {
    marginTop: 3,
    alignItems: 'center',
  },
  seeAllButtonTextStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    color: '#000',
  },
  seeAllIconStyle: {
    color: '#000',
    marginTop: -3,
    fontSize: 14,
    marginLeft: 3,
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
};

const sortDownloadDataByRecentlyViewedAt = (array) => {
  // check for recently viewed at
  let recentlyViewedAt = array.filter(item => item.recentlyViewedAt);
  const downloadedAt = array.filter(item => !item.recentlyViewedAt);

  if (recentlyViewedAt.length) recentlyViewedAt.sort((a, b) => new Date(b.recentlyViewedAt) - new Date(a.recentlyViewedAt));
  if (downloadedAt.length) downloadedAt.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  recentlyViewedAt = recentlyViewedAt.concat(downloadedAt);
  return recentlyViewedAt;
};

class HomeContainer extends Component {
  static propTypes = {
    featured: PropTypes.array,
    mostPopular: PropTypes.array,
    newReleases: PropTypes.array,
    trending: PropTypes.array,
    navigate: PropTypes.func,
    navigation: PropTypes.object,
    downloads: PropTypes.array,
    closeModal: PropTypes.func,
    modal: PropTypes.object,
    continueReadingLabel: PropTypes.string,
    seeAllLabel: PropTypes.string,
    featuredLabel: PropTypes.string,
    mostPopularLabel: PropTypes.string,
    newReleaseLabel: PropTypes.string,
    trendingLabel: PropTypes.string,
    emptyLabel: PropTypes.string,
    openDownloadPage: PropTypes.func,
    openFeaturedPage: PropTypes.func,
    openTrendingPage: PropTypes.func,
    openNewReleasesPage: PropTypes.func,
    openMostPopularPage: PropTypes.func,
  };

  handleOpenDownloads = () => {
    this.props.openDownloadPage();
  };

  render() {
    const {
      continueReadingStyle,
      headerContainer,
      seeAllButtonStyle,
      headerStyle,
      seeAllButtonTextStyle,
      sliderContainer,
      pageContent,
      preheaderStyle,
      seeAllIconStyle,
    } = styles;

    const {
      navigation,

      continueReadingLabel,
      seeAllLabel,
      featuredLabel,
      mostPopularLabel,
      newReleaseLabel,
      trendingLabel,
      emptyLabel,

      offlineReadyLabel,
      storageDownloads,

      isFeaturedEnable,
      isMostPopularEnable,
      isNewReleaseEnable,
      isTrendingEnable,
    } = this.props;

    const { bgColor } = this.props.theme;

    let formattedDownloads = {};
    let formattedFeatured = {};
    let formattedMostPopular = {};
    let formattedNewReleases = {};
    let formattedTrending = {};
    let formattedList;
    let formattedDownloadArr;

    formattedDownloadArr = sortDownloadDataByRecentlyViewedAt(storageDownloads);

    // 1.Downloads
    formattedDownloads.ExperienceStreams = Object.assign([], formattedDownloadArr);
    formattedDownloads.Type = 'Fixed';
    formattedDownloads.Title = 'Downloads';
    formattedDownloads.SubHeader = true;
    formattedDownloads.ExperienceChannelGUID = "1";
    
    // 1.1 Featured
    if (isFeaturedEnable) {
      formattedFeatured.ExperienceStreams = Object.assign([], this.props.featured);
      formattedFeatured.Type = 'Fixed';
      formattedFeatured.Title = 'Featured';
      formattedFeatured.ExperienceChannelGUID = "2";
    }

    // 1.2 Most Popular
    if (isMostPopularEnable) {
      formattedMostPopular.ExperienceStreams = Object.assign([], this.props.mostPopular);
      formattedMostPopular.Type = 'Fixed';
      formattedMostPopular.Title = 'Most popular';
      formattedMostPopular.ExperienceChannelGUID = "3";
    }

    // 1.3 New Releases
    if (isNewReleaseEnable) {
      formattedNewReleases.ExperienceStreams = Object.assign([], this.props.newReleases);
      formattedNewReleases.Type = 'Fixed';
      formattedNewReleases.Title = 'New Releases';
      formattedNewReleases.ExperienceChannelGUID = "4";
    }

    // 1.4 Trending
    // if (isTrendingEnable) {
      // formattedTrending.ExperienceStreams = Object.assign([], state.trending);
      // formattedTrending.Type = 'Fixed';
      // formattedTrending.ChannelName = 'Trending';
      //  formattedTrending.ExperienceChannelGUID = "5";
    // }

    // 2. Combining all the arrays
    formattedList = [formattedDownloads];

    if (isFeaturedEnable) {
      formattedList.push(formattedFeatured);
    }

    if (isMostPopularEnable) {
      formattedList.push(formattedMostPopular);
    } 

    if (isNewReleaseEnable) {
      formattedList.push(formattedNewReleases);
    } 

    // if (isTrendingEnable) {
    //   formattedList.push(formattedTrending);
    // } 

    return (
      <Container style={[pageContent, { backgroundColor: bgColor }]}>
        <View style={{ paddingTop: 6 }}>
          {
            isFeaturedEnable && <DxFeaturedList navigation={navigation} emptyLabel={emptyLabel} />
          }
          { 
            isMostPopularEnable && <DxPopularList navigation={navigation} emptyLabel={emptyLabel} /> 
          }
          {
            isNewReleaseEnable && <DxNewReleaseList navigation={navigation} emptyLabel={emptyLabel} />
          }

          {/* { 
            isTrendingEnable && <DxTrendingList navigation={navigation} emptyLabel={emptyLabel} />
          } */}

          {/* My Channels */}
          <View>
            <MyChannelsList 
              navigation={this.props.navigation}
              seeAllLabel={seeAllLabel}
              emptyLabel={emptyLabel}
              featuredLabel={featuredLabel}
              mostPopularLabel={mostPopularLabel}
              trendingLabel={trendingLabel}
              newReleaseLabel={newReleaseLabel}
              continueReadingLabel={continueReadingLabel}
              offlineReadyLabel={offlineReadyLabel}
              formattedList={formattedList}
            />
          </View>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  isLoadingFeatured: state.explore.isLoadingFeatured,
  isLoadingNewReleases: state.explore.isLoadingNewReleases,
  isLoadingMostPopular: state.explore.isLoadingMostPopular,
  isLoadingTrending: state.explore.isLoadingTrending,

  isFeaturedEnable: state.deviceInfo.isFeaturedEnable,
  isMostPopularEnable: state.deviceInfo.isMostPopularEnable,
  isNewReleaseEnable: state.deviceInfo.isNewReleaseEnable,
  isTrendingEnable: state.deviceInfo.isTrendingEnable,

  featured: state.explore.featured,
  newReleases: state.explore.newReleases,
  mostPopular: state.explore.mostPopular,
  trending: state.explore.trending,
  theme: state.setting.theme,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  deviceInfo: state.deviceInfo,
  storageDownloads: state.download.storageDownloads,
});

const dispatchToProps = dispatch => ({
  openDownloadPage: pageType => dispatch(downloadActions.openDownloadPage(pageType)),
  openFeaturedPage: pageType => dispatch(carouselActions.openFeaturedPage(pageType)),
  openTrendingPage: pageType => dispatch(carouselActions.openTrendingPage(pageType)),
  openNewReleasesPage: pageType => dispatch(carouselActions.openNewReleasesPage(pageType)),
  openMostPopularPage: pageType => dispatch(carouselActions.openMostPopularPage(pageType)),
  getMyChannelsListRequest: data => dispatch(actions.getMyChannelsListRequest(data)),
});

export default compose(
  connect(
    mapStateToProps,
    dispatchToProps,
  ),
  withNavigation,
)(HomeContainer);
