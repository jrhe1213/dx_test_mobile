import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import BookmarkPage from './components/layout/BookmarkPage';


class BookmarkScreen extends Component {
  static propTypes = {
  }

  render() {
    return (
      <DxContainer>
        <BookmarkPage />
      </DxContainer>
    );
  }
}

export default BookmarkScreen;
