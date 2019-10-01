import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import CarouselPage from './components/layout/CarouselPage';

class CarouselScreen extends Component {
  render() {
    return (
      <DxContainer>
        <CarouselPage />
      </DxContainer>
    );
  }
}

export default CarouselScreen;
