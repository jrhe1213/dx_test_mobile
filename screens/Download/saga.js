import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import { AsyncStorage } from 'react-native';

// Library
import Storage from 'react-native-storage';

// Actions
import actions from './actions';

// Constants
import constants from './constants';

// Filesystem
import {
  downloadZip,
  deleteFile,
  isFolderExists,
  deleteUserFile,
  isUserFolderExists,
} from '../../utils/fileSystem';

// Selectors
import * as selectors from '../../utils/selector';

// config
import config from '../../config';

// Helpers
import { 
  getUtcCurrentDateTime, crashlyticsRecord
} from '../../helpers';

// Utils
import Alert from '../../utils/alert';

// Api
import { dxApi } from '../../helpers/apiManager';

const storage = new Storage({
  // maximum capacity, default 1000
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: false,
  sync: {
  },
});

const sortDownloadDataByRecentlyViewedAt = (array) => {
  // check for recently viewed at
  let recentlyViewedAt = array.filter(item => item.recentlyViewedAt);
  const downloadedAt = array.filter(item => !item.recentlyViewedAt);

  if (recentlyViewedAt.length) recentlyViewedAt.sort((a, b) => new Date(b.recentlyViewedAt) - new Date(a.recentlyViewedAt));
  if (downloadedAt.length) downloadedAt.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

  recentlyViewedAt = recentlyViewedAt.concat(downloadedAt);
  return recentlyViewedAt;
};

function* getDownloadDirectorySaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const downloadReducer = yield select(selectors.download);

    const response = downloadReducer.storageDownloads;

    const getRecentlyViewed = sortDownloadDataByRecentlyViewedAt(response);

    if (response) {
      let formattedResponse;

      if (action.payload.data.searchValue) {
        formattedResponse = response.filter(item => item.Experience.ExperienceTitle.toLowerCase().includes(action.payload.data.searchValue.toLowerCase())
          || item.ChannelName.toLowerCase().includes(action.payload.data.searchValue.toLowerCase()));
      } else {
        formattedResponse = getRecentlyViewed;
      }

      formattedResponse = formattedResponse.slice(action.payload.data.Offset).slice(0, action.payload.data.Limit);

      yield put(actions.getDownloadsDirectorySuccess(response, formattedResponse, action.payload.data));
    }
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getDownloadDirectorySaga', err.type, err.method, err.message);
    yield put(actions.getDownloadsDirectoryErrors(err));
  }
}

// 3. Delete
const deleteDownloadedFiles = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
  deleteFile('downloadFeeds', userGUID, experienceStreamGUID)
    .then(() => {
      resolve({ Confirmation: 'SUCCESSS' });
    })
    .catch((error) => {
      resolve({ Confirmation: 'SUCCESSS' });
    });
});

const deleteLocalStorageData = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-DOWNLOADS`,
    })
    .then((downloadArr) => {
      let found = false;
      let index;
      for (let i = 0; i < downloadArr.length; i++) {
        if (downloadArr[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }
      if (found) {
        downloadArr.splice(index, 1);
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({ Confirmation: 'SUCCESSS' });
          })
          .catch((error) => {
            resolve ({
              Confirmation: 'FAIL',
              type: 'Localstorage',
              method: 'deleteLocalStorageData',
              message: error,
            });
          });
      } else {
        resolve ({
          Confirmation: 'FAIL',
          type: 'Localstorage',
          method: 'deleteLocalStorageData',
          message: error,
        });
      }
    })
    .catch((error) => {
      resolve ({
        Confirmation: 'FAIL',
        type: 'Localstorage',
        method: 'deleteLocalStorageData',
        message: error,
      });
    });
});

const updateBookmarkLocalStorage = (experienceStreamGUID, toggle, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-BOOKMARKCARDS`,
    })
    .then((bookmarkArr) => {
      let found = false;
      let index;
      for (let i = 0; i < bookmarkArr.length; i++) {
        if (bookmarkArr[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }

      if (found) {
        bookmarkArr[index].isDownloaded = toggle;
        bookmarkArr[index].downloadedAt = toggle ? getUtcCurrentDateTime() : null;
      }
      storage
        .save({
          key: `${userGUID}-BOOKMARKCARDS`,
          data: bookmarkArr,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          resolve({
            Confirmation: 'FAIL',
            type: 'Localstorage',
            method: 'updateBookmarkLocalStorage',
            message: error,
          });
        });
    })
    .catch((error) => {
      resolve({
        Confirmation: 'FAIL',
        type: 'Localstorage',
        method: 'updateBookmarkLocalStorage',
        message: error,
      });
    });
});

export const removeStreamApi = (params, keycloak) => dxApi('/user/v2/remove_stream', params, true, keycloak);
function* deleteDownloadSaga(action) {
  
  const deviceInfo = yield select(selectors.deviceInfo);
  const {
    experienceStreamGUID,
  } = action.payload;

  try {
    const userReducer = yield select(selectors.user);

    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const channelSubscribeLabel = langLabels ? langLabels.Message : [];
    let deleteLabel;
    channelSubscribeLabel.map((label) => {
      if (label.Type === 'DOWNLOAD_DELETE_SUCCESS') {
        deleteLabel = label.Content;
      }
    });

    // 1. Check Experience Stream folder exist
    const checkStreamFolder = yield(isFolderExists('downloadFeeds', userReducer.userGUID, experienceStreamGUID));

    if (checkStreamFolder.Confirmation === 'FAIL') {
      crashlyticsRecord(deviceInfo.crashlytics, 'Download', 'deleteDownloadSaga', checkStreamFolder.type, checkStreamFolder.method, checkStreamFolder.message);
    }

    yield call(deleteDownloadedFiles, experienceStreamGUID, userReducer.userGUID);

    yield call(deleteLocalStorageData, experienceStreamGUID, userReducer.userGUID);
    // Sync bookmark data
    yield call(updateBookmarkLocalStorage, experienceStreamGUID, false, userReducer.userGUID);

    // 2. delete sync data in server
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };
    if (deviceInfo.internetInfo.isConnected) {
      const params = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        ExperienceStreamGUID: experienceStreamGUID,
        Type: 'DOWNLOAD',
        SectionGUID: ""
      };
      const removeStreamRes = yield call(removeStreamApi, params, keycloak);

      const { Confirmation, Message } = removeStreamRes.Data;
      if (Confirmation !== 'SUCCESS') {
        crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'deleteDownloadSaga', 'Api', '/user/v2/remove_stream', Message);
      }
    }

    Alert.showToast(deleteLabel, 1000, 'success');
    yield put(actions.deleteDownloadSuccess(experienceStreamGUID));
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'deleteDownloadSaga', err.type, err.method, err.message);
    yield put(actions.deleteDownloadSuccess(experienceStreamGUID));
  }
}


// 4. Clear
const clearDownloadedFiles = userGUID => new Promise((resolve, reject) => {
  deleteUserFile('downloadFeeds', userGUID)
    .then(() => {
      resolve({
        Confirmation: 'SUCCESSS',
      });
    })
    .catch((error) => {
      reject(error);
    });
});

const clearLocalStorageData = async (userGUID) => {
  try {
    await storage.save({ key: `${userGUID}-DOWNLOADS`, data: [] });

    const response = await storage.load({ key: `${userGUID}-DOWNLOADS` });

    if (!response.length) {
      return ({ Confirmation: 'SUCCESSS' });
    }
  } catch (err) {
    console.log('Clear storage error: ', err);
  }
};

const updateBookmarkAfterClearLocalStorage = (toggle, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-BOOKMARKCARDS`,
    })
    .then((bookmarkArr) => {
      if (bookmarkArr.length) {
        bookmarkArr[index].isDownloaded = toggle;
        bookmarkArr[index].downloadedAt = toggle ? getUtcCurrentDateTime() : null;
      }
      // console.log('bookmarkArr: ', bookmarkArr);
      storage
        .save({
          key: `${userGUID}-BOOKMARKCARDS`,
          data: bookmarkArr,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          resolve();
        });
    })
    .catch((error) => {
      resolve();
    });
});


function* clearDownloadSaga(action) {
  try {
    const userReducer = yield select(selectors.user);

    // 1. Check User folder exist
    const checkStreamFolder = yield (isUserFolderExists('downloadFeeds', userReducer.userGUID));

    if (checkStreamFolder) {
      const deleteFileResponse = yield call(clearDownloadedFiles, userReducer.userGUID);

      if (deleteFileResponse.Confirmation === 'SUCCESSS') {
        const deleteDataResponse = yield call(clearLocalStorageData, userReducer.userGUID);

        // Sync bookmark data
        yield call(updateBookmarkAfterClearLocalStorage, false, userReducer.userGUID);

        if (deleteDataResponse.Confirmation === 'SUCCESSS') {
          yield put(actions.clearDownloadSuccess());
          Alert.showToast('Successfull cleared downloads', 2000, 'success');
        } else {
          yield put(actions.clearDownloadErrors({
            Message: 'Clear download error 1',
          }));
        }
      } else {
        yield put(actions.clearDownloadErrors({
          Message: 'Clear download error 2',
        }));
      }
    } else {
      yield put(actions.clearDownloadErrors({
        Message: 'Clear download error 3',
      }));
    }
  } catch (err) {
    yield put(actions.clearDownloadErrors(err));
  }
}

export default function* DownloadSaga() {
  yield takeLatest(constants.DX_GET_DOWNLOADS_DIRECTORY_REQUEST, getDownloadDirectorySaga);
  yield takeLatest(constants.DX_DELETE_DOWNLOAD_REQUEST, deleteDownloadSaga);
  yield takeLatest(constants.DX_CLEAR_DOWNLOAD_REQUEST, clearDownloadSaga);
}
