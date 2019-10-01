import React, { Component } from 'react';
import {
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Container,
} from 'native-base';

// Redux
import { connect } from 'react-redux';

// Components
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import BookmarkSectionContainer from '../container/BookmarkSectionContainer';
import Spinner from '../container/Spinner';

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    minHeight: Dimensions.get('window').height - 64 - 48,
  },
};

class BookmarkSectionPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
  }

  render() {
    const {
      currentTab,
      language,
      theme,
    } = this.props;

    const {
      contentContainerStyle,
    } = styles;

    if (currentTab === 'Bookmark') {
      return null;
    }

    // Destructing Labels for the page
    const languageCheck = language || {};

    const bookmarkLabels = languageCheck.BookmarkScreen ? languageCheck.BookmarkScreen : [];
    const dxCardLabels = languageCheck.DxCard ? languageCheck.DxCard : [];

    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let bookmarkLabel;
    let emptyLabel;
    let searchLabel;

    let videoNotAvailableLabel;

    let videoLabel;
    let pdfLabel;
    let textLabel;
    let linkLabel;
    let otherLabel;
    let imagesLabel;
    let postByLabel;
    let audioLabel;

    dxCardLabels.map((label) => {
      if (label.Type === 'POST') {
        postByLabel = label.Content;
      }
    });

    bookmarkLabels.map((label) => {
      if (label.Type === 'BOOKMARK') {
        bookmarkLabel = label.Content;
      }

      if (label.Type === 'EMPTY') {
        emptyLabel = label.Content;
      }

      if (label.Type === 'IMAGE') {
        imagesLabel = label.Content;
      }

      if (label.Type === 'VIDEO') {
        videoLabel = label.Content;
      }
      if (label.Type === 'PDF') {
        pdfLabel = label.Content;
      }
      if (label.Type === 'TEXT') {
        textLabel = label.Content;
      }
      if (label.Type === 'LINK') {
        linkLabel = label.Content;
      }
      if (label.Type === 'AUDIO') {
        audioLabel = label.Content;
      }
      if (label.Type === 'OTHER') {
        otherLabel = label.Content;
      }
      if (label.Type === 'SEARCH') {
        searchLabel = label.Content;
      }
    });

    errorMessage.map((label) => {
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    // console.log('Bookmark Sections page');

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isBackIcon={false}
          searchLabel={searchLabel}
          bookmarksLabel={bookmarkLabel}
          imagesLabel={imagesLabel}
          videoLabel = {videoLabel}
          pdfLabel = {pdfLabel}
          textLabel = {textLabel}
          linkLabel = {linkLabel}
          otherLabel = {otherLabel}
          audioLabel={audioLabel}
        />
        <Container style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <Spinner />
          <BookmarkSectionContainer
            postByLabel={postByLabel}
            emptyLabel={emptyLabel}
            videoNotAvailableLabel={videoNotAvailableLabel} />
        </Container>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkSectionPage);
