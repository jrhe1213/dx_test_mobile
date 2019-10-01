import React, { Component } from 'react';
import PropTypes from 'prop-types';

// components
import { DxContainer } from '../../styles/grid';
import HomePage from './components/layout/HomePage';

class HomeScreen extends Component {
  static propTypes = {

  }

  render() {
    return (
      <DxContainer>
        <HomePage />
      </DxContainer>
    );
  }
}

export default HomeScreen;
