import constants from './constants';

// Actions
export default {
  // Get download content
  getDownloadCards: downloadParams => ({
    type: constants.DX_GET_DOWNLOAD_CARDS,
    payload: {
      downloadParams,
    },
  }),

  // Get featured Content
  getFeaturedCardsRequest: (featuredParams, downloads, pullUpRefresh) => ({
    type: constants.DX_GET_FEATURED_CARDS_REQUEST,
    payload: {
      featuredParams,
      downloads,
      pullUpRefresh,
    },
  }),

  getFeaturedCardsSuccess: (featuredData, downloads, bookmarkCards, isSearch) => ({
    type: constants.DX_GET_FEATURED_CARDS_SUCCESS,
    payload: {
      featuredData, downloads, bookmarkCards, isSearch
    },
  }),

  getFeaturedCardsErrors: errors => ({
    type: constants.DX_GET_FEATURED_CARDS_ERRORS,
    payload: errors,
  }),

  // Get New Releases Content
  getNewReleaseRequest: (newReleaseParams, downloads, pullUpRefresh) => ({
    type: constants.DX_GET_NEW_RELEASES_CARDS_REQUEST,
    payload: {
      newReleaseParams,
      downloads,
      pullUpRefresh,
    },
  }),

  getNewReleaseSuccess: (newReleaseData, downloads, bookmarkCards, isSearch) => ({
    type: constants.DX_GET_NEW_RELEASES_CARDS_SUCCESS,
    payload: {
      newReleaseData, downloads, bookmarkCards, isSearch,
    },
  }),

  getNewReleaseErrors: errors => ({
    type: constants.DX_GET_NEW_RELEASES_CARDS_ERRORS,
    payload: errors,
  }),

  // Get Most Popular Content
  getMostPopularRequest: (mostPopularParams, downloads, pullUpRefresh) => ({
    type: constants.DX_GET_MOST_POPULAR_CARDS_REQUEST,
    payload: {
      mostPopularParams,
      downloads,
      pullUpRefresh,
    },
  }),

  getMostPopularSuccess: (mostPopularData, downloads, bookmarkCards, isSearch) => ({
    type: constants.DX_GET_MOST_POPULAR_CARDS_SUCCESS,
    payload: {
      mostPopularData, downloads, bookmarkCards, isSearch,
    },
  }),

  getMostPopularErrors: errors => ({
    type: constants.DX_GET_MOST_POPULAR_CARDS_ERRORS,
    payload: errors,
  }),

  // Get Trending Content
  getTrendingRequest: (trendingParams, downloads, pullUpRefresh) => ({
    type: constants.DX_GET_TRENDING_CARDS_REQUEST,
    payload: {
      trendingParams,
      downloads,
      pullUpRefresh,
    },
  }),

  getTrendingSuccess: (trendingData, downloads, bookmarkCards, isSearch) => ({
    type: constants.DX_GET_TRENDING_CARDS_SUCCESS,
    payload: {
      trendingData, downloads, bookmarkCards, isSearch,
    },
  }),

  getTrendingErrors: errors => ({
    type: constants.DX_GET_TRENDING_CARDS_ERRORS,
    payload: errors,
  }),

  // Get My channels
  getMyChannelsListRequest: (myChannelParams) => ({
    type: constants.DX_GET_MY_CHANNELS_LIST_REQUEST,
    payload: {
      myChannelParams,
    },
  }),

  getMyChannelsListSuccess: (myChannelsData, downloads, bookmarkCards, isSearch, totalRecord) => ({
    type: constants.DX_GET_MY_CHANNELS_LIST_SUCCESS,
    payload: {
      myChannelsData,
      downloads,
      bookmarkCards,
      isSearch,
      totalRecord,
    },
  }),

  getMyChannelsListErrors: errors => ({
    type: constants.DX_GET_MY_CHANNELS_LIST_ERRORS,
    payload: errors,
  }),

  updateMyChannelsPageNumber: () => ({
    type: constants.DX_UPDATE_MY_CHANNELS_LIST_PAGE_NUMBER,
    payload: {},
  }),

  dx_my_channel_back: () => ({
    type: constants.DX_MY_CHANNELS_BACK,
    payload: {},
  }),

};
