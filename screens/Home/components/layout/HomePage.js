import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import actions from '../../../../actions/DeviceInfo';

// Components
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import HomeContainer from '../container/HomeContainer';
import FeedEmptyPage from './FeedEmptyPage';

// Constants
import * as colors from '../../../../styles/variables';


const styles = {
  mainContainerStyle: {
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
  },
};

class HomePage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
    isConnected: PropTypes.bool,
    download: PropTypes.object,
  }

  renderContainer = (continueReadingLabel, seeAllLabel, featuredLabel, mostPopularLabel, newReleaseLabel, trendingLabel, emptyLabel, offlineReadyLabel) => <HomeContainer
    continueReadingLabel={continueReadingLabel}
    seeAllLabel={seeAllLabel}
    featuredLabel={featuredLabel}
    mostPopularLabel={mostPopularLabel}
    newReleaseLabel={newReleaseLabel}
    trendingLabel={trendingLabel}
    emptyLabel={emptyLabel}
    offlineReadyLabel={offlineReadyLabel}
  />


  render() {
    const {
      currentTab,
      isConnected,
      download: {
        storageDownloads,
      },
      language,
      isNightMode,
    } = this.props;

    const {
      mainContainerStyle,
      errorMessageStyle,
      errorMessageTextStyle,
    } = styles;

    if (currentTab != 'Home' && currentTab != 'MainScreen') {
      return null;
    }

    const languageCheck = language || {};
    const homeLabels = languageCheck.HomeScreen ? languageCheck.HomeScreen : [];
    const messageLabels = languageCheck.Message ? languageCheck.Message : [];
    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    // Destructing Labels for the page
    let homeLabel;
    let discoverLabel;
    let continueReadingLabel;
    let seeAllLabel;
    let featuredLabel;
    let mostPopularLabel;
    let newReleaseLabel;
    let trendingLabel;
    let emptyLabel;
    let searchLabel;
    let internetLabel;
    let offlineReadyLabel;

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchLabel = label.Content;
      }
    });

    homeLabels.map((label) => {
      if (label.Type === 'HOME') { homeLabel = label.Content; }
      if (label.Type === 'OFFLINE') { offlineReadyLabel = label.Content; }
      if (label.Type === 'DISCOVER') { discoverLabel = label.Content; }
      if (label.Type === 'CONTINUE_READING') { continueReadingLabel = label.Content; }
      if (label.Type === 'SEE_ALL') { seeAllLabel = label.Content; }
      if (label.Type === 'FEATURED') { featuredLabel = label.Content; }
      if (label.Type === 'MOST_POPULAR') { mostPopularLabel = label.Content; }
      if (label.Type === 'NEW_RELEASE') { newReleaseLabel = label.Content; }
      if (label.Type === 'TRENDING') { trendingLabel = label.Content; }
      if (label.Type === 'EMPTY') { emptyLabel = label.Content; }
    });

    messageLabels.map((label) => {
      if (label.Type === 'INTERNET') { internetLabel = label.Content; }
    });

    const { bgColor, primaryColor, textColor2 } = this.props.theme;

    return (
      <DxContainer style={[mainContainerStyle, { backgroundColor: bgColor }]}>
        <HeaderNavigator
          isSearchIcon={true}
          isAddIcon={true}
          searchLabel={searchLabel}
          homeLabel={homeLabel}
        />
        {
          this.renderContainer(
            continueReadingLabel,
            seeAllLabel,
            featuredLabel,
            mostPopularLabel,
            newReleaseLabel,
            trendingLabel,
            emptyLabel,
            offlineReadyLabel,
          )
        }
        {/* {
          storageDownloads.length > 0
            ? this.renderContainer(
              continueReadingLabel,
              seeAllLabel,
              featuredLabel,
              mostPopularLabel,
              newReleaseLabel,
              trendingLabel,
              emptyLabel,
              offlineReadyLabel,
            )
            : isConnected
              ? <FeedEmptyPage
                handleNavigateExplore={() => this.props.openExplorePage()}
                feedEmptyLabels={discoverLabel}
                bgColor={bgColor}
                primaryColor={primaryColor}
              />
              : <View style={errorMessageStyle}>
                <Text style={[errorMessageTextStyle, { color: textColor2 }]}>
                  {internetLabel}
                </Text>
              </View>
        } */}

      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  download: state.download,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({
  openExplorePage: () => dispatch(actions.openExplorePage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(HomePage));
