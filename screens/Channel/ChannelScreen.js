import React, { Component } from 'react';

// Components
import {
  DxContainer,
} from '../../styles/grid';
import ChannelPage from './components/layout/ChannelPage';

class ChannelScreen extends Component {
  render() {
    return (
      <DxContainer>
        <ChannelPage />
      </DxContainer>
    );
  }
}


export default ChannelScreen;
