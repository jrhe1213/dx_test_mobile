import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

// Libraries
import PropTypes from 'prop-types';

// Components
import LoginPage from './components/layout/LoginPage';

// Config
import config from '../../config';

class LoginScreen extends Component {
  static propTypes = {

  };

  // componentDidMount() {
  //   AsyncStorage.clear();
  // }

  static navigationOptions = {
    header: null,
  }

  render() {
    return (
      <LoginPage />
    );
  }
}

export default LoginScreen;
