import React, { Component } from 'react';

// Libraries
import PropTypes from 'prop-types';

// Components
import RegisterPage from './components/layout/RegisterPage';

// Config
import config from '../../config';

class RegisterScreen extends Component {
  static navigationOptions = {
    header: null,
  }

  render() {
    return (
      <RegisterPage />
    );
  }
}

export default RegisterScreen;
