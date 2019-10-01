import constants from './constants';

// Actions
export default {

  // Bookmark search
  updateBookmarkInput: val => ({
    type: constants.DX_BOOKMARK_INPUT_CHANGE,
    payload: {
      val,
    },
  }),

  updatePageNumber: (pullUpRefresh, reduceOffsetWhenWeDelete) => ({
    type: constants.UPDATE_PAGE_NUMBER_BOOKMARKS,
    payload: {
      pullUpRefresh,
      reduceOffsetWhenWeDelete,
    },
  }),

  // Search toggle
  toggleBookmarkSearch: toggle => ({
    type: constants.DX_BOOKMARK_SEARCH_TOGGLE,
    payload: {
      toggle,
    },
  }),

  // Add bookmark
  addBookmarkRequest: data => ({
    type: constants.DX_ADD_BOOKMARK_REQUEST,
    payload: data,
  }),

  addBookmarkCardsSuccess: (data, currentTab) => ({
    type: constants.DX_ADD_BOOKMARK_CARDS_SUCCESS,
    payload: { currentTab, data },
  }),

  addBookmarkSectionsSuccess: data => ({
    type: constants.DX_ADD_BOOKMARK_SECTIONS_SUCCESS,
    payload: data,
  }),

  addBookmarkErrors: errors => ({
    type: constants.DX_ADD_BOOKMARK_ERRORS,
    payload: errors,
  }),

  // Delete bookmark
  deleteBookmarkRequest: data => ({
    type: constants.DX_DELETE_BOOKMARK_REQUEST,
    payload: data,
  }),

  deleteBookmarkSectionsSuccess: data => ({
    type: constants.DX_DELETE_BOOKMARK_SECTIONS_SUCCESS,
    payload: data,
  }),

  deleteBookmarkCardsSuccess: (data, currentTab) => ({
    type: constants.DX_DELETE_BOOKMARK_CARDS_SUCCESS,
    payload: { data, currentTab },
  }),

  deleteBookmarkErrors: errors => ({
    type: constants.DX_DELETE_BOOKMARK_ERRORS,
    payload: errors,
  }),

  // Get all bookmarks
  getBookmarkCardsRequest: (data, pullupRefresh) => ({
    type: constants.DX_GET_BOOKMARKS_CARDS_REQUEST,
    payload: {
      data, pullupRefresh
    },
  }),

  getBookmarkCardsSuccess: (paginationResponse, payloadData) => ({
    type: constants.DX_GET_BOOKMARKS_CARDS_SUCCESS,
    payload: {
      paginationResponse,
      payloadData,
    },
  }),

  getBookmarkCardsErrors: errors => ({
    type: constants.DX_GET_BOOKMARKS_CARDS_ERRORS,
    payload: errors,
  }),

  getBookmarkSectionsRequest: (data, pullupRefresh) => ({
    type: constants.DX_GET_BOOKMARKS_SECTION_REQUEST,
    payload: {
      data,
      pullupRefresh,
    },
  }),

  getBookmarkSectionsSuccess: (response, payloadData) => ({
    type: constants.DX_GET_BOOKMARKS_SECTIONS_SUCCESS,
    payload: {
      response,
      payloadData,
    },
  }),

  getBookmarkSectionsErrors: errors => ({
    type: constants.DX_GET_BOOKMARKS_SECTIONS_ERRORS,
    payload: errors,
  }),

  // Add Download
  addDownloadRequest: (stream, downloadData, acceptedUpdate) => ({
    type: constants.DX_BOOKMARK_ADD_DOWNLOAD_REQUEST,
    payload: {
      stream,
      downloadData,
      acceptedUpdate,
    },
  }),

  addDownloadSuccess: data => ({
    type: constants.DX_BOOKMARK_ADD_DOWNLOAD_SUCCESS,
    payload: data,
  }),

  addDownloadErrors: errors => ({
    type: constants.DX_BOOKMARK_ADD_DOWNLOAD_ERRORS,
    payload: errors,
  }),

  // Get cards inside pages(mobile-view)
  postStreamCardContentRequest: data => ({
    type: constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_REQUEST,
    payload: data,
  }),

  postStreamCardOnlyContentSucccess: (experiences, bookmarks, experienceCard,
    experienceStreamGUID, acceptedUpdate, currentTab, bookmarkCards, isFirstGetIn, isContinousCall) => ({
      type: constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS,
      payload: {
        experiences,
        bookmarks,
        experienceCard,
        experienceStreamGUID,
        acceptedUpdate,
        currentTab,
        bookmarkCards,
        isFirstGetIn,
        isContinousCall
      },
    }),

  postStreamCardAndPageContentSucccess: (experiences, bookmarks, experienceCard,
    experienceStreamGUID, acceptedUpdate, currentTab,
    bookmarkCards, isFirstGetIn, isContinousCall, updateBS, isSkipPageUpdate) => ({
      type: constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS,
      payload: {
        experiences,
        bookmarks,
        experienceCard,
        experienceStreamGUID,
        acceptedUpdate,
        currentTab,
        bookmarkCards,
        isFirstGetIn,
        isContinousCall,
        updateBS,
        isSkipPageUpdate
      },
    }),

  postStreamCardContentErrors: errors => ({
    type: constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_ERRORS,
    payload: errors,
  }),

  // V2
  postStreamCardContentV2Request: data => ({
    type: constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST,
    payload: data,
  }),

  bookmarkSkipTheContentUpdateRequest: stream => ({
    type: constants.DX_BOOKMARK_SKIP_THE_CONTENT_UPDATE_REQUEST,
    payload: {
      stream,
    },
  }),

  openBookmarkCardsPage: () => ({
    type: constants.DX_OPEN_BOOKMARK_CARDS_PAGE,
    payload: {},
  }),

  closeBookmarkCardsPage: () => ({
    type: constants.DX_CLOSE_BOOKMARK_CARDS_PAGE,
    payload: {},
  }),

  openBookmarkSectionPage: sectionType => ({
    type: constants.DX_OPEN_BOOKMARK_SECTION_PAGE,
    payload: {
      sectionType,
    },
  }),

  closeBookmarkSectionPage: sectionType => ({
    type: constants.DX_CLOSE_BOOKMARK_SECTION_PAGE,
    payload: {
      sectionType,
    },
  }),
};
