import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Navigation
import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';
import { Header } from '../../../../components';

// Redux
import searchActions from '../../../Search/actions';

class HeaderNavigator extends Component {
  static propTypes = {
    isSearchIcon: PropTypes.bool,
    isAddIcon: PropTypes.bool,
    homeLabel: PropTypes.string,
    searchLabel: PropTypes.string,
    deviceInfo: PropTypes.object,
    updateHomeInput: PropTypes.func,
    getDownloadCards: PropTypes.func,
    userGUID: PropTypes.string,
    languageGUID: PropTypes.string,
    getFeaturedCardsRequest: PropTypes.func,
    download: PropTypes.object,
    getNewReleaseRequest: PropTypes.func,
    getMostPopularRequest: PropTypes.func,
    getTrendingRequest: PropTypes.func,
    toggleHomeSearch: PropTypes.func,
    explore: PropTypes.object,
    navigation: PropTypes.object,

  }

  handleChangeInput = (value) => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
    } = this.props;

    this.props.updateInput(value);
  }

  handleClearSearch = () => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
    } = this.props;
    this.props.updateInput(null);
  }

  handleSearchIconPress = () => {
    let type = 'HOME_SEARCH';
    if (this.props.searchToggle) {
      type = null;
    }
    this.props.toggleSearch(!this.props.searchToggle, type);
  }

  render() {
    const {
      isSearchIcon,
      homeLabel,
      searchLabel,
      theme,
      orgImageGUID,
    } = this.props;
   
    return (
      <Header
        title={homeLabel}
        isLogo={true}
        isSearchIcon={isSearchIcon}
        isSearch={this.props.searchToggle}
        drawerOpen={this.props.navigation.openDrawer}
        inputPlaceholder={searchLabel}
        inputValue={this.props.searchValue}
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        theme={theme}
        orgImageGUID={orgImageGUID}
      />
    );
  }
}

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  download: state.download,
  explore: state.explore,
  searchValue: state.search.searchValue,
  searchToggle: state.search.searchToggle,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  theme: state.setting.theme,
  orgImageGUID: state.deviceInfo.orgImageGUID,
});

const mapDispatchToProps = dispatch => ({
  updateInput: val => dispatch(searchActions.updateInput(val)),
  toggleSearch: (toggle, type) => dispatch(searchActions.toggleSearch(toggle, type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(HeaderNavigator));
