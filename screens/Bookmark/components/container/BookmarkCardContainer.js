import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';


// Libraries
import Moment from 'react-moment';
import {
  Icon,
  Button,
} from 'native-base';
import FastImage from 'react-native-fast-image';
import { SwipeRow } from 'react-native-swipe-list-view';

// Redux
import { compose } from 'redux';
import { connect } from 'react-redux';
import actions from '../../actions';
import channelActions from '../../../Channel/actions';
import videoActions from '../../../../actions/VideoScreen';

// Components
import DxVideoThumbnail from '../../../../components/DxVideoThumbnail';
import {
  DxTextContent,
  DxImage,
  DxLink,
  DxPdf,
  DxH5P,
  DxHtmlModal,
  DxCard2,
  DxAccordion,
  DxAudio,
} from '../../../../components';

import ContentCard from '../../../Search/components/presentation/ContentCard';

// Config
import * as config from '../../../../config';

// Utils
import { getUtcCurrentDateTime } from '../../../../helpers';
import { getRootPath } from '../../../../utils/fileSystem';

// fonts
import fonts from '../../../../styles/fonts';

// Images
import imagesIcon from '../../../../assets/images/Icons/sharp-image.png';
import videoIcon from '../../../../assets/images/Icons/sharp-video_library.png';
import pdfIcon from '../../../../assets/images/Icons/sharp-picture_as_pdf.png';
import textIcon from '../../../../assets/images/Icons/sharp-text_fields.png';
import linkIcon from '../../../../assets/images/Icons/sharp-link.png';
import otherIcon from '../../../../assets/images/Icons/sharp-blur_circular.png';
import audioIcon from '../../../../assets/images/Icons/audio.png';

const styles = {
  contentStyle: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 12,
  },
  titleStyle: {
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
    width: Dimensions.get('window').width
  },
  errorMessageStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 48,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  rightsideDeleteButton: {
    height: '100%',
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 2,
    display: 'flex',
    alignItems: 'flex-end',
  },
  deleteButtonStyle: {
    fontSize: 30,
  },
  iconOverlayStyle: {
    width: 25,
    height: 25,
    position: 'absolute',
    top: 0,
    right: 5,
    opacity: 0.6,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
};

const limitFixed = 4;

class BookmarkCardContainer extends Component {
  static propTypes = {
    previousTab: PropTypes.string,
    previousEmbedTab: PropTypes.string,
    currentTab: PropTypes.string,
    isConnected: PropTypes.bool,
    currentExperienceStreamGUID: PropTypes.string,
    paginationBookmarks: PropTypes.array,
    totalBookmarkcardRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    searchValue: PropTypes.string,
    pullUpRefresh: PropTypes.bool,
    isUpdating: PropTypes.bool,
    updatePageNumber: PropTypes.func,
    getBookmarkCardsRequest: PropTypes.func,
    postStreamCardContentRequest: PropTypes.func,
    navigation: PropTypes.object,
    userGUID: PropTypes.string,
    deleteBookmarkRequest: PropTypes.func,
  }

  componentDidMount() {
    const {
      previousTab,
      previousEmbedTab,
      currentTab,
      currentExperienceStreamGUID,
      paginationBookmarks,
      cardOnly,
      cardWithPages,
    } = this.props;

    if (previousTab != 'Section' && previousEmbedTab != 'Video') {
      // console.log('Bookmark cards list');
      this.getBookmarkCardsList(false, 1, false, limitFixed);
    } else if (this.refs._flatListView) {
      // Auto locate experience stream
      setTimeout(() => {
        if (currentExperienceStreamGUID) {
          let formattedBookmarkcards = [];
          if (currentTab === 'BookmarkCardPage') {
            formattedBookmarkcards = paginationBookmarks;
          } else if (currentTab === 'COVER') {
            formattedBookmarkcards = cardOnly;
          } else if (currentTab === 'PAGES') {
            formattedBookmarkcards = cardWithPages;
          }

          formattedBookmarkcards.map((item, index) => {
            if (item.ExperienceStreamGUID == currentExperienceStreamGUID) {
              this.refs._flatListView.scrollToIndex({ animated: true, index });
            }
          });
        }
      }, 500);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      pageNumber,
      searchValue,
      pullUpRefresh,
      currentTab,
    } = this.props;

    // delete and fetch more

    let dataArray;
    if (currentTab === 'BookmarkCardPage') {
      dataArray = nextProps.paginationBookmarks;
    } else if (currentTab === 'COVER') {
      dataArray = nextProps.cardOnly;
    } else if (currentTab === 'PAGES') {
      dataArray = nextProps.cardWithPages;
    }

    if (!nextProps.isUpdating && !nextProps.isSearchingBookmarks && dataArray.length < nextProps.limit) {
      // console.log("hit here")
      this.handleLoadMore(false, true);
    }

    // common fetch exp
    if (searchValue == nextProps.searchValue && pageNumber < nextProps.pageNumber) {
      this.getBookmarkCardsList(nextProps.pullUpRefresh || pullUpRefresh, nextProps.pageNumber, nextProps.reduceOffsetWhenWeDelete);
    }
  }

  handleLoadMore = (pullUpRefresh, reduceOffsetWhenWeDelete) => {
    const {
      isUpdating,
      totalBookmarkcardRecords,
      pageNumber,
      currentTab,
      originalTotalCardOnlyRecords,
      originalTotalCardWithPagesRecords,
      paginationBookmarks,
      cardOnly,
      cardWithPages,
      isSearchingBookmarks,
    } = this.props;

    if (currentTab === 'BookmarkCardPage') {
      if (!isUpdating && totalBookmarkcardRecords > paginationBookmarks.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'COVER') {
      if (!isUpdating && originalTotalCardOnlyRecords > cardOnly.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    } else if (currentTab === 'PAGES') {
      if (!isUpdating && originalTotalCardWithPagesRecords > cardWithPages.length) {
        this.props.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete);
      }
    }
  };

  getBookmarkCardsList = (pullUpRefresh, pageNumber, reduceOffsetWhenWeDelete, constLimit) => {
    const {
      searchValue, currentTab, limit,
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
      searchValue,
      currentTab,
    };

    this.props.getBookmarkCardsRequest(data, pullUpRefresh);
  };

  // Hard subscribe
  handlePressCard = (item) => {
    if (!item.isDownloaded) {
      this.handleHardSubscribe(item);
    }
    this.handleStreamContent(item);
  };

  // Hard subscribe
  handleHardSubscribe = (item) => {
    if (item.IsHardInterest === 0) {
      this.props.postChannelSubscribeRequest(
        this.props.userGUID,
        item.ExperienceChannelGUID,
        '1',
      );
    }
  };


  handleStreamContent = (item) => {
    const {
      isRequesting,
      isConnected
    } = this.props;
    const formattedParams = {
      stream: item,
      offline: !isConnected,
    };
    if (!isRequesting) {
      this.props.postStreamCardContentRequest(formattedParams);
    }
  };

  handleChannelNameClick = (channel) => {
    // this.props.navigation.navigate('Feed', {
    //   channel,
    //   UserGUID: this.props.userGUID,
    // });
    this.props.openClickedChannelExp(channel, false, false)
  };

  // Handle un-bookmark
  handleUnBookmark = (stream) => {
    const {
      currentTab,
      isRequesting
    } = this.props;

    let data;
    if (stream.SectionGUID) {
      data = {
        type: 'sections',
        section: stream,
        currentTab,
      };
    } else {
      data = {
        type: 'cards',
        stream,
        currentTab,
      };
    }
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  };

  renderBookmarkSection = (section) => {
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
          <DxPdf
            key={section.SectionGUID}
            source={`${sourceLink}${section.Pdf}.pdf`}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            pdfLabel={section.PdfLabel}
            pdfBgColor={section.PdfBgColor}
            currentTab="BookmarkCardPage"
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
          />
        );

      case 'EDITOR':
        return (
          <View style={{ height: 150 }}>
            <DxHtmlModal
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              source={`${sourceLink}${section.Html}.html`}
              handlePressContent={() => { }}
              currentTab="BookmarkCardPage"
            />
          </View>
        );

      case 'VIDEO':
        return (
          <DxVideoThumbnail
            videoLink={section.VideoUrl}
            // padding={true}
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
          />
        );

      case 'LINK':
        return (
          <DxLink
            key={section.SectionGUID}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            link={section.Link}
            linkLabel={section.LinkLabel}
            linkColor={section.LinkColor}
            linkBgColor={section.LinkBgColor}
            currentTab="BookmarkCardPage"
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
          />
        );

      case 'H5P':
        return (
          <DxH5P
            key={section.SectionGUID}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            h5p={section.H5p}
            h5pLabel={section.H5pLabel}
            h5pBgColor={section.H5pBgColor}
            h5pFilename={section.H5pFileName}
            currentTab="BookmarkCardPage"
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
          />
        );

      case 'ACCORDION':
        return (
          <View style={{ width: Dimensions.get('window').width }}>
            <DxAccordion
              key={section.SectionGUID}
              accordionData={section.AccordionArr}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'AUDIO':
        return (
          <View style={{ width: Dimensions.get('window').width - 20 }}>
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
              currentTab="Bookmark"
              subTab="InnerPage"
            />
          </View>
        );

      default:
        return null;
    }
  }

  renderExperienceStream = (bookmarkcardItem, userGUID) => {
    const { isConnected, theme, isNightMode } = this.props;

    const {
      titleContainerStyle,
      titleStyle,
    } = styles;

    let imageSrc;
    if (bookmarkcardItem.Type === 'EMBED_PDF') {
      imageSrc = pdfIcon;
    } else if (bookmarkcardItem.Type === 'EDITOR' || bookmarkcardItem.Type === 'ACCORDION') {
      imageSrc = textIcon;
    } else if (bookmarkcardItem.Type === 'VIDEO') {
      imageSrc = videoIcon;
    } else if (bookmarkcardItem.Type === 'TEXT') {
      imageSrc = textIcon;
    } else if (bookmarkcardItem.Type === 'IMAGE') {
      imageSrc = imagesIcon;
    } else if (bookmarkcardItem.Type === 'LINK') {
      imageSrc = linkIcon;
    } else if (bookmarkcardItem.Type === 'H5P') {
      imageSrc = otherIcon;
    } else if (bookmarkcardItem.Type === 'AUDIO') {
      imageSrc = audioIcon;
    }

    const tmpDate = getUtcCurrentDateTime();

    return (
      <View style={[{ marginBottom: 12 }, Platform.OS == 'android' ? { marginTop: 12, marginBottom: 0 } : null]}>
        <SwipeRow
          key={bookmarkcardItem.ExperienceStreamGUID}
          style={[styles.swipeBodyStyle, { backgroundColor: theme.bgColor2 }]}
          disableRightSwipe={true}
          rightOpenValue={-100}
        >
          <View style={styles.rightsideDeleteButton}>
            <Button style={{
              shadowOffset: {
                height: 0,
                width: 0,
              },
              shadowOpacity: 0,
              elevation: 0,
              height: '100%',
              width: 100,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }} danger onPress={() => this.handleUnBookmark(bookmarkcardItem)}>
              <Icon active name={'ios-trash'} />
            </Button>
          </View>
          <View style={[{
            overflow: 'hidden', justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: theme.bgColor2
          },]}>
            <View style={titleContainerStyle}>
              <Moment element={Text} format="YYYY-MM-DD h:mm a" style={[titleStyle, { color: theme.textColor2 }]}>{bookmarkcardItem.bookmarkedAt ? bookmarkcardItem.bookmarkedAt : tmpDate}</Moment>
            </View>
            {
              bookmarkcardItem.SectionGUID ? <View style={[{ position: 'relative', marginTop: 6 }, isNightMode ? { paddingBottom: 16 } : { paddingBottom: 6 }]}>
                {this.renderBookmarkSection(bookmarkcardItem)}
                <View style={styles.iconOverlayStyle}>
                  <FastImage
                    style={styles.imageStyle}
                    source={imageSrc}
                  />
                </View>
              </View>
                : <ContentCard
                  experience={bookmarkcardItem}
                  fullWidth
                  localData={bookmarkcardItem.isDownloaded}
                  folderName={bookmarkcardItem.ExperienceStreamGUID}
                  handlePressCard={() => this.handlePressCard(bookmarkcardItem)}
                  handleChannelNameClick={this.handleChannelNameClick}
                  type="FEEDSPAGE_CARD"
                  postByLabel={this.props.postByLabel}
                  videoNotAvailableLabel={this.props.videoNotAvailableLabel}
                  isConnected={isConnected}
                  userGUID={userGUID}
                  theme={theme}
                  isNightMode={isNightMode}
                  currentTab="BookmarkCardPage"
                  showChannelName={true}
                />
            }
          </View>
        </SwipeRow>
      </View>
    );
  }

  _keyExtractor = (item) => {
    if (item.SectionGUID) {
      return item.SectionGUID;
    }
    return item.ExperienceStreamGUID;
  };

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
      paginationBookmarks,
      userGUID,
      currentTab,
      cardOnly,
      cardWithPages,
      previousTab,
      theme,
    } = this.props;

    let dataArray;
    if (currentTab === 'BookmarkCardPage') {
      dataArray = paginationBookmarks;
    } else if (currentTab === 'COVER') {
      dataArray = cardOnly;
    } else if (currentTab === 'PAGES') {
      dataArray = cardWithPages;
    }

    // console.log('Bookmark card list container');

    return (
      <View style={contentStyle}>
        {
          dataArray.length > 0
            ? <FlatList
              ref='_flatListView'
              keyExtractor={this._keyExtractor}
              data={dataArray}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
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
  searchValue: state.bookmark.searchValue,

  currentExperienceStreamGUID: state.bookmark.currentExperienceStream.ExperienceStreamGUID,
  totalBookmarkcardRecords: state.bookmark.totalBookmarkcardRecords,
  paginationBookmarks: state.bookmark.paginationBookmarks,
  isLoading: state.bookmark.isLoading,
  isFirstLoading: state.bookmark.isFirstLoading,
  pageNumber: state.bookmark.pageNumber,
  isUpdating: state.bookmark.isUpdating,
  pullUpRefresh: state.bookmark.pullUpRefresh,


  cardOnly: state.bookmark.cardOnly,
  totalCardOnlyRecords: state.bookmark.totalCardOnlyRecords,
  originalTotalCardOnlyRecords: state.bookmark.originalTotalCardOnlyRecords,

  cardWithPages: state.bookmark.cardWithPages,
  totalCardWithPagesRecords: state.bookmark.totalCardWithPagesRecords,
  originalTotalCardWithPagesRecords: state.bookmark.originalTotalCardWithPagesRecords,
  limit: state.bookmark.limit,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,

  reduceOffsetWhenWeDelete: state.bookmark.reduceOffsetWhenWeDelete,

  isSearchingBookmarks: state.bookmark.isSearchingBookmarks,

  isRequesting: state.deviceInfo.isRequesting
});

const dispatchToProps = dispatch => ({
  getBookmarkCardsRequest: (data, pullUpRefres) => dispatch(actions.getBookmarkCardsRequest(data, pullUpRefres)),

  postStreamCardContentRequest: data => dispatch(actions.postStreamCardContentRequest(data)),

  postChannelSubscribeRequest: (userGUID, ExperienceChannelGUID, IsHardInterest) => dispatch(
    channelActions.postChannelSubscribeRequest(userGUID, ExperienceChannelGUID, IsHardInterest),
  ),

  deleteBookmarkRequest: data => dispatch(actions.deleteBookmarkRequest(data)),

  updatePageNumber: (pullUpRefresh, reduceOffsetWhenWeDelete) => dispatch(actions.updatePageNumber(pullUpRefresh, reduceOffsetWhenWeDelete)),

  redirectVideoScreen: (data, experienceType) => dispatch(videoActions.redirectVideoScreen(data, experienceType)),
  openClickedChannelExp: (channelData, isSearch, isNavigate) => dispatch(channelActions.openClickedChannelExp(channelData, isSearch, isNavigate)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(BookmarkCardContainer);
