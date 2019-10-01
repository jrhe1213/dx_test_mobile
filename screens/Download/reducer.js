import constants from './constants';
import homeConstants from '../Home/constants';
import bookmarkConstants from '../Bookmark/constants';
import FeedConstants from '../Feed/constants';
import mainConstants from '../../constants';

// Helpers
import { getUtcCurrentDateTime } from '../../helpers';

const INITIAL_STATE = {
  limit: 4,
  searchValue: null,
  searchStroageDownloads: [],
  paginationDownloads: [],
  storageDownloads: [],
  isUpdating: false,
  isLoading: false,
  isFirstLoading: false,
  errors: {},
  currentExperienceStream: {},
  totalDownloadRecords: null,
  pageNumber: 1,
  pullUpRefresh: false,
  reduceOffsetWhenWeDelete: false,
  isSearchingDownloads: false,
};

export default (state = INITIAL_STATE, action) => {
  let tempStorageDownloads;
  let tempDownloads = state.storageDownloads;
  let tempPaginationDownloads = state.paginationDownloads;
  let tmpPageNumber = state.pageNumber;
  let tempTotalDownloadRecords = state.totalDownloadRecords;
  let tempFound;
  let tempIndex;
  let tempSearchStroageDownloads;
  switch (action.type) {

    case mainConstants.GET_FIRST_LOAD_SUCCESS:
    case mainConstants.GET_USER_INFO_SUCCESS:
      tempStorageDownloads = action.payload.localData.downloads;
      tempPaginationDownloads = action.payload.localData.downloads;
      return {
        ...state,
        storageDownloads: tempStorageDownloads,
        totalDownloadRecords: action.payload.localData.downloads.length,
        paginationDownloads: tempPaginationDownloads.slice(0, 4),
      };

    case FeedConstants.DX_BROWSE_TO_PREVIOUS_TAB:
      return {
        ...state,
        paginationDownloads: [],
        pageNumber: 1,
      }

    case constants.DX_DOWNLOAD_INPUT_CHANGE:
      return {
        ...state,
        searchValue: action.payload.inputValue,
        pageNumber: 1,
      };

    // Search Download
    case homeConstants.DX_GET_DOWNLOAD_CARDS:
      if (!action.payload.downloadParams) {
        tempSearchStroageDownloads = [];
      } else {
        tempSearchStroageDownloads = state.storageDownloads.filter(item => item.Experience.ExperienceTitle.toLowerCase().includes(action.payload.downloadParams.toLowerCase())
          || item.ChannelName.toLowerCase().includes(action.payload.downloadParams.toLowerCase()));
      }
      return {
        ...state,
        searchStroageDownloads: tempSearchStroageDownloads,
      };

    case FeedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case FeedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
      tempFound = false;
      tempStorageDownloads = Object.assign([], state.storageDownloads);
      for (let i = 0; i < tempStorageDownloads.length; i++) {
        if (tempStorageDownloads[i].ExperienceStreamGUID == action.payload.experiences.ExperienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
          break;
        }
      }
      if (tempFound) {
        tempStorageDownloads.splice(tempIndex, 1, action.payload.experiences);
      } else {
        action.payload.experiences.downloadedAt = getUtcCurrentDateTime();
        tempStorageDownloads.push(action.payload.experiences);
      }
      tempStorageDownloads = tempStorageDownloads.sort(compare);

      return {
        ...state,
        storageDownloads: tempStorageDownloads,
        totalDownloadRecords: tempStorageDownloads.length,
      };

    case constants.DX_ADD_DOWNLOAD_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    // Delete download
    case constants.DX_DELETE_DOWNLOAD_SUCCESS:

      // 1. storage
      tempDownloads = tempDownloads.filter(download => download.ExperienceStreamGUID !== action.payload);

      // 2. pagination
      tempPaginationDownloads = tempPaginationDownloads.filter(download => download.ExperienceStreamGUID !== action.payload);

      // 3. total number
      tempTotalDownloadRecords -= 1;

      if (state.limit * (tmpPageNumber - 1) == tempPaginationDownloads.length && tmpPageNumber > 1) {
        tmpPageNumber -= 1;
      }

      return {
        ...state,
        storageDownloads: tempDownloads,
        paginationDownloads: tempPaginationDownloads,
        totalDownloadRecords: tempTotalDownloadRecords,
        pageNumber: tmpPageNumber,
      };


    case constants.DX_DELETE_DOWNLOAD_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

      // Fetch download

    case constants.DX_GET_DOWNLOADS_DIRECTORY_REQUEST:
      return {
        ...state,
        isLoading: true,
        isFirstLoading: state.pageNumber === 1,
      };


    case constants.DX_GET_DOWNLOADS_DIRECTORY_SUCCESS:
      const {
        paginationResponse,
        downloadsDirectory,
        payloadData: {
          isSearch,
        },
      } = action.payload;

      let tempStorageDownloads = paginationResponse;
      // loadmore or pullup or search list
      if (state.pullUpRefresh && !isSearch) {
        tempStorageDownloads = [...tempStorageDownloads, ...state.paginationDownloads];
      } else if (!state.pullUpRefresh && !isSearch) {
        tempStorageDownloads = [...state.paginationDownloads, ...tempStorageDownloads];
      }

      return {
        ...state,
        paginationDownloads: tempStorageDownloads,
        storageDownloads: downloadsDirectory,
        totalDownloadRecords: downloadsDirectory.length,
        isLoading: false,
        isFirstLoading: false,
        isUpdating: false,
        isSearchingDownloads: isSearch,
      };

    case constants.DX_GET_DOWNLOADS_DIRECTORY_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
      tempFound = false;
      tempStorageDownloads = Object.assign([], state.storageDownloads);
      for (let i = 0; i < tempStorageDownloads.length; i++) {
        if (tempStorageDownloads[i].ExperienceStreamGUID == action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
          break;
        }
      }
      if (!tempFound) {
        action.payload.downloadedAt = getUtcCurrentDateTime();
        tempStorageDownloads.push(action.payload.experiences);
      } else {
        if (action.payload.acceptedUpdate) {
          action.payload.experiences.Experience.ExperiencePages.Sections.map((item) => {
            if (item.isBookmarked) {
              item.isBookmarked = false;
            }
          });
        }
        tempStorageDownloads.splice(tempIndex, 1, action.payload.experiences);
      }
      tempStorageDownloads = tempStorageDownloads.sort(compare);

      return {
        ...state,
        storageDownloads: tempStorageDownloads,
        currentExperienceStream: action.payload.experiences,
      };

    case constants.UPDATE_PAGE_NUMBER_DONWLOADS:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
        pullUpRefresh: action.payload.pullUpRefresh,
        reduceOffsetWhenWeDelete: action.payload.reduceOffsetWhenWeDelete,
      };

    case constants.DX_DOWNLOAD_PAGE_OPEN:
    case constants.DX_DOWNLOAD_PAGE_CLOSE:
      return {
        ...state,
        pageNumber: 1,
        paginationDownloads: [],
      };

    case constants.DX_CLEAR_DOWNLOAD_SUCCESS:
      return {
        ...state,
        paginationDownloads: [],
        storageDownloads: [],
        searchStroageDownloads: [],
        pageNumber: 1,
        totalDownloadRecords: null,
      };

    default:
      return state;
  }
};


function compare(a, b) {
  if (new Date(a.downloadedAt) < new Date(b.downloadedAt)) {
    return 1;
  }
  if (new Date(a.downloadedAt) > new Date(b.downloadedAt)) {
    return -1;
  }
  return 0;
}
