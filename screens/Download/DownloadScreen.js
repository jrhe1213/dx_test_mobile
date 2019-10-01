import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import DownloadPage from './components/layout/DownloadPage';

class DownloadScreen extends Component {
  render() {
    return (
      <DxContainer>
        <DownloadPage />
      </DxContainer>
    );
  }
}

export default DownloadScreen;
