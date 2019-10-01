import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import { View } from 'react-native';

// Components
import { connect } from 'react-redux';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import FeaturedContainer from '../container/FeaturedContainer';
import MostPopularContainer from '../container/MostPopularContainer';
import NewReleasesContainer from '../container/NewReleasesContainer';
import TrendingContainer from '../container/TrendingContainer';

import Spinner from '../container/Spinner';

// Redux

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    flex: 1,
  },
};

class CarouselPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
  }

  handlePageContainer = (postByLabel, videoNotAvailableLabel, emptyLabel, internetAccesssLabel) => {
    const { currentTab } = this.props;


    if (currentTab === 'Featured') {
      return <FeaturedContainer internetAccesssLabel={internetAccesssLabel} postByLabel={postByLabel} videoNotAvailableLabel={videoNotAvailableLabel} emptyLabel={emptyLabel} />;
    } if (currentTab === 'MostPopular') {
      return <MostPopularContainer internetAccesssLabel={internetAccesssLabel} postByLabel={postByLabel} videoNotAvailableLabel={videoNotAvailableLabel} emptyLabel={emptyLabel} />;
    } if (currentTab === 'NewReleases') {
      return <NewReleasesContainer internetAccesssLabel={internetAccesssLabel} postByLabel={postByLabel} videoNotAvailableLabel={videoNotAvailableLabel} emptyLabel={emptyLabel} />;
    } if (currentTab === 'Trending') {
      return <TrendingContainer internetAccesssLabel={internetAccesssLabel} postByLabel={postByLabel} videoNotAvailableLabel={videoNotAvailableLabel} emptyLabel={emptyLabel} />;
    }
  }

  render() {
    const {
      currentTab,
      language,
      theme,
    } = this.props;

    const {
      contentContainerStyle,
    } = styles;

    const languageCheck = language || {};
    const homeLabels = languageCheck.HomeScreen ? languageCheck.HomeScreen : [];
    const dxCardLabels = languageCheck.DxCard ? languageCheck.DxCard : [];
    const carouselLabels = languageCheck.CarouselScreen ? languageCheck.CarouselScreen : [];
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    let featuredLabel;
    let postByLabel;
    let mostPopularLabel;
    let newReleaseLabel;
    let trendingLabel;
    let videoNotAvailableLabel;
    let internetAccesssLabel;
    let emptyLabel;

    homeLabels.map((label) => {
      if (label.Type === 'FEATURED') { featuredLabel = label.Content; }
      if (label.Type === 'MOST_POPULAR') {
        mostPopularLabel = label.Content;
      }
      if (label.Type === 'NEW_RELEASE') {
        newReleaseLabel = label.Content;
      }
      if (label.Type === 'TRENDING') { trendingLabel = label.Content; }
      if (label.Type === 'EMPTY') { emptyLabel = label.Content; }
    });

    dxCardLabels.map((label) => {
      if (label.Type === 'POST') { postByLabel = label.Content; }
    });

    errorMessage.map((label) => {
      if (label.Type === 'REQUIRE_INTERNET_ACCESS') {
        internetAccesssLabel = label.Content;
      }
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    let headerLabel;
    let searchLabel;

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchLabel = label.Content;
      }
    });

    if (currentTab === 'Featured') {
      headerLabel = featuredLabel;
    } else if (currentTab === 'MostPopular') {
      headerLabel = mostPopularLabel;
    } else if (currentTab === 'NewReleases') {
      headerLabel = newReleaseLabel;
    } else if (currentTab === 'Trending') {
      headerLabel = trendingLabel;
    }

    // console.log(`${currentTab} page`);

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={true}
          isBackIcon={false}
          headerLabel={headerLabel}
          currentTab={currentTab}
          searchLabel={searchLabel}
        />
        <View style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <Spinner />
          {
            this.handlePageContainer(postByLabel, videoNotAvailableLabel, emptyLabel, internetAccesssLabel)
          }
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CarouselPage);
