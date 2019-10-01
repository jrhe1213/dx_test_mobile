import constants from './constants';
import downloadConstants from '../Download/constants';
import feedConstants from '../Feed/constants';
import mainConstants from '../../constants';

// helpers
import { getCurrentDateTime } from '../../helpers';

const INITIAL_STATE = {
  searchValue: null,
  searchToggle: false,
  bookmarks: {
    cards: [],
    sections: [],

    searchCards: [],
    searchSections: [],
  },
  paginationBookmarks: [],
  totalBookmarkcardRecords: 0,
  currentExperienceStream: {},
  isLoading: false,
  isUpdating: false,
  isFirstLoading: false,

  limit: null,
  reduceOffsetWhenWeDelete: false,

  isSearchingBookmarks: false,

  pageNumber: 1,
  pullUpRefresh: false,
  errors: {},

  pdfArray: [],
  totalPdfRecords: 0,

  editorArray: [],
  totalEditorRecords: 0,

  videoArray: [],
  totalVideoRecords: 0,

  imageArray: [],
  totalImageRecords: 0,

  linkArray: [],
  totalLinkRecords: 0,

  h5pArray: [],
  totalH5pRecords: 0,

  audioArray: [],
  cardOnly: [],
  
  totalCardOnlyRecords: 0,
  originalTotalCardOnlyRecords: 0,

  cardWithPages: [],
  totalCardWithPagesRecords: 0,
  originalTotalCardWithPagesRecords: 0,

  paginationPdfArray: [],
  paginationEditorArray: [],
  paginationVideoArray: [],
  paginationImageArray: [],
  paginationLinkArray: [],
  paginationH5pArray: [],
  paginationAudioArray: [],
};

export default (state = INITIAL_STATE, action) => {
  let tempResult;
  let tempCardFound;
  let tempSectionFound;
  let tmpBookmarkCards = Object.assign([], state.bookmarks.cards);
  let tempTotalBookmarkcardRecords = state.totalBookmarkcardRecords;
  let tmpBookmarkSections = Object.assign([], state.bookmarks.sections);
  let tmpSearchCards = [];
  let tmpSearchSections = [];
  let tempFound;
  let tempIndex;
  let tempPaginationBookmarks = state.paginationBookmarks;

  let tempOriginalTotalCardOnlyRecords = state.originalTotalCardOnlyRecords;
  let tempOriginalTotalCardWithPagesRecords = state.originalTotalCardWithPagesRecords;

  let tmpPageNumber = state.pageNumber;

  let tempPdfArray = state.pdfArray;
  let tempPaginationPdfArray = state.paginationPdfArray;
  let tempTotalPdfRecords = state.totalPdfRecords;

  let tempEditorArray = state.editorArray;
  let tempPaginationEditorArray = state.paginationEditorArray;
  let tempTotalEditorRecords = state.totalEditorRecords;

  let tempVideoArray = state.videoArray;
  let tempPaginationVideoArray = state.paginationVideoArray;
  let tempTotalVideoRecords = state.totalVideoRecords;

  let tempImageArray = state.imageArray;
  let tempPaginationImageArray = state.paginationImageArray;
  let tempTotalImageRecords = state.totalImageRecords;

  let tempLinkArray = state.linkArray;
  let tempPaginationLinkArray = state.paginationLinkArray;
  let tempTotalLinkRecords = state.totalLinkRecords;

  let tempH5pArray = state.h5pArray;
  let tempPaginationH5pArray = state.paginationH5pArray;
  let tempTotalH5pRecords = state.totalH5pRecords;

  let tempAudioArray = state.audioArray;
  let tempPaginationAudioArray = state.paginationAudioArray;
  let tempTotalAudioRecords = state.totalAudioRecords;

  let tempCardOnly = state.cardOnly;
  let tempCardWithPages = state.cardWithPages;

  switch (action.type) {

    case mainConstants.GET_FIRST_LOAD_SUCCESS:
    case mainConstants.GET_USER_INFO_SUCCESS:
      tempDownloads = action.payload.localData.downloads;

      tmpBookmarkCards = action.payload.localData.bookmarkCards;
      tmpBookmarkCards = tmpBookmarkCards.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });

      tempPaginationBookmarks = action.payload.localData.bookmarkCards;
      tempPaginationBookmarks = tempPaginationBookmarks.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });

      tempCardOnly = action.payload.localData.cardOnly;
      tempCardOnly = tempCardOnly.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });

      tempCardWithPages = action.payload.localData.cardWithPages;
      tempCardWithPages = tempCardWithPages.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });
      format_array_of_experiences(tempDownloads, tmpBookmarkCards);

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: action.payload.localData.bookmarkSections,
        },
        // paginationBookmarks: [],
        totalBookmarkcardRecords: action.payload.localData.bookmarkCards.length + action.payload.localData.bookmarkSections.length,

        pdfArray: action.payload.localData.pdfArray,
        totalPdfRecords: action.payload.localData.pdfArray.length,

        editorArray: action.payload.localData.editorArray,
        totalEditorRecords: action.payload.localData.editorArray.length,

        videoArray: action.payload.localData.videoArray,
        totalVideoRecords: action.payload.localData.videoArray.length,

        imageArray: action.payload.localData.imageArray,
        totalImageRecords: action.payload.localData.imageArray.length,

        linkArray: action.payload.localData.linkArray,
        totalLinkRecords: action.payload.localData.linkArray.length,

        h5pArray: action.payload.localData.h5pArray,
        totalH5pRecords: action.payload.localData.h5pArray.length,

        audioArray: action.payload.localData.audioArray,
        totalAudioRecords: action.payload.localData.audioArray.length,

        // cardOnly: [],
        totalCardOnlyRecords: action.payload.localData.cardOnly.length,
        originalTotalCardOnlyRecords: action.payload.localData.cardOnly.length,

        // cardWithPages: [],
        totalCardWithPagesRecords: action.payload.localData.cardWithPages.length,
        originalTotalCardWithPagesRecords: action.payload.localData.cardWithPages.length,
      };

    case constants.DX_BOOKMARK_IMAGE_RATIO:
      tmpBookmarkCards.map((item) => {
        if (item.ExperienceStreamGUID == action.payload.experienceStreamGUID) {
          item.originalWidth = action.payload.originalWidth;
          item.originalHeight = action.payload.originalHeight;
        }
      });
      state.bookmarks.cards = tmpBookmarkCards;
      return state;

    case constants.DX_BOOKMARK_INPUT_CHANGE:
      if (action.payload.val) {
        if (action.payload.val.toUpperCase() == 'IMAGE') {
          tmpSearchSections = tmpBookmarkSections.filter(item => item.Type == 'IMAGE');
        } else if (action.payload.val.toUpperCase() == 'HTML') {
          tmpSearchSections = tmpBookmarkSections.filter(item => (item.Type == 'EDITOR' || item.Type == 'ACCORDION'));
        } else if (action.payload.val.toUpperCase() == 'PDF') {
          tmpSearchSections = tmpBookmarkSections.filter(item => item.Type == 'EMBED_PDF');
        } else if (action.payload.val.toUpperCase() == 'VIDEO') {
          tmpSearchSections = tmpBookmarkSections.filter(item => item.Type == 'VIDEO');
        } else if (action.payload.val.toUpperCase() == 'LINK') {
          tmpSearchSections = tmpBookmarkSections.filter(item => item.Type == 'LINK');
        } else if (action.payload.val.toUpperCase() == 'AUDIO') {
          tmpSearchSections = tmpBookmarkSections.filter(item => item.Type == 'AUDIO');
        } else {
          tmpSearchCards = tmpBookmarkCards.filter(
            item => item.Experience.ExperienceTitle.toLowerCase().includes(
              action.payload.val.toLowerCase(),
            ) || item.ChannelName.toLowerCase().includes(action.payload.val.toLowerCase()),
          );
        }
      }

      return {
        ...state,
        searchValue: action.payload.val,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: tmpSearchCards,
          searchSections: tmpSearchSections,
        },
      };

    case constants.DX_BOOKMARK_SEARCH_TOGGLE:
      return {
        ...state,
        searchToggle: action.payload.toggle,
      };

    case 'Navigation/NAVIGATE':
      return {
        ...state,
        searchValue: null,
        searchToggle: false,
      };

    // Add bookmark for cards
    case constants.DX_ADD_BOOKMARK_CARDS_SUCCESS:
      tempCardFound = false;
      for (let i = 0; i < tmpBookmarkCards.length; i++) {
        if (tmpBookmarkCards[i].ExperienceStreamGUID == action.payload.data.ExperienceStreamGUID) {
          tempCardFound = true;
          break;
        }
      }

      if (!tempCardFound) {
        action.payload.data.bookmarkedAt = getCurrentDateTime();
        tmpBookmarkCards.push(action.payload.data);

        if (action.payload.data.Experience.ExperienceType === '0') {
          tempCardOnly.push(action.payload.data);
          tempOriginalTotalCardOnlyRecords += 1;
        } else if (action.payload.data.Experience.ExperienceType === '1') {
          tempCardWithPages.push(action.payload.data);
          tempOriginalTotalCardWithPagesRecords += 1;
        }
      }

      tempCardFound = false;
      for (let i = 0; i < tempPaginationBookmarks.length; i++) {
        if (tempPaginationBookmarks[i].ExperienceStreamGUID == action.payload.data.ExperienceStreamGUID) {
          tempCardFound = true;
          break;
        }
      }

      if (!tempCardFound) {
        action.payload.data.bookmarkedAt = getCurrentDateTime();
        tempPaginationBookmarks.push(action.payload.data);
      }

      tempCardOnly = tempCardOnly.sort(compare);
      tempCardWithPages = tempCardWithPages.sort(compare);
      tmpBookmarkCards = tmpBookmarkCards.sort(compare);
      tempPaginationBookmarks = tempPaginationBookmarks.sort(compare);

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: [],
          searchSections: [],
        },
        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tempTotalBookmarkcardRecords + 1,
        cardOnly: tempCardOnly,
        totalCardOnlyRecords: tempCardOnly.length,
        originalTotalCardOnlyRecords: tempOriginalTotalCardOnlyRecords,

        cardWithPages: tempCardWithPages,
        totalCardWithPagesRecords: tempCardWithPages.length,
        originalTotalCardWithPagesRecords: tempOriginalTotalCardWithPagesRecords,
      };

    // Add bookmark for sections
    case constants.DX_ADD_BOOKMARK_SECTIONS_SUCCESS:
      tempSectionFound = false;
      for (let i = 0; i < tmpBookmarkSections.length; i++) {
        if (tmpBookmarkSections[i].SectionGUID == action.payload.SectionGUID
          && tmpBookmarkSections[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID) {
          tempSectionFound = true;
          break;
        }
      }

      if (!tempSectionFound) {
        action.payload.bookmarkedAt = getCurrentDateTime();
        tmpBookmarkSections.push(action.payload);
      }

      tempSectionFound = false;
      for (let i = 0; i < tempPaginationBookmarks.length; i++) {
        if (tempPaginationBookmarks[i].SectionGUID == action.payload.SectionGUID
          && tempPaginationBookmarks[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID) {
          tempSectionFound = true;
          break;
        }
      }

      if (!tempSectionFound) {
        action.payload.bookmarkedAt = getCurrentDateTime();
        tempPaginationBookmarks.push(action.payload);
      }

      tempPaginationBookmarks = tempPaginationBookmarks.sort(compare);

      tmpBookmarkSections = tmpBookmarkSections.sort(compare);

      tempSectionFound = false;
      // Pdf Array
      if (action.payload.Type === 'EMBED_PDF') {
        if (tempPdfArray.length) {
          for (let i = 0; i < tempPdfArray.length; i++) {
            if (
              tempPdfArray[i].SectionGUID == action.payload.SectionGUID
              && tempPdfArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempPdfArray.push(action.payload);
        }

        tempPdfArray = tempPdfArray.sort(compare);
      }

      // Editor Array
      if (action.payload.Type === 'EDITOR' || action.payload.Type === 'ACCORDION') {
        if (tempEditorArray.length) {
          for (let i = 0; i < tempEditorArray.length; i++) {
            if (
              tempEditorArray[i].SectionGUID == action.payload.SectionGUID
              && tempEditorArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempEditorArray.push(action.payload);
        }

        tempEditorArray = tempEditorArray.sort(compare);
      }

      // Video Array
      if (action.payload.Type === 'VIDEO') {
        if (tempVideoArray.length) {
          for (let i = 0; i < tempVideoArray.length; i++) {
            if (
              tempVideoArray[i].SectionGUID == action.payload.SectionGUID
              && tempVideoArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempVideoArray.push(action.payload);
        }

        tempVideoArray = tempVideoArray.sort(compare);
      }

      // IMage Array
      if (action.payload.Type === 'IMAGE') {
        if (tempImageArray.length) {
          for (let i = 0; i < tempImageArray.length; i++) {
            if (
              tempImageArray[i].SectionGUID == action.payload.SectionGUID
              && tempImageArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempImageArray.push(action.payload);
        }

        tempImageArray = tempImageArray.sort(compare);
      }

      // Link Array
      if (action.payload.Type === 'LINK') {
        if (tempLinkArray.length) {
          for (let i = 0; i < tempLinkArray.length; i++) {
            if (
              tempLinkArray[i].SectionGUID == action.payload.SectionGUID
              && tempLinkArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempLinkArray.push(action.payload);
        }

        tempLinkArray = tempLinkArray.sort(compare);
      }

      // H5P Array
      if (action.payload.Type === 'H5P') {
        if (tempH5pArray.length) {
          for (let i = 0; i < tempH5pArray.length; i++) {
            if (
              tempH5pArray[i].SectionGUID == action.payload.SectionGUID
              && tempH5pArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempH5pArray.push(action.payload);
        }

        tempH5pArray = tempH5pArray.sort(compare);
      }

      // AUDIO Array
      if (action.payload.Type === 'AUDIO') {
        if (tempAudioArray.length) {
          for (let i = 0; i < tempAudioArray.length; i++) {
            if (
              tempAudioArray[i].SectionGUID == action.payload.SectionGUID
              && tempAudioArray[i].ExperienceStreamGUID == action.payload.ExperienceStreamGUID
            ) {
              tempSectionFound = true;
              break;
            }
          }
        }

        if (!tempSectionFound) {
          action.payload.bookmarkedAt = getCurrentDateTime();
          tempAudioArray.push(action.payload);
        }

        tempH5pArray = tempH5pArray.sort(compare);
      }

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: [],
          searchSections: [],
        },

        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tempTotalBookmarkcardRecords + 1,

        pdfArray: tempPdfArray,
        totalPdfRecords: tempPdfArray.length,

        editorArray: tempEditorArray,
        totalEditorRecords: tempEditorArray.length,

        videoArray: tempVideoArray,
        totalVideoRecords: tempVideoArray.length,

        imageArray: tempImageArray,
        totalImageRecords: tempImageArray.length,

        linkArray: tempLinkArray,
        totalLinkRecords: tempLinkArray.length,

        h5pArray: tempH5pArray,
        totalH5pRecords: tempH5pArray.length,

        audioArray: tempAudioArray,
        totalAudioRecords: tempAudioArray.length,
      };

    // Delete bookmark Cards
    case constants.DX_DELETE_BOOKMARK_CARDS_SUCCESS:
      // 1. Bookmark --> cards
      if (tmpBookmarkCards && tmpBookmarkCards.length) {
        tmpBookmarkCards = tmpBookmarkCards.filter(
          item => item.ExperienceStreamGUID !== action.payload.data.ExperienceStreamGUID,
        );

        // Filterung cards based on type
        if (action.payload.data.Experience.ExperienceType === '0') {
          tempOriginalTotalCardOnlyRecords -= 1;
        } else if (action.payload.data.Experience.ExperienceType === '1') {
          tempOriginalTotalCardWithPagesRecords -= 1;
        }
      }

      // 2. Recent bookmarks Page
      if (action.payload.currentTab === 'BookmarkCardPage' && tempPaginationBookmarks && tempPaginationBookmarks.length) {
        tempPaginationBookmarks = tempPaginationBookmarks.filter(
          item => (item.ExperienceStreamGUID !== action.payload.data.ExperienceStreamGUID || !item.Experience),
        );

        // 3. total number
        tempTotalBookmarkcardRecords -= 1;

        if (Number(state.limit) * (tmpPageNumber - 1) == tempPaginationBookmarks.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // Search
      if (state.bookmarks.searchCards && state.bookmarks.searchCards.length) {
        state.bookmarks.searchCards.filter(
          item => item.ExperienceStreamGUID !== action.payload.data.ExperienceStreamGUID,
        );
      }

      // 3. Cover Page
      if (action.payload.currentTab === 'COVER' && tempCardOnly && tempCardOnly.length) {
        tempCardOnly = tempCardOnly.filter(
          item => item.ExperienceStreamGUID !== action.payload.data.ExperienceStreamGUID,
        );

        // 3. total number

        if (Number(state.limit) * (tmpPageNumber - 1) == tempCardOnly.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // 4. Pages Page
      if (action.payload.currentTab === 'PAGES' && tempCardWithPages && tempCardWithPages.length) {
        tempCardWithPages = tempCardWithPages.filter(
          item => item.ExperienceStreamGUID !== action.payload.data.ExperienceStreamGUID,
        );

        // 3. total number

        if (Number(state.limit) * (tmpPageNumber - 1) == tempCardWithPages.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }


      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: state.bookmarks.searchCards,
          searchSections: [],
        },
        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tempTotalBookmarkcardRecords,

        pageNumber: tmpPageNumber,

        cardOnly: tempCardOnly,
        totalCardOnlyRecords: tempCardOnly.length,
        originalTotalCardOnlyRecords: tempOriginalTotalCardOnlyRecords,

        cardWithPages: tempCardWithPages,
        totalCardWithPagesRecords: tempCardWithPages.length,
        originalTotalCardWithPagesRecords: tempOriginalTotalCardWithPagesRecords,
      };

    // Delete bookmark Sections
    case constants.DX_DELETE_BOOKMARK_SECTIONS_SUCCESS:

      // Bookmark sections
      tmpBookmarkSections = tmpBookmarkSections.filter(
        item => item.SectionGUID !== action.payload.SectionGUID
          || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
      );

      // Recent bookmarks
      tempPaginationBookmarks = tempPaginationBookmarks.filter(
        item => item.SectionGUID !== action.payload.SectionGUID
          || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
      );

      tempTotalBookmarkcardRecords -= 1;

      // Pdf Array
      if (action.payload.Type === 'EMBED_PDF') {
        tempPdfArray = tempPdfArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationPdfArray = tempPaginationPdfArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalPdfRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempPdfArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // Editor Array
      if (action.payload.Type === 'EDITOR' || action.payload.Type === 'ACCORDION') {
        tempEditorArray = tempEditorArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationEditorArray = tempPaginationEditorArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalEditorRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempEditorArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // Video Array
      if (action.payload.Type === 'VIDEO') {
        tempVideoArray = tempVideoArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationVideoArray = tempPaginationVideoArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalVideoRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempVideoArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // IMage Array
      if (action.payload.Type === 'IMAGE') {
        // Actual array
        tempImageArray = tempImageArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationImageArray = tempPaginationImageArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalImageRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempImageArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // Link Array
      if (action.payload.Type === 'LINK') {
        tempLinkArray = tempLinkArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationLinkArray = tempPaginationLinkArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalLinkRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempLinkArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // H5P Array
      if (action.payload.Type === 'H5P') {
        tempH5pArray = tempH5pArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationH5pArray = tempPaginationH5pArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalH5pRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempH5pArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      // H5P Array
      if (action.payload.Type === 'AUDIO') {
        tempAudioArray = tempAudioArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // Pagination array
        tempPaginationAudioArray = tempPaginationAudioArray.filter(
          item => item.SectionGUID !== action.payload.SectionGUID
            || item.ExperienceStreamGUID !== action.payload.ExperienceStreamGUID,
        );

        // 3. total number
        tempTotalAudioRecords -= 1;

        if (state.limit * (tmpPageNumber - 1) == tempAudioArray.length && tmpPageNumber > 1) {
          tmpPageNumber -= 1;
        }
      }

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: state.bookmarks.searchCards,
        },

        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tempTotalBookmarkcardRecords,

        pdfArray: tempPdfArray,
        paginationPdfArray: tempPaginationPdfArray,
        totalPdfRecords: tempTotalPdfRecords,

        editorArray: tempEditorArray,
        paginationEditorArray: tempPaginationEditorArray,
        totalEditorRecords: tempTotalEditorRecords,

        videoArray: tempVideoArray,
        paginationVideoArray: tempPaginationVideoArray,
        totalVideoRecords: tempTotalVideoRecords,

        imageArray: tempImageArray,
        paginationImageArray: tempPaginationImageArray,
        totalImageRecords: tempTotalImageRecords,

        linkArray: tempLinkArray,
        paginationLinkArray: tempPaginationLinkArray,
        totalLinkRecords: tempTotalLinkRecords,

        h5pArray: tempH5pArray,
        paginationH5pArray: tempPaginationH5pArray,
        totalH5pRecords: tempTotalH5pRecords,

        audioArray: tempAudioArray,
        paginationAudioArray: tempPaginationAudioArray,
        totalAudioRecords: tempTotalAudioRecords,

        pageNumber: tmpPageNumber,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
      tmpBookmarkCards.forEach((item) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          item.isDownloaded = true;
        }
      });

      tmpBookmarkCards = tmpBookmarkCards.map(item => (item.ExperienceStreamGUID === action.payload.experienceStreamGUID
        ? action.payload.experiences
        : item));

      if (action.payload.acceptedUpdate) {
        // Remove sections
        tmpBookmarkSections = tmpBookmarkSections.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempPdfArray = tempPdfArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempEditorArray = tempEditorArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempVideoArray = tempVideoArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempImageArray = tempImageArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempLinkArray = tempLinkArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempH5pArray = tempH5pArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempAudioArray = tempAudioArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );
      }

      if (action.payload.updateBS) {
        tmpBookmarkSections = action.payload.bookmarks;

        tempPaginationBookmarks = [...tmpBookmarkCards, ...tmpBookmarkSections];
        tempPaginationBookmarks = tempPaginationBookmarks.sort(compare);
        
        tempPdfArray = tmpBookmarkSections.filter(item => item.Type === 'EMBED_PDF');
        tempEditorArray = tmpBookmarkSections.filter(item => (item.Type === 'EDITOR' || item.Type === 'ACCORDION'));
        tempVideoArray = tmpBookmarkSections.filter(item => item.Type === 'VIDEO');
        tempImageArray = tmpBookmarkSections.filter(item => item.Type === 'IMAGE');
        tempLinkArray = tmpBookmarkSections.filter(item => item.Type === 'LINK');
        tempH5pArray = tmpBookmarkSections.filter(item => item.Type === 'H5P');
         tempAudioArray = tmpBookmarkSections.filter(item => item.Type === 'AUDIO');
      }

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: [],
          searchSections: [],
        },
        paginationBookmarks: tempPaginationBookmarks,
        pdfArray: tempPdfArray,
        editorArray: tempEditorArray,
        videoArray: tempVideoArray,
        imageArray: tempImageArray,
        linkArray: tempLinkArray,
        h5pArray: tempH5pArray,
        audioArray: tempAudioArray,
        totalPdfRecords: tempPdfArray.length,
        totalEditorRecords: tempEditorArray.length,
        totalVideoRecords: tempVideoArray.length,
        totalImageRecords: tempImageArray.length,
        totalLinkRecords: tempLinkArray.length,
        totalH5pRecords: tempH5pArray.length,
        totalAudioRecords: tempAudioArray.length,
      };

    // DX_DELETE_DOWNLOAD_SUCCESS
    case downloadConstants.DX_DELETE_DOWNLOAD_SUCCESS:
      if (tmpBookmarkCards.length) {
        tmpBookmarkCards.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }

      if (tempPaginationBookmarks.length) {
        tempPaginationBookmarks.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: [],
          searchSections: [],
        },
        paginationBookmarks: tempPaginationBookmarks,
      };

    case constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:

      // 1. original bookmark card
      tempFound = false;
      if (tmpBookmarkCards && tmpBookmarkCards.length) {
        tmpBookmarkCards.map((item, i) => {
          if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
            tempFound = true;
            tempIndex = i;
          }
        });
      }
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tmpBookmarkCards.splice(tempIndex, 1, action.payload.experiences);
      }


      // 2. pagination bookmarks
      tempFound = false;
      if (tempPaginationBookmarks && tempPaginationBookmarks.length) {
        tempPaginationBookmarks.map((item, i) => {
          if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID
            && item.Experience) {
            tempFound = true;
            tempIndex = i;
          }
        });
      }
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempPaginationBookmarks.splice(tempIndex, 1, action.payload.experiences);
      }

      // 3. search pagination bookmarks
      tempFound = false;
      if (state.bookmarks.searchCards && state.bookmarks.searchCards.length) {
        state.bookmarks.searchCards.map((item, i) => {
          if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID
            && item.Experience) {
            tempFound = true;
            tempIndex = i;
          }
        });
      }
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        state.bookmarks.searchCards.splice(tempIndex, 1, action.payload.experiences);
      }

      // Accepted update
      if (action.payload.acceptedUpdate) {
        tmpBookmarkSections = tmpBookmarkSections.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempPdfArray = tempPdfArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempEditorArray = tempEditorArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempVideoArray = tempVideoArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempImageArray = tempImageArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempLinkArray = tempLinkArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempH5pArray = tempH5pArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        tempAudioArray = tempAudioArray.filter(
          bookmark => bookmark.ExperienceStreamGUID !== action.payload.experienceStreamGUID,
        );

        // Recent bookmarks remove sections
        // 1. filter the exp sections
        tempResult = [];
        tempPaginationBookmarks.forEach(
          (bookmark, i) => {
            if (bookmark.ExperienceStreamGUID === action.payload.experienceStreamGUID && bookmark.SectionGUID) {
              tempResult.push(bookmark);
            }
          },
        );

        // 2. remove the exp sections
        if (tempResult.length) {
          for (let i = tempPaginationBookmarks.length - 1; i >= 0; i--) {
            for (let j = 0; j < tempResult.length; j++) {
              if (tempPaginationBookmarks[i].SectionGUID === tempResult[j].SectionGUID) {
                tempPaginationBookmarks.splice(i, 1);
              }
            }
          }
          tempTotalBookmarkcardRecords = state.bookmarks.cards.length + state.bookmarks.sections.length;
        }
      }

      if (action.payload.updateBS) {
        tmpBookmarkSections = action.payload.bookmarks;

        tempPaginationBookmarks = [...tmpBookmarkCards, ...tmpBookmarkSections];
        tempPaginationBookmarks = tempPaginationBookmarks.sort(compare);
        
        tempPdfArray = tmpBookmarkSections.filter(item => item.Type === 'EMBED_PDF');
        tempEditorArray = tmpBookmarkSections.filter(item => (item.Type === 'EDITOR' || item.Type === 'ACCORDION'));
        tempVideoArray = tmpBookmarkSections.filter(item => item.Type === 'VIDEO');
        tempImageArray = tmpBookmarkSections.filter(item => item.Type === 'IMAGE');
        tempLinkArray = tmpBookmarkSections.filter(item => item.Type === 'LINK');
        tempH5pArray = tmpBookmarkSections.filter(item => item.Type === 'H5P');
        tempAudioArray = tmpBookmarkSections.filter(item => item.Type === 'AUDIO');
      }

      return {
        ...state,
        currentExperienceStream: action.payload.experiences,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: state.bookmarks.searchCards,
          searchSections: state.bookmarks.searchSections,
        },
        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tempTotalBookmarkcardRecords,

        pdfArray: tempPdfArray,
        editorArray: tempEditorArray,
        videoArray: tempVideoArray,
        imageArray: tempImageArray,
        linkArray: tempLinkArray,
        h5pArray: tempH5pArray,
        totalPdfRecords: tempPdfArray.length,
        totalEditorRecords: tempEditorArray.length,
        totalVideoRecords: tempVideoArray.length,
        totalImageRecords: tempImageArray.length,
        totalLinkRecords: tempLinkArray.length,
        totalH5pRecords: tempH5pArray.length,
      };

    case constants.DX_GET_BOOKMARKS_CARDS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isFirstLoading: state.pageNumber === 1,
        limit: action.payload.data.Limit,
      };

    case constants.DX_GET_BOOKMARKS_CARDS_SUCCESS:
      const {
        paginationResponse,
        payloadData: { isSearch, currentTab },
      } = action.payload;


      if (currentTab === 'COVER') {

        tempCardOnly = paginationResponse;
        // 1. If search then change pageNumnber to 1 otherwise check for duplicates
        if (isSearch) {
          tmpPageNumber = 1;
        } else {
          // Filter dunplicates from the response
          tempCardOnly = filterCardPageDuplicates(state.cardOnly, tempCardOnly);
        }

        // 2. loadmore or pullup or search list
        if (state.pullUpRefresh && !isSearch) {
          tempCardOnly = [...tempCardOnly, ...state.cardOnly];
        } else if (!state.pullUpRefresh && !isSearch) {
          tempCardOnly = [...state.cardOnly, ...tempCardOnly];
        }
        tempCardOnly = tempCardOnly.sort(compare);
      } else if (currentTab === 'PAGES') {

        tempCardWithPages = paginationResponse;
        // 1. If search then change pageNumnber to 1 otherwise check for duplicates
        if (isSearch) {
          tmpPageNumber = 1;
        } else {
          tempCardWithPages = filterCardPageDuplicates(state.cardWithPages, tempCardWithPages);
        }

        // 2. loadmore or pullup or search list
        if (state.pullUpRefresh && !isSearch) {
          tempCardWithPages = [...tempCardWithPages, ...state.cardWithPages];
        } else if (!state.pullUpRefresh && !isSearch) {
          tempCardWithPages = [...state.cardWithPages, ...tempCardWithPages];
        }
        tempCardWithPages = tempCardWithPages.sort(compare);
      } else if (currentTab === 'BookmarkCardPage') {

        tempPaginationBookmarks = paginationResponse;
        // 1. If search then change pageNumnber to 1 otherwise check for duplicates
        if (isSearch) {
          tmpPageNumber = 1;
        } else {
          tempPaginationBookmarks = filterCardAndSectionPageDuplicates(state.paginationBookmarks, tempPaginationBookmarks);
        }

        // 2. loadmore or pullup or search list
        if (state.pullUpRefresh && !isSearch) {
          tempPaginationBookmarks = [...tempPaginationBookmarks, ...state.paginationBookmarks];
        } else if (!state.pullUpRefresh && !isSearch) {
          tempPaginationBookmarks = [...state.paginationBookmarks, ...tempPaginationBookmarks];
        }
        tempPaginationBookmarks = tempPaginationBookmarks.sort(compare);
      }

      return {
        ...state,
        paginationBookmarks: tempPaginationBookmarks,
        totalBookmarkcardRecords: tmpBookmarkCards.length + tmpBookmarkSections.length,

        pageNumber: tmpPageNumber,

        cardOnly: tempCardOnly,
        totalCardOnlyRecords: tempCardOnly.length,

        cardWithPages: tempCardWithPages,
        totalCardWithPagesRecords: tempCardWithPages.length,

        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,

        isSearchingBookmarks: isSearch,
      };

    case constants.DX_GET_BOOKMARKS_CARDS_ERRORS:
      return {
        ...state,
        isLoading: false,
        isFirstLoading: false,
        errors: action.payload,
      };

    case constants.DX_GET_BOOKMARKS_SECTION_REQUEST:
      return {
        ...state,
        isLoading: true,
        isFirstLoading: state.pageNumber === 1,
        limit: action.payload.data.Limit,
      };

    case constants.DX_GET_BOOKMARKS_SECTIONS_SUCCESS:

      if (action.payload.payloadData.currentTab === 'PDF') {
        tempPaginationPdfArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationPdfArray = filterSectionPageDuplicates(state.paginationPdfArray, tempPaginationPdfArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationPdfArray = [...tempPaginationPdfArray, ...state.paginationPdfArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationPdfArray = [...state.paginationPdfArray, ...tempPaginationPdfArray];
        }
      } else if (action.payload.payloadData.currentTab === 'IMAGES') {
        tempPaginationImageArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationImageArray = filterSectionPageDuplicates(state.paginationImageArray, tempPaginationImageArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationImageArray = [...tempPaginationImageArray, ...state.paginationImageArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationImageArray = [...state.paginationImageArray, ...tempPaginationImageArray];
        }
      } else if (action.payload.payloadData.currentTab === 'TEXT') {
        tempPaginationEditorArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationEditorArray = filterSectionPageDuplicates(state.paginationEditorArray, tempPaginationEditorArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationEditorArray = [...tempPaginationEditorArray, ...state.paginationEditorArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationEditorArray = [...state.paginationEditorArray, ...tempPaginationEditorArray];
        }
      } else if (action.payload.payloadData.currentTab === 'VIDEOS') {
        tempPaginationVideoArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationVideoArray = filterSectionPageDuplicates(state.paginationVideoArray, tempPaginationVideoArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationVideoArray = [...tempPaginationVideoArray, ...state.paginationVideoArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationVideoArray = [...state.paginationVideoArray, ...tempPaginationVideoArray];
        }
      } else if (action.payload.payloadData.currentTab === 'LINKS') {
        tempPaginationLinkArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationLinkArray = filterSectionPageDuplicates(state.paginationLinkArray, tempPaginationLinkArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationLinkArray = [...tempPaginationLinkArray, ...state.paginationLinkArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationLinkArray = [...state.paginationLinkArray, ...tempPaginationLinkArray];
        }
      } else if (action.payload.payloadData.currentTab === 'H5P') {
        tempPaginationH5pArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationH5pArray = filterSectionPageDuplicates(state.paginationH5pArray, tempPaginationH5pArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationH5pArray = [...tempPaginationH5pArray, ...state.paginationH5pArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationH5pArray = [...state.paginationH5pArray, ...tempPaginationH5pArray];
        }
      } else if (action.payload.payloadData.currentTab === 'AUDIO') {
        tempPaginationAudioArray = action.payload.response;

        // Filter section for duplicates
        tempPaginationAudioArray = filterSectionPageDuplicates(state.paginationAudioArray, tempPaginationAudioArray);

        // loadmore or pullup or search list
        if (state.pullUpRefresh) {
          tempPaginationAudioArray = [...tempPaginationAudioArray, ...state.paginationAudioArray];
        } else if (!state.pullUpRefresh) {
          tempPaginationAudioArray = [...state.paginationAudioArray, ...tempPaginationAudioArray];
        }
      }

      return {
        ...state,
        paginationPdfArray: tempPaginationPdfArray,
        paginationEditorArray: tempPaginationEditorArray,
        paginationVideoArray: tempPaginationVideoArray,
        paginationImageArray: tempPaginationImageArray,
        paginationLinkArray: tempPaginationLinkArray,
        paginationH5pArray: tempPaginationH5pArray,
        paginationAudioArray: tempPaginationAudioArray,

        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
      };

    case constants.DX_GET_BOOKMARKS_SECTIONS_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    case constants.UPDATE_PAGE_NUMBER_BOOKMARKS:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
        pullUpRefresh: action.payload.pullUpRefresh,
        reduceOffsetWhenWeDelete: action.payload.reduceOffsetWhenWeDelete,
      };

    case constants.DX_CLOSE_BOOKMARK_CARDS_PAGE:
      return {
        ...state,
        pageNumber: 1,
        paginationBookmarks: [],
        searchToggle: false,
        searchValue: null,
      };

    case constants.DX_CLOSE_BOOKMARK_SECTION_PAGE:
      return {
        ...state,
        pageNumber: 1,
        cardOnly: [],
        cardWithPages: [],
        paginationBookmarks: [],
        paginationPdfArray: [],
        paginationEditorArray: [],
        paginationVideoArray: [],
        paginationImageArray: [],
        paginationLinkArray: [],
        paginationH5pArray: [],
        paginationAudioArray: [],
        searchToggle: false,
        searchValue: null,
      };

    case mainConstants.DX_MINIMIZE_APP_SUCCESS:
      return {
        ...state,
        searchToggle: false,
        searchValue: null,
      };

    case mainConstants.CLOSE_AUDIO_MODAL:
      
      // Add current time to searchSection
      if (tmpBookmarkSections.length) {
        tmpBookmarkSections.map(item => {
          if (item.SectionGUID === action.payload.sectionData.SectionGUID) {
            item.CurrentTime = action.payload.sectionData.CurrentTime;
          }
        })
      }

      return {
        ...state,
        bookmarks: {
          cards: tmpBookmarkCards,
          sections: tmpBookmarkSections,
          searchCards: tmpSearchCards,
          searchSections: tmpSearchSections,
        },
      }

    default:
      return state;
  }
};

function compare(a, b) {
  if (new Date(a.bookmarkedAt) < new Date(b.bookmarkedAt)) { return 1; }
  if (new Date(a.bookmarkedAt) > new Date(b.bookmarkedAt)) { return -1; }
  return 0;
}

const format_array_of_experiences = (downloads, experience) => {
  if (!downloads) {
    return;
  }
  if (!experience) {
    return;
  }

  for (let i = 0; i < downloads.length; i++) {
    const item1 = downloads[i];
    for (let j = 0; j < experience.length; j++) {
      const item2 = experience[j];
      if (item1.ExperienceStreamGUID === item2.ExperienceStreamGUID) {
        experience[j].isDownloaded = true;

        // Check for updATE
        if (item2.UpdatedAt != item1.UpdatedAt) {
          experience[j].isContentUpdated = true;
        }
      }
    }
  }
};


const filterCardAndSectionPageDuplicates = (targetArr, newArray) => {
  const resultArray = [];
  newArray.forEach((newArrayItem) => {
    let found = false;
    targetArr.forEach((targetArrItem) => {
      if (newArrayItem.ExperienceStreamGUID === targetArrItem.ExperienceStreamGUID && newArrayItem.SectionGUID == targetArrItem.SectionGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(newArrayItem);
    }
  });

  return resultArray;
};

const filterCardPageDuplicates = (targetArr, newArray) => {
  const resultArray = [];
  newArray.forEach((newArrayItem) => {
    let found = false;
    targetArr.forEach((targetArrItem) => {
      if (newArrayItem.ExperienceStreamGUID === targetArrItem.ExperienceStreamGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(newArrayItem);
    }
  });

  return resultArray;
};

const filterSectionPageDuplicates = (targetArr, newArray) => {
  const resultArray = [];
  newArray.forEach((newArrayItem) => {
    let found = false;
    targetArr.forEach((targetArrItem) => {
      if (newArrayItem.SectionGUID === targetArrItem.SectionGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(newArrayItem);
    }
  });

  return resultArray;
};
