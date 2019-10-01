
import constants from './constants';

export default {
  //search
  updateInput: val => ({
    type: constants.DX_INPUT_CHANGE,
    payload: {
      val,
    },
  }),

  updateInputSection: val => ({
    type: constants.DX_SECTION_INPUT_CHANGE,
    payload: {
      val,
    },
  }),

  handleCurrentTab: index => ({
    type: constants.DX_HANDLE_CURRENT_TAB,
    payload: {
      index,
    },
  }),

  // Search toggle
  toggleSearch: (toggle, type) => ({
    type: constants.DX_SEARCH_TOGGLE,
    payload: {
      toggle,
      type
    },
  }),

  // Tags action
  getTagListRequest: (tagListParams, isFirstLoad) => ({
    type: constants.DX_GET_TAGS_LIST_REQUEST,
    payload: {
      tagListParams,
      isFirstLoad
    },
  }),

  getTagListSuccess: (tagsListData, isSearch) => ({
    type: constants.DX_GET_TAGS_LIST_SUCCESS,
    payload: {
      tagsListData,
      isSearch
    },
  }),

  getTagListErrors: (errors) => ({
    type: constants.DX_GET_TAGS_LIST_ERRORS,
    payload: {
      errors
    },
  }),

  updateTagsListPageNumber: () => ({
    type: constants.DX_UPDATE_TAGS_LIST_PAGE_NUMBER,
    payload: {},
  }),

  // Channels Action
  getChannelListRequest: (channelListParams, isFirstLoading) => ({
    type: constants.DX_GET_CHANNELS_LIST_REQUEST,
    payload: {
      channelListParams,
      isFirstLoading
    },
  }),

  getChannelListSuccess: (channelListData, isSearch) => ({
    type: constants.DX_GET_CHANNELS_LIST_SUCCESS,
    payload: {
      channelListData,
      isSearch
    },
  }),

  getChannelListErrors: (errors) => ({
    type: constants.DX_GET_CHANNELS_LIST_ERRORS,
    payload: {
        errors
      },
    }),

  updateChannelListPageNumber: () => ({
    type: constants.DX_UPDATE_CHANNELS_LIST_PAGE_NUMBER,
    payload: {},
  }),

  // Content List
  getContentListRequest: (contentListParams, isFirstLoading) => ({
    type: constants.DX_GET_CONTENT_LIST_REQUEST,
    payload: {
      contentListParams,
      isFirstLoading
    },
  }),

  getContentListSuccess: (contentListData, isSearch) => ({
    type: constants.DX_GET_CONTENT_LIST_SUCCESS,
    payload: {
      contentListData,
      isSearch
    },
  }),

  getContentListErrors: (errors) => ({
    type: constants.DX_GET_CONTENT_LIST_ERRORS,
    payload: {
        errors
      },
    }),

  updateContentListPageNumber: () => ({
    type: constants.DX_UPDATE_CONTENT_LIST_PAGE_NUMBER,
    payload: {},
  }),

  // Tag NAme CLick
  getTagExpRequest: (tagParams, clickedTag, isFirstLoading) => ({
    type: constants.DX_GET_TAG_EXP_REQUEST,
    payload: {
      tagParams,
      clickedTag,
      isFirstLoading,
    },
  }),

  getTagExpSuccess: (tagExpListData, downloads) => ({
    type: constants.DX_GET_TAG_EXP_SUCCESS,
    payload: {
      tagExpListData,
      downloads,
    },
  }),

  getTagExpErrors: (errors) => ({
    type: constants.DX_GET_TAG_EXP_ERRORS,
    payload: {
        errors
      },
    }),

  updateTagExpListPageNumber: () => ({
    type: constants.DX_UPDATE_TAG_EXP_LIST_PAGE_NUMBER,
    payload: {},
  }),

  updateCurrentSectionSearchTab: currentTabIndex => ({
    type: constants.DX_UPDATE_CURRENT_SECTION_SEARCH_TAB,
    payload: {
      currentTabIndex
    },
  }),

  updateSearchSectionPageNumber: () => ({
    type: constants.DX_UPDATE_SEARCH_SECTION_LIST_PAGE_NUMBER,
    payload: {},
  }),

  // Search action
  getSearchDataListRequest: (searchParams, isFirstLoad) => ({
    type: constants.DX_GET_SEARCH_LIST_REQUEST,
    payload: {
      searchParams,
      isFirstLoad
    },
  }),

  getSearchDataListSuccess: (searchData, isSearch, totalRecord, bookmarkSections) => ({
    type: constants.DX_GET_SEARCH_LIST_SUCCESS,
    payload: {
      searchData,
      isSearch,
      totalRecord,
      bookmarkSections,
    },
  }),

  getSearchDataListErrors: (errors) => ({
    type: constants.DX_GET_SEARCH_LIST_ERRORS,
    payload: {
      errors
    },
  }),

  // Search action v2
  getSearchDataListV2Request: (searchParams, isFirstLoad) => ({
    type: constants.DX_GET_SEARCH_LIST_V2_REQUEST,
    payload: {
      searchParams,
      isFirstLoad
    },
  }),

  getSearchDataListV2Success: (searchData, isSearch, bookmarkSections) => ({
    type: constants.DX_GET_SEARCH_LIST_V2_SUCCESS,
    payload: {
      searchData,
      isSearch,
      bookmarkSections
    },
  }),

  getSearchDataListV2Errors: (errors) => ({
    type: constants.DX_GET_SEARCH_LIST_V2_ERRORS,
    payload: {
      errors
    },
  }),

  // Jump to Page
  handleGoToPage: (section, bookmarks) => ({
    type: constants.DX_HANDLE_GO_TO_PAGE,
    payload: {
      section,
      bookmarks
    },
  }),

  // Search toggle
  toggleSearchSection: (toggle, type) => ({
    type: constants.DX_SEARCH_SECTION_TOGGLE,
    payload: {
      toggle,
      type
    },
  }),

};
