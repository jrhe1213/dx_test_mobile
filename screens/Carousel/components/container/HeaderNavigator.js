import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Navigation
import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';
import { Header } from '../../../../components';

// Redux
import actions from '../../actions';
import searchActions from '../../../Search/actions';

class HeaderNavigator extends Component {
  static propTypes = {
  }

  state = {
    limit: 4,
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    // console.log('hit download android back');
    this.handleCloseAction(this.props.currentTab);
    return true;
  }

  handleChangeInput = (value) => {
    const { isConnected } = this.props;
    if (!isConnected) {
      return;
    }

    this.props.updateInput(value);
  }

  handleClearSearch = () => {
    const { isConnected } = this.props;
    if (!isConnected) {
      return;
    }

    this.props.updateInput(null);
  }

  handleSearchIconPress = () => {
    const { currentTab } = this.props;
    let type = `${currentTab.toUpperCase()}_SEARCH`;
    if (this.props.searchToggle) {
      type = null;
    }
    this.props.toggleSearch(!this.props.searchToggle, type);
  }

  handleCloseAction = (currentTab) => {
    if (currentTab === 'Featured') {
      this.props.closeFeaturedPage('Featured');
    } else if (currentTab === 'MostPopular') {
      this.props.closeMostPopularPage('MostPopular');
    } else if (currentTab === 'NewReleases') {
      this.props.closeNewReleasesPage('NewReleases');
    } else if (currentTab === 'Trending') {
      this.props.closeTrendingPage('Trending');
    }
  }

  render() {
    const {
      isBackIcon,
      isSearchIcon,
      headerLabel,
      currentTab,
      theme,
      searchLabel,
    } = this.props;

    return (
      <Header
        title={headerLabel}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}

        inputValue={this.props.searchValue}
        isSearch={this.props.searchToggle}
        inputPlaceholder={searchLabel}

        isClose={true}
        handleBackIconPress={() => {}}
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        handleClosePage = {() => this.handleCloseAction(currentTab)}
        theme={theme}
      />
    );
  }
}

const stateToProps = state => ({
  theme: state.setting.theme,
  searchValue: state.search.searchValue,
  searchToggle: state.search.searchToggle,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  download: state.download,
  isConnected: state.deviceInfo.internetInfo.isConnected,
});

const dispatchToProps = dispatch => ({
  updateInput: val => dispatch(searchActions.updateInput(val)),

  toggleSearch: (toggle, type) => dispatch(searchActions.toggleSearch(toggle, type)),

  closeFeaturedPage: pageType => dispatch(actions.closeFeaturedPage(pageType)),
  closeMostPopularPage: pageType => dispatch(actions.closeMostPopularPage(pageType)),
  closeNewReleasesPage: pageType => dispatch(actions.closeNewReleasesPage(pageType)),
  closeTrendingPage: pageType => dispatch(actions.closeTrendingPage(pageType)),
});

export default connect(stateToProps, dispatchToProps)(withNavigation(HeaderNavigator));
