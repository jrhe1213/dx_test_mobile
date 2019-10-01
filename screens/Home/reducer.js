import mainConstants from '../../constants';
import constants from './constants';
import downloadConstants from '../Download/constants';
import registerConstants from '../Register/constants';
import settingsConstants from '../Setting/constants';
import feedConstants from '../Feed/constants';
import carousleConstants from '../Carousel/constants';

const INITIAL_STATE = {
  featured: [],
  newReleases: [],
  mostPopular: [],
  trending: [],

  isLoading: false,
  errors: {},

  isLoadingFeatured: true,
  isLoadingNewReleases: true,
  isLoadingMostPopular: true,
  isLoadingTrending: true,

  mychannelsList: [],
  isLoadingMyChannels: true,
  pageNumber: 1,
  totalMyChannelsRecords: null,
  isUpdating: false,
};

export default (state = INITIAL_STATE, action) => {
  let tempExperienceStreams;
  let tempFeatureExperienceStreams;
  let tempPopularExperienceStreams;
  let tempNewReleaseExperienceStreams;
  let tempTrendingExperienceStreams;
  let tempFound;
  let tempIndex;
  let tempMyChannelsList;
  switch (action.type) {

    case mainConstants.GET_FIRST_LOAD_SUCCESS:
    case mainConstants.GET_USER_INFO_SUCCESS:

      tempDownloads = action.payload.localData.downloads;
      tempFeatureExperienceStreams = Object.assign([], state.featured);
      tempPopularExperienceStreams = Object.assign([], state.mostPopular);
      tempNewReleaseExperienceStreams = Object.assign([], state.newReleases);
      tempTrendingExperienceStreams = Object.assign([], state.trending);

      tempFeatureExperienceStreams = tempFeatureExperienceStreams.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });
      tempPopularExperienceStreams = tempPopularExperienceStreams.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });
      tempNewReleaseExperienceStreams = tempNewReleaseExperienceStreams.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });
      tempTrendingExperienceStreams = tempTrendingExperienceStreams.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(tempDownloads, tempFeatureExperienceStreams);
      format_array_of_experiences(tempDownloads, tempPopularExperienceStreams);
      format_array_of_experiences(tempDownloads, tempNewReleaseExperienceStreams);
      format_array_of_experiences(tempDownloads, tempTrendingExperienceStreams);
      return {
        ...state,
        featured: tempFeatureExperienceStreams,
        trending: tempTrendingExperienceStreams,
        newReleases: tempNewReleaseExperienceStreams,
        mostPopular: tempPopularExperienceStreams,
      };

    case mainConstants.GET_HEARTBEAT_SUCCESS:
      return {
        ...state,
        // isLoadingFeatured: action.payload.data.IsFeaturedEnable == 1,
        // isLoadingNewReleases: action.payload.data.IsNewReleaseEnable == 1,
        // isLoadingMostPopular: action.payload.data.IsMostPopularEnable == 1,
        // isLoadingTrending: action.payload.data.IsTrendingEnable == 1,
        // isLoadingMyChannels: action.payload.data.IsMychannelEnable == 1,
      }

    case constants.DX_UPDATE_MY_CHANNELS_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
      }

    case 'Navigation/NAVIGATE':
    case carousleConstants.DX_MOST_POPULAR_PAGE_OPEN:
    case carousleConstants.DX_FEATURED_PAGE_OPEN:
    case carousleConstants.DX_NEW_RELEASES_PAGE_OPEN:
    case carousleConstants.DX_TRENDING_PAGE_OPEN:
      return {
        ...state,
        mychannelsList: [],
        pageNumber: 1,
        totalMyChannelsRecords: null,
      };

    case mainConstants.DX_OPEN_HOME_PAGE:
    case mainConstants.DX_OPEN_EXPLORE_PAGE:
    case mainConstants.DX_OPEN_BOOKMARK_PAGE:
    case registerConstants.OPEN_REGISTER_PAGE:
    case downloadConstants.DX_DOWNLOAD_PAGE_OPEN:
    case settingsConstants.DX_OPEN_SETTINGS_PAGE:

    case carousleConstants.DX_FEATURED_PAGE_CLOSE:
    case carousleConstants.DX_MOST_POPULAR_PAGE_CLOSE:
    case carousleConstants.DX_NEW_RELEASES_PAGE_CLOSE:
    case carousleConstants.DX_TRENDING_PAGE_CLOSE:

    case downloadConstants.DX_DOWNLOAD_PAGE_CLOSE:
      return {
        ...state,
        mychannelsList: [],
        pageNumber: 1,
        totalMyChannelsRecords: null,
      };

    case feedConstants.DX_BROWSE_TO_PREVIOUS_TAB:
    case constants.DX_MY_CHANNELS_BACK:
      return {
        ...state,
        mychannelsList: [],
        pageNumber: 1,
        totalMyChannelsRecords: null,
        featured: [],
        newReleases: [],
        mostPopular: [],
        trending: [],
      }

    case mainConstants.LOGOUT_REQUEST:
      return {
        ...state,
        mychannelsList: [],
        pageNumber: 1,
        totalMyChannelsRecords: null,
      };

    // Get Featured
    case constants.DX_GET_FEATURED_CARDS_REQUEST:
      return {
        ...state,
        isLoadingFeatured: true,
        featured: [],
      };

    case constants.DX_GET_FEATURED_CARDS_SUCCESS:
      tempExperienceStreams = action.payload.featuredData.Response.ExperienceStreams;
      return {
        ...state,
        featured: tempExperienceStreams,
        isLoadingFeatured: false,
      };

    case constants.DX_GET_FEATURED_CARDS_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoadingFeatured: false,
      };

    // Get Most Popular
    case constants.DX_GET_MOST_POPULAR_CARDS_REQUEST:
      return {
        ...state,
        isLoadingMostPopular: true,
        mostPopular: [],
      };

    case constants.DX_GET_MOST_POPULAR_CARDS_SUCCESS:
      tempExperienceStreams = action.payload.mostPopularData.Response.ExperienceStreams;
      return {
        ...state,
        mostPopular: tempExperienceStreams,
        isLoadingMostPopular: false,
      };

    case constants.DX_GET_MOST_POPULAR_CARDS_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoadingMostPopular: false,
      };

    // Get New Releases
    case constants.DX_GET_NEW_RELEASES_CARDS_REQUEST:
      return {
        ...state,
        isLoadingNewReleases: true,
        newReleases: [],
      };

    case constants.DX_GET_NEW_RELEASES_CARDS_SUCCESS:
      tempExperienceStreams = action.payload.newReleaseData.Response.ExperienceStreams;
      return {
        ...state,
        newReleases: tempExperienceStreams,
        isLoadingNewReleases: false,
      };

    case constants.DX_GET_NEW_RELEASES_CARDS_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoadingNewReleases: false,
      };

    // Get Trending
    case constants.DX_GET_TRENDING_CARDS_REQUEST:
      return {
        ...state,
        isLoadingTrending: true,
        trending: [],
      };

    case constants.DX_GET_TRENDING_CARDS_SUCCESS:
      tempExperienceStreams = action.payload.trendingData.Response.ExperienceStreams;
      return {
        ...state,
        trending: tempExperienceStreams,
        isLoadingTrending: false,
      };

    case constants.DX_GET_TRENDING_CARDS_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoadingTrending: false,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:

      tempFeatureExperienceStreams = Object.assign([], state.featured);
      tempPopularExperienceStreams = Object.assign([], state.mostPopular);
      tempNewReleaseExperienceStreams = Object.assign([], state.newReleases);
      tempTrendingExperienceStreams = Object.assign([], state.trending);
      tempMyChannelsList = Object.assign([], state.mychannelsList);

      // featured
      tempFound = false;
      tempFeatureExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempFeatureExperienceStreams.splice(tempIndex, 1);
      }

      // most popular
      tempFound = false;
      tempPopularExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempPopularExperienceStreams.splice(tempIndex, 1);
      }

      // new release
      tempFound = false;
      tempNewReleaseExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempNewReleaseExperienceStreams.splice(tempIndex, 1);
      }

      // trending
      tempFound = false;
      tempTrendingExperienceStreams.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempTrendingExperienceStreams.splice(tempIndex, 1);
      }

      // my channels
      tempMyChannelsList.forEach(channel => {
        channel.ExperienceStreams.forEach((stream, i) => {
          if (stream.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
            channel.ExperienceStreams.splice(i, 1);
          }
        })
      })

      return {
        ...state,
        featured: tempFeatureExperienceStreams,
        mostPopular: tempPopularExperienceStreams,
        newReleases: tempNewReleaseExperienceStreams,
        trending: tempTrendingExperienceStreams,
        mychannelsList: tempMyChannelsList,
      };

    case downloadConstants.DX_DELETE_DOWNLOAD_SUCCESS:
      tempFeatureExperienceStreams = Object.assign([], state.featured);
      tempPopularExperienceStreams = Object.assign([], state.mostPopular);
      tempNewReleaseExperienceStreams = Object.assign([], state.newReleases);
      tempTrendingExperienceStreams = Object.assign([], state.trending);

      if (tempFeatureExperienceStreams.length) {
        tempFeatureExperienceStreams.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }

      if (tempPopularExperienceStreams.length) {
        tempPopularExperienceStreams.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }

      if (tempNewReleaseExperienceStreams.length) {
        tempNewReleaseExperienceStreams.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }

      if (tempTrendingExperienceStreams.length) {
        tempTrendingExperienceStreams.forEach((item) => {
          if (item.ExperienceStreamGUID === action.payload) {
            item.isDownloaded = false;
          }
        });
      }
      return {
        ...state,
        featured: tempFeatureExperienceStreams,
        mostPopular: tempPopularExperienceStreams,
        newReleases: tempNewReleaseExperienceStreams,
        trending: tempTrendingExperienceStreams,
      };

    case constants.DX_GET_MY_CHANNELS_LIST_REQUEST:
      return {
        ...state,
        isLoadingMyChannels: true,
      }

    case constants.DX_GET_MY_CHANNELS_LIST_SUCCESS:
      tempMyChannelsList = action.payload.myChannelsData;

      tempMyChannelsList = filterDuplicates(state.mychannelsList, tempMyChannelsList);

      if (action.payload.isSearch) {
        tempMyChannelsList = action.payload.myChannelsData;
      } else {
        tempMyChannelsList = [...state.mychannelsList, ...tempMyChannelsList];
      }

      return {
        ...state,
        mychannelsList: tempMyChannelsList,
        isLoadingMyChannels: false,
        totalMyChannelsRecords: action.payload.totalRecord,
        isUpdating: false,
      }

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


const filterDuplicates = (targetArr, newArray) => {
  const resultArray = [];
  newArray.forEach((newArrayItem) => {
    let found = false;
    targetArr.forEach((targetArrItem) => {
      if (newArrayItem.ExperienceChannelGUID === targetArrItem.ExperienceChannelGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(newArrayItem);
    }
  });

  return resultArray;
};