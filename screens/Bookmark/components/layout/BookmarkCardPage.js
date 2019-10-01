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
import BookmarkCardContainer from '../container/BookmarkCardContainer';
import Spinner from '../container/Spinner';

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    minHeight: Dimensions.get('window').height - 64 - 48,
    backgroundColor: colors.bgColor,
  },
};

class BookmarkCardPage extends Component {
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

    if (currentTab !== 'BookmarkCardPage' && currentTab !== 'COVER' && currentTab !== 'PAGES') {
      return null;
    }

    const languageCheck = language || {};

    const bookmarkLabels = languageCheck.BookmarkScreen ? languageCheck.BookmarkScreen : [];

    const dxCardLabels = languageCheck.DxCard ? languageCheck.DxCard : [];

    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let bookmarkLabel;
    let searchLabel;
    let emptyLabel;
    let postByLabel;
    let coverLabel;
    let pagesLabel;

    let recetlyBookmarksLabel;
    let videoNotAvailableLabel;

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
      if (label.Type === 'RECENTLY_BOOKMARK') {
        recetlyBookmarksLabel = label.Content;
      }

      if (label.Type === 'COVER') {
        coverLabel = label.Content;
      }

      if (label.Type === 'PAGE') {
        pagesLabel = label.Content;
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

    // console.log('Bookmark Cards page');

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={true}
          isBackIcon={false}
          recetlyBookmarksLabel={recetlyBookmarksLabel}
          searchLabel={searchLabel}
          bookmarksLabel={bookmarkLabel}
          coverLabel={coverLabel}
          pagesLabel={pagesLabel}
        />
        <Container style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <Spinner />
          <BookmarkCardContainer
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

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkCardPage);
