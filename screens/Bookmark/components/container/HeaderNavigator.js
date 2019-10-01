import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BackHandler } from 'react-native';
import _ from 'lodash';

// Navigation
import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';
import { Header } from '../../../../components';

// Redux
import actions from '../../actions';

class HeaderNavigator extends Component {
  static propTypes = {
    isSearchIcon: PropTypes.bool,
    emptyLabel: PropTypes.string,
    bookmarkLabel: PropTypes.string,
    updateBookmarkInput: PropTypes.func,
    toggleBookmarkSearch: PropTypes.func,
    searchLabel: PropTypes.string,
    currentTab: PropTypes.string,
    searchValue: PropTypes.string,
    totalPdfRecords: PropTypes.number,
    totalEditorRecords: PropTypes.number,
    totalVideoRecords: PropTypes.number,
    totalImageRecords: PropTypes.number,
    totalLinkRecords: PropTypes.number,
    totalH5pRecords: PropTypes.number,
    searchToggle: PropTypes.bool,
    totalBookmarkcardRecords: PropTypes.number,
    closeBookmarkSectionPage: PropTypes.func,
    navigation: PropTypes.object,
  }

  state = {
    isSearch: false,
    limit: 4,
  }

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.searchValue !== nextProps.searchValue) {
      this.getBookmarkCardsList(nextProps.searchValue);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
  }

  handleAndroidBackPress = () => {
    // console.log('hit download android back');
    const { currentTab } = this.props;
    this.props.closeBookmarkSectionPage(currentTab);
    return true;
  }

  getBookmarkCardsList = _.debounce((searchValue) => {
    const { limit } = this.state;
    const { currentTab } = this.props;

    const data = {
      Limit: limit.toString(),
      Offset: 0,
      searchValue,
      isSearch: true,
      currentTab,
    };

    this.props.getBookmarkCardsRequest(data, false);
  }, 1000);

  handleChangeInput = (value) => {
    this.props.updateBookmarkInput(value);
  }

  handleClearSearch = () => {
    this.props.updateBookmarkInput(null);
  }

  handleSearchIconPress = () => {
    this.props.toggleBookmarkSearch(!this.props.searchToggle);
  }

  handleCloseAction = () => {
    const { currentTab } = this.props;

    this.props.closeBookmarkSectionPage(currentTab);
  }

  render() {
    const {
      isSearchIcon,
      bookmarksLabel,
      recetlyBookmarksLabel,
      searchLabel,
      currentTab,
      searchValue,
      searchToggle,
      totalBookmarkcardRecords,
      totalPdfRecords,
      totalEditorRecords,
      totalVideoRecords,
      totalImageRecords,
      totalLinkRecords,
      totalH5pRecords,
      totalAudioRecords,
      originalTotalCardOnlyRecords,
      originalTotalCardWithPagesRecords,
      theme,
      orgImageGUID,
      videoLabel,
      imagesLabel,
      pdfLabel,
      textLabel,
      linkLabel,
      otherLabel,
      coverLabel,
      pagesLabel,
    } = this.props;

    let isLogo;
    let isClose;
    let totalCounts;
    let bookmarkLabel;

    if (currentTab === 'Bookmark') {
      bookmarkLabel = bookmarksLabel;
      isLogo = true;
      isClose = false;
    } else {
      isLogo = false;
      isClose = true;
    }


    if (currentTab === 'IMAGES') {
      bookmarkLabel = imagesLabel;
      totalCounts = totalImageRecords;
    } else if (currentTab === 'VIDEOS') {
      bookmarkLabel = videoLabel;
      totalCounts = totalVideoRecords;
    } else if (currentTab === 'PDF') {
      bookmarkLabel = pdfLabel;
      totalCounts = totalPdfRecords;
    } else if (currentTab === 'TEXT') {
      bookmarkLabel = textLabel;
      totalCounts = totalEditorRecords;
    } else if (currentTab === 'LINKS') {
      bookmarkLabel = linkLabel;
      totalCounts = totalLinkRecords;
    } else if (currentTab === 'H5P') {
      bookmarkLabel = otherLabel;
      totalCounts = totalH5pRecords;
    } else if (currentTab === 'AUDIO') {
      bookmarkLabel = 'Audio';
      totalCounts = totalAudioRecords;
    } else if (currentTab === 'COVER') {
      bookmarkLabel = coverLabel;
      totalCounts = originalTotalCardOnlyRecords;
    } else if (currentTab === 'PAGES') {
      bookmarkLabel = pagesLabel;
      totalCounts = originalTotalCardWithPagesRecords;
    } else if (currentTab === 'BookmarkCardPage') {
      bookmarkLabel = recetlyBookmarksLabel;
      totalCounts = totalBookmarkcardRecords;
    }

    return (
      <Header
        title={bookmarkLabel}
        isLogo={isLogo}
        orgImageGUID={orgImageGUID}
        isClose={isClose}
        isSearchIcon={isSearchIcon}
        isSearch={searchToggle}
        inputPlaceholder={searchLabel}
        inputValue={searchValue}
        drawerOpen={this.props.navigation.openDrawer}
        // totalDownloadRecords={totalCounts}
        totalDownloadRecords={0}
        postLabel={bookmarksLabel}
        currentTab="BookmarkCardPage"
        handleChangeInput={val => this.handleChangeInput(val)}
        handleClearSearch={() => this.handleClearSearch()}
        handleSearchIconPress={() => this.handleSearchIconPress()}
        handleClosePage = {() => this.handleCloseAction()}
        theme={theme}
      />
    );
  }
}

const mapStateToProps = state => ({
  searchValue: state.bookmark.searchValue,
  searchToggle: state.bookmark.searchToggle,
  currentTab: state.nav.currentTab,
  totalBookmarkcardRecords: state.bookmark.totalBookmarkcardRecords,
  totalPdfRecords: state.bookmark.totalPdfRecords,
  totalEditorRecords: state.bookmark.totalEditorRecords,
  totalVideoRecords: state.bookmark.totalVideoRecords,
  totalImageRecords: state.bookmark.totalImageRecords,
  totalLinkRecords: state.bookmark.totalLinkRecords,
  totalH5pRecords: state.bookmark.totalH5pRecords,
  totalAudioRecords: state.bookmark.totalAudioRecords,
  originalTotalCardOnlyRecords: state.bookmark.originalTotalCardOnlyRecords,
  originalTotalCardWithPagesRecords: state.bookmark.originalTotalCardWithPagesRecords,
  theme: state.setting.theme,
  orgImageGUID: state.deviceInfo.orgImageGUID,
});

const mapDispatchToProps = dispatch => ({
  getBookmarkCardsRequest: (data, pullUpRefres) => dispatch(actions.getBookmarkCardsRequest(data, pullUpRefres)),
  updateBookmarkInput: val => dispatch(actions.updateBookmarkInput(val)),
  toggleBookmarkSearch: toggle => dispatch(actions.toggleBookmarkSearch(toggle)),
  closeBookmarkSectionPage: sectionType => dispatch(actions.closeBookmarkSectionPage(sectionType)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(HeaderNavigator));
