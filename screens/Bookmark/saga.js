import {
  call, put, takeLatest, select,
} from 'redux-saga/effects';

import {
  AsyncStorage,
} from 'react-native';
import Storage from 'react-native-storage';
import actions from './actions';
import constants from './constants';
import feedActions from '../Feed/actions';
import deviceInfoActions from '../../actions/DeviceInfo';

// Helpers
import { getCurrentDateTime } from '../../helpers';

// Utils
import Alert from '../../utils/alert';
import * as selectors from '../../utils/selector';

import {
  createFolder,
  isFolderExists,
  downloadZip,
} from '../../utils/fileSystem';

// Api
import { dxApi } from '../../helpers/apiManager';

// Saga
import modalActions from '../../actions/Modal';

import * as helpers from '../../helpers';

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

// =======================================
// 1. Add
const checkAndUpdateLocalStorage = (type, response, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
    })
    .then((ret) => {
      let found = false;

      for (let i = 0; i < ret.length; i++) {
        if (type == 'BOOKMARKCARDS'
          && ret[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          break;
        } else if (type == 'BOOKMARKSECTIONS'
          && ret[i].SectionGUID == response.SectionGUID
          && ret[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          break;
        }
      }
      if (found) {
        resolve({ Confirmation: 'SUCCESS' });
        return;
      }
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
            method: 'checkAndUpdateLocalStorage',
            message: error,
          });
        });
    })
    .catch((error) => {
      switch (error.name) {
        case 'NotFoundError':
          // Insert storage
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
                method: 'checkAndUpdateLocalStorage',
                message: error,
              });
            });
          break;
        case 'ExpiredError':
          // Replace storage
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
                method: 'checkAndUpdateLocalStorage',
                message: error,
              });
            });
          break;
        default:
          reject({
            type: 'Localstorage',
            method: 'checkAndUpdateLocalStorage',
            message: 'Check local storage error',
          });
      }
    });
});
const updateDownloadLocalStorage = (response, toggle, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-DOWNLOADS`,
    })
    .then((downloadArr) => {
      let found = false;
      let index;
      for (let i = 0; i < downloadArr.length; i++) {
        if (downloadArr[i].ExperienceStreamGUID == response.ExperienceStreamGUID) {
          found = true;
          index = i;
          break;
        }
      }

      if (found) {
        downloadArr[index].isBookmarked = toggle;
        downloadArr[index].bookmarkedAt = toggle ? getCurrentDateTime() : null;
      }
      storage
        .save({
          key: `${userGUID}-DOWNLOADS`,
          data: downloadArr,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          resolve({
            Confirmation: 'FAIL',
            type: 'Localstorage',
            method: 'updateDownloadLocalStorage',
            message: error.message,
          });
        });
    })
    .catch((error) => {
      resolve({
        Confirmation: 'FAIL',
        type: 'Localstorage',
        method: 'updateDownloadLocalStorage',
        message: error.message,
      });
    });
});

export const addBookmarkSyncApi = (params, keycloak) => dxApi('/user/v2/sync_stream_bookmark', params, true, keycloak);
function* addBookmarkSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const feedReducer = yield select(selectors.feed);
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const bookmarkLabel = langLabels ? langLabels.Message : [];
    let addBookmarkLabel;
    bookmarkLabel.map((label) => {
      if (label.Type === 'BOOKMARK_ADD_SUCCESS') {
        addBookmarkLabel = label.Content;
      }
    });

    if (action.payload.type === 'cards') {
      let data = action.payload.stream;
      data.isBookmarked = true;
      data.bookmarkedAt = getCurrentDateTime();
      data.SyncedAt = getCurrentDateTime();

      // 1. DATA SYNC FLOW
      const syncedAt = helpers.getCurrentDateTime();
      // Local storage: Insert into bookmark card array
      if (deviceInfo.internetInfo.isConnected) {
        data.SyncedAt = syncedAt;
      }
      const response = yield call(checkAndUpdateLocalStorage, 'BOOKMARKCARDS', data, userReducer.userGUID);

      if (deviceInfo.internetInfo.isConnected) {
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'BOOKMARK_CARD',
          ExperienceStreamGUID: data.ExperienceStreamGUID,
          SectionGUID: '',
          Data: {
            SyncedAt: syncedAt,
          },
        };
        const userSync = yield call(addBookmarkSyncApi, params, keycloak);
        const { Confirmation, Response, Message } = userSync.Data;
        if (userSync) {
          if (Confirmation == 'SUCCESS') {

          } else {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'addBookmarkSaga', 'Api', '/user/sync_stream_v5', Message);
          }
        }
      }

      // Sync download data
      yield call(updateDownloadLocalStorage, data, true, userReducer.userGUID);
      if (response) {
        yield put(actions.addBookmarkCardsSuccess(data, action.payload.currentTab));
        Alert.showToast(addBookmarkLabel, 1000, 'success');
      }
    } else if (action.payload.type === 'sections') {
      let data = action.payload.section;
      data.isBookmarked = true;
      data.bookmarkedAt = getCurrentDateTime();
      data.SyncedAt = getCurrentDateTime();

      // 1. DATA SYNC FLOW
      const syncedAt = helpers.getCurrentDateTime();
      // Local storage: Insert into bookmark card array
      if (deviceInfo.internetInfo.isConnected) {
        data.SyncedAt = syncedAt;
      }
      const response = yield call(checkAndUpdateLocalStorage, 'BOOKMARKSECTIONS', data, userReducer.userGUID);

      if (deviceInfo.internetInfo.isConnected) {
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'BOOKMARK_SECTION',
          ExperienceStreamGUID: data.ExperienceStreamGUID,
          PageGUID: feedReducer.current_level_section.PageGUID,
          SectionGUID: data.SectionGUID,
          Data: {
            SyncedAt: syncedAt
          },
          AudioCompletionArr: [
            {
              CurrentTime: data.CurrentTime,
            }
          ]
        };
        const userSync = yield call(addBookmarkSyncApi, params, keycloak);
        const { Confirmation, Response, Message } = userSync.Data;
        if (userSync) {
          if (Confirmation == 'SUCCESS') {

          } else {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'addBookmarkSaga', 'Api', '/user/sync_stream_v5', Message);
          }
        }
      }

      if (response) {
        yield put(actions.addBookmarkSectionsSuccess(data));
        Alert.showToast(addBookmarkLabel, 1000, 'success');
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'addBookmarkSaga', err.type, err.method, err.message);
    yield put(actions.addBookmarkErrors(err));
  }
}


// =======================================
// 2. Delete
const removeLocalStorage = (type, response, userGUID) => new Promise((resolve, reject) => {
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
        .then(() => {
          resolve({ Confirmation: 'SUCCESS' });
        })
        .catch((err) => {
          resolve({
            type: 'Localstorage',
            method: 'removeLocalStorage',
            message: err.message,
          });
        });
    })
    .catch((error) => {
      resolve({
        Confirmation: 'SUCCESS',
        type: 'Localstorage',
        method: 'removeLocalStorage',
        message: error.message,
      });
    });
});

export const deleteBookmarkSyncApi = (params, keycloak) => dxApi('/user/v2/remove_stream', params, true, keycloak);
function* deleteBookmarkSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const bookmarkLabel = langLabels ? langLabels.Message : [];
    let deleteBookmarkLabel;
    bookmarkLabel.map((label) => {
      if (label.Type === 'BOOKMARK_DELETE_SUCCESS') {
        deleteBookmarkLabel = label.Content;
      }
    });

    if (action.payload.type === 'cards') {
      // 1. DATA SYNC FLOW
      if (deviceInfo.internetInfo.isConnected) {
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'BOOKMARK_CARD',
          ExperienceStreamGUID: action.payload.stream.ExperienceStreamGUID,
          SectionGUID: '',
        };
        const deleteBookmarkSyncRes = yield call(deleteBookmarkSyncApi, params, keycloak);
        const { Confirmation, Message } = deleteBookmarkSyncRes.Data;
        if (Confirmation !== 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'deleteBookmarkSaga', 'Api', '/user/v2/remove_stream', Message);
        }
      }

      // Local storage: Remove bookmark card array
      const response = yield call(removeLocalStorage, 'BOOKMARKCARDS', action.payload.stream, userReducer.userGUID);
      // Sync download data
      yield call(updateDownloadLocalStorage, action.payload.stream, false, userReducer.userGUID);
      if (response) {
        Alert.showToast(deleteBookmarkLabel, 1000, 'success');
        yield put(actions.deleteBookmarkCardsSuccess(action.payload.stream, action.payload.currentTab));
      }
    } else if (action.payload.type === 'sections') {
      // 1. DATA SYNC FLOW
      if (deviceInfo.internetInfo.isConnected) {
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'BOOKMARK_SECTION',
          ExperienceStreamGUID: action.payload.section.ExperienceStreamGUID,
          SectionGUID: action.payload.section.SectionGUID,
        };
        const deleteBookmarkSyncRes = yield call(deleteBookmarkSyncApi, params, keycloak);
        const { Confirmation, Message } = deleteBookmarkSyncRes.Data;
        if (Confirmation !== 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'deleteBookmarkSaga', 'Api', '/user/v2/remove_stream', Message);
        }
      }

      // Local storage: Remove bookmark card array
      const response = yield call(removeLocalStorage, 'BOOKMARKSECTIONS', action.payload.section, userReducer.userGUID);
      if (response) {
        Alert.showToast(deleteBookmarkLabel, 1000, 'success');
        yield put(actions.deleteBookmarkSectionsSuccess(action.payload.section));
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'deleteBookmarkSaga', err.type, err.method, err.message);
    yield put(actions.deleteBookmarkErrors(err));
  }
}

// =======================================
// 3. Fetch
function compare(a, b) {
  if (new Date(a.bookmarkedAt) < new Date(b.bookmarkedAt)) {
    return 1;
  }
  if (a.bookmarkedAt > b.bookmarkedAt) {
    return -1;
  }
  return 0;
}

function* getBookmarksCardsSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const bookmarkReducer = yield select(selectors.bookmark);

    let response = bookmarkReducer.bookmarks.cards;

    // Combine sections and cards for recent bookmarks
    if (action.payload.data.currentTab === 'BookmarkCardPage') {
      response = [...bookmarkReducer.bookmarks.cards, ...bookmarkReducer.bookmarks.sections];
    } else if (action.payload.data.currentTab === 'COVER') {
      // Filter the card only
      response = response.filter(item => item.Experience.ExperienceType === '0');
    } else if (action.payload.data.currentTab === 'PAGES') {
      // Filter the card and pages
      response = response.filter(item => item.Experience.ExperienceType === '1');
    }

    if (response) {
      let formattedResponse;
      if (action.payload.data.searchValue) {
        if (action.payload.data.searchValue.toUpperCase() == 'IMAGE') {
          formattedResponse = response.filter(item => item.Type == 'IMAGE' && !item.Experience);
        } else if (action.payload.data.searchValue.toUpperCase() == 'HTML') {
          formattedResponse = response.filter(item => (item.Type == 'EDITOR' || item.Type == 'ACCORDION') && !item.Experience);
        } else if (action.payload.data.searchValue.toUpperCase() == 'PDF') {
          formattedResponse = response.filter(item => item.Type == 'EMBED_PDF' && !item.Experience);
        } else if (action.payload.data.searchValue.toUpperCase() == 'VIDEO') {
          formattedResponse = response.filter(item => item.Type == 'VIDEO' && !item.Experience);
        } else if (action.payload.data.searchValue.toUpperCase() == 'LINK') {
          formattedResponse = response.filter(item => item.Type == 'LINK' && !item.Experience);
        } else if (action.payload.data.searchValue.toUpperCase() == 'AUDIO') {
          formattedResponse = response.filter(item => item.Type == 'AUDIO' && !item.Experience);
        } else {
          formattedResponse = response.filter(item => item.Experience && (item.Experience.ExperienceTitle.toLowerCase().includes(action.payload.data.searchValue.toLowerCase())
            || item.ChannelName.toLowerCase().includes(action.payload.data.searchValue.toLowerCase())));
        }
      } else {
        formattedResponse = response.sort(compare);
      }

      formattedResponse = formattedResponse.slice(action.payload.data.Offset).slice(0, action.payload.data.Limit);

      yield put(actions.getBookmarkCardsSuccess(formattedResponse, action.payload.data));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getBookmarksCardsSaga', err.type, err.method, err.message);
    yield put(actions.getBookmarkCardsErrors(err));
  }
}

function* getBookmarksSectionsSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const bookmarkReducer = yield select(selectors.bookmark);

    let response;

    if (action.payload.data.currentTab === 'PDF') {
      response = bookmarkReducer.pdfArray;
    } else if (action.payload.data.currentTab === 'IMAGES') {
      response = bookmarkReducer.imageArray;
    } else if (action.payload.data.currentTab === 'TEXT') {
      response = bookmarkReducer.editorArray;
    } else if (action.payload.data.currentTab === 'VIDEOS') {
      response = bookmarkReducer.videoArray;
    } else if (action.payload.data.currentTab === 'LINKS') {
      response = bookmarkReducer.linkArray;
    } else if (action.payload.data.currentTab === 'H5P') {
      response = bookmarkReducer.h5pArray;
    } else if (action.payload.data.currentTab === 'AUDIO') {
      response = bookmarkReducer.audioArray;
    }

    response = response.sort(compare);

    if (response) {
      formattedResponse = response.slice(action.payload.data.Offset).slice(0, action.payload.data.Limit);

      yield put(actions.getBookmarkSectionsSuccess(formattedResponse, action.payload.data));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getBookmarksSectionsSaga', err.type, err.method, err.message);
    yield put(actions.getBookmarkSectionsErrors(err));
  }
}

// ============================================================

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

const updateLocalStorage = (type, data, userGUID) => new Promise((resolve, reject) => {
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

// 4. Add download
const downloadXiFolder = (folderName, userGUID, streamFolderName, experienceGUID) => new Promise((resolve, reject) => {
  downloadZip(folderName, userGUID, streamFolderName, experienceGUID)
    .then((response) => {
      resolve(response);
    })
    .catch((error) => {
      reject({
        type: 'Download',
        method: 'downloadXiFolder',
        message: error.message,
      });
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
      // content update, empty the completion arr
      stream.CompletionArr = [];
      stream.IsFeedbackCompleted = "0";
      
      // 4. local storage
      yield call(checkAndUpdateLocalStorageV2, stream, 'BOOKMARKCARDS', userReducer.userGUID);
      // 5. retrieve local storage
      const response = yield call(retrieveDataFromLocalStorageV2, stream.ExperienceStreamGUID, 'BOOKMARKCARDS', stream, userReducer.userGUID, true);
      // 5.1. Update New Structure boolean
      yield call(UpdateIsNewStructureLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);
      // 6. New Stucture then Assemble Data
      response.dataType = "NEW_DATA";
      response.isFetchNewData = false;
      response.DataArr = JSON.parse(JSON.stringify(response.Experience.ExperiencePages));

      if (response.Experience.ExperienceType === "1") {
        response.Experience.ExperiencePages = helpers.assembleTree(response.Experience.ExperiencePages, response.CompletionArr, response.AudioCompletionArr);
        response.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = null;
        response.Experience.ExperiencePages.IsFeedbackCompleted = response.IsFeedbackCompleted == '1';
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
          Type: 'BOOKMARK_CARD',
          ExperienceStreamGUID: stream.ExperienceStreamGUID,
        };
        const acceptContentRes = yield call(acceptContentApi, params, keycloak);
        const { Confirmation, Message } = acceptContentRes.Data;
        if (Confirmation !== 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Download', 'addDownloadSaga', 'Download', '/user/accept_update_stream_v2', Message);
        }

        const cardReponse = yield call(fetchLocalStorage, 'BOOKMARKSECTIONS', userReducer.userGUID);

        // Check for bookmark sections from non updated expreience streams
        const updatedBookmarkSections = cardReponse.filter(bookmark => bookmark.ExperienceStreamGUID !== stream.ExperienceStreamGUID);

        // Update the localStorage for bookmark cards
        yield call(updateLocalStorage, 'BOOKMARKSECTIONS', updatedBookmarkSections, userReducer.userGUID);
      }

      if (response) {
        const {
          bookmarks: {
            sections,
            cards,
          },
        } = yield select(selectors.bookmark);
        if (action.payload.stream.Experience.ExperienceType === '1') {
          yield put(actions.postStreamCardAndPageContentSucccess(response, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, acceptedUpdate, nav.currentTab, cards, false, acceptedUpdate, false, false));
        } else {
          yield put(actions.postStreamCardOnlyContentSucccess(response, sections, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, acceptedUpdate, nav.currentTab, cards, false, acceptedUpdate));
        }
      }
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Download', 'addDownloadSaga', checkStreamFolder.type, checkStreamFolder.method, checkStreamFolder.message);
      yield put(actions.addDownloadErrors({ errorMessage: 'Cannot create folder' }));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Download', 'addDownloadSaga', err.type, err.method, err.message);
    yield put(actions.addDownloadErrors(err));
  }
}

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

const checkAndUpdateOfflineLocalStorageV2 = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-BOOKMARKCARDS`,
    })
    .then((ret) => {
      const result = ret.filter(item => item.ExperienceStreamGUID == experienceStreamGUID);
      if (result) {
        storage
          .load({
            key: `${userGUID}-DOWNLOADS`,
          })
          .then((downloadArr) => {
            // 1. Update number of clicks in download
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
            stream.numberOfClicks = stream.numberOfClicks ? stream.numberOfClicks + 1 : 1;
            downloadArr[index] = stream;

            // 2. Update number of clicks in bookmark card
            found = false;
            index = null;
            for (let i = 0; i < ret.length; i++) {
              if (ret[i].ExperienceStreamGUID == experienceStreamGUID) {
                found = true;
                index = i;
                break;
              }
            }
            if (!found) {
              resolve();
              return;
            }
            const bStream = ret[index];
            bStream.numberOfClicks = bStream.numberOfClicks ? bStream.numberOfClicks + 1 : 1;
            ret[index] = bStream;

            // Replace storage
            storage
              .save({
                key: `${userGUID}-DOWNLOADS`,
                data: downloadArr,
              })
              .then(() => {
                storage
                  .save({
                    key: `${userGUID}-BOOKMARKCARDS`,
                    data: ret,
                  })
                  .then(() => {
                    resolve({ Confirmation: 'SUCCESS' });
                  })
                  .catch((error) => {
                    reject({
                      type: 'Localstorage',
                      method: 'checkAndUpdateOfflineLocalStorageV2',
                      message: error.message,
                    });
                  });
              })
              .catch((error) => {
                reject({
                  type: 'Localstorage',
                  method: 'checkAndUpdateOfflineLocalStorageV2',
                  message: error.message,
                });
              });
          })
          .catch((error) => {
            resolve({
              type: 'Localstorage',
              method: 'checkAndUpdateOfflineLocalStorageV2',
              message: error.message,
            });
          });
      } else {
        resolve();
      }
    })
    .catch((error) => {
      resolve({
        type: 'Localstorage',
        method: 'checkAndUpdateOfflineLocalStorageV2',
        message: error.message,
      });
    });
});

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
          ret[index].downloadedAt = getCurrentDateTime();
          ret[index].recentlyViewedAt = getCurrentDateTime();
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
              message: error.message,
            });
          });
      } else {
        // not happen: exception ??
        response.numberOfClicks = 1;
        response.isDownloaded = true;
        response.downloadedAt = getCurrentDateTime();
        response.recentlyViewedAt = getCurrentDateTime();
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
              message: error.message,
            });
          });
      }
    })
    .catch((error) => {
      response.numberOfClicks = 1;
      response.isDownloaded = true;
      response.downloadedAt = getCurrentDateTime();
      response.recentlyViewedAt = getCurrentDateTime();
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
            message: error.message,
          });
        });
    });
});

const retrieveDataFromLocalStorageV2 = (experienceStreamGUID, type, response, userGUID, replaceContent) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
    })
    .then((ret) => {
      const result = ret.filter(item => item.ExperienceStreamGUID == experienceStreamGUID);
      if (result) {
        // Sync download data
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
              const ret = downloadArr[index];
              // use from download to view
              if (ret.Experience.UpdatedAt == response.Experience.UpdatedAt) {
                response.isDownloaded = true;
                response.downloadedAt = ret.downloadedAt;
                response.recentlyViewedAt = getCurrentDateTime();
                response.numberOfClicks = ret.numberOfClicks ? ret.numberOfClicks + 1 : 1;
              } else {
                response.isDownloaded = true;
                response.downloadedAt = getCurrentDateTime();
                response.recentlyViewedAt = getCurrentDateTime();
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
                  resolve(response);
                })
                .catch((error) => {
                  reject({
                    type: 'Localstorage',
                    method: 'retrieveDataFromLocalStorageV2',
                    message: error.message,
                  });
                });
            } else {
              response.isNewStructure = true;
              response.isDownloaded = true;
              response.downloadedAt = getCurrentDateTime();
              response.recentlyViewedAt = getCurrentDateTime();
              response.numberOfClicks = 1;
              downloadArr.push(response);
              storage
                .save({
                  key: `${userGUID}-DOWNLOADS`,
                  data: downloadArr,
                })
                .then(() => {
                  resolve(response);
                })
                .catch((error) => {
                  reject({
                    type: 'Localstorage',
                    method: 'retrieveDataFromLocalStorageV2',
                    message: error,
                  });
                });
            }
          })
          .catch((error) => {
            response.isDownloaded = true;
            response.downloadedAt = getCurrentDateTime();
            response.recentlyViewedAt = getCurrentDateTime();
            response.numberOfClicks = 1;
            storage
              .save({
                key: `${userGUID}-DOWNLOADS`,
                data: [response],
              })
              .then(() => {
                resolve(response);
              })
              .catch((error) => {
                reject({
                  type: 'Localstorage',
                  method: 'retrieveDataFromLocalStorageV2',
                  message: error,
                });
              });
          });
      } else {
        reject({
          type: 'Localstorage',
          method: 'retrieveDataFromLocalStorageV2',
          message: 'retrieve local storage error',
        });
      }
    })
    .catch((error) => {
      reject({
        type: 'Localstorage',
        method: 'retrieveDataFromLocalStorageV2',
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
        return;
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

// Api call for mobile view
export const postStreamExperienceCardInfoApi = (params, keycloak) => dxApi('/user/v2/mobile_view', params, true, keycloak);

export const checkDataSyncedApi = (params, keycloak) => dxApi('/user/mobile_check_sync', params, true, keycloak);

export const userSyncApi = (params, keycloak) => dxApi('/user/v2/sync_stream', params, true, keycloak);

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
            resolve({
              type: 'Localstorage',
              method: 'updateTempOldExpStreamFromLocalStorage',
              message: error.message,
            });
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

function* postStreamExperienceCardInfoSaga(action) {


  // case 1: get in with old data
  // case 2: download new content


  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const { stream } = action.payload;
    const userReducer = yield select(selectors.user);

    // 1.1 Check if the Exp in the localStorage
    const getExistedDownloaded = yield call(getExistedDownloadedFiles, action.payload.stream.ExperienceStreamGUID, userReducer.userGUID);

    console.log('getExistedDownloaded 2: ', getExistedDownloaded);

    if (getExistedDownloaded.Confirmation === 'SUCCESS') {

      yield call(checkAndUpdateOfflineLocalStorageV2, stream.ExperienceStreamGUID, userReducer.userGUID);
      // 1. retrieve local storage
      let response = yield call(retrieveDataFromLocalStorage, stream.ExperienceStreamGUID, userReducer.userGUID);

      // 2. Assemble Data Here
      if (response.isNewStructure) {
        response.dataType = "NEW_DATA";
        response.isFetchNewData = false;
        response.DataArr = JSON.parse(JSON.stringify(response.Experience.ExperiencePages));

        if (response.Experience.ExperienceType === "1") {
          response.Experience.ExperiencePages = helpers.assembleTree(response.Experience.ExperiencePages, response.CompletionArr, response.AudioCompletionArr);
          response.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = response.CurrentLevelExperiencePageGUID;
          response.Experience.ExperiencePages.IsFeedbackCompleted = response.IsFeedbackCompleted == '1';
        }
      } else {
        response.dataType = "OLD_DATA";
        response.isFetchNewData = true;
        response.DataArr = [];
      }

      if (response) {
        // report 1
        response.startedAt = getCurrentDateTime();
        if (!response.timeSpent) {
          response.timeSpent = 0;
        }
        if (!response.numberOfImpressions) {
          response.numberOfImpressions = 1;
        } else {
          response.numberOfImpressions += 1;
        }

        const {
          bookmarks: {
            sections,
            cards,
          },
        } = yield select(selectors.bookmark);
        if (response.Experience.ExperienceType === '1') {
          // Card Pages
          if (response.Experience.ExperiencePages) {
            yield put(actions.postStreamCardAndPageContentSucccess(response, sections, response.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, true, false, false, false));
          } else {
            yield put(actions.postStreamCardContentErrors({ Message: 'postStreamCardContentErrors' }));
          }
        } else { // Card only
          yield put(actions.postStreamCardOnlyContentSucccess(response, sections, response.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, action.payload.currentTab, cards, true, false));
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
        Type: 'BOOKMARK_CARD',
        Data: {}
      };
      const response = yield call(postStreamExperienceCardInfoApi, formattedMobileViewParams, keycloak);
      const { Response, Confirmation, Message } = response.Data;

      if (Confirmation === 'SUCCESS') {

        // 3.1 If token refresh update the local storage
        if (response.isTokenRefreshed) {
          yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
          yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
        }

        if (Response.Type == 'DELETE') {
          Alert.showToast('Not available content', 5000);
          yield put(actions.postStreamCardContentErrors('Not available content'));
          return;
        } else {

          // server synced data
          const updatedStream = Response.ExperienceStream;
          // 3.2 check needs of download Data ?
          const downloadData = {
            folderName: 'downloadFeeds',
            streamFolderName: updatedStream.ExperienceStreamGUID,
          };
          // report 1
          updatedStream.startedAt = getCurrentDateTime();
          updatedStream.numberOfImpressions = 1;
          if (!updatedStream.timeSpent) {
            updatedStream.timeSpent = 0;
          }
          // 4. download new structure
          yield put(actions.addDownloadRequest(updatedStream, downloadData));
        }
      } else {
        Alert.showToast('Something went wrong', 5000);
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoSaga', 'Api', '/user/v2/mobile_view', Message);
        yield put(actions.postStreamCardContentErrors(Message));
      }
    }
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postStreamExperienceCardInfoSaga', err.type, err.method, err.message);
    yield put(actions.postStreamCardContentErrors(err));
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
        Type: 'BOOKMARK_CARD',
        SyncedAt: getExistedDownloaded.Response[0].SyncedAt,
      };

      const checkDataSynced = yield call(checkDataSyncedApi, formattedCheckApiParams, keycloak);
      const { Confirmation, Response, Message } = checkDataSynced.Data;

      if (Confirmation === 'SUCCESS') {

        if (Response.IsNeedSynced) {

          const syncedAt = helpers.getCurrentDateTime();
          getExistedDownloaded.Response[0].SyncedAt = syncedAt;

          // 1.3 Api call to User Sync
          const formattedUserSyncParams = {
            Platform: deviceInfo.systemName.toUpperCase(),
            DeviceID: deviceInfo.deviceId,
            Type: 'BOOKMARK_CARD',
            ExperienceStreamGUID: getExistedDownloaded.Response[0].ExperienceStreamGUID,
            SectionGUID: '',
            Data: {
              CurrentLevelExperiencePageGUID: getExistedDownloaded.Response[0].CurrentLevelExperiencePageGUID || "",
              SyncedAt: getExistedDownloaded.Response[0].SyncedAt,
              TimeSpent: getExistedDownloaded.Response[0].timeSpent || "0",
              NumberOfImpressions: getExistedDownloaded.Response[0].numberOfImpressions || "0",
              CompletionArr: getExistedDownloaded.Response[0].CompletionArr,
              AudioCompletionArr: getExistedDownloaded.Response[0].AudioCompletionArr,
              IsTrainingCompleted: getExistedDownloaded.Response[0].IsTrainingCompleted,
            }
          }
          const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
          if (userSync.Data.Confirmation !== 'SUCCESS') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoSaga', 'Api', '/user/v2/sync_stream', userSync.Data.Message);
          }
        }
      } else {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoSaga', 'Api', '/user/mobile_check_sync', Message);
      }
    }

    // 2. mobile view
    const formattedMobileViewParams = {
      IsRequiredPages: feedReducer.isFetchNewData ? "1" : "0",
      Platform: deviceInfo.systemName.toUpperCase(),
      DeviceID: deviceInfo.deviceId,
      ExperienceStreamGUID: action.payload.stream.ExperienceStreamGUID,
      Type: 'BOOKMARK_CARD',
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
              helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'postStreamExperienceCardInfoV2Saga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
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
              helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'postStreamExperienceCardInfoV2Saga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
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
                const originalStream = yield call(retrieveDataFromLocalStorageV3, action.payload.stream.ExperienceStreamGUID, 'DOWNLOADS', userReducer.userGUID);
                // ask stay or update

                // stop
                nav = yield select(selectors.nav);
                if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
                  yield put(feedActions.openUpdateUserSyncModal(updatedStream, originalStream, updateBS));
                }

                return;
              }
            }
          }

          // report 1
          updatedStream.startedAt = getCurrentDateTime();
          updatedStream.numberOfImpressions = 1;
          if (!updatedStream.timeSpent) {
            updatedStream.timeSpent = 0;
          }

          // 4. local storage
          yield call(checkAndUpdateLocalStorageV2, updatedStream, 'BOOKMARKCARDS', userReducer.userGUID);

          // 5. retrieve local storage
          let res = yield call(retrieveDataFromLocalStorageV2, updatedStream.ExperienceStreamGUID, 'BOOKMARKCARDS', updatedStream, userReducer.userGUID, feedReducer.isFetchNewData);

          // 5.1. Update New Structure boolean
          yield call(UpdateIsNewStructureLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 6. Assemble Data 
          res.dataType = "NEW_DATA";
          res.isFetchNewData = false;
          res.DataArr = JSON.parse(JSON.stringify(res.Experience.ExperiencePages));

          if (res.Experience.ExperienceType === "1") {
            res.Experience.ExperiencePages = helpers.assembleTree(res.Experience.ExperiencePages, res.CompletionArr, res.AudioCompletionArr);
            res.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = res.CurrentLevelExperiencePageGUID;
            res.Experience.ExperiencePages.IsFeedbackCompleted = res.IsFeedbackCompleted == '1';
          }

          if (res) {
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
              if (action.payload.stream.Experience.ExperienceType === '1') {
                yield put(actions.postStreamCardAndPageContentSucccess(res, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true, updateBS, isSamePage));
              } else {
                yield put(actions.postStreamCardOnlyContentSucccess(res, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true));
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
        updatedStream.startedAt = getCurrentDateTime();
        updatedStream.numberOfImpressions = 1;
        if (!updatedStream.timeSpent) {
          updatedStream.timeSpent = 0;
        }
        // update content before accept
        const newStream = Response.UpdatedExperienceStream;
        if (newStream) {
          newStream.startedAt = getCurrentDateTime();
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
          const originalStream = yield call(retrieveDataFromLocalStorageV3, action.payload.stream.ExperienceStreamGUID, 'DOWNLOADS', userReducer.userGUID);

          // stop
          nav = yield select(selectors.nav);
          if (nav.currentTab == 'Section' || nav.currentTab == 'Video') {
            yield put(feedActions.openUpdateUserConsentModal(newStream, downloadData, originalStream, serverBookmarkSectionArr, Response.IsSameDevice));
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
              helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'postStreamExperienceCardInfoV2Saga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
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
              helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'postStreamExperienceCardInfoV2Saga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
            }
          }
          if (syncBookmarkSectionArr.length || syncDeleteBookmarkSectionArr.length) {
            updateBS = true;
          }
          // =============================================================

          const originalStream = yield call(retrieveDataFromLocalStorageV3, action.payload.stream.ExperienceStreamGUID, 'DOWNLOADS', userReducer.userGUID);
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
                  yield put(feedActions.openUpdateUserSyncModal(updatedStream, originalStream, updateBS));
                }

                return;
              }
            }
          }

          // 4. local storage
          yield call(checkAndUpdateLocalStorageV2, updatedStream, 'BOOKMARKCARDS', userReducer.userGUID);

          // 6. retrieve local storage,
          let res = yield call(retrieveDataFromLocalStorageV2, updatedStream.ExperienceStreamGUID, 'BOOKMARKCARDS', updatedStream, userReducer.userGUID, feedReducer.isFetchNewData);

          // 6.1. Update New Structure boolean
          yield call(UpdateIsNewStructureLocalStorage, updatedStream.ExperienceStreamGUID, userReducer.userGUID);

          // 7. Assemble Data 
          res.dataType = "NEW_DATA";
          res.isFetchNewData = false;
          res.DataArr = JSON.parse(JSON.stringify(res.Experience.ExperiencePages));

          if (res.Experience.ExperienceType === "1") {
            res.Experience.ExperiencePages = helpers.assembleTree(res.Experience.ExperiencePages, res.CompletionArr, res.AudioCompletionArr);
            res.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = res.CurrentLevelExperiencePageGUID;
            res.Experience.ExperiencePages.IsFeedbackCompleted = res.IsFeedbackCompleted == '1';
          }

          if (res) {
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
              if (action.payload.stream.Experience.ExperienceType === '1') {
                yield put(actions.postStreamCardAndPageContentSucccess(res, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true, updateBS, isSamePage && !isRedownload));
              } else {
                yield put(actions.postStreamCardOnlyContentSucccess(res, fetchUserBookmarksectionsObj, updatedStream.Experience.ExperienceCard, updatedStream.ExperienceStreamGUID, false, action.payload.currentTab, cards, false, true));
              }
            }
          }
        }
      }
    } else {
      Alert.showToast('Something went wrong', 5000);
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postStreamExperienceCardInfoV2Saga', 'Api', '/user/v2/mobile_view', Message);
      yield put(actions.postStreamCardContentErrors(Message));
    }
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postStreamExperienceCardInfoV2Saga', err.type, err.method, err.message);
  }
}


function* bookmarkSkipThContentUpdateSaga(action) {
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
        helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'postStreamExperienceCardInfoV2Saga', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
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
        helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'postStreamExperienceCardInfoV2Saga', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
      }
    }
    if (syncBookmarkSectionArr.length || syncDeleteBookmarkSectionArr.length) {
      updateBS = true;
    }
    // =============================================================

    const originalStream = yield call(retrieveDataFromLocalStorageV3, action.payload.stream.ExperienceStreamGUID, 'DOWNLOADS', userReducer.userGUID);
    const isRedownload = originalStream.Experience.UpdatedAt != stream.Experience.UpdatedAt;

    const isSamePage = stream.CurrentLevelExperiencePageGUID == feedReducer.experienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID;
    if (!modalReducer.isSameDevice) {
      if (!isSamePage) {
        // ask stay or update
        yield put(feedActions.openUpdateUserSyncModal(stream, originalStream, updateBS));
        return;
      }
    }

    // 1. local storage
    yield call(checkAndUpdateLocalStorageV2, stream, 'BOOKMARKCARDS', userReducer.userGUID);
    // 2. retrieve local storage
    const res = yield call(retrieveDataFromLocalStorageV2, stream.ExperienceStreamGUID, 'BOOKMARKCARDS', stream, userReducer.userGUID, false);
    // 3. Assemble Data Here
    if (res.isNewStructure) {
      res.dataType = "NEW_DATA";
      res.isFetchNewData = false;
      res.DataArr = JSON.parse(JSON.stringify(res.Experience.ExperiencePages));

      if (res.Experience.ExperienceType === "1") {
        res.Experience.ExperiencePages = helpers.assembleTree(res.Experience.ExperiencePages, res.CompletionArr, res.AudioCompletionArr);
        res.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = res.CurrentLevelExperiencePageGUID;
        res.Experience.ExperiencePages.IsFeedbackCompleted = res.IsFeedbackCompleted == '1';
      }
    } else {
      res.dataType = "OLD_DATA";
      res.isFetchNewData = true;
      res.DataArr = [];
    }

    if (res) {
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

      if (action.payload.stream.Experience.ExperienceType === '1') {
        yield put(actions.postStreamCardAndPageContentSucccess(res, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, nav.currentTab, cards, false, true, updateBS, isSamePage && !isRedownload));
      } else {
        yield put(actions.postStreamCardOnlyContentSucccess(res, fetchUserBookmarksectionsObj, stream.Experience.ExperienceCard, stream.ExperienceStreamGUID, null, null, cards, false, true));
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'bookmarkSkipThContentUpdateSaga', err.type, err.method, err.message);
    yield put(actions.postStreamCardContentErrors(err));
  }
}


// Helper func


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
    const response = await dxApi('/user/v2/sync_stream_bookmark_sync', params, true, keycloak);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      let audioCompletionArr = Response.UserExperienceStreamData.AudioCompletionArr;
      audioCompletionArr = JSON.parse(audioCompletionArr);
      
      let section = Response.UserExperienceStreamData.Data;
      section = JSON.parse(section);

      if (audioCompletionArr && audioCompletionArr.length) {
        section.CurrentTime = audioCompletionArr[0].CurrentTime;
      }

      return await checkAndUpdateLocalStorageV3(section, 'BOOKMARKSECTIONS', userReducer.userGUID);
    } else {
      return ({
        Confirmation: 'FAIL',
        domain: 'Api',
        type: 'Api',
        method: '/user/v2/sync_stream_bookmark_sync',
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

const checkAndUpdateLocalStorageV3 = (response, type, userGUID) => new Promise((resolve, reject) => {
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
              method: 'checkAndUpdateLocalStorageV3',
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
              method: 'checkAndUpdateLocalStorageV3',
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
            method: 'checkAndUpdateLocalStorageV3',
            message: error,
          });
        });
    });
});

const deleteSyncBookmarkDataApi = async (params, keycloak, userGUID, type, experienceStreamGUID, sectionGUID) => {
  try {
    await removeLocalStorageV2(userGUID, type, experienceStreamGUID, sectionGUID);
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
      method: 'removeLocalStorageV2',
      message: err.message,
    });
  }
};

const removeLocalStorageV2 = (userGUID, type, experienceStreamGUID, sectionGUID) => new Promise((resolve, reject) => {
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


const retrieveDataFromLocalStorageV3 = (experienceStreamGUID, type, userGUID) => new Promise((resolve, reject) => {
  storage
    .load({
      key: `${userGUID}-${type}`,
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
        method: 'retrieveDataFromLocalStorageV3',
        message: error.message,
      });
    });
});

const assembleOldDataIntoOneDimensionArr = (oldData, formattedOldData) => {
  formattedOldData.push(oldData);
  if (oldData.Sections) {
    for (let i = 0; i < oldData.Sections.length; i++) {
      assembleOldDataIntoOneDimensionArr(oldData.Sections[i], formattedOldData);
    }
  }
};

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

export default function* BookmarkSaga() {
  yield takeLatest(constants.DX_ADD_BOOKMARK_REQUEST, addBookmarkSaga);
  yield takeLatest(constants.DX_DELETE_BOOKMARK_REQUEST, deleteBookmarkSaga);

  yield takeLatest(constants.DX_BOOKMARK_ADD_DOWNLOAD_REQUEST, addDownloadSaga);

  yield takeLatest(constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_REQUEST, postStreamExperienceCardInfoSaga);
  yield takeLatest(constants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST, postStreamExperienceCardInfoV2Saga);


  yield takeLatest(constants.DX_BOOKMARK_SKIP_THE_CONTENT_UPDATE_REQUEST, bookmarkSkipThContentUpdateSaga);

  yield takeLatest(constants.DX_GET_BOOKMARKS_CARDS_REQUEST, getBookmarksCardsSaga);
  yield takeLatest(constants.DX_GET_BOOKMARKS_SECTION_REQUEST, getBookmarksSectionsSaga);
}