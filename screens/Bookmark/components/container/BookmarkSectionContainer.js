import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import Moment from 'react-moment';
import {
  Icon,
  SwipeRow,
  Button,
} from 'native-base';

// Redux
import { connect } from 'react-redux';
import DxVideoThumbnail from '../../../../components/DxVideoThumbnail';
import actions from '../../actions';
import videoActions from '../../../../actions/VideoScreen';

// Components
import {
  DxTextContent,
  DxImage,
  DxLink,
  DxPdf,
  DxH5P,
  DxHtmlModal,
  DxAccordion,
  DxAudio
} from '../../../../components';

// Config
import * as config from '../../../../config';

// Constants
import * as colors from '../../../../styles/variables';

// Utils
import { getUtcCurrentDateTime } from '../../../../helpers';
import { getRootPath } from '../../../../utils/fileSystem';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  contentStyle: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  titleStyle: {
    color: colors.greyColor,
    fontSize: 14,
    marginRight: 3,
    fontFamily: fonts.light,
    letterSpacing: 2,
  },
  swipeBodyStyle: {
    width: '100%',
    borderBottomWidth: 0,
    // marginBottom: 6,
    marginRight: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  errorMessageStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 48,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  rightsideDeleteButton: {
    height: '100%',
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 2,
  },
  deleteButtonStyle: {
    fontSize: 30,
  },
  videoStyle: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  bookmarkDateContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  bookmarkDateStyling: {
    fontFamily: fonts.light,
    color: colors.greyColor,
    fontSize: 14,
    marginRight: 3,
    letterSpacing: 2,
  },
};

const limitFixed = 4;

class BookmarkSectionContainer extends Component {
  static propTypes = {
    previousTab: PropTypes.string,
    previousEmbedTab: PropTypes.string,
    currentTab: PropTypes.string,
    isConnected: PropTypes.bool,
    currentExperienceStreamGUID: PropTypes.string,
    paginationBookmarks: PropTypes.array,
    totalBookmarkcardRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pullUpRefresh: PropTypes.bool,
    updatePageNumber: PropTypes.func,
    getBookmarkSectionsRequest: PropTypes.func,
    postStreamCardContentRequest: PropTypes.func,
    navigation: PropTypes.object,
    isUpdating: PropTypes.bool,
    userGUID: PropTypes.string,
    deleteBookmarkRequest: PropTypes.func,
    isLoading: PropTypes.bool,
    paginationPdfArray: PropTypes.array,
    paginationEditorArray: PropTypes.array,
    paginationVideoArray: PropTypes.array,
    paginationImageArray: PropTypes.array,
    paginationLinkArray: PropTypes.array,
    paginationH5pArray: PropTypes.array,
    storageDownloads: PropTypes.array,
    redirectVideoScreen: PropTypes.func,
  }

  componentDidMount() {
    this.getBookmarkSectionsList(false, 1, false, limitFixed);
  }

  componentWillReceiveProps(nextProps) {
    const {
      pageNumber,
      pullUpRefresh,
      currentTab,
      limit,
    } = this.props;

    let dataArray;
    if (currentTab === 'IMAGES') {
      dataArray = nextProps.paginationImageArray;
    } else if (currentTab === 'VIDEOS') {
      dataArray = nextProps.paginationVideoArray;
    } else if (currentTab === 'PDF') {
      dataArray = nextProps.paginationPdfArray;
    } else if (currentTab === 'TEXT') {
      dataArray = nextProps.paginationEditorArray;
    } else if (currentTab === 'LINKS') {
      dataArray = nextProps.paginationLinkArray;
    } else if (currentTab === 'H5P') {
      dataArray = nextProps.paginationH5pArray;
    } else if (currentTab === 'AUDIO') {
      dataArray = nextProps.paginationAudioArray;
    } else {
      dataArray = [];
    }

    if (!nextProps.isUpdating && dataArray.length < nextProps.limit) {
      this.handleLoadMore(false, true);
    }

    if (pageNumber < nextProps.pageNumber) {
      this.getBookmarkSectionsList(nextProps.pullUpRefresh || pullUpRefresh, nextProps.pageNumber, nextProps.reduceOffsetWhenWeDelete);
    }
  }

  handleLoadMore = (pullUpRefresh, reduceOffsetWhenWeDelete) => {
    const {
      isUpdating,
      totalImageRecords,
      totalVideoRecords,
      totalPdfRecords,
      totalAudioRecords,
      totalEditorRecords,
      totalLinkRecords,
      totalH5pRecords,
      paginationImageArray,
      paginationVideoArray,
      paginationPdfArray,
      paginationEditorArray,
      paginationLinkArray,
      paginationH5pArray,
      paginationAudioArray,
      pageNumber,
      currentTab,
    } = this.props;

    if (currentTab === 'IMAGES') {
      if (!isUpdating && totalImageRecords > paginationImageArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'VIDEOS') {
      if (!isUpdating && totalVideoRecords > paginationVideoArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'PDF') {
      if (!isUpdating && totalPdfRecords > paginationPdfArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'TEXT') {
      if (!isUpdating && totalEditorRecords > paginationEditorArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'LINKS') {
      if (!isUpdating && totalLinkRecords > paginationLinkArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'H5P') {
      if (!isUpdating && totalH5pRecords > paginationH5pArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'AUDIO') {
      if (!isUpdating && totalAudioRecords > paginationAudioArray.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    }
  };

  getBookmarkSectionsList = (pullUpRefresh, pageNumber, reduceOffsetWhenWeDelete, constLimit) => {
    const {
      currentTab, limit,
    } = this.props;

    let tempLimit;
    if (constLimit) {
      tempLimit = limitFixed;
    } else {
      tempLimit = limit;
    }

    let offsetCalc = tempLimit * (pageNumber - 1);

    if (reduceOffsetWhenWeDelete) {
      offsetCalc -= 1;
    }

    const data = {
      Limit: tempLimit.toString(),
      Offset: offsetCalc.toString(),
      currentTab,
    };

    this.props.getBookmarkSectionsRequest(data, pullUpRefresh);
  };

  // Hard subscribe
  handlePressCard = (item) => {
    if (!item.isDownloaded) {
      this.handleHardSubscribe(item);
    }
    this.handleStreamContent(item);
  };

  handleStreamContent = (item) => {
    const {
      isRequesting,
      isConnected,
    } = this.props;
    const formattedParams = {
      stream: item,
      offline: !isConnected,
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  // Handle un-bookmark
  handleUnBookmark = (section) => {
    const {
      isRequesting
    } = this.props;
    const data = {
      type: 'sections',
      section,
    };
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  };

  renderContent = (section) => {
    if (!section) {
      return null;
    }

    const {
      storageDownloads,
    } = this.props;
    const {
      ExperienceStreamGUID,
      ExperienceGUID,
    } = section;

    const { userGUID } = this.props;

    // Check is downloaded
    const isDownloaded = storageDownloads.filter(
      stream => stream.ExperienceStreamGUID === ExperienceStreamGUID,
    );
    let sourceLink;
    let blurSourceLink;
    if (isDownloaded.length) {
      sourceLink = getRootPath('downloadFeeds', userGUID, ExperienceStreamGUID);
      blurSourceLink = getRootPath('downloadFeeds', userGUID, ExperienceStreamGUID);
    } else if (section.Type == 'EMBED_PDF' || section.Type == 'EDITOR') {
      sourceLink = `${config.default.viewBaseLink + ExperienceGUID}/`;
    } else if (section.Type == 'IMAGE') {
      sourceLink = `${config.formatImageLink(section.Img)}`;
      blurSourceLink = `${config.formatImageLink(section.Img)}&Type=BLUR`;
    }

    switch (section.Type) {
      case 'EMBED_PDF':
        return (
          <View style={{ flex: 1 }}>
            <DxPdf
              key={section.SectionGUID}
              source={`${sourceLink}${section.Pdf}.pdf`}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              pdfLabel={section.PdfLabel}
              pdfBgColor={section.PdfBgColor}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'EDITOR':
        return (
          <View style={{ flex: 1, height: 150 }}>
            <DxHtmlModal
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              source={`${sourceLink}${section.Html}.html`}
              handlePressContent={() => { }}
            />
          </View>
        );

      case 'VIDEO':
        return (
          <DxVideoThumbnail
            videoLink={section.VideoUrl}
            handleVideoPress={() => this.props.redirectVideoScreen(section.VideoUrl, '0')}
            isConnected={this.props.isConnected}
            videoNotAvailableLabel={this.props.videoNotAvailableLabel}
          />
        );

      case 'TEXT':
        return (
          <DxTextContent
            key={section.SectionGUID}
            content={section.Content}
            marginBottom={7}
          />
        );

      case 'IMAGE':
        return (
          <DxImage
            key={section.SectionGUID}
            section={section}
            targetSectionGUID={section.SectionGUID}
            source={`${sourceLink}${isDownloaded.length ? `${section.Img}.jpg` : ''}`}
            blurSource={`${blurSourceLink}${isDownloaded.length ? `${section.Img}_blur.jpg` : ''}`}
            marginBottom={7}
          />
        );

      case 'LINK':
        return (
          <View style={{ flex: 1 }}>
            <DxLink
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              link={section.Link}
              linkLabel={section.LinkLabel}
              linkColor={section.LinkColor}
              linkBgColor={section.LinkBgColor}
              marginBottom={7}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'H5P':
        return (
          <View style={{ flex: 1 }}>
            <DxH5P
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              h5p={section.H5p}
              h5pLabel={section.H5pLabel}
              h5pBgColor={section.H5pBgColor}
              h5pFilename={section.H5pFileName}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'ACCORDION':
        return (
          <View style={{ width: '100%' }}>
            <DxAccordion
              key={section.SectionGUID}
              accordionData={section.AccordionArr}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'AUDIO':
        return (
          <View style={{ width: '100%', paddingLeft: 12, paddingRight: 12 }}>
            <DxAudio
              key={section.SectionGUID}
              section={section}
              isImageCover={section.IsImgCover}
              targetSectionGUID={section.SectionGUID}
              source={`${sourceLink}${section.Audio}.mp3`}
              audioLabel={section.AudioLabel}
              audioBgColor={section.AudioBgColor}
              audioFilename={section.AudioFileName}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 200px);`}
              imgSource={`${sourceLink}${isDownloaded.length ? `${section.AudioImg}.jpg` : ''}`}
              blurImageSource={`${blurSourceLink}${isDownloaded.length ? `${section.AudioImg}_blur.jpg` : ''}`}
              currentTab="BookmarkPage"
              subTab="InnerPage"
            />
          </View>
        );

      default:
        return null;
    }
  }

  renderExperienceStream = (bookmarkItem) => {
    const {
      swipeBodyStyle,
      rightsideDeleteButton,
      bookmarkDateContainerStyle,
      bookmarkDateStyling,
      deleteButtonStyle,
    } = styles;

    const { theme } = this.props;

    const tmpDate = getUtcCurrentDateTime();

    return (
      <View style={[{ marginBottom: 12 }, Platform.OS == 'android' ? { marginTop: 12, marginBottom: 0 } : null]}>
        <SwipeRow
          disableRightSwipe
          style={[swipeBodyStyle, { backgroundColor: theme.bgColor2 }]}
          rightOpenValue={-100}
          body={
            <View style={{
              overflow: 'hidden', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 16, paddingBottom: 16,
            }}>
              <View style={bookmarkDateContainerStyle}>
                <Moment
                  element={Text}
                  format="YYYY-MM-DD h:mm a"
                  style={[bookmarkDateStyling, { color: theme.textColor2 }]}
                >{bookmarkItem.bookmarkedAt ? bookmarkItem.bookmarkedAt : tmpDate}</Moment>
              </View>
              {
                this.renderContent(bookmarkItem)
              }
            </View>
          }
          right={
            <View style={rightsideDeleteButton}>
              <Button style={{
                shadowOffset: {
                  height: 0,
                  width: 0,
                },
                shadowOpacity: 0,
                elevation: 0,
              }}
                danger onPress={
                  () => this.handleUnBookmark(bookmarkItem)
                } >
                <Icon active name="trash" style={deleteButtonStyle} />
              </Button>
            </View>
          }
        />
      </View>
    );
  }

  _keyExtractor = item => item.SectionGUID;

  render() {
    const {
      contentStyle,
      errorMessageStyle,
      errorMessageTextStyle,
    } = styles;

    const {
      emptyLabel,
      pageNumber,
      isLoading,
      userGUID,
      currentTab,
      paginationPdfArray,
      paginationEditorArray,
      paginationVideoArray,
      paginationImageArray,
      paginationLinkArray,
      paginationH5pArray,
      paginationAudioArray,
      theme,
    } = this.props;

    let dataArray;
    if (currentTab === 'IMAGES') {
      dataArray = paginationImageArray;
    } else if (currentTab === 'VIDEOS') {
      dataArray = paginationVideoArray;
    } else if (currentTab === 'PDF') {
      dataArray = paginationPdfArray;
    } else if (currentTab === 'TEXT') {
      dataArray = paginationEditorArray;
    } else if (currentTab === 'LINKS') {
      dataArray = paginationLinkArray;
    } else if (currentTab === 'H5P') {
      dataArray = paginationH5pArray;
    } else if (currentTab === 'AUDIO') {
      dataArray = paginationAudioArray;
    } else {
      dataArray = [];
    }

    // console.log(`${currentTab} container`);
    return (
      <View style={contentStyle}>
        {
          dataArray.length > 0
            ? <FlatList
              ref='_flatListView'
              keyExtractor={this._keyExtractor}
              data={dataArray}
              style={{ paddingTop: 12 }}
              renderItem={({ item }) => this.renderExperienceStream(item, userGUID)}
              onScrollToIndexFailed={() => { }}

              ListFooterComponent={isLoading && <ActivityIndicator size="small" animating />}
              onEndReached={
                ({ distanceFromEnd }) => {
                  if (distanceFromEnd < -100 && pageNumber === 1) {
                    return;
                  }
                  this.handleLoadMore(false);
                }}
              onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
              // scrollEventThrottle={1000}
              refreshing={isLoading}
              onRefresh={() => this.handleLoadMore(true)}
            />
            : <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {emptyLabel}
              </Text>
            </View>
        }
      </View>
    );
  }
}

const stateToProps = state => ({
  previousTab: state.nav.previousTab,
  previousEmbedTab: state.nav.previousEmbedTab,
  currentTab: state.nav.currentTab,

  userGUID: state.user.userGUID,
  languageGUID: state.deviceInfo.languageGUID,
  storageDownloads: state.download.storageDownloads,
  isConnected: state.deviceInfo.internetInfo.isConnected,

  currentExperienceStreamGUID: state.bookmark.currentExperienceStreamGUID,
  totalBookmarkcardRecords: state.bookmark.totalBookmarkcardRecords,
  paginationBookmarks: state.bookmark.paginationBookmarks,
  isLoading: state.bookmark.isLoading,
  isFirstLoading: state.bookmark.isFirstLoading,
  pageNumber: state.bookmark.pageNumber,
  isUpdating: state.bookmark.isUpdating,
  pullUpRefresh: state.bookmark.pullUpRefresh,

  paginationPdfArray: state.bookmark.paginationPdfArray,
  paginationEditorArray: state.bookmark.paginationEditorArray,
  paginationVideoArray: state.bookmark.paginationVideoArray,
  paginationImageArray: state.bookmark.paginationImageArray,
  paginationLinkArray: state.bookmark.paginationLinkArray,
  paginationH5pArray: state.bookmark.paginationH5pArray,
  paginationAudioArray: state.bookmark.paginationAudioArray,

  totalPdfRecords: state.bookmark.totalPdfRecords,
  totalEditorRecords: state.bookmark.totalEditorRecords,
  totalVideoRecords: state.bookmark.totalVideoRecords,
  totalImageRecords: state.bookmark.totalImageRecords,
  totalLinkRecords: state.bookmark.totalLinkRecords,
  totalH5pRecords: state.bookmark.totalH5pRecords,
  totalAudioRecords: state.bookmark.totalAudioRecords,

  theme: state.setting.theme,
  reduceOffsetWhenWeDelete: state.bookmark.reduceOffsetWhenWeDelete,
  limit: state.bookmark.limit,

  isRequesting: state.deviceInfo.isRequesting
});

const dispatchToProps = dispatch => ({
  getBookmarkSectionsRequest: (data, pullUpRefres) => dispatch(actions.getBookmarkSectionsRequest(data, pullUpRefres)),

  postStreamCardContentRequest: data => dispatch(actions.postStreamCardContentRequest(data)),

  deleteBookmarkRequest: data => dispatch(actions.deleteBookmarkRequest(data)),

  updatePageNumber: (pullUpRefresh, reduceOffsetWhenWeDelete) => dispatch(actions.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete)),

  redirectVideoScreen: (data, experienceType) => dispatch(videoActions.redirectVideoScreen(data, experienceType)),
});

export default connect(stateToProps, dispatchToProps)(BookmarkSectionContainer);
