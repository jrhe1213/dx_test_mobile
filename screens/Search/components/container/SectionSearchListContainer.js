import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  FlatList,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../actions';
import videoActions from '../../../../actions/VideoScreen';
import modalActions from '../../../../actions/Modal';
import bookmarkActions from '../../../Bookmark/actions';

// Libraries
import _ from 'lodash';
import Swipeable from 'react-native-swipeable';
import { Icon } from 'native-base';
import { readFile } from '../../../../utils/fileSystem';

// Components
import Spinner from './Spinner';
import {
  DxTextContent,
  DxImage,
  DxHtmlReader,
  DxLink,
  DxPdf,
  DxVideoThumbnail,
  DxH5P,
  DxAccordion,
  DxAudio,
} from '../../../../components';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

// Utils
import { getRootPath } from '../../../../utils/fileSystem';

const styles = {
  contentWrapperStyle: {
    flex: 1,
  },
  errorMessageStyle: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 42,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  iconButtonStyle: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 99,
    paddingLeft: 20,
    paddingRight: 20,
  },
  iconStyle: {
    fontSize: 20,
  }
};

class SectionSearchListContainer extends Component {
  static propTypes = {
  };

  state = {
    limit: 8,
  }

  componentDidMount() {
    const {
      currentTabIndex,
      searchToggleSection
    } = this.props;
    if (currentTabIndex === 0 && searchToggleSection) {
      this.handleSearchList(null, 1, true, false, 0);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { searchValueSection, pageNumberSectionSearch, currentTabIndex } = this.props;

    // Search
    if (searchValueSection !== nextProps.searchValueSection && nextProps.searchValueSection) {
      this.handleSearchListV2(nextProps.searchValueSection, 1, true, true, nextProps.currentTabIndex);
    }

    // Tab Switch
    // Search val empty
    if (currentTabIndex !== nextProps.currentTabIndex
      && !searchValueSection
    ) {
      this.handleSearchList(nextProps.searchValueSection, 1, true, true, nextProps.currentTabIndex);
    }

    // searchValueSection AND TAB SWITCH
    if ((currentTabIndex !== nextProps.currentTabIndex) && searchValueSection) {
      if (nextProps.currentTabIndex !== 1 && nextProps.currentTabIndex !== 2) {
        this.handleSearchListV2(nextProps.searchValueSection, 1, true, true, nextProps.currentTabIndex);
      } else {
        this.handleSearchList(nextProps.searchValueSection, 1, true, true, nextProps.currentTabIndex);
      }
    }

    if (searchValueSection && !nextProps.searchValueSection) {
      this.handleSearchList(nextProps.searchValueSection, 1, true, true, nextProps.currentTabIndex);
    }

    // LOADMORE
    if (!nextProps.searchValueSection && pageNumberSectionSearch < nextProps.pageNumberSectionSearch) {
      this.handleSearchList(nextProps.searchValueSection, nextProps.pageNumberSectionSearch, false, false, nextProps.currentTabIndex);
    }
    if (nextProps.searchValueSection && pageNumberSectionSearch < nextProps.pageNumberSectionSearch) {
      this.handleSearchListV2(nextProps.searchValueSection, nextProps.pageNumberSectionSearch, false, false, nextProps.currentTabIndex);
    }
  }

  handleSearchList = (searchValueSection, pageNumberSectionSearch, isFirstLoading, isSearch, currentTabIndex) => {
    const { limit } = this.state;
    let offsetCalc = (limit * (pageNumberSectionSearch - 1));
    const formmattedParam = {
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      searchValueSection,
      isSearch,
      currentTabIndex,
    };
    this.props.getSearchDataListRequest(formmattedParam, isFirstLoading);
  }

  handleSearchListV2 = _.debounce((searchValueSection, pageNumberSectionSearch, isFirstLoading, isSearch, currentTabIndex) => {

    const { limit } = this.state;
    if (searchValueSection) {
      searchValueSection = searchValueSection.replace(/[^a-z0-9\s]/gi, '');
      searchValueSection = searchValueSection.trim();
      if (searchValueSection) {
        let typesArr = [];
        if (currentTabIndex == 0 || currentTabIndex == null) {
          typesArr = ["EDITOR", "EMBED_PDF", "LINK", "H5P", "ACCORDION", "AUDIO"];
        } else if (currentTabIndex == 3) {
          typesArr = ["AUDIO"];
        } else if (currentTabIndex == 4) {
          typesArr = ["EMBED_PDF"];
        } else if (currentTabIndex == 5) {
          typesArr = ["EDITOR", "ACCORDION"];
        } else if (currentTabIndex == 6) {
          typesArr = ["LINK"];
        } else if (currentTabIndex == 7) {
          typesArr = ["H5P"];
        }
        if (currentTabIndex == 0
          || currentTabIndex == 3
          || currentTabIndex == 4
          || currentTabIndex == 5
          || currentTabIndex == 6
          || currentTabIndex == 7
          || currentTabIndex == null) {
          let {
            sectionListArr,
            searchSectionListArr
          } = this.props;
          this.findTargetSections(
            searchValueSection,
            limit * pageNumberSectionSearch,
            sectionListArr,
            searchSectionListArr,
            typesArr
          )
            .then(output => {
              const formmattedParam = {
                isSearch,
                output,
              };
              this.props.getSearchDataListV2Request(formmattedParam, isFirstLoading);
            })
        }
      }
    }
  }, 1000)

  findTargetSections = (searchValueSection, total, sectionListArr, output, typeArr) => {
    return new Promise(async (resolve) => {
      let {
        currentExperienceStreamGUID,
        userGUID,
      } = this.props;

      sectionListArr = sectionListArr.filter(item => {
        if (typeArr.includes(item.Type)) {
          return item;
        }
      });

      if (!sectionListArr.length) {
        return resolve(output);
      }
      if (output.length >= total) {
        return resolve(output);
      }

      let section = sectionListArr[0];
      sectionListArr.splice(0, 1);

      let included = false;
      output.map((item => {
        if (item.SectionGUID == section.SectionGUID) {
          included = true;
        }
      }))

      if (!included) {
        if (section.Type == 'EDITOR') {
          const source = getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID) + `${section.Html}.html`;
          const fileContent = await readFile(source);
          if (fileContent) {
            const htmlRegex = /(<([^>]+)>)/ig;
            const pureString = fileContent.replace(htmlRegex, "");
            if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
              output.push(section);
            }
          }
        }
        else if (section.Type == 'EMBED_PDF') {
          if (section.PdfLabel) {
            const htmlRegex = /(<([^>]+)>)/ig;
            const pureString = section.PdfLabel.replace(htmlRegex, "");
            if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
              output.push(section);
            }
          }
        }
        else if (section.Type == 'LINK') {
          if (section.LinkLabel) {
            const htmlRegex = /(<([^>]+)>)/ig;
            const pureString = section.LinkLabel.replace(htmlRegex, "");
            if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
              output.push(section);
            }
          }
        }
        else if (section.Type == 'H5P') {
          if (section.H5pLabel) {
            const htmlRegex = /(<([^>]+)>)/ig;
            const pureString = section.H5pLabel.replace(htmlRegex, "");
            if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
              output.push(section);
            }
          }
        }
        else if (section.Type == 'ACCORDION') {

          if (section.AccordionArr && section.AccordionArr.length) {
            const htmlRegex = /(<([^>]+)>)/ig;
            let pureString;

            let foundString = false;
            section.AccordionArr.forEach(item => {

              // Accordian title
              pureString = item.AccordionTitle ? item.AccordionTitle.replace(htmlRegex, "") : "";
              if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
                foundString = true;
                return;
              }

              // Accordian Content
              pureString = item.AccordionContent ? item.AccordionContent.replace(htmlRegex, "") : "";
              if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
                foundString = true;
                return;
              }

            });

            if (foundString) {
              output.push(section);
            }
          }
        }
        else if (section.Type == 'AUDIO') {
          if (section.AudioLabel) {
            const htmlRegex = /(<([^>]+)>)/ig;
            const pureString = section.AudioLabel.replace(htmlRegex, "");

            if (pureString.toLowerCase().includes(searchValueSection.toLowerCase())) {
              output.push(section);
            }
          }
        }
      }
      return resolve(this.findTargetSections(searchValueSection, total, sectionListArr, output, typeArr));
    })
  }

  keyExtractor = (item) => (item.SectionGUID);

  // Handle bookmark
  handleBookmark = (section) => {
    section.ExperienceStreamGUID = this.props.experienceStreamWithChannelInfo.ExperienceStreamGUID;
    section.ExperienceGUID = this.props.experienceStreamWithChannelInfo.Experience.ExperienceGUID;
    const data = {
      type: 'sections',
      section,
    };
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.addBookmarkRequest(data);
    }
  }

  // Handle unBookmark
  handleUBookmark = (section) => {
    section.ExperienceStreamGUID = this.props.experienceStreamWithChannelInfo.ExperienceStreamGUID;
    const data = {
      type: 'sections',
      section,
    };
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.deleteBookmarkRequest(data);
    }
  }

  handleGoToPage = (section) => {
    const {
      bookmarks
    } = this.props;
    this.props.handleGoToPage(section, bookmarks.sections);
  }

  renderSwipeRow = (section) => {
    return (
      <Swipeable
        key={section.SectionGUID}
        rightButtonWidth={65}
        style={{ backgroundColor: 'white', marginBottom: 2 }}
        rightButtons={[
          (
            <TouchableOpacity style={{
              paddingBottopm: 0,
              borderRadius: 0,
              margin: 0,
              width: 65,
              height: '100%',
              backgroundColor: '#F6F6F6',
            }}
              transparent
              onPress={() => this.handleGoToPage(section)}
            >
              <View style={{
                width: 65,
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Icon
                  active
                  style={{ fontSize: 25 }}
                  name="ios-document-outline"
                />
              </View>
            </TouchableOpacity>
          )
          , (
            <TouchableOpacity style={{
              paddingBottopm: 0,
              borderRadius: 0,
              margin: 0,
              width: 65,
              height: '100%',
              backgroundColor: '#F0F0F0'
            }}
              light
              onPress={!section.isBookmarked ? () => this.handleBookmark(section) : () => this.handleUBookmark(section)}
            >
              <View style={{
                width: 65,
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Icon
                  active
                  style={{ fontSize: 25 }}
                  name={section.isBookmarked ? 'ios-star' : 'ios-star-outline'}
                />
              </View>
            </TouchableOpacity>
          )]}
        onPress={() => this.handleNavigate()}
      >
        <View>
          {
            section.Type === 'EDITOR'
              ? <View style={{ minHeight: 50, width: Dimensions.get('window').width }}>
                {
                  this.renderItem(section)
                }
              </View>
              : this.renderItem(section)
          }
        </View>
      </Swipeable>
    )
  }

  renderItem = (section) => {
    const {
      currentExperienceStreamGUID,
      isConnected,
      userGUID,
      language,
    } = this.props;

    if (!section) {
      return null;
    }

    const languageCheck = language || {};
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    let videoNotAvailableLabel;

    errorMessage.map((label) => {
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    switch (section.Type) {
      case 'EMBED_PDF':
        return (
          <DxPdf
            key={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Pdf}.pdf`}
            targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
            pdfLabel={section.PdfLabel}
            pdfBgColor={section.PdfBgColor}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
            searchValue={this.props.searchValueSection}
          />
        );

      case 'EDITOR':
        return (
          <View>
            <DxHtmlReader
              key={section.SectionGUID}
              currentTab="Section"
              isBigImg={true}
              source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Html}.html`}
              acceptedUpdate={this.props.acceptedUpdate}
              searchValue={this.props.searchValueSection}
              handlePressContent={() => { }}
              openEmbeddedLinkModal={link => this.props.openEmbeddedLinkModal(link)}
            />
          </View>
        );

      case 'VIDEO':
        return (
          <DxVideoThumbnail
            videoLink={section.VideoUrl}
            handleVideoPress={() => this.props.redirectVideoScreen(section.VideoUrl, '0')}
            isConnected={isConnected}
            videoNotAvailableLabel={videoNotAvailableLabel}
            currentTab="Section"
          />
        );

      case 'TEXT':
        return (
          <DxTextContent
            key={section.SectionGUID}
            content={section.Content}
          />
        );

      case 'IMAGE':
        return (
          <DxImage
            key={section.SectionGUID}
            section={section}
            targetSectionGUID={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Img}.jpg`}
            blurSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Img}_blur.jpg`}
            currentTab="Section"
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
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
            searchValue={this.props.searchValueSection}
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
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            currentTab="Section"
            searchValue={this.props.searchValueSection}
          />
        );

      case 'ACCORDION':
        return (
          <View style={{ width: Dimensions.get('window').width }}>
            <DxAccordion
              key={section.SectionGUID}
              accordionData={section.AccordionArr}
              searchValue={this.props.searchValueSection}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            />
          </View>
        );

      case 'AUDIO':
        return (
          <DxAudio
            key={section.SectionGUID}
            section={section}
            isImageCover={section.IsImgCover}
            targetSectionGUID={section.SectionGUID}
            source={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.Audio}.mp3`}
            audioLabel={section.AudioLabel}
            audioBgColor={section.AudioBgColor}
            audioFilename={section.AudioFileName}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 170px);`}
            searchValue={this.props.searchValueSection}
            imgSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.AudioImg}.jpg`}
            blurImageSource={`${getRootPath('downloadFeeds', userGUID, currentExperienceStreamGUID)}${section.AudioImg}_blur.jpg`}
          />
        );

      default:
        return null;
    }
  }


  handleLoadMore = () => {
    const {
      isUpdating,
      totalsearchSectionListArrRecords,
      pageNumberSectionSearch,
      isV2Search,
      searchValueSection
    } = this.props;
    const { limit } = this.state;

    if (!isUpdating && isV2Search && searchValueSection) {
      this.props.updateSearchSectionPageNumber();
    }

    if (!isUpdating && totalsearchSectionListArrRecords > limit && totalsearchSectionListArrRecords > pageNumberSectionSearch * limit) {
      this.props.updateSearchSectionPageNumber();
    }
  }


  render() {
    const {
      contentWrapperStyle,
      errorMessageStyle,
      errorMessageTextStyle
    } = styles;

    const {
      theme,
      searchSectionListArr,
      isLoadingSearchSection,
      pageNumberSectionSearch,
      isFirstLoadingSearchSection,
      isNightMode,
      language,
    } = this.props;

    const languageCheck = language || {};
    const homeLabels = languageCheck.HomeScreen ? languageCheck.HomeScreen : [];

    let empytyLabel;

    homeLabels.map((label) => {
      if (label.Type === 'EMPTY') {
        empytyLabel = label.Content;
      }
    });

    return (
      <View style={[contentWrapperStyle, { backgroundColor: isNightMode ? theme.bgColor2 : theme.bgColor }]}>

        {
          isFirstLoadingSearchSection ?
            <Spinner isLoading={isFirstLoadingSearchSection} theme={theme} />
            :
            searchSectionListArr && searchSectionListArr.length > 0
              ?
              <FlatList
                ref="_flatListView"
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 65 }}
                keyExtractor={this.keyExtractor}
                data={searchSectionListArr}
                renderItem={({ item }) => this.renderSwipeRow(item)}
                onScrollToIndexFailed={() => { }}
                ListFooterComponent={isLoadingSearchSection && <ActivityIndicator size="small" animating />}
                onEndReached={({ distanceFromEnd }) => {
                  if (distanceFromEnd < -100 && pageNumberSectionSearch === 1) {
                    return;
                  }
                  this.handleLoadMore();
                }}
                onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
              // scrollEventThrottle={1000}
              />
              :
              (
                <View style={errorMessageStyle}>
                  <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                    {empytyLabel}
                  </Text>
                </View>
              )
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  languageGUID: state.deviceInfo.languageGUID,
  language: state.deviceInfo.language,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  userGUID: state.user.userGUID,

  searchValueSection: state.search.searchValueSection,
  isFirstLoadingSearchSection: state.search.isFirstLoadingSearchSection,
  isLoadingSearchSection: state.search.isLoadingSearchSection,
  pageNumberSectionSearch: state.search.pageNumberSectionSearch,
  isUpdating: state.search.isUpdating,
  acceptedUpdate: state.feed.acceptedUpdate,
  isRequesting: state.deviceInfo.isRequesting,
  sectionListArr: state.search.sectionListArr,
  searchSectionListArr: state.search.searchSectionListArr,
  totalsearchSectionListArrRecords: state.search.totalsearchSectionListArrRecords,
  currentTabIndex: state.search.currentTabIndex,

  bookmarks: state.bookmark.bookmarks,

  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  searchToggleSection: state.search.searchToggleSection,

  isV2Search: state.search.isV2Search,

});

const dispatchToProps = dispatch => ({
  getSearchDataListRequest: (params, isFirstLoading) => dispatch(searchActions.getSearchDataListRequest(params, isFirstLoading)),
  getSearchDataListV2Request: (params, isFirstLoading) => dispatch(searchActions.getSearchDataListV2Request(params, isFirstLoading)),

  handleGoToPage: (section, bookmarks) => dispatch(searchActions.handleGoToPage(section, bookmarks)),

  updateSearchSectionPageNumber: params => dispatch(searchActions.updateSearchSectionPageNumber(params)),

  redirectVideoScreen: (data, experienceType, isFirstOpen) => dispatch(videoActions.redirectVideoScreen(data, experienceType, isFirstOpen)),
  openEmbeddedLinkModal: link => dispatch(modalActions.openEmbeddedLinkModal(link)),
  addBookmarkRequest: data => dispatch(bookmarkActions.addBookmarkRequest(data)),
  deleteBookmarkRequest: data => dispatch(bookmarkActions.deleteBookmarkRequest(data)),
});

export default connect(mapStateToProps, dispatchToProps)(SectionSearchListContainer);
