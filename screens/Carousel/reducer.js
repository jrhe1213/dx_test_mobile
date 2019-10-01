import mainConstants from '../../constants';
import constants from './constants';
import homeConstants from '../Home/constants';
import feedConstants from '../Feed/constants';
import bookmarkConstants from '../Bookmark/constants';

// helpers
import { getCurrentDateTime } from '../../helpers';

const INITIAL_STATE = {
  totalFeaturedRecords: null,
  paginationFeatured: [],
  currentFeaturedExperienceStreamGUID: null,

  totalMostPopularRecords: null,
  paginationMostPopular: [],
  currentMostPopularExperienceStreamGUID: null,

  paginationNewReleases: [],
  totalNewReleasesRecords: null,
  currentNewReleaseExperienceStreamGUID: null,

  paginationTrending: [],
  totalTrendingRecords: null,
  currentTrendingExperienceStreamGUID: null,

  isUpdating: false,
  isLoading: false,
  isFirstLoading: false,
  errors: {},
  pageNumber: 1,
  pullUpRefresh: false,
};

export default (state = INITIAL_STATE, action) => {
  let tempPaginationFeatured = state.paginationFeatured;
  let tempPaginationMostPopular = state.paginationMostPopular;
  let tempPaginationNewReleases = state.paginationNewReleases;
  let tempPaginationTrending = state.paginationTrending;

  let tempFeatureExperienceStreams;
  let tempPopularExperienceStreams;
  let tempNewReleaseExperienceStreams;
  let tempTrendingExperienceStream;
  let tempBookmarkCards;

  switch (action.type) {

    case mainConstants.GET_FIRST_LOAD_SUCCESS:
    case mainConstants.GET_USER_INFO_SUCCESS:
      tempDownloads = action.payload.localData.downloads;
      tempBookmarkCards = action.payload.localData.bookmarkCards;
      tempPaginationFeatured = tempPaginationFeatured.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        return stream;
      });
      tempPaginationMostPopular = tempPaginationMostPopular.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        return stream;
      });
      tempPaginationNewReleases = tempPaginationNewReleases.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        return stream;
      });
      tempPaginationTrending = tempPaginationTrending.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(tempDownloads, tempPaginationFeatured);
      format_array_of_experiences(tempDownloads, tempPaginationMostPopular);
      format_array_of_experiences(tempDownloads, tempPaginationNewReleases);
      format_array_of_experiences(tempDownloads, tempPaginationTrending);
      update_experience_streams_boolean(tempPaginationFeatured, tempBookmarkCards);
      update_experience_streams_boolean(tempPaginationMostPopular, tempBookmarkCards);
      update_experience_streams_boolean(tempPaginationNewReleases, tempBookmarkCards);
      update_experience_streams_boolean(tempPaginationTrending, tempBookmarkCards);
      return {
        ...state,
        paginationFeatured: tempPaginationFeatured,
        paginationMostPopular: tempPaginationMostPopular,
        paginationNewReleases: tempPaginationNewReleases,
        paginationTrending: tempPaginationTrending,
      };

    case feedConstants.DX_BROWSE_TO_PREVIOUS_TAB:
      return {
        ...state,
        paginationFeatured: [],
        paginationMostPopular: [],
        paginationNewReleases: [],
        paginationTrending: [],
        pageNumber: 1,
      }

    case constants.DX_UPDATE_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
        pullUpRefresh: action.payload.pullUpRefresh,
      };

    case homeConstants.DX_GET_FEATURED_CARDS_REQUEST:
    case homeConstants.DX_GET_MOST_POPULAR_CARDS_REQUEST:
    case homeConstants.DX_GET_NEW_RELEASES_CARDS_REQUEST:
    case homeConstants.DX_GET_TRENDING_CARDS_REQUEST:
      return {
        ...state,
        isLoading: true,
        isFirstLoading: state.pageNumber === 1,
      };

    case homeConstants.DX_GET_FEATURED_CARDS_ERRORS:
    case homeConstants.DX_GET_MOST_POPULAR_CARDS_ERRORS:
    case homeConstants.DX_GET_NEW_RELEASES_CARDS_ERRORS:
    case homeConstants.DX_GET_TRENDING_CARDS_ERRORS:
      return {
        ...state,
        isLoading: false,
        isFirstLoading: false,
      };

    case homeConstants.DX_GET_FEATURED_CARDS_SUCCESS:
      const {
        isSearch,
        featuredData,
        downloads,
        bookmarkCards,
      } = action.payload;

      tempPaginationFeatured = featuredData.Response.ExperienceStreams;
      // Add default boolean for download and bookmarks
      tempPaginationFeatured = tempPaginationFeatured.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        stream.isContentUpdated = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(downloads, tempPaginationFeatured);
      // Add the true to isBookmarked if match
      update_experience_streams_boolean(tempPaginationFeatured, bookmarkCards);

      const tempFeaturedTotalRecord = featuredData.Response.TotalRecord;

      // loadmore or pullup or search list
      if (state.pullUpRefresh && !isSearch) {
        tempPaginationFeatured = [...tempPaginationFeatured, ...state.paginationFeatured];
      } else if (isSearch) {
        tempPaginationFeatured = featuredData.Response.ExperienceStreams;
      } else if (!state.pullUpRefresh && !isSearch) {
        tempPaginationFeatured = [...state.paginationFeatured, ...tempPaginationFeatured];
      }
      return {
        ...state,
        paginationFeatured: tempPaginationFeatured,
        totalFeaturedRecords: tempFeaturedTotalRecord,
        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
      };

    case homeConstants.DX_GET_MOST_POPULAR_CARDS_SUCCESS:
      const {
        mostPopularData,
      } = action.payload;

      tempPaginationMostPopular = mostPopularData.Response.ExperienceStreams;

      // Add default boolean for download and bookmarks
      tempPaginationMostPopular = tempPaginationMostPopular.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        stream.isContentUpdated = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(action.payload.downloads, tempPaginationMostPopular);
      // Add the true to isBookmarked if match
      update_experience_streams_boolean(tempPaginationMostPopular, action.payload.bookmarkCards);

      const tempMostPopularTotalRecord = mostPopularData.Response.TotalRecord;

      // loadmore or pullup or search list
      if (state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationMostPopular = [...tempPaginationMostPopular, ...state.paginationMostPopular];
      } else if (action.payload.isSearch) {
        tempPaginationMostPopular = mostPopularData.Response.ExperienceStreams;
      } else if (!state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationMostPopular = [...state.paginationMostPopular, ...tempPaginationMostPopular];
      }
      return {
        ...state,
        paginationMostPopular: tempPaginationMostPopular,
        totalMostPopularRecords: tempMostPopularTotalRecord,
        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
      };

    case homeConstants.DX_GET_NEW_RELEASES_CARDS_SUCCESS:
      const {
        newReleaseData,
      } = action.payload;

      tempPaginationNewReleases = newReleaseData.Response.ExperienceStreams;

      // Add default boolean for download and bookmarks
      tempPaginationNewReleases = tempPaginationNewReleases.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        stream.isContentUpdated = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(action.payload.downloads, tempPaginationNewReleases);
      // Add the true to isBookmarked if match
      update_experience_streams_boolean(tempPaginationNewReleases, action.payload.bookmarkCards);

      const tempTotalRecord = newReleaseData.Response.TotalRecord;

      // loadmore or pullup or search list
      if (state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationNewReleases = [...tempPaginationNewReleases, ...state.paginationNewReleases];
      } else if (action.payload.isSearch) {
        tempPaginationNewReleases = newReleaseData.Response.ExperienceStreams;
      } else if (!state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationNewReleases = [...state.paginationNewReleases, ...tempPaginationNewReleases];
      }
      return {
        ...state,
        paginationNewReleases: tempPaginationNewReleases,
        totalNewReleasesRecords: tempTotalRecord,
        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
      };

    case homeConstants.DX_GET_TRENDING_CARDS_SUCCESS:
      const {
        trendingData,
      } = action.payload;

      tempPaginationTrending = trendingData.Response.ExperienceStreams;

      // Add default boolean for download and bookmarks
      tempPaginationTrending = tempPaginationTrending.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        stream.isContentUpdated = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(action.payload.downloads, tempPaginationTrending);
      // Add the true to isBookmarked if match
      update_experience_streams_boolean(tempPaginationTrending, action.payload.bookmarkCards);

      const tempTotalRecord2 = trendingData.Response.TotalRecord;

      // loadmore or pullup or search list
      if (state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationTrending = [...tempPaginationTrending, ...state.paginationTrending];
      } else if (action.payload.isSearch) {
        tempPaginationTrending = trendingData.Response.ExperienceStreams;
      } else if (!state.pullUpRefresh && !action.payload.isSearch) {
        tempPaginationTrending = [...state.paginationTrending, ...tempPaginationTrending];
      }
      return {
        ...state,
        paginationTrending: tempPaginationTrending,
        totalTrendingRecords: tempTotalRecord2,
        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
      };

    case constants.DX_FEATURED_PAGE_OPEN:
    case constants.DX_MOST_POPULAR_PAGE_OPEN:
    case constants.DX_NEW_RELEASES_PAGE_OPEN:
    case constants.DX_TRENDING_PAGE_OPEN:
    case constants.DX_FEATURED_PAGE_CLOSE:
    case constants.DX_MOST_POPULAR_PAGE_CLOSE:
    case constants.DX_NEW_RELEASES_PAGE_CLOSE:
    case constants.DX_TRENDING_PAGE_CLOSE:
      return {
        ...state,
        paginationFeatured: [],
        paginationMostPopular: [],
        paginationNewReleases: [],
        paginationTrending: [],
        isLoading: false,
        isFirstLoading: false,
        pageNumber: 1,
        isUpdating: false,
        pullUpRefresh: false,
        totalFeaturedRecords: null,
        totalMostPopularRecords: null,
        totalNewReleasesRecords: null,
        totalTrendingRecords: null,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:

      tempFeatureExperienceStreams = Object.assign([], state.paginationFeatured);
      tempPopularExperienceStreams = Object.assign([], state.paginationMostPopular);
      tempNewReleaseExperienceStreams = Object.assign([], state.paginationNewReleases);
      tempTrendingExperienceStream = Object.assign([], state.paginationTrending);

      let tempFound = false;
      let tempIndex;
      tempFeatureExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });

      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempFeatureExperienceStreams.splice(tempIndex, 1, action.payload.experiences);
      }

      tempFound = false;
      tempPopularExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempPopularExperienceStreams.splice(tempIndex, 1, action.payload.experiences);
      }

      tempFound = false;
      tempNewReleaseExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempNewReleaseExperienceStreams.splice(tempIndex, 1, action.payload.experiences);
      }

      tempFound = false;
      tempTrendingExperienceStream.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempTrendingExperienceStream.splice(tempIndex, 1, action.payload.experiences);
      }

      return {
        ...state,
        paginationFeatured: tempFeatureExperienceStreams,
        paginationMostPopular: tempPopularExperienceStreams,
        paginationNewReleases: tempNewReleaseExperienceStreams,
        paginationTrending: tempTrendingExperienceStream,
        currentFeaturedExperienceStreamGUID: action.payload.currentTab === 'Featured' ? action.payload.experiences.ExperienceStreamGUID : state.currentFeaturedExperienceStreamGUID,
        currentMostPopularExperienceStreamGUID: action.payload.currentTab === 'MostPopular' ? action.payload.experiences.ExperienceStreamGUID : state.currentMostPopularExperienceStreamGUID,
        currentNewReleaseExperienceStreamGUID: action.payload.currentTab === 'NewReleases' ? action.payload.experiences.ExperienceStreamGUID : state.currentNewReleaseExperienceStreamGUID,
        currentTrendingExperienceStreamGUID: action.payload.currentTab === 'Trending' ? action.payload.experiences.ExperienceStreamGUID : state.currentTrendingExperienceStreamGUID,
      };

    // Add bookmark for cards
    case bookmarkConstants.DX_ADD_BOOKMARK_CARDS_SUCCESS:
      if (action.payload.currentTab === 'Featured') {
        tempPaginationFeatured.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = true;
          }
        });
      } else if (action.payload.currentTab === 'MostPopular') {
        tempPaginationMostPopular.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = true;
          }
        });
      } else if (action.payload.currentTab === 'NewReleases') {
        tempPaginationNewReleases.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = true;
          }
        });
      } else if (action.payload.currentTab === 'Trending') {
        tempPaginationTrending.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = true;
          }
        });
      }

      return {
        ...state,
        paginationFeatured: tempPaginationFeatured,
        paginationMostPopular: tempPaginationMostPopular,
        paginationNewReleases: tempPaginationNewReleases,
        paginationTrending: tempPaginationTrending,
      };

      // Delete bookmark for cards
    case bookmarkConstants.DX_DELETE_BOOKMARK_CARDS_SUCCESS:
      if (action.payload.currentTab === 'Featured') {
        tempPaginationFeatured.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = false;
          }
        });
      } else if (action.payload.currentTab === 'MostPopular') {
        tempPaginationMostPopular.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = false;
          }
        });
      } else if (action.payload.currentTab === 'NewReleases') {
        tempPaginationNewReleases.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = false;
          }
        });
      } else if (action.payload.currentTab === 'Trending') {
        tempPaginationTrending.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
            item.isBookmarked = false;
          }
        });
      }

      return {
        ...state,
        paginationFeatured: tempPaginationFeatured,
        paginationMostPopular: tempPaginationMostPopular,
        paginationNewReleases: tempPaginationNewReleases,
        paginationTrending: tempPaginationTrending,
      };

    default:
      return state;
  }
};

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

const update_experience_streams_boolean = (experienceStreams, bookmarks) => {
  if (!bookmarks.length || !experienceStreams.length) {
    return experienceStreams;
  }
  for (let i = 0; i < experienceStreams.length; i++) {
    const item1 = experienceStreams[i];
    for (let j = 0; j < bookmarks.length; j++) {
      const item2 = bookmarks[j];
      if (item1.ExperienceStreamGUID === item2.ExperienceStreamGUID) {
        experienceStreams[i].isBookmarked = true;
      }
    }
  }
};
