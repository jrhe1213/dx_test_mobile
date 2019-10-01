import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button, Icon } from 'native-base';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import actions from '../../actions';

// Components
import { TextSize } from '../../../../styles/types';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import DxBookmarkCardList from '../container/DxBookmarkCardList';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

// Images
import sectionBg from '../../../../assets/images/Icons/bookmarkSectionBG.png';
import nightModeSectionBg from '../../../../assets/images/Icons/nightModeSectionBg.png';
import imagesIcon from '../../../../assets/images/Icons/sharp-image.png';
import videoIcon from '../../../../assets/images/Icons/sharp-video_library.png';
import pdfIcon from '../../../../assets/images/Icons/sharp-picture_as_pdf.png';
import textIcon from '../../../../assets/images/Icons/sharp-text_fields.png';
import linkIcon from '../../../../assets/images/Icons/sharp-link.png';
import otherIcon from '../../../../assets/images/Icons/sharp-blur_circular.png';
import coverIcon from '../../../../assets/images/Icons/sharp-note.png';
import pagesIcon from '../../../../assets/images/Icons/sharp-filter_none.png';

const styles = {
  contentContainerStyle: {
    paddingTop: 12,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  continueReadingStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStyle: {
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: '#000',
    fontSize: 18,
  },
  seeAllButtonStyle: {
    marginTop: 3,
    alignItems: 'center',
  },
  seeAllButtonTextStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    color: '#000',
  },
  seeAllIconStyle: {
    color: '#000',
    marginTop: -3,
    fontSize: 14,
    marginLeft: 3,
  },
  sectionContainerStyle: {
    marginRight: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionContainerButtonStyle: {
    // flex: 1,
    width: 112,
    height: 112,
  },
  totaltRecordsTextStyle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#85909A',
  },
  sectionButtonHeadingStyle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    letterSpacing: 1,
  },
  iconStyle: {
    width: 25,
    height: 25,
    marginBottom: 12,
  },
  contentWrapperStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  bgImageStyle: {
    width: 108,
    height: 108,
    position: 'relative',
  },
};

class BookmarkPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
    totalPdfRecords: PropTypes.number,
    totalEditorRecords: PropTypes.number,
    totalVideoRecords: PropTypes.number,
    totalImageRecords: PropTypes.number,
    totalLinkRecords: PropTypes.number,
    totalH5pRecords: PropTypes.number,
    totalBookmarkcardRecords: PropTypes.number,
    openBookmarkCardsPage: PropTypes.func,
    openBookmarkSectionPage: PropTypes.func,
  };

  renderBookmarkSection = (item, theme, isNightMode) => (
    <View key={item.id} style={styles.sectionContainerStyle}>
      <Button
        style={[styles.sectionContainerButtonStyle, Dimensions.get('window').width <= 320 ? { width: 90, height: 90 } : null, Dimensions.get('window').width >= 400 ? { width: 122, height: 122 } : null]}
        transparent
        onPress={() => this.props.openBookmarkSectionPage(item.routeName)}
      >
        <FastImage style={[styles.bgImageStyle, Dimensions.get('window').width <= 320 ? { width: 90, height: 90 } : null, Dimensions.get('window').width >= 400 ? { width: 118, height: 118 } : null]} source={isNightMode ? nightModeSectionBg : sectionBg} />
        <View style={styles.contentWrapperStyle}>
          <FastImage
            style={[styles.iconStyle, { width: item.width, height: item.height }]}
            source={item.icon}
          />
          <Text style={styles.sectionButtonHeadingStyle}>{item.labelName}</Text>
        </View>
      </Button>
      <Text style={[styles.totaltRecordsTextStyle, { color: theme.textColor2 }]}>
        {item.totalRecords}
      </Text>
    </View>
  );

  _keyExtractor = item => item.sectionId;

  render() {
    const {
      currentTab,
      language,
      totalPdfRecords,
      totalEditorRecords,
      totalVideoRecords,
      totalImageRecords,
      totalLinkRecords,
      totalH5pRecords,
      totalAudioRecords,
      totalBookmarkcardRecords,
      originalTotalCardOnlyRecords,
      originalTotalCardWithPagesRecords,
      theme,
      isNightMode,
      bookmarkcards,
      bookmarksections,
    } = this.props;

    const { contentContainerStyle } = styles;

    if (currentTab !== 'Bookmark') {
      return null;
    }

    const languageCheck = language || {};
    const homeLabels = languageCheck.HomeScreen ? languageCheck.HomeScreen : [];
    const bookmarkLabels = languageCheck.BookmarkScreen ? languageCheck.BookmarkScreen : [];

    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let bookmarkLabel;
    let searchLabel;
    let emptyLabel;
    let seeAllLabel;

    let collectionsLabel;
    let recetlyBookmarksLabel;
    let videoNotAvailableLabel;

    let videoLabel;
    let pdfLabel;
    let textLabel;
    let linkLabel;
    let otherLabel;
    let coverLabel;
    let pagesLabel;
    let imagesLabel;
    let audioLabel;

    homeLabels.map((label) => {
      if (label.Type === 'SEE_ALL') {
        seeAllLabel = label.Content;
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
      if (label.Type === 'COLLECTIONS') {
        collectionsLabel = label.Content;
      }

      if (label.Type === 'IMAGE') {
        imagesLabel = label.Content;
      }

      if (label.Type === 'VIDEO') {
        videoLabel = label.Content;
      }

      if (label.Type === 'AUDIO') {
        audioLabel = label.Content;
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
      if (label.Type === 'OTHER') {
        otherLabel = label.Content;
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

    // console.log('Bookmark page');

    const sectionItemdata = [
      {
        sectionId: 1,
        icon: imagesIcon,
        routeName: 'Image',
        labelName: imagesLabel,
        width: 25,
        height: 25,
        totalRecords: totalImageRecords,
      },
      {
        sectionId: 2,
        icon: videoIcon,
        routeName: 'Video',
        labelName: videoLabel,
        width: 25,
        height: 25,
        totalRecords: totalVideoRecords,
      },
      {
        sectionId: 3,
        icon: videoIcon,
        routeName: 'Audio',
        labelName: audioLabel,
        width: 25,
        height: 25,
        totalRecords: totalAudioRecords,
      },
      {
        sectionId: 4,
        icon: pdfIcon,
        routeName: 'Pdf',
        labelName: pdfLabel,
        width: 25,
        height: 25,
        totalRecords: totalPdfRecords,
      },
      {
        sectionId: 5,
        icon: textIcon,
        routeName: 'Text',
        labelName: textLabel,
        width: 32,
        height: 32,
        totalRecords: totalEditorRecords,
      },
      {
        sectionId: 6,
        icon: linkIcon,
        routeName: 'Link',
        labelName: linkLabel,
        width: 32,
        height: 32,
        totalRecords: totalLinkRecords,
      },
      {
        sectionId: 7,
        icon: otherIcon,
        routeName: 'Other',
        labelName: otherLabel,
        width: 25,
        height: 25,
        totalRecords: totalH5pRecords,
      },
      {
        sectionId: 8,
        icon: coverIcon,
        routeName: 'Cover',
        labelName: coverLabel,
        width: 25,
        height: 25,
        totalRecords: originalTotalCardOnlyRecords,
      },
      {
        sectionId: 9,
        icon: pagesIcon,
        routeName: 'Page',
        labelName: pagesLabel,
        width: 25,
        height: 25,
        totalRecords: originalTotalCardWithPagesRecords,
      },
    ];

    const combinedLength = bookmarkcards.length + bookmarksections.length;

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isAddIcon={true}
          bookmarksLabel={bookmarkLabel}
          searchLabel={searchLabel}
        />
        <ScrollView style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          {/* Featured Content */}
          <View style={styles.sliderContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.continueReadingStyle}>
                <TouchableOpacity style={{ paddingLeft: 12, paddingRight: 12 }} onPress={combinedLength > 0 ? () => this.props.openBookmarkCardsPage() : null}>
                  <Text style={[styles.headerStyle, { color: theme.textColor }, Dimensions.get('window').width <= 320 ? { fontSize: 16 } : null]}>
                    {recetlyBookmarksLabel}
                  </Text>
                </TouchableOpacity>
              </View>
              {combinedLength > 0 ? <Button
                iconRight
                transparent
                small
                style={styles.seeAllButtonStyle}
                onPress={() => this.props.openBookmarkCardsPage()}
              >
                <TextSize
                  xSmall
                  style={[styles.seeAllButtonTextStyle, { color: theme.textColor2 }, Dimensions.get('window').width <= 320 ? { fontSize: 10 } : null]}
                >
                  {seeAllLabel}
                </TextSize>
                <Icon
                  style={[styles.seeAllIconStyle, { color: theme.textColor2 }, Platform.OS == 'android' ? { marginTop: 1 } : null]}
                  name="arrow-forward"
                />
              </Button> : null
              }
            </View>
            {/* <Spinner /> */}
            <DxBookmarkCardList emptyLabel={emptyLabel} />
          </View>

          <View style={[styles.continueReadingStyle, { marginBottom: 12, paddingLeft: 12, paddingRight: 12 }]}>
            <Text style={[styles.headerStyle, { color: theme.textColor }, Dimensions.get('window').width <= 320 ? { fontSize: 16 } : null]}>{collectionsLabel}</Text>
          </View>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <FlatList
              ref="_flatListView"
              keyExtractor={this._keyExtractor}
              data={sectionItemdata}
              numColumns={3}
              renderItem={({ item }) => this.renderBookmarkSection(item, theme, isNightMode)}
              onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
              // scrollEventThrottle={1000}
              onScrollToIndexFailed={() => { }}
            />
          </View>
        </ScrollView>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,

  bookmarkcards: state.bookmark.bookmarks.cards,
  bookmarksections: state.bookmark.bookmarks.sections,

  totalPdfRecords: state.bookmark.totalPdfRecords,
  totalEditorRecords: state.bookmark.totalEditorRecords,
  totalVideoRecords: state.bookmark.totalVideoRecords,
  totalImageRecords: state.bookmark.totalImageRecords,
  totalLinkRecords: state.bookmark.totalLinkRecords,
  totalH5pRecords: state.bookmark.totalH5pRecords,
  totalCardOnlyRecords: state.bookmark.totalCardOnlyRecords,
  totalCardWithPagesRecords: state.bookmark.totalCardWithPagesRecords,
  totalAudioRecords: state.bookmark.totalAudioRecords,

  originalTotalCardOnlyRecords: state.bookmark.originalTotalCardOnlyRecords,
  originalTotalCardWithPagesRecords: state.bookmark.originalTotalCardWithPagesRecords,

  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
});

const mapDispatchToProps = dispatch => ({
  openBookmarkCardsPage: () => dispatch(actions.openBookmarkCardsPage()),
  openBookmarkSectionPage: sectionType => dispatch(actions.openBookmarkSectionPage(sectionType)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BookmarkPage);
