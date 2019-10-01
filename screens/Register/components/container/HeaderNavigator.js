import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import PropTypes from 'prop-types';

// Components
import { connect } from 'react-redux';
import { Header } from '../../../../components';

// Redux
import actions from '../../actions';
import homeActions from '../../../Home/actions';

class HeaderNavigator extends Component {
  static propTypes = {
    closeRegisterPage: PropTypes.func,
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    // console.log('hit download android back');
    this.props.settingsPageClose();
    return true;
  }

  render() {
    const {
      isBackIcon,
      isSearchIcon,
      registerLabel,
      theme,
    } = this.props;

    return (
      <Header
        title={registerLabel}
        isBackIcon={isBackIcon}
        isSearchIcon={isSearchIcon}
        isClose={true}
        handleBackIconPress={() => {}}
        handleClosePage={() => this.props.closeRegisterPage()}
        theme={theme}
      />
    );
  }
}

const stateToProps = state => ({
  theme: state.setting.theme,
});

const dispatchToProps = dispatch => ({
  closeRegisterPage: () => dispatch(actions.closeRegisterPage()),
});

export default connect(stateToProps, dispatchToProps)(HeaderNavigator);
