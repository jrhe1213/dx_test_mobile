import {
  call, put, takeLatest, select,
} from 'redux-saga/effects';
import {
  AsyncStorage,
} from 'react-native';

// Library
import Storage from 'react-native-storage';
import moment from 'moment';

// Actions
import actions from './actions';
import deviceInfoActions from '../../actions/DeviceInfo';

// Constants
import constants from './constants';

// Filesystem
import {
  downloadZip,
  createFolder,
  isFolderExists,
} from '../../utils/fileSystem';

// Selector
import * as selectors from '../../utils/selector';

// Api
import { dxApi } from '../../helpers/apiManager';
import Alert from '../../utils/alert';

// Actions
import modalActions from '../../actions/Modal';

// Helpers
import {
  getUtcCurrentDateTime,
  getCurrentDateTime,
  crashlyticsRecord,
  assembleTree,
} from '../../helpers';


const storage = new Storage({
  // maximum capacity, default 1000
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: false,
  sync: {
  },
});

const updateTokenDataLocalStorage = async (key, keycloak) => {
  try {
    const getItem = await storage.load({
      key,
    });
    getItem.expiryDate = keycloak.expiryDate;
    getItem.token = keycloak.token;
    getItem.refreshToken = keycloak.refreshToken;

    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    const data = {
      expiryDate: keycloak.expiryDate,
      token: keycloak.token,
      refreshToken: keycloak.refreshToken,
    };

    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data,
          });
        } catch (err) {
          return ({
            type: 'Localstorage',
            method: 'updateTokenDataLocalStorage',
            message: 'Cannot save into localStorage (NotFoundError)',
          });
        }
        break;
      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data,
          });
        } catch (err) {
          return ({
            type: 'Localstorage',
            method: 'updateTokenDataLocalStorage',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    return ({
      type: 'Localstorage',
      method: 'updateTokenDataLocalStorage',
      message: 'Not found error',
    });
  }
};

// ============================================================
// 1. channel stream list
const streamExperienceApi = (params, keycloak) => dxApi('/user/stream_list_inner', params, true, keycloak);

function* postStreamExperienceSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const formattedParams = {
      ChannelLanguageGUID: action.payload.data.ChannelLanguageGUID,
      Extra: action.payload.data.Extra,
      Limit: action.payload.data.Limit,
      Offset: action.payload.data.Offset,
    };

    const downloadReducer = yield select(selectors.download);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(streamExperienceApi, formattedParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      yield put(actions.postStreamExperienceSuccess(response.Data, downloadReducer.storageDownloads, action.payload.data.bookmarks, action.payload.data.pageNumber, action.payload.data.isSearch, action.payload.data.currentTab));
    } else {
      crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceSaga', 'Api', '/user/stream_list_inner', Message);
      yield put(actions.postStreamExperienceFailure(Message));
    }
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postStreamExperienceSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}


// ============================================================
// 2. mobile view
const checkAndUpdateOfflineLocalStorage = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
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
      if (!found) {
        resolve();
        return;
      }
      const stream = downloadArr[index];
      stream.recentlyViewedAt = getUtcCurrentDateTime();
      stream.numberOfClicks = stream.numberOfClicks ? stream.numberOfClicks + 1 : 1;
      downloadArr[index] = stream;
      storage
        .save({
          key: `${userGUID}-DOWNLOADS`,
          data: downloadArr,
        })
        .then(() => {
          resolve({ Confirmation: 'SUCCESS' });
        })
        .catch((error) => {
          reject({
            type: 'Localstorage',
            method: 'checkAndUpdateOfflineLocalStorage',
            message: error,
          });
        });
    })
    .catch((error) => {
      switch (error.name) {
        case 'NotFoundError':
          resolve();
          break;
        case 'ExpiredError':
          resolve();
          break;
        default:
          reject({
            type: 'Localstorage',
            method: 'checkAndUpdateOfflineLocalStorage',
            message: 'Check and update local storage error',
          });
      }
    });
});

const downloadXiFolder = (folderName, userGUID, streamFolderName, experienceGUID) => new Promise((resolve, reject) => {
  downloadZip(folderName, userGUID, streamFolderName, experienceGUID)
    .then((response) => {
      resolve(response);
    })
    .catch((error) => {
      reject({
        type: 'Download',
        method: 'downloadXiFolder',
        message: error,
      });
    });
});

const checkExistedDownloadedData = (experienceStreamGUID, userGUID, newStream) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-DOWNLOADS`,
    })
    .then((downloadArr) => {
      let found = false;
      for (let i = 0; i < downloadArr.length; i++) {
        if (downloadArr[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }
      if (!found) {
        resolve({ type: 'NEW_DOWNLOAD' });
      } else {
        // 1. old logic
        if (!newStream) {
          resolve({ type: 'NO_UPDATE' });
        } else {
          // 2. new data sync new update detect
          resolve({ type: 'NEW_UPDATE' });
        }
      }
    })
    .catch((error) => {
      resolve({ type: 'NEW_DOWNLOAD' });
    });
});

const getExistedDownloadedFiles = async (experienceStreamGUID, userGUID) => {

  const getStorageDownloads = await storage.load({ key: `${userGUID}-DOWNLOADS` });

  if (!getStorageDownloads) {
    return ({
      Confirmation: 'FAIL',
      type: 'Download',
      method: 'getExistedDownloadedFiles',
      message: 'No files found',
    });
  }

  const response = getStorageDownloads.filter(item => (item.ExperienceStreamGUID == experienceStreamGUID));

  if (!response.length) {
    return ({
      Confirmation: 'FAIL',
      type: 'Download',
      method: 'getExistedDownloadedFiles',
      message: 'File not found',
    });
  }
  return ({ Confirmation: 'SUCCESS', Response: response });
};

const checkAndUpdateLocalStorage = (experienceStreamGUID, response, userGUID, replaceContent) => new Promise((resolve, reject) => {
  response.isDownloaded = true;

  storage
    .load({
      key: `${userGUID}-DOWNLOADS`,
    }).then((downloadArr) => {
      let found = false;
      let index;
      for (let i = 0; i < downloadArr.length; i++) {
        if (downloadArr[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }
      if (!found) {
        response.downloadedAt = getUtcCurrentDateTime();
        response.recentlyViewedAt = getUtcCurrentDateTime();
        response.numberOfClicks = 1;
        response.isNewStructure = true;
        downloadArr.push(response);
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({ Confirmation: 'SUCCESS' });
          })
          .catch((error) => {
            reject({
              type: 'Localstorage',
              method: 'checkAndUpdateLocalStorage',
              message: error,
            });
          });
      } else {
        const ret = downloadArr[index];
        if (ret.Experience.UpdatedAt == response.Experience.UpdatedAt) {
          response.downloadedAt = ret.downloadedAt;
          response.recentlyViewedAt = getUtcCurrentDateTime();
          response.numberOfClicks = ret.numberOfClicks ? ret.numberOfClicks + 1 : 1;
        } else {
          response.downloadedAt = getUtcCurrentDateTime();
          response.recentlyViewedAt = getUtcCurrentDateTime();
          response.numberOfClicks = 1;
        }
        response.isNewStructure = downloadArr[index].isNewStructure;
        if (!replaceContent) {
          response.Experience.ExperiencePages = downloadArr[index].Experience.ExperiencePages;
        }
        downloadArr[index] = response;

        // Replace storage
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({ Confirmation: 'SUCCESS' });
          })
          .catch((error) => {
            reject({
              type: 'Localstorage',
              method: 'checkAndUpdateLocalStorage',
              message: error,
            });
          });
      }
    })
    .catch((error) => {
      switch (error.name) {
        case 'NotFoundError':
          response.downloadedAt = getUtcCurrentDateTime();
          response.recentlyViewedAt = getUtcCurrentDateTime();
          response.numberOfClicks = 1;
          storage
            .save({
              key: `${userGUID}-DOWNLOADS`,
              data: [response],
            })
            .then(() => {
              resolve({ Confirmation: 'SUCCESS' });
            })
            .catch((error) => {
              reject({
                type: 'Localstorage',
                method: 'checkAndUpdateLocalStorage',
                message: error,
              });
            });
          break;
        case 'ExpiredError':
          response.downloadedAt = getUtcCurrentDateTime();
          response.recentlyViewedAt = getUtcCurrentDateTime();
          response.numberOfClicks = 1;
          storage
            .save({
              key: `${userGUID}-DOWNLOADS`,
              data: [response],
            })
            .then(() => {
              resolve({ Confirmation: 'SUCCESS' });
            })
            .catch((error) => {
              reject({
                type: 'Localstorage',
                method: 'checkAndUpdateLocalStorage',
                message: error,
              });
            });
          break;
        default:
          reject({
            type: 'Localstorage',
            method: 'checkAndUpdateLocalStorage',
            message: 'Check and update local storage error',
          });
      }
    });
});

const UpdateIsNewStructureLocalStorage = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {

  storage
    .load({
      key: `${userGUID}-DOWNLOADS`,
    }).then((downloadArr) => {
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

        downloadArr[index].isNewStructure = true;
        // Replace storage
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({
              Confirmation: 'SUCCESS'
            });
          })
          .catch((error) => {
            reject({
              type: 'Localstorage',
              method: 'UpdateIsNewStructureLocalStorage',
              message: error,
            });
          });
      }
    })
});

const updateTempOldExpStreamFromLocalStorage = (experienceStreamGUID, updatedStream, userGUID) => new Promise((resolve, reject) => {
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
        updatedStream.isNewStructure = downloadArr[index].isNewStructure;
        updatedStream.Experience.ExperiencePages = downloadArr[index].Experience.ExperiencePages;
        downloadArr[index] = updatedStream;
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            resolve();
          });
      } else {
        resolve();
      }
    })
    .catch((error) => {
      reject({
        type: 'Localstorage',
        method: 'updateTempOldExpStreamFromLocalStorage',
        message: error,
      });
    });
});

const retrieveDataFromLocalStorage = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
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
        resolve(downloadArr[index]);
      }
      resolve(null);
    })
    .catch((error) => {
      reject({
        type: 'Localstorage',
        method: 'retrieveDataFromLocalStorage',
        message: error,
      });
    });
});

const updateBookmarkOfflineLocalStorage = (response, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-BOOKMARKCARDS`,
    })
    .then((bookmarkArr) => {
      let found = false;
      let index;
      for (let i = 0; i < bookmarkArr.length; i++) {
        if (bookmarkArr[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }

      if (found) {
        bookmarkArr[index].recentlyViewedAt = getUtcCurrentDateTime();
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
          resolve();
        });
    })
    .catch((error) => {
      resolve();
    });
});

const updateBookmarkLocalStorage = (response, toggle, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-BOOKMARKCARDS`,
    })
    .then((bookmarkArr) => {
      let found = false;
      let index;
      for (let i = 0; i < bookmarkArr.length; i++) {
        if (bookmarkArr[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }

      if (found) {
        bookmarkArr[index] = response;
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
          resolve();
        });
    })
    .catch((error) => {
      resolve();
    });
});


// Api call for channel list
export const postStreamExperienceCardInfoApi = (params, keycloak) => dxApi('/user/v2/mobile_view', params, true, keycloak);

export const checkDataSyncedApi = (params, keycloak) => dxApi('/user/mobile_check_sync', params, true, keycloak);

function* postStreamExperienceCardInfoSaga(action) {

  // case 1: get in with old data
  // case 2: download new content

  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const { stream } = action.payload;
    const userReducer = yield select(selectors.user);

    // 1.1 Check if the Exp in the localStorage
    const getExistedDownloaded = yield call(getExistedDownloadedFiles, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);

    if (getExistedDownloaded.Confirmation === 'SUCCESS') {
      // 1. retrieve local storage
      yield call(checkAndUpdateOfflineLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

      // 2. Sync bookmark data
      yield call(updateBookmarkOfflineLocalStorage, stream, userReducer.userGUID);

      let formattedResponse = yield call(retrieveDataFromLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

      if (formattedResponse) {
        // report 1
        formattedResponse.startedAt = getUtcCurrentDateTime();
        if (!formattedResponse.timeSpent) {
          formattedResponse.timeSpent = 0;
        }
        if (!formattedResponse.numberOfImpressions) {
          formattedResponse.numberOfImpressions = 1;
        } else {
          formattedResponse.numberOfImpressions += 1;
        }

        // 3. Assemble Data Here
        if (formattedResponse.isNewStructure) {
          formattedResponse.dataType = "NEW_DATA";
          formattedResponse.isFetchNewData = false;
          formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));

          if (formattedResponse.Experience.ExperienceType === "1") {
            formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
            formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = formattedResponse.CurrentLevelExperiencePageGUID;
            formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
          }
        } else {
          formattedResponse.dataType = "OLD_DATA";
          formattedResponse.isFetchNewData = true;
          formattedResponse.DataArr = [];
        }

        const {
          bookmarks: {
            sections,
            cards,
          },
        } = yield select(selectors.bookmark);
        if (formattedResponse.Experience.ExperienceType === '1') {
          // Card Pages
          if (formattedResponse.Experience.ExperiencePages) {
            yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, true, false, false, false));
          } else {
            yield put(actions.postStreamCardContentErrors({ Message: 'postStreamCardContentErrors' }));
          }
        } else { // Card only
          yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, action.payload.currentTab, cards, true, false));
        }
      } else {
        yield put(actions.postStreamCardContentErrors({ Message: 'postStreamCardContentErrors' }));
      }
    } else {

      // 1. call mobile view api
      const keycloak = {
        isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
        deviceId: deviceInfo.deviceId,
        expiryDate: deviceInfo.expiryDate,
        token: deviceInfo.token,
        refreshToken: deviceInfo.refreshToken,
      };

      // 2. mobile view
      const formattedMobileViewParams = {
        IsRequiredPages: "1",
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        ExperienceStreamGUID: action.payload.stream.ExperienceStreamGUID,
        Type: 'DOWNLOAD',
        Data: {}
      };

      const response = yield call(postStreamExperienceCardInfoApi, formattedMobileViewParams, keycloak);

      const { Confirmation, Response, Message } = response.Data;

      if (Confirmation === 'SUCCESS') {
        // 3.1 If token refresh update the local storage
        if (response.isTokenRefreshed) {
          yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
          yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
        }
        // 1. Content delete
        // 2. Stream delete
        if (Response.Type == 'DELETE') {
          Alert.showToast('Not available content', 5000);
          yield put(actions.postStreamCardContentErrors('Not available content'));
          return;

        } else {
          // server synced data
          const updatedStream = Response.ExperienceStream;
          const downloadData = {
            folderName: 'downloadFeeds',
            streamFolderName: updatedStream.ExperienceStreamGUID,
          };
          // report 1
          updatedStream.startedAt = getUtcCurrentDateTime();
          updatedStream.numberOfImpressions = 1;
          if (!updatedStream.timeSpent) {
            updatedStream.timeSpent = 0;
          }

          yield put(actions.addDownloadRequest(updatedStream, downloadData));
        }
      } else {
        Alert.showToast('Something went wrong', 5000);
        crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoSaga', 'Api', '/user/v2/mobile_view', Message);
        yield put(actions.postStreamCardContentErrors(Message));
      }
    }

  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postStreamExperienceCardInfoSaga', err.type, err.method, err.message);
  }
}

function* postStreamExperienceCardInfoV2Saga(action) {


  // case: secondary call for old data


  const deviceInfo = yield select(selectors.deviceInfo);
  const bookmarkReducer = yield select(selectors.bookmark);
  const feedReducer = yield select(selectors.feed);
  let nav;
  try {
    const { offline } = action.payload;
    const userReducer = yield select(selectors.user);

    if (offline) {
      return;
    }

    // 1. call mobile view api
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    // 1.1 Check if the Exp in the localStorage
    const getExistedDownloaded = yield call(getExistedDownloadedFiles, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);

    // 1.2 Check Sync is necessary
    if (getExistedDownloaded.Confirmation === 'SUCCESS') {
      const formattedCheckApiParams = {
        ExperienceStreamGUID: getExistedDownloaded.Response[0].ExperienceStreamGUID,
        Type: 'DOWNLOAD',
        SyncedAt: getExistedDownloaded.Response[0].SyncedAt,
      };

      const checkDataSynced = yield call(checkDataSyncedApi, formattedCheckApiParams, keycloak);
      const { Confirmation, Response, Message } = checkDataSynced.Data;

      if (Confirmation === 'SUCCESS') {
        if (Response.IsNeedSynced) {

          const syncedAt = getCurrentDateTime();
          getExistedDownloaded.Response[0].SyncedAt = syncedAt;

          // 1.3 Api call to User Sync
          const formattedUserSyncParams = {
            Platform: deviceInfo.systemName.toUpperCase(),
            DeviceID: deviceInfo.deviceId,
            Type: 'DOWNLOAD',
            ExperienceStreamGUID: getExistedDownloaded.Response[0].ExperienceStreamGUID,
            Data: {
              CurrentLevelExperiencePageGUID: getExistedDownloaded.Response[0].CurrentLevelExperiencePageGUID || "",
              SyncedAt: getExistedDownloaded.Response[0].SyncedAt,
              TimeSpent: getExistedDownloaded.Response[0].timeSpent || "0",
              NumberOfImpressions: getExistedDownloaded.Response[0].numberOfImpressions || "0",
              CompletionArr: getExistedDownloaded.Response[0].CompletionArr,
              AudioCompletionArr: getExistedDownloaded.Response[0].AudioCompletionArr,
            },
          };

          const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);

          if (userSync.Data.Confirmation !== 'SUCCESS') {
            crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoV2Saga', 'Api', '/user/v2/sync_stream', userSync.Data.Message);
          }
        }
      } else {
        crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoV2Saga', 'Api', '/user/mobile_check_sync', Message);
      }
    }

    // 2. mobile view
    let formattedMobileViewParams = {
      IsRequiredPages: feedReducer.isFetchNewData ? "1" : "0",
      Platform: deviceInfo.systemName.toUpperCase(),
      DeviceID: deviceInfo.deviceId,
      ExperienceStreamGUID: action.payload.stream.ExperienceStreamGUID,
      Type: 'DOWNLOAD',
      Data: {}
    };

    // handle the old data & completion arr
    const experienceStreamWithChannelInfo = JSON.parse(JSON.stringify(feedReducer.experienceStreamWithChannelInfo));
    if (feedReducer.isFetchNewData && experienceStreamWithChannelInfo.Experience.ExperienceType == '1') {
      formattedMobileViewParams.Data = {};
      let tempFormattedOldData = [];
      assembleOldDataIntoOneDimensionArr(experienceStreamWithChannelInfo.Experience.ExperiencePages, tempFormattedOldData);
      formattedMobileViewParams.Data.CompletionArr = [];
      tempFormattedOldData.map(item => {
        if (!item.Sections && item.SectionGUID && item.IsCompleted) {
          if (!formattedMobileViewParams.Data.CompletionArr.includes(item.SectionGUID)) {
            formattedMobileViewParams.Data.CompletionArr.push(item.SectionGUID);
          }
        }
      })
    }

    const response = yield call(postStreamExperienceCardInfoApi, formattedMobileViewParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // 3.1 If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      // 1. Content delete
      // 2. Stream delete
      if (Response.Type == 'DELETE') {
        // 3.2 check needs of download Data ?
        const checkExistedDownloadedDataRes = yield call(checkExistedDownloadedData, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);
        if (checkExistedDownloadedDataRes.type === 'NEW_DOWNLOAD') {
          // 1. NEW_DOWNLOAD
          Alert.showToast('Not available content', 5000);
          yield put(actions.postStreamCardContentErrors('Not available content'));
          return;
        } else if (checkExistedDownloadedDataRes.type === 'NO_UPDATE') {

          // 2. NO_UPDATE
          const updatedStream = Response.ExperienceStream;
          if (updatedStream.RecentlyViewedAt) {
            updatedStream.recentlyViewedAt = updatedStream.RecentlyViewedAt;
          }
          if (updatedStream.DownloadedAt) {
            updatedStream.downloadedAt = updatedStream.DownloadedAt;
          }
          if (updatedStream.BookmarkedAt) {
            updatedStream.bookmarkedAt = updatedStream.BookmarkedAt;
          }

          // =============================================================
          // 3. Bookmark section
          let updateBS = false;
          const serverBookmarkSectionArr = Response.BookmarkSections;
          const serverDeviceBookmarkSectionArr = bookmarkReducer.bookmarks.sections;
          // 3.1 download the new exp
          const syncBookmarkSectionArr = checkSyncStreamToDownload(serverBookmarkSectionArr, serverDeviceBookmarkSectionArr);
          // 3.2 delete local exp
          const syncDeleteBookmarkSectionArr = checkSyncStreamToDelete(updatedStream.ExperienceStreamGUID, serverDeviceBookmarkSectionArr, serverBookmarkSectionArr);

          // 3.3 download
          for (const i in syncBookmarkSectionArr) {
            const item = syncBookmarkSectionArr[i];
            const params = {
              Platform: deviceInfo.systemName.toUpperCase(),
              DeviceID: deviceInfo.deviceId,
              UserExperienceStreamGUID: item.UserExperienceStreamGUID,
            };
            const syncBookmarkSectionDataRes = yield call(syncBookmarkSectionDataApi, params, keycloak, userReducer, deviceInfo);

            if (syncBookmarkSectionDataRes.Confirmation != 'SUCCESS') {
              crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'postStreamExperienceCardInfoV2Saga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
            }
          }
          // // 3.4 delete
          for (const i in syncDeleteBookmarkSectionArr) {
            const item = syncDeleteBookmarkSectionArr[i];
            const params = {
              Platform: deviceInfo.systemName.toUpperCase(),
              DeviceID: deviceInfo.deviceId,
              ExperienceStreamGUID: item.ExperienceStreamGUID,
              Type: 'BOOKMARK_SECTION',
              SectionGUID: item.SectionGUID,
            };
            const deleteSyncBookmarkDataRes = yield call(deleteSyncBookmarkDataApi, params, keycloak, userReducer.userGUID, 'BOOKMARKSECTIONS', item.ExperienceStreamGUID, item.SectionGUID);

            if (deleteSyncBookmarkDataRes.Confirmation != 'SUCCESS') {
              crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'postStreamExperienceCardInfoV2Saga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
            }
          }
          if (syncBookmarkSectionArr.length || syncDeleteBookmarkSectionArr.length) {
            updateBS = true;
          }
          // =============================================================

          const isSamePage = updatedStream.CurrentLevelExperiencePageGUID == feedReducer.experienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID;
          if (feedReducer.dataType != "OLD_DATA") {
            if (!Response.IsSameDevice) {
              if (!isSamePage) {
                const originalStream = yield call(retrieveDataFromLocalStorage, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);
                // ask stay or update

                // stop
                nav = yield select(selectors.nav);
                if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
                  yield put(actions.openUpdateUserSyncModal(updatedStream, originalStream, updateBS));
                }
                return;
              }
            }
          }

          // report 1
          updatedStream.startedAt = getUtcCurrentDateTime();
          updatedStream.numberOfImpressions = 1;
          if (!updatedStream.timeSpent) {
            updatedStream.timeSpent = 0;
          }

          // 4. local storage
          yield call(checkAndUpdateLocalStorage, updatedStream.ExperienceStreamGUID, updatedStream, userReducer.userGUID, feedReducer.isFetchNewData);

          // 4.1. Update New Structure boolean
          yield call(UpdateIsNewStructureLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 5. sync bookmark data
          yield call(updateBookmarkLocalStorage, updatedStream, true, userReducer.userGUID);
          yield call(updateBookmarkOfflineLocalStorage, updatedStream, userReducer.userGUID);

          // 6. retrieve local storage,
          let formattedResponse = yield call(retrieveDataFromLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 7. Assemble Data 
          formattedResponse.dataType = "NEW_DATA";
          formattedResponse.isFetchNewData = false;
          formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));

          if (formattedResponse.Experience.ExperienceType === "1") {
            formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
            formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = formattedResponse.CurrentLevelExperiencePageGUID;
            formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
          }

          if (formattedResponse) {
            const {
              bookmarks: {
                sections,
                cards,
              },
            } = yield select(selectors.bookmark);

            let fetchUserBookmarksectionsObj;
            if (updateBS) {
              fetchUserBookmarksectionsObj = yield call(
                filterAndfetchBookmarksectionsFromLocalUserObj,
                userReducer.userGUID,
              );
            } else {
              fetchUserBookmarksectionsObj = sections;
            }

            // stop
            nav = yield select(selectors.nav);
            if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
              if (formattedResponse.Experience.ExperienceType === '1') {
                yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true, updateBS, isSamePage));
              } else {
                yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true));
              }
            }

          }

        }
      } else {

        // server synced data
        const updatedStream = Response.ExperienceStream;
        if (updatedStream.RecentlyViewedAt) {
          updatedStream.recentlyViewedAt = updatedStream.RecentlyViewedAt;
        }
        if (updatedStream.DownloadedAt) {
          updatedStream.downloadedAt = updatedStream.DownloadedAt;
        }
        if (updatedStream.BookmarkedAt) {
          updatedStream.bookmarkedAt = updatedStream.BookmarkedAt;
        }
        // report 1
        updatedStream.startedAt = getUtcCurrentDateTime();
        updatedStream.numberOfImpressions = 1;
        if (!updatedStream.timeSpent) {
          updatedStream.timeSpent = 0;
        }
        // update content before accept
        const newStream = Response.UpdatedExperienceStream;
        if (newStream) {
          newStream.startedAt = getUtcCurrentDateTime();
          newStream.numberOfImpressions = 1;
          if (!newStream.timeSpent) {
            newStream.timeSpent = 0;
          }
        }

        // 3.2 check needs of download Data ?
        const checkExistedDownloadedDataRes = yield call(checkExistedDownloadedData, updatedStream.ExperienceStreamGUID, userReducer.userGUID, newStream);
        const downloadData = {
          folderName: 'downloadFeeds',
          streamFolderName: updatedStream.ExperienceStreamGUID,
        };

        if (checkExistedDownloadedDataRes.type === 'NEW_DOWNLOAD') {
          // 1. NEW_DOWNLOAD
          Alert.showToast('Not available content', 5000);
          yield put(actions.postStreamCardContentErrors('Not available content'));
          return;
        } else if (checkExistedDownloadedDataRes.type === 'NEW_UPDATE') {
          // old
          const serverBookmarkSectionArr = Response.BookmarkSections;
          // except the update accept, sync data still working
          yield call(updateTempOldExpStreamFromLocalStorage, updatedStream.ExperienceStreamGUID, updatedStream, userReducer.userGUID);
          const originalStream = yield call(retrieveDataFromLocalStorage, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);

          // stop
          nav = yield select(selectors.nav);
          if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
            yield put(actions.openUpdateUserConsentModal(newStream, downloadData, originalStream, serverBookmarkSectionArr, Response.IsSameDevice));
          }

        } else if (checkExistedDownloadedDataRes.type === 'NO_UPDATE') {

          // =============================================================
          // 3. Bookmark section
          let updateBS = false;
          const serverBookmarkSectionArr = Response.BookmarkSections;
          const serverDeviceBookmarkSectionArr = bookmarkReducer.bookmarks.sections;
          // 3.1 download the new exp
          const syncBookmarkSectionArr = checkSyncStreamToDownload(serverBookmarkSectionArr, serverDeviceBookmarkSectionArr);
          // 3.2 delete local exp
          const syncDeleteBookmarkSectionArr = checkSyncStreamToDelete(updatedStream.ExperienceStreamGUID, serverDeviceBookmarkSectionArr, serverBookmarkSectionArr);

          // 3.3 download
          for (const i in syncBookmarkSectionArr) {
            const item = syncBookmarkSectionArr[i];
            const params = {
              Platform: deviceInfo.systemName.toUpperCase(),
              DeviceID: deviceInfo.deviceId,
              UserExperienceStreamGUID: item.UserExperienceStreamGUID,
            };
            const syncBookmarkSectionDataRes = yield call(syncBookmarkSectionDataApi, params, keycloak, userReducer, deviceInfo);

            if (syncBookmarkSectionDataRes.Confirmation != 'SUCCESS') {
              crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'postStreamExperienceCardInfoV2Saga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
            }
          }
          // // 3.4 delete
          for (const i in syncDeleteBookmarkSectionArr) {
            const item = syncDeleteBookmarkSectionArr[i];
            const params = {
              Platform: deviceInfo.systemName.toUpperCase(),
              DeviceID: deviceInfo.deviceId,
              ExperienceStreamGUID: item.ExperienceStreamGUID,
              Type: 'BOOKMARK_SECTION',
              SectionGUID: item.SectionGUID,
            };
            const deleteSyncBookmarkDataRes = yield call(deleteSyncBookmarkDataApi, params, keycloak, userReducer.userGUID, 'BOOKMARKSECTIONS', item.ExperienceStreamGUID, item.SectionGUID);

            if (deleteSyncBookmarkDataRes.Confirmation != 'SUCCESS') {
              crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'postStreamExperienceCardInfoV2Saga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
            }
          }
          if (syncBookmarkSectionArr.length || syncDeleteBookmarkSectionArr.length) {
            updateBS = true;
          }
          // =============================================================

          const originalStream = yield call(retrieveDataFromLocalStorage, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);
          // re-download folder
          const isRedownload = originalStream.Experience.UpdatedAt != updatedStream.Experience.UpdatedAt;
          if (isRedownload) {

            // stop
            nav = yield select(selectors.nav);
            if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
              yield put(modalActions.openModal('DOWNLOAD'));
              yield call(downloadXiFolder, 'downloadFeeds', userReducer.userGUID, updatedStream.ExperienceStreamGUID, updatedStream.Experience.ExperienceGUID);
              yield put(modalActions.closeModal());
            }
          }

          const isSamePage = updatedStream.CurrentLevelExperiencePageGUID == feedReducer.experienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID;
          if (feedReducer.dataType != "OLD_DATA") {
            if (!Response.IsSameDevice) {
              if (!isSamePage && !isRedownload) {
                // ask stay or update

                // stop
                nav = yield select(selectors.nav);
                if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
                  yield put(actions.openUpdateUserSyncModal(updatedStream, originalStream, updateBS));
                }
                return;
              }
            }
          }

          // 4. local storage
          yield call(checkAndUpdateLocalStorage, updatedStream.ExperienceStreamGUID, updatedStream, userReducer.userGUID, feedReducer.isFetchNewData);

          // 4.1. Update New Structure boolean
          yield call(UpdateIsNewStructureLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 5. sync bookmark data
          yield call(updateBookmarkLocalStorage, updatedStream, true, userReducer.userGUID);
          yield call(updateBookmarkOfflineLocalStorage, updatedStream, userReducer.userGUID);
          // 6. retrieve local storage,
          let formattedResponse = yield call(retrieveDataFromLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 7. Assemble Data 
          formattedResponse.dataType = "NEW_DATA";
          formattedResponse.isFetchNewData = false;
          formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));

          if (formattedResponse.Experience.ExperienceType === "1") {
            formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
            formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = formattedResponse.CurrentLevelExperiencePageGUID;
            formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
          }

          if (formattedResponse) {

            const {
              bookmarks: {
                sections,
                cards,
              },
            } = yield select(selectors.bookmark);
            let fetchUserBookmarksectionsObj;
            if (updateBS) {
              fetchUserBookmarksectionsObj = yield call(
                filterAndfetchBookmarksectionsFromLocalUserObj,
                userReducer.userGUID,
              );
            } else {
              fetchUserBookmarksectionsObj = sections;
            }

            // stop
            nav = yield select(selectors.nav);
            if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
              if (formattedResponse.Experience.ExperienceType === '1') {
                yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true, updateBS, isSamePage && !isRedownload));
              } else {
                yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true));
              }
            }
          }
        }
      }
    } else {
      Alert.showToast('Something went wrong', 5000);
      crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoV2Saga', 'Api', '/user/v2/mobile_view', Message);
      yield put(actions.postStreamCardContentErrors(Message));
    }
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postStreamExperienceCardInfoV2Saga', err.type, err.method, err.message);
  }
}

function* skipThContentUpdateSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const modalReducer = yield select(selectors.modal);
    const bookmarkReducer = yield select(selectors.bookmark);
    const feedReducer = yield select(selectors.feed);
    const nav = yield select(selectors.nav);

    const { stream } = action.payload;

    // =============================================================
    // 3. Bookmark section
    let updateBS = false;
    const serverBookmarkSectionArr = modalReducer.serverBookmarkSectionArr;
    const serverDeviceBookmarkSectionArr = bookmarkReducer.bookmarks.sections;
    // 3.1 download the new exp
    const syncBookmarkSectionArr = checkSyncStreamToDownload(serverBookmarkSectionArr, serverDeviceBookmarkSectionArr);
    // 3.2 delete local exp
    const syncDeleteBookmarkSectionArr = checkSyncStreamToDelete(stream.ExperienceStreamGUID, serverDeviceBookmarkSectionArr, serverBookmarkSectionArr);

    // 3.3 download
    for (const i in syncBookmarkSectionArr) {
      const item = syncBookmarkSectionArr[i];
      const params = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        UserExperienceStreamGUID: item.UserExperienceStreamGUID,
      };
      const syncBookmarkSectionDataRes = yield call(syncBookmarkSectionDataApi, params, keycloak, userReducer, deviceInfo);

      if (syncBookmarkSectionDataRes.Confirmation != 'SUCCESS') {
        crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'skipThContentUpdateSaga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
      }
    }
    // // 3.4 delete
    for (const i in syncDeleteBookmarkSectionArr) {
      const item = syncDeleteBookmarkSectionArr[i];
      const params = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        ExperienceStreamGUID: item.ExperienceStreamGUID,
        Type: 'BOOKMARK_SECTION',
        SectionGUID: item.SectionGUID,
      };
      const deleteSyncBookmarkDataRes = yield call(deleteSyncBookmarkDataApi, params, keycloak, userReducer.userGUID, 'BOOKMARKSECTIONS', item.ExperienceStreamGUID, item.SectionGUID);

      if (deleteSyncBookmarkDataRes.Confirmation != 'SUCCESS') {
        crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'skipThContentUpdateSaga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
      }
    }
    if (syncBookmarkSectionArr.length || syncDeleteBookmarkSectionArr.length) {
      updateBS = true;
    }
    // =============================================================

    const originalStream = yield call(retrieveDataFromLocalStorage, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);
    const isRedownload = originalStream.Experience.UpdatedAt != stream.Experience.UpdatedAt;

    const isSamePage = stream.CurrentLevelExperiencePageGUID == feedReducer.experienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID;
    if (!modalReducer.isSameDevice) {
      if (!isSamePage) {
        // ask stay or update
        yield put(actions.openUpdateUserSyncModal(stream, originalStream, updateBS));
        return;
      }
    }

    // 1. local storage
    yield call(checkAndUpdateLocalStorage, stream.ExperienceStreamGUID, stream, userReducer.userGUID, false);
    // 2. sync bookmark data
    yield call(updateBookmarkLocalStorage, stream, true, userReducer.userGUID);
    yield call(updateBookmarkOfflineLocalStorage, stream, userReducer.userGUID);
    // 3. retrieve local storage
    const formattedResponse = yield call(retrieveDataFromLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);
    // 4. Assemble Data
    if (formattedResponse.isNewStructure) {
      formattedResponse.dataType = "NEW_DATA";
      formattedResponse.isFetchNewData = false;
      formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));
      if (formattedResponse.Experience.ExperienceType === "1") {
        formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
        formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = formattedResponse.CurrentLevelExperiencePageGUID;
        formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
      }
    } else {
      formattedResponse.dataType = "OLD_DATA";
      formattedResponse.isFetchNewData = true;
      formattedResponse.DataArr = [];
    }

    if (formattedResponse) {
      const {
        bookmarks: {
          sections,
          cards,
        },
      } = yield select(selectors.bookmark);
      let fetchUserBookmarksectionsObj;
      if (updateBS) {
        fetchUserBookmarksectionsObj = yield call(
          filterAndfetchBookmarksectionsFromLocalUserObj,
          userReducer.userGUID,
        );
      } else {
        fetchUserBookmarksectionsObj = sections;
      }
      if (formattedResponse.Experience.ExperienceType === '1') {
        yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, nav.currentTab, cards, false, true, updateBS, isSamePage && !isRedownload));
      } else {
        yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, false, true));
      }
    }
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'skipThContentUpdateSaga', err.type, err.method, err.message);
    yield put(actions.postStreamCardContentErrors(err));
  }
}

export const userSyncApi = (params, keycloak) => dxApi('/user/v2/sync_stream', params, true, keycloak);

function* updateUserContentSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const nav = yield select(selectors.nav);
  try {
    const userReducer = yield select(selectors.user);

    const { stream, isUpdate } = action.payload;

    // new structure handle
    if (isUpdate) {
      yield call(UpdateIsNewStructureLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);
    }

    // 1. local storage
    const syncedAt = getCurrentDateTime();
    if (!isUpdate) {
      stream.SyncedAt = syncedAt;
    }
    yield call(checkAndUpdateLocalStorage, stream.ExperienceStreamGUID, stream, userReducer.userGUID, false);
    // 2. sync bookmark data
    yield call(updateBookmarkLocalStorage, stream, true, userReducer.userGUID);
    yield call(updateBookmarkOfflineLocalStorage, stream, userReducer.userGUID);
    // 3. retrieve local storage
    const formattedResponse = yield call(retrieveDataFromLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

    if (formattedResponse.isNewStructure) {
      formattedResponse.dataType = "NEW_DATA";
      formattedResponse.isFetchNewData = false;
      formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));
      if (formattedResponse.Experience.ExperienceType === "1") {
        formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
        formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = formattedResponse.CurrentLevelExperiencePageGUID;
        formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
      }
    } else {
      formattedResponse.dataType = "OLD_DATA";
      formattedResponse.isFetchNewData = true;
      formattedResponse.DataArr = [];
    }

    if (!isUpdate) {

      const keycloak = {
        isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
        deviceId: deviceInfo.deviceId,
        expiryDate: deviceInfo.expiryDate,
        token: deviceInfo.token,
        refreshToken: deviceInfo.refreshToken,
      };

      // Sync Api...
      const formattedUserSyncParams = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        Type: (nav.previousTab == 'Bookmark'
          || nav.previousTab == 'BookmarkCardPage'
          || nav.previousTab == 'PAGES') ? 'BOOKMARK_CARD' : 'DOWNLOAD',
        ExperienceStreamGUID: stream.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: stream.CurrentLevelExperiencePageGUID || "",
          SyncedAt: stream.SyncedAt,
          TimeSpent: stream.timeSpent || "0",
          NumberOfImpressions: stream.numberOfImpressions || "0",
          CompletionArr: stream.CompletionArr,
          AudioCompletionArr: stream.AudioCompletionArr,
        },
      };
      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'completeFeedbackLocalStorageExperienceStreamSaga', 'Api', '/user/v2/sync_stream', Message);
          throw new Error();
        } else {

        }
      }
    }

    if (formattedResponse) {

      const {
        bookmarks: {
          sections,
          cards,
        },
      } = yield select(selectors.bookmark);
      let fetchUserBookmarksectionsObj;
      if (action.payload.updateBS) {
        fetchUserBookmarksectionsObj = yield call(
          filterAndfetchBookmarksectionsFromLocalUserObj,
          userReducer.userGUID,
        );
      } else {
        fetchUserBookmarksectionsObj = sections;
      }

      if (formattedResponse.Experience.ExperienceType === '1') {
        yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, false, true, action.payload.updateBS, false));
      } else {
        yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, false, true));
      }
    }
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'skipThContentUpdateSaga', err.type, err.method, err.message);
    yield put(actions.postStreamCardContentErrors(err));
  }
}

// Add Download
const fetchLocalStorage = (type, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
    })
    .then((ret) => {
      resolve(ret);
    })
    .catch(() => {
      resolve([]);
    });
});

const updateBookmarksLocalStorage = (type, data, userGUID) => new Promise((resolve, reject) => {
  storage
    .save({
      key: `${userGUID}-${type}`,
      data,
    })
    .then((ret) => {
      resolve(ret);
    })
    .catch(() => {
      resolve([]);
    });
});

export const acceptContentApi = (params, keycloak) => dxApi('/user/v2/accept_update_stream', params, true, keycloak);
function* addDownloadSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const {
      stream,
      downloadData: {
        folderName,
        streamFolderName,
      },
      acceptedUpdate,
    } = action.payload;

    const userReducer = yield select(selectors.user);
    const nav = yield select(selectors.nav);

    // 1. Create the folder with name of the ExperienceStreamGUID
    const createFolderRes = yield (createFolder(folderName, userReducer.userGUID, streamFolderName));

    // 2. Check the folder exists
    const checkStreamFolder = yield (isFolderExists(folderName, userReducer.userGUID, streamFolderName));

    if (checkStreamFolder.Confirmation === 'SUCCESS') {
      // 3. Download all the files inside that directory
      yield call(downloadXiFolder, folderName, userReducer.userGUID, streamFolderName, stream.Experience.ExperienceGUID);

      // 4. local storage
      // empty the completion arr
      stream.CompletionArr = [];
      stream.IsFeedbackCompleted = "0";
      
      yield call(checkAndUpdateLocalStorage, stream.ExperienceStreamGUID, stream, userReducer.userGUID, true);

      // 4.1. Update New Structure boolean
      yield call(UpdateIsNewStructureLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

      // 5. sync bookmark data
      yield call(updateBookmarkLocalStorage, stream, true, userReducer.userGUID);
      yield call(updateBookmarkOfflineLocalStorage, action.payload.stream, userReducer.userGUID);

      // 6. retrieve local storage
      let formattedResponse = yield call(retrieveDataFromLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

      // 7. New Stucture then Assemble Data
      formattedResponse.dataType = "NEW_DATA";
      formattedResponse.isFetchNewData = false;
      formattedResponse.DataArr = JSON.parse(JSON.stringify(formattedResponse.Experience.ExperiencePages));

      if (formattedResponse.Experience.ExperienceType === "1") {
        formattedResponse.Experience.ExperiencePages = assembleTree(formattedResponse.Experience.ExperiencePages, formattedResponse.CompletionArr, formattedResponse.AudioCompletionArr);
        formattedResponse.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = null;
        formattedResponse.Experience.ExperiencePages.IsFeedbackCompleted = formattedResponse.IsFeedbackCompleted == '1';
      }

      // Remove Bookmarks sections if user accepts the update
      if (acceptedUpdate) {
        // accept sync server data
        const keycloak = {
          isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
          deviceId: deviceInfo.deviceId,
          expiryDate: deviceInfo.expiryDate,
          token: deviceInfo.token,
          refreshToken: deviceInfo.refreshToken,
        };
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'DOWNLOAD',
          ExperienceStreamGUID: stream.ExperienceStreamGUID,
        };
        const acceptContentRes = yield call(acceptContentApi, params, keycloak);
        const { Confirmation, Response, Message } = acceptContentRes.Data;

        if (Confirmation !== 'SUCCESS') {
          crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'addDownloadSaga', 'Api', '/user/v2/accept_update_stream', Message);
          throw new Error();
        }

        const cardReponse = yield call(fetchLocalStorage, 'BOOKMARKSECTIONS', userReducer.userGUID);

        // Check for bookmark sections from non updated expreience streams
        const updatedBookmarkSections = cardReponse.filter(bookmark => bookmark.ExperienceStreamGUID !== stream.ExperienceStreamGUID);

        // Update the localStorage for bookmark cards
        yield call(updateBookmarksLocalStorage, 'BOOKMARKSECTIONS', updatedBookmarkSections, userReducer.userGUID);
      }

      if (formattedResponse) {
        const {
          bookmarks: {
            sections,
            cards,
          },
        } = yield select(selectors.bookmark);
        if (formattedResponse.Experience.ExperienceType === '1') {
          yield put(actions.postStreamCardAndPageContentSucccess(formattedResponse, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, acceptedUpdate, nav.currentTab, cards, false, acceptedUpdate, false, false));
        } else {
          yield put(actions.postStreamCardOnlyContentSucccess(formattedResponse, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, acceptedUpdate, nav.currentTab, cards, false, acceptedUpdate));
        }
      }
    } else {
      crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'addDownloadSaga', checkStreamFolder.type, checkStreamFolder.method, checkStreamFolder.message);
      yield put(actions.addDownloadErrors({ errorMessage: 'Cannot create folder' }));
    }
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'addDownloadSaga', err.type, err.method, err.message);
    yield put(actions.addDownloadErrors(err));
  }
}

// ============================================================
// 3. Navigate back
const updateLocalStorage = (experienceStreamGUID, response, userGUID) => new Promise((resolve, reject) => {
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
        downloadArr[index] = response;
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
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

                if (!found) {
                  resolve({ Confirmation: 'SUCCESS' });
                  return;
                }

                bookmarkArr[index] = response;
                storage
                  .save({
                    key: `${userGUID}-BOOKMARKCARDS`,
                    data: bookmarkArr,
                  })
                  .then(() => {
                    resolve({ Confirmation: 'SUCCESS' });
                  })
                  .catch((error) => {
                    reject({
                      type: 'Localstorage',
                      method: 'updateLocalStorage',
                      message: error,
                    });
                  });
              })
              .catch((error) => {
                resolve({ Confirmation: 'SUCCESS' });
              });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject({
          type: 'Localstorage',
          method: 'updateLocalStorage',
          message: 'Experience not found',
        });
      }
    })
    .catch((error) => {
      reject({
        type: 'Localstorage',
        message: error,
        method: 'updateLocalStorage',
      });
    });
});
function* updateLocalStorageExperienceStreamSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const nav = yield select(selectors.nav);
    const feed = yield select(selectors.feed);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const tempExperienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;

    // ADD CURRENT TIME ON EXIT
    tempExperienceStreamWithChannelInfo.SyncedAt = getUtcCurrentDateTime();
    // report 1
    tempExperienceStreamWithChannelInfo.endedAt = getUtcCurrentDateTime();
    if (!tempExperienceStreamWithChannelInfo.timeSpent) {
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
    }
    if (!tempExperienceStreamWithChannelInfo.startedAt) {
      tempExperienceStreamWithChannelInfo.startedAt = getUtcCurrentDateTime();
    }
    if (!tempExperienceStreamWithChannelInfo.numberOfImpressions) {
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 1;
    }
    tempExperienceStreamWithChannelInfo.numberOfImpressions += 1;
    tempExperienceStreamWithChannelInfo.timeSpent += moment(tempExperienceStreamWithChannelInfo.endedAt).diff(moment(tempExperienceStreamWithChannelInfo.startedAt), 'seconds');
    tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID = feed.current_level_section.ExperiencePageGUID;


    // Update local storage: completion
    const syncedAt = getCurrentDateTime();
    if (deviceInfo.internetInfo.isConnected) {
      tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
    }

    // * replace the data arr back to stream
    if (feed.dataType == 'NEW_DATA' && !feed.isFetchNewData) {
      if (tempExperienceStreamWithChannelInfo.DataArr && tempExperienceStreamWithChannelInfo.DataArr.length) {
        tempExperienceStreamWithChannelInfo.Experience.ExperiencePages = tempExperienceStreamWithChannelInfo.DataArr;
      }
    }
   
    const response = yield call(updateLocalStorage, action.payload.experienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

    // Sync Api...
    if (deviceInfo.internetInfo.isConnected) {
      const formattedUserSyncParams = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        Type: (nav.previousTab == 'Bookmark'
          || nav.previousTab == 'BookmarkCardPage'
          || nav.previousTab == 'PAGES') ? 'BOOKMARK_CARD' : 'DOWNLOAD',
        ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
          SyncedAt: tempExperienceStreamWithChannelInfo.SyncedAt,
          TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
          NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
          CompletionArr: tempExperienceStreamWithChannelInfo.CompletionArr,
          AudioCompletionArr: tempExperienceStreamWithChannelInfo.AudioCompletionArr,
        }
      };

      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'updateLocalStorageExperienceStreamSaga', 'Api', '/user/v2/sync_stream', Message);
          throw new Error();
        } else {

        }
      }
    }

    yield put(actions.dx_browser_back_success());
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'updateLocalStorageExperienceStreamSaga', err.type, err.method, err.message);
    yield put(actions.dx_browser_back_success());
  }
}


// ============================================================
// 4. Complete experience
function* completeLocalStorageExperienceStreamSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const tempExperienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;
  try {
    const userReducer = yield select(selectors.user);
    const feed = yield select(selectors.feed);

    // ADD CURRENT TIME ON EXIT
    tempExperienceStreamWithChannelInfo.SyncedAt = getUtcCurrentDateTime();
    // report 1
    tempExperienceStreamWithChannelInfo.endedAt = getUtcCurrentDateTime();
    if (!tempExperienceStreamWithChannelInfo.timeSpent) {
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
    }
    if (!tempExperienceStreamWithChannelInfo.startedAt) {
      tempExperienceStreamWithChannelInfo.startedAt = getUtcCurrentDateTime();
    }
    if (!tempExperienceStreamWithChannelInfo.numberOfImpressions) {
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 1;
    }
    tempExperienceStreamWithChannelInfo.numberOfImpressions += 1;
    tempExperienceStreamWithChannelInfo.timeSpent += moment(tempExperienceStreamWithChannelInfo.endedAt).diff(moment(tempExperienceStreamWithChannelInfo.startedAt), 'seconds');

    // * replace the data arr back to stream
    if (feed.dataType == 'NEW_DATA' && !feed.isFetchNewData) {
      if (tempExperienceStreamWithChannelInfo.DataArr && tempExperienceStreamWithChannelInfo.DataArr.length) {
        tempExperienceStreamWithChannelInfo.Experience.ExperiencePages = tempExperienceStreamWithChannelInfo.DataArr;
      }
    }

    // Update local storage: completion
    const response = yield call(updateLocalStorage, action.payload.experienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);
    yield put(actions.dx_feed_back_success(tempExperienceStreamWithChannelInfo));
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'completeLocalStorageExperienceStreamSaga', err.type, err.method, err.message);
    yield put(actions.dx_feed_back_success(tempExperienceStreamWithChannelInfo));
  }
}

// ============================================================
// 5. Complete feedback
function* completeFeedbackLocalStorageExperienceStreamSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const tempExperienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;
  try {
    const userReducer = yield select(selectors.user);
    const nav = yield select(selectors.nav);
    const feed = yield select(selectors.feed);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    // Update local storage: completion
    const synced = getCurrentDateTime();
    if (deviceInfo.internetInfo.isConnected) {
      tempExperienceStreamWithChannelInfo.SyncedAt = synced;
    }

    // * replace the data arr back to stream
    if (feed.dataType == 'NEW_DATA' && !feed.isFetchNewData) {
      if (tempExperienceStreamWithChannelInfo.DataArr && tempExperienceStreamWithChannelInfo.DataArr.length) {
        tempExperienceStreamWithChannelInfo.Experience.ExperiencePages = tempExperienceStreamWithChannelInfo.DataArr;
      }
    }

    // Add IsFeedbackcompleted to stream level
    tempExperienceStreamWithChannelInfo.IsFeedbackCompleted = "1";

    const response = yield call(updateLocalStorage, action.payload.experienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

    if (deviceInfo.internetInfo.isConnected) {
      // Sync Api...
      const formattedUserSyncParams = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        Type: (nav.previousTab == 'Bookmark'
          || nav.previousTab == 'BookmarkCardPage'
          || nav.previousTab == 'PAGES') ? 'BOOKMARK_CARD' : 'DOWNLOAD',
        ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
          SyncedAt: tempExperienceStreamWithChannelInfo.SyncedAt,
          TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
          NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
          CompletionArr: tempExperienceStreamWithChannelInfo.CompletionArr,
          AudioCompletionArr: tempExperienceStreamWithChannelInfo.AudioCompletionArr,
          IsFeedbackCompleted: "1",
        },
      };

      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'completeFeedbackLocalStorageExperienceStreamSaga', 'Api', '/user/v2/sync_stream', Message);
          throw new Error();
        } else {

        }
      }
    }

    yield put(actions.dx_feed_back_complete_success());
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'completeFeedbackLocalStorageExperienceStreamSaga', err.type, err.method, err.message);
    yield put(actions.dx_feed_back_complete_success());
  }
}

// ============================================================
// 6. Archive experience
const freshExperienceCompletion = (data) => {
  if (data.ExperiencePageGUID) {
    // Feedback completion
    if (data.IsRoot) {
      data.IsFeedbackCompleted = false;
    }
    data.IsCompleted = false;
    data.IsRecommended = false;
  } else {
    data.IsCompleted = false;
  }
  if (data.Sections) {
    for (let i = 0; i < data.Sections.length; i++) {
      freshExperienceCompletion(data.Sections[i]);
    }
  } else {

  }
};
function* archiveLocalStorageExperienceStreamSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    // 1. Fresh local storage: completion
    const experienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;
    freshExperienceCompletion(experienceStreamWithChannelInfo.Experience.ExperiencePages);
    // 2. Save new completion
    experienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID = null;
    const response = yield call(updateLocalStorage, action.payload.experienceStreamGUID, experienceStreamWithChannelInfo, userReducer.userGUID);
    if (response.Confirmation === 'SUCCESS') { yield put(actions.dx_archive_success(experienceStreamWithChannelInfo, action.payload.bookmarks)); }
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'archiveLocalStorageExperienceStreamSaga', err.type, err.method, err.message);
    yield put(actions.dx_archive_errors(err));
  }
}

// ============================================================
// 7. Home-browser-back experience
function* updateLocalStorageExperienceStreamWithCurrentLevelSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const nav = yield select(selectors.nav);
    const feed = yield select(selectors.feed);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const tempExperienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;
    // ADD CURRENT TIME ON EXIT
    tempExperienceStreamWithChannelInfo.SyncedAt = getUtcCurrentDateTime();
    // report 1
    tempExperienceStreamWithChannelInfo.endedAt = getUtcCurrentDateTime();
    if (!tempExperienceStreamWithChannelInfo.timeSpent) {
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
    }
    if (!tempExperienceStreamWithChannelInfo.startedAt) {
      tempExperienceStreamWithChannelInfo.startedAt = getUtcCurrentDateTime();
    }
    if (!tempExperienceStreamWithChannelInfo.numberOfImpressions) {
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 1;
    }
    tempExperienceStreamWithChannelInfo.numberOfImpressions += 1;
    tempExperienceStreamWithChannelInfo.timeSpent += moment(tempExperienceStreamWithChannelInfo.endedAt).diff(moment(tempExperienceStreamWithChannelInfo.startedAt), 'seconds');
    tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID = action.payload.currentLevelExperiencePageGUID;

    // Update local storage: completion
    const syncedAt = getCurrentDateTime();
    if (deviceInfo.internetInfo.isConnected) {
      tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
    }

    // * replace the data arr back to stream
    if (feed.dataType == 'NEW_DATA' && !feed.isFetchNewData) {
      if (tempExperienceStreamWithChannelInfo.DataArr && tempExperienceStreamWithChannelInfo.DataArr.length) {
        tempExperienceStreamWithChannelInfo.Experience.ExperiencePages = tempExperienceStreamWithChannelInfo.DataArr;
      }
    }

    const response = yield call(updateLocalStorage, action.payload.experienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

    // Sync Api...
    if (deviceInfo.internetInfo.isConnected) {
      const formattedUserSyncParams = {
        Platform: deviceInfo.systemName.toUpperCase(),
        DeviceID: deviceInfo.deviceId,
        Type: (nav.previousTab == 'Bookmark'
          || nav.previousTab == 'BookmarkCardPage'
          || nav.previousTab == 'PAGES') ? 'BOOKMARK_CARD' : 'DOWNLOAD',
        ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
          SyncedAt: tempExperienceStreamWithChannelInfo.SyncedAt,
          TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
          NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
          CompletionArr: tempExperienceStreamWithChannelInfo.CompletionArr,
          AudioCompletionArr: tempExperienceStreamWithChannelInfo.AudioCompletionArr,
        }
      };

      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'updateLocalStorageExperienceStreamWithCurrentLevelSaga', 'Api', '/user/v2/sync_stream', Message);
          throw new Error();
        } else {

        }
      }
    }

    yield put(actions.dx_home_browser_back_success());
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'updateLocalStorageExperienceStreamWithCurrentLevelSaga', err.type, err.method, err.message);
    yield put(actions.dx_home_browser_back_success());
  }
}

// ============================================================
// 8. Home-back experience
function* homebackSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    yield put(actions.dx_home_back_success(action.payload.bookmarks));
  } catch (err) {
    crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'homebackSaga', err.type, err.method, err.message);
    yield put(actions.dx_home_back_errors(err));
  }
}


const checkSyncStreamToDownload = (userExpStreamArray, userDeviceExpStreamArray) => {
  const resultArray = [];
  userExpStreamArray.forEach((userExpItem) => {
    let found = false;
    userDeviceExpStreamArray.forEach((userDeviceItem) => {
      if (userExpItem.ExperienceStreamGUID === userDeviceItem.ExperienceStreamGUID
        && userExpItem.SectionGUID === userDeviceItem.SectionGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(userExpItem);
    }
  });
  return resultArray;
};

const checkSyncStreamToDelete = (experienceStreamGUID, localUserDeviceExpStreamArray, userExpStreamArray) => {
  const resultArray = [];
  localUserDeviceExpStreamArray = localUserDeviceExpStreamArray.filter(item => item.ExperienceStreamGUID == experienceStreamGUID);
  localUserDeviceExpStreamArray.forEach((loc) => {
    let found = false;
    userExpStreamArray.forEach((ser) => {
      if (loc.ExperienceStreamGUID === ser.ExperienceStreamGUID
        && loc.SectionGUID === ser.SectionGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(loc);
    }
  });
  return resultArray;
};

const syncBookmarkSectionDataApi = async (params, keycloak, userReducer, deviceInfo) => {
  try {
    const response = await dxApi('/user/v2/_sync', params, true, keycloak);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      let audioCompletionArr = Response.UserExperienceStreamData.AudioCompletionArr;
      audioCompletionArr = JSON.parse(audioCompletionArr);
      
      let section = Response.UserExperienceStreamData.Data;
      section = JSON.parse(section);

      if (audioCompletionArr && audioCompletionArr.length) {
        section.CurrentTime = audioCompletionArr[0].CurrentTime;
      }

      return await checkAndUpdateLocalStorageV2(section, 'BOOKMARKSECTIONS', userReducer.userGUID);
    } else {
      return ({
        Confirmation: 'FAIL',
        domain: 'Api',
        type: 'Api',
        method: '/user/v2/_sync',
        message: Message,
      })
    }
  } catch (err) {
    return ({
      Confirmation: 'FAIL',
      domain: 'Api',
      type: err.type,
      method: err.method,
      message: err.message,
    });
  }
};

const checkAndUpdateLocalStorageV2 = (response, type, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
    })
    .then((ret) => {
      let found = false;
      let index;
      for (let i = 0; i < ret.length; i++) {
        if (type == 'BOOKMARKCARDS'
          && ret[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          index = i;
          break;
        } else if (type == 'BOOKMARKSECTIONS'
          && ret[i].SectionGUID == response.SectionGUID
          && ret[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }
      if (found) {
        if (ret[index]) {
          ret[index] = response;
          ret[index].numberOfClicks = ret[index].numberOfClicks ? ret[index].numberOfClicks + 1 : 1;
          ret[index].isDownloaded = true;
        }
        storage
          .save({
            key: `${userGUID}-${type}`,
            data: ret,
          })
          .then(() => {
            resolve({ Confirmation: 'SUCCESS' });
          })
          .catch((error) => {
            reject({
              type: 'Localstorage',
              method: 'checkAndUpdateLocalStorageV2',
              message: error,
            });
          });
      } else {
        // not happen: exception ??
        response.numberOfClicks = 1;
        response.isDownloaded = true;
        ret.push(response);

        storage
          .save({
            key: `${userGUID}-${type}`,
            data: ret,
          })
          .then(() => {
            resolve({ Confirmation: 'SUCCESS' });
          })
          .catch((error) => {
            reject({
              type: 'Localstorage',
              method: 'checkAndUpdateLocalStorageV2',
              message: error,
            });
          });
      }
    })
    .catch((error) => {
      response.numberOfClicks = 1;
      response.isDownloaded = true;
      storage
        .save({
          key: `${userGUID}-${type}`,
          data: [response],
        })
        .then(() => {
          resolve({ Confirmation: 'SUCCESS' });
        })
        .catch((error) => {
          reject({
            type: 'Localstorage',
            method: 'checkAndUpdateLocalStorageV2',
            message: error,
          });
        });
    });
});

const deleteSyncBookmarkDataApi = async (params, keycloak, userGUID, type, experienceStreamGUID, sectionGUID) => {
  try {
    await removeLocalStorage(userGUID, type, experienceStreamGUID, sectionGUID);
    const res = await dxApi('/user/v2/remove_stream', params, true, keycloak);
    const { Confirmation, Message } = res.Data;
    if (Confirmation == 'SUCCESS') {
      return ({ Confirmation: 'SUCCESS' });
    } else {
      return ({
        Confirmation: 'FAIL',
        domain: 'Api',
        type: 'Api',
        method: '/user/v2/remove_stream',
        message: Message,
      });
    }
  } catch (err) {
    return ({
      Confirmation: 'FAIL',
      domain: 'Localstorage',
      type: 'LocalStorage',
      method: 'removeLocalStorage',
      message: err.message,
    });
  }
};

const removeLocalStorage = (userGUID, type, experienceStreamGUID, sectionGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
    })
    .then((ret) => {
      let found = false;
      let index;
      for (let i = 0; i < ret.length; i++) {
        if (type == 'BOOKMARKCARDS'
          && ret[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        } else if (type == 'BOOKMARKSECTIONS'
          && ret[i].SectionGUID == sectionGUID
          && ret[i].ExperienceStreamGUID == experienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }
      if (!found) {
        resolve({ Confirmation: 'SUCCESS' });
        return;
      }
      ret.splice(index, 1);
      storage
        .save({
          key: `${userGUID}-${type}`,
          data: ret,
        })
        .then(async () => {
          resolve({ Confirmation: 'SUCCESS' });
        })
        .catch((error) => {
          reject({
            type: 'Localstorage',
            method: 'deleteLocalStorageData',
            message: error,
          });
        });
    })
    .catch(() => {
      resolve({ Confirmation: 'SUCCESS' });
    });
});

const filterAndfetchBookmarksectionsFromLocalUserObj = async (userGUID) => {
  try {
    const getBookmarkSections = await storage.load({
      key: `${userGUID}-BOOKMARKSECTIONS`,
    });

    return getBookmarkSections;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key: `${userGUID}-BOOKMARKSECTIONS`,
            data: [],
          });

          const getBookmarkSections = await storage.load({
            key: `${userGUID}-BOOKMARKSECTIONS`,
          });

          return getBookmarkSections;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'filterAndfetchBookmarksectionsFromLocalUserObj',
            message: 'Cannot save into localStorage (NotFoundError)',
          });
        }
      case 'ExpiredError':
        try {
          await storage.save({
            key: `${userGUID}-BOOKMARKSECTIONS`,
            data: [],
          });

          const getBookmarkSections = await storage.load({
            key: `${userGUID}-BOOKMARKSECTIONS`,
          });

          return getBookmarkSections;
        } catch (err) {
          throw new Object({
            type: 'filterAndfetchBookmarksectionsFromLocalUserObj',
            method: 'LocalStorage',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
      default:
        break;
    }
    throw new Object({
      type: 'LocalStorage',
      method: 'filterAndfetchBookmarksectionsFromLocalUserObj',
      message: 'Not found error',
    });
  }
};

const assembleOldDataIntoOneDimensionArr = (oldData, formattedOldData) => {
  formattedOldData.push(oldData);
  if (oldData.Sections) {
    for (let i = 0; i < oldData.Sections.length; i++) {
      assembleOldDataIntoOneDimensionArr(oldData.Sections[i], formattedOldData);
    }
  }
};

export default function* FeedsSaga() {
  yield takeLatest(constants.DX_POST_STREAM_EXPRERIENCE_LIST_REQUEST, postStreamExperienceSaga);

  yield takeLatest(constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_REQUEST, postStreamExperienceCardInfoSaga);
  yield takeLatest(constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST, postStreamExperienceCardInfoV2Saga);

  yield takeLatest(constants.DX_BROWSER_BACK, updateLocalStorageExperienceStreamSaga);
  yield takeLatest(constants.DX_FEED_BACK, completeLocalStorageExperienceStreamSaga);
  yield takeLatest(constants.DX_FEED_BACK_COMPLETE, completeFeedbackLocalStorageExperienceStreamSaga);
  yield takeLatest(constants.DX_ARCHIVE, archiveLocalStorageExperienceStreamSaga);
  yield takeLatest(constants.DX_HOME_BROWSER_BACK, updateLocalStorageExperienceStreamWithCurrentLevelSaga);
  yield takeLatest(constants.DX_HOME_BACK, homebackSaga);

  yield takeLatest(constants.DX_ADD_DOWNLOAD_REQUEST, addDownloadSaga);

  yield takeLatest(constants.DX_SKIP_THE_CONTENT_UPDATE_REQUEST, skipThContentUpdateSaga);
  yield takeLatest(constants.DX_UPDATE_USER_THE_CONTENT_REQUEST, updateUserContentSaga);
}