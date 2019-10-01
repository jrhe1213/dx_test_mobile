import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import SettingPage from './components/layout/SettingPage';

class SettingScreen extends Component {
  render() {
    return (
      <DxContainer>
        <SettingPage />
      </DxContainer>
    );
  }
}

export default SettingScreen;
