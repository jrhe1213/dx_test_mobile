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
import homeActions from '../../../Home/actions';

class HeaderNavigator extends Component {
  static propTypes = {
    searchLabel: PropTypes.string,
    downloadLabel: PropTypes.string,
    searchValue: PropTypes.string,
    updateDownloadInput: PropTypes.func,
    totalDownloadRecords: PropTypes.number,
    clearDownloadRequest: PropTypes.func,
  }

  state = {
    isSearch: false,
    limit: 4,
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.searchValue !== nextProps.searchValue) {
      this.getDownloadsList(nextProps.searchValue);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  getDownloadsList = _.debounce((searchValue) => {
    const {
      limit,
    } = this.state;

    const data = {
      Limit: limit.toString(),
      Offset: '0',
      searchValue,
      isSearch: true,
    };

    this.props.getDownloadsDirectoryRequest(data, false);
  }, 1000);

  handleAndroidBackPress = () => {
    // console.log('hit download android back');
    this.props.closeDownloadPage();
    return true;
  }

  handleChangeInput = (value) => {
    this.props.updateDownloadInput(value);
  }

  handleClearSearch = () => {
    this.props.updateDownloadInput(null);
  }

  handleSearchIconPress = () => {
    this.setState({
      isSearch: !this.state.isSearch,
    });
  }

  render() {
    const {
      isBackIcon,
      isSearchIcon,
      searchLabel,
      downloadLabel,
      totalDownloadRecords,
      theme,
      postsLabel,
    } = this.props;

    return (
      <Header
        title={downloadLabel}
        postLabel={postsLabel}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}
        inputPlaceholder={searchLabel}
        inputValue={this.props.searchValue}
        isSearch={this.state.isSearch}
        isClose={true}
        isOnleHamburgerIcon={false}
        currentTab="Download"
        // totalDownloadRecords={totalDownloadRecords}
        totalDownloadRecords={0}
        handleBackIconPress={() => {}}
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        handleClosePage={() => this.props.closeDownloadPage()}
        handleToggleMenu={() => this.props.clearDownloadRequest()}
        theme={theme}
      />
    );
  }
}

const stateToProps = state => ({
  searchValue: state.download.searchValue,
  totalDownloadRecords: state.download.totalDownloadRecords,
  theme: state.setting.theme,
});

const dispatchToProps = dispatch => ({
  updateDownloadInput: val => dispatch(actions.updateDownloadInput(val)),

  getDownloadsDirectoryRequest: (data, pullUpRefresh) => dispatch(actions.getDownloadsDirectoryRequest(data, pullUpRefresh)),

  closeDownloadPage: () => dispatch(actions.closeDownloadPage()),
  clearDownloadRequest: () => dispatch(actions.clearDownloadRequest()),
});

export default connect(stateToProps, dispatchToProps)(withNavigation(HeaderNavigator));
