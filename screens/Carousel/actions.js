import constants from './constants';

// Actions
export default {
  // Download page
  openFeaturedPage: pageType => ({
    type: constants.DX_FEATURED_PAGE_OPEN,
    payload: {
      pageType,
    },
  }),

  closeFeaturedPage: pageType => ({
    type: constants.DX_FEATURED_PAGE_CLOSE,
    payload: {
      pageType,
    },
  }),

  // MOST Popular page
  openMostPopularPage: pageType => ({
    type: constants.DX_MOST_POPULAR_PAGE_OPEN,
    payload: {
      pageType,
    },
  }),

  closeMostPopularPage: pageType => ({
    type: constants.DX_MOST_POPULAR_PAGE_CLOSE,
    payload: {
      pageType,
    },
  }),

  // NewReleases page
  openNewReleasesPage: pageType => ({
    type: constants.DX_NEW_RELEASES_PAGE_OPEN,
    payload: {
      pageType,
    },
  }),

  closeNewReleasesPage: pageType => ({
    type: constants.DX_NEW_RELEASES_PAGE_CLOSE,
    payload: {
      pageType,
    },
  }),

  // Download page
  openTrendingPage: pageType => ({
    type: constants.DX_TRENDING_PAGE_OPEN,
    payload: {
      pageType,
    },
  }),

  closeTrendingPage: pageType => ({
    type: constants.DX_TRENDING_PAGE_CLOSE,
    payload: {
      pageType,
    },
  }),

  updatePageNumber: pullUpRefresh => ({
    type: constants.DX_UPDATE_PAGE_NUMBER,
    payload: {
      pullUpRefresh,
    },
  }),
};
