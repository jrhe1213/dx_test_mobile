import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import TagPage from './components/layout/TagPage';

class TagScreen extends Component {
  render() {
    return (
      <DxContainer>
        <TagPage />
      </DxContainer>
    );
  }
}

export default TagScreen;
