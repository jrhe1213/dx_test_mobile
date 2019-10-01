import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import PropTypes from 'prop-types';

// Components
import { Header } from '../../../../components';

// Redux
import { connect } from 'react-redux';
import feedActions from '../../../Feed/actions';

class HeaderNavigator extends Component {
  static propTypes = {
    settingsPageClose: PropTypes.func,
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    // console.log('hit download android back');
    // this.props.settingsPageClose();
    return true;
  }

  handleBackNavigate = () => {
    this.props.dx_browse_to_previous_tab(this.props.history);
  }

  render() {
    const {
      isBackIcon,
      isSearchIcon,
      theme,
      tagNameLabel,
      searchLabel,
    } = this.props;

    return (
      <Header
        title={tagNameLabel}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}
        isSearch={this.props.searchToggle}
        handleBackIconPress={() => this.handleBackNavigate()}
        theme={theme}
        inputPlaceholder={searchLabel}
      />
    );
  }
}

const stateToProps = state => ({
  history: state.nav.history,
  theme: state.setting.theme,
  searchToggle: state.search.searchToggle,
});

const dispatchToProps = dispatch => ({
  dx_browse_to_previous_tab: (history) => dispatch(feedActions.dx_browse_to_previous_tab(history)),
});

export default connect(stateToProps, dispatchToProps)(HeaderNavigator);
