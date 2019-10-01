import constants from './constants';

// Actions
export default {
  updateDownloadInput: inputValue => ({
    type: constants.DX_DOWNLOAD_INPUT_CHANGE,
    payload: {
      inputValue,
    },
  }),

  updatePageNumber: (pullUpRefresh, reduceOffsetWhenWeDelete) => ({
    type: constants.UPDATE_PAGE_NUMBER_DONWLOADS,
    payload: {
      pullUpRefresh,
      reduceOffsetWhenWeDelete,
    },
  }),

  // Download page
  openDownloadPage: () => ({
    type: constants.DX_DOWNLOAD_PAGE_OPEN,
    payload: {},
  }),

  closeDownloadPage: () => ({
    type: constants.DX_DOWNLOAD_PAGE_CLOSE,
    payload: {},
  }),

  // get local storage download directory
  getDownloadsDirectoryRequest: (data, pullupRefresh) => ({
    type: constants.DX_GET_DOWNLOADS_DIRECTORY_REQUEST,
    payload: {
      data,
      pullupRefresh,
    },
  }),

  getDownloadsDirectorySuccess: (downloadsDirectory, paginationResponse, payloadData) => ({
    type: constants.DX_GET_DOWNLOADS_DIRECTORY_SUCCESS,
    payload: {
      downloadsDirectory,
      paginationResponse,
      payloadData,
    },
  }),

  getDownloadsDirectoryErrors: errors => ({
    type: constants.DX_GET_DOWNLOADS_DIRECTORY_ERRORS,
    payload: errors,
  }),

  // Delete download
  deleteDownloadRequest: experienceStreamGUID => ({
    type: constants.DX_DELETE_DOWNLOAD_REQUEST,
    payload: {
      experienceStreamGUID,
    },
  }),

  deleteDownloadSuccess: data => ({
    type: constants.DX_DELETE_DOWNLOAD_SUCCESS,
    payload: data,
  }),

  deleteDownloadErrors: errors => ({
    type: constants.DX_DELETE_DOWNLOAD_ERRORS,
    payload: errors,
  }),

  // Delete download
  clearDownloadRequest: () => ({
    type: constants.DX_CLEAR_DOWNLOAD_REQUEST,
    payload: {},
  }),

  clearDownloadSuccess: () => ({
    type: constants.DX_CLEAR_DOWNLOAD_SUCCESS,
    payload: {},
  }),

  clearDownloadErrors: errors => ({
    type: constants.DX_CLEAR_DOWNLOAD_ERRORS,
    payload: errors,
  }),
};
