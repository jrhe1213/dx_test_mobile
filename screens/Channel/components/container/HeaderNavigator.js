import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import { compose } from 'redux';
import actions from '../../actions';
import searchActions from '../../../Search/actions';

// Components
import { Header } from '../../../../components';

// helpers
import * as helpers from '../../../../helpers';

class HeaderNavigator extends Component {
  static propTypes = {
    openDrawer: PropTypes.func,
    isBackIcon: PropTypes.bool,
    isSearchIcon: PropTypes.bool,
    isHamburgerIcon: PropTypes.bool,
    isAddIcon: PropTypes.bool,
    isDownloadIcon: PropTypes.bool,
    navigation: PropTypes.object,
    nav: PropTypes.object,
    currentTab: PropTypes.string,
    openPromoButton: PropTypes.func,
    closePromoButton: PropTypes.func,
    exploreLabel: PropTypes.string,
    searchChannelLabel: PropTypes.string,
  }

  state = {
    limit: 6,
  }

  handleBackNavigate = () => {
    // console.log('go back');
  }

  handleChangeInput = (value) => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
    } = this.props;
    if (!isConnected) {
      return;
    }

    this.props.updateInput(value);
  }

  handleClearSearch = () => {
    const {
      deviceInfo: {
        internetInfo: { isConnected },
      },
    } = this.props;
    if (!isConnected) {
      return;
    }

    this.props.updateInput(null);
  }

  handleSearchIconPress = () => {
    let type = 'CHANNEL_SEARCH';
    if (this.props.searchToggle) {
      type = null;
    }
    this.props.toggleSearch(!this.props.searchToggle, type);
  }

  render() {
    const {
      isBackIcon,
      isSearchIcon,
      nav: { currentTab },
      openPromoButton,
      closePromoButton,
      exploreLabel,
      searchChannelLabel,
      theme,
      orgImageGUID,
    } = this.props;

    return (
      <Header
        currentTab={currentTab}
        isLogo={true}
        orgImageGUID={orgImageGUID}
        title={exploreLabel}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}
        isSearch={this.props.searchToggle}
        inputPlaceholder={searchChannelLabel}
        inputValue={this.props.searchValue}
        handleBackIconPress={() => this.handleBackNavigate()}
        drawerOpen={() => this.props.navigation.openDrawer()}
        openPromoButton={() => openPromoButton()}
        closePromoButton={() => closePromoButton()}
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        theme={theme}
      />
    );
  }
}

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  nav: state.nav,
  channel: state.channel,
  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  searchToggle: state.search.searchToggle,
  searchValue: state.search.searchValue,
  pageNumber: state.channel.pageNumber,
  isLoading: state.channel.isLoading,
  theme: state.setting.theme,
  orgImageGUID: state.deviceInfo.orgImageGUID,
});

const mapDispatchToProps = dispatch => ({
  updateInput: val => dispatch(searchActions.updateInput(val)),
  toggleSearch: (toggle, type) => dispatch(searchActions.toggleSearch(toggle, type)),
  
  openPromoButton: () => dispatch(actions.openPromoButton()),
  closePromoButton: () => dispatch(actions.closePromoButton()),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withNavigation)(HeaderNavigator);
