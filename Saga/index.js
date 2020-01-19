/* eslint no-use-before-define: 0 */
import {
  call, put, takeLatest, select, all,
} from 'redux-saga/effects';

import {
  AsyncStorage,
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";

// Library
import Storage from 'react-native-storage';
import { authorize } from 'react-native-app-auth';
import moment from 'moment';

// Actions
import deviceInfoActions from '../actions/DeviceInfo';
import loginActions from '../screens/Login/actions';
import modalActions from '../actions/Modal';
import videoActions from '../actions/VideoScreen';

// Constants
import globalConstants from '../constants';

// Utils
import * as selectors from '../utils/selector';

// Filesystem
import {
  downloadZip,
  createFolder,
  isFolderExists,
  deleteFile,
} from '../utils/fileSystem';
import Alert from '../utils/alert';

// Api
import { dxApi, dxAdminApi, formApi } from '../helpers/apiManager';

// Config
import config from '../config';

// Helpers
import * as helpers from '../helpers';


const storage = new Storage({
  // maximum capacity, default 1000
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: false,
  sync: {},
});

const keycloakConfig = {
  issuer: config.keycloakHost,
  clientId: config.keycloakClient,
  redirectUrl: 'redirect:/callback',
  scopes: ['openid', 'profile'],
  dangerouslyAllowInsecureHttpRequests: true,
};

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
      message: 'Not found in localstorage',
    });
  }
};

// Fetch LocalStorage
const fetchFromLocalAppObj = async (key) => {
  try {
    const getItem = await storage.load({
      key,
    });
    return getItem;
  } catch (error) {
    const data = {
      userGUID: null,
      userDeviceGUID: null,
      isNightMode: false,
      isLoginRequired: false,
      isSelfRegister: false,
      isAnonymous: false,
      isActivePasscode: false,
      themeColor: '#000000',

      loginType: null,
      isAnonymousLogin: false,
      isAuthenticated: false,
      languageGUID: null,
      language: null,
      token: null,
      refreshToken: null,
      expiryDate: null,
    };
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data,
          });
          return data;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'fetchFromLocalAppObj',
            message: 'Cannot save into localStorage (NotFoundError)',
          });
        }

      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data,
          });
          return data;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'fetchFromLocalAppObj',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'fetchFromLocalAppObj',
      message: 'Not found in localstorage',
    });
  }
};

const checkInternet = () => new Promise((resolve, reject) => {
  NetInfo.getConnectionInfo().then((connectionInfo) => {
    const {
      type,
    } = connectionInfo;
    if (type == 'none') {
      resolve(false);
    } else {
      resolve(true);
    }
  });
});
function* getAppInfo(action) {
  const deviceInfo = yield select(selectors.deviceInfo);

  try {
    // Add empty user object on first load
    const fetchAppObj = yield call(fetchFromLocalAppObj, 'App');
    const checkInternetRes = yield call(checkInternet);
    fetchAppObj.isConnected = checkInternetRes;
    // Add empty Data array
    yield put(
      deviceInfoActions.fetchAppInfoSuccess(action.payload.userData.appVersion, fetchAppObj),
    );
    if (!checkInternetRes && !fetchAppObj.token) {
      Alert.showToast('Please connect to internet to login', 8000, 'danger');
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getAppInfo', err.type, err.method, err.message);
    yield put(deviceInfoActions.fetchAppInfoErrors(err.message));
  }
}

// Update LocalStorage
const updateUserLocalstorage = async (key, languageGUID, language) => {
  try {
    const getItem = await storage.load({ key });
    getItem.languageGUID = languageGUID;
    getItem.language = language;
    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data: {
              languageGUID,
              language,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorage',
            message: 'Cannot save into localstorage (NotFoundError)',
          });
        }
        break;
      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data: {
              languageGUID,
              language,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorage',
            message: 'Cannot save into localstorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'updateUserLocalstorage',
      message: 'Not found in localstorage',
    });
  }
};


const updateUserLocalstorageByUserGUID = async (key, userGUID) => {
  try {
    const getItem = await storage.load({ key });
    getItem.userGUID = userGUID;
    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data: {
              userGUID,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (NotFoundError)',
          });
        }
        break;
      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data: {
              userGUID,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'updateUserLocalstorageByUserGUID',
      message: 'Not found in localstorage',
    });
  }
};

const versionCheck = (appVersion, serverVersion) => {
  const appVersionSplit = appVersion.split('.');
  const serverVersionSplit = serverVersion.split('.');

  // Length Check
  if (appVersionSplit.length !== 3 || serverVersionSplit.length !== 3) {
    return false;
  }
  // comparison
  for (let i = 0; i < 3; i++) {
    if (Number(serverVersionSplit[i]) > Number(appVersionSplit[i])) {
      return false;
    }
  }
  return true;
};

const addAppDataToLocalStoage = async (key, response) => {
  // theme filter
  let tempNightMode = response.User.Attributes.length && response.User.Attributes.filter(item => item.NAME === 'IsNightMode');
  if (tempNightMode.length) {
    tempNightMode = tempNightMode[0].VALUE;
  } else {
    tempNightMode = '0';
  }
  try {
    const getItem = await storage.load({
      key
    });
    getItem.userGUID = response.User.UserGUID;
    getItem.userDeviceGUID = response.Device.UserDeviceGUID;
    getItem.isNightMode = tempNightMode == '1';
    getItem.isLoginRequired = response.IsLoginRequired == '1';
    getItem.isSelfRegister = response.IsSelfRegister == '1';
    getItem.isAnonymous = response.IsAnonymous == '1';
    getItem.isActivePasscode = response.IsActivePasscode == '1';
    getItem.themeColor = response.OrgThemeColor;

    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data: {
              userGUID: response.User.UserGUID,
              userDeviceGUID: response.Device.UserDeviceGUID,
              isNightMode: tempNightMode == '1',
              isLoginRequired: response.IsLoginRequired == '1',
              isSelfRegister: response.IsSelfRegister == '1',
              isAnonymous: response.IsAnonymous == '1',
              isActivePasscode: response.IsActivePasscode == '1',
              themeColor: response.OrgThemeColor,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (NotFoundError)',
          });
        }
        break;
      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data: {
              userGUID: response.User.UserGUID,
              userDeviceGUID: response.Device.UserDeviceGUID,
              isNightMode: tempNightMode == '1',
              isLoginRequired: response.IsLoginRequired == '1',
              isSelfRegister: response.IsSelfRegister == '1',
              isAnonymous: response.IsAnonymous == '1',
              isActivePasscode: response.IsActivePasscode == '1',
              themeColor: response.OrgThemeColor,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'updateUserLocalstorageByUserGUID',
      message: 'Not found in localstorage',
    });
  }
};

// Api call heartbeatV0Saga
const heartbeatV0Api = params => dxAdminApi('/user/heart_beat_v0', params, true, null);

const addThemeColorToLocalStoage = async (key, themeColor) => {
  try {
    const getItem = await storage.load({
      key
    });
    getItem.themeColor = themeColor;

    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data: {
              themeColor,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (NotFoundError)',
          });
        }
        break;
      case 'ExpiredError':
        try {
          await storage.save({
            key,
            data: {
              themeColor,
            },
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'updateUserLocalstorageByUserGUID',
      message: 'Not found in localstorage',
    });
  }
};

function* heartbeatV0Saga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const params = {
      OrgUrl: config.keycloakUrl,
    };
    // Api call
    const response = yield call(heartbeatV0Api, params);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      let formattedResponse;
      let userLanguageNotActive;
      let autoLangSelect = false;

      // Add themeColor t0 localStorage
      yield call(addThemeColorToLocalStoage, 'App', Response.OrgThemeColor)

      // 1.0
      // Check for the version function
      const versionCheckResult = versionCheck(action.payload, Response.Version);

      // Function to check user language active...
      const userLanguageActive = Response.Languages.filter(
        lang => lang.LanguageGUID === deviceInfo.languageGUID,
      );

      // 2.0
      // Check IF user language still active
      if (!userLanguageActive.length) {
        //  CheckList for Languages
        // No language is there then use defaultLanguage
        if (!Response.Languages.length) {
          // THen check userLanguageGUID mathches with defaultlanguage GUID
          Response.Languages = [Response.DefaultLanguage];
          formattedResponse = Response;

          const autoSetLanguageResponse = yield call(
            autoSetLanguage,
            formattedResponse.Languages[0].LanguageGUID,
          );

          if (autoSetLanguageResponse.Confirmation === 'FAIL') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'autoSetLanguage', autoSetLanguageResponse.type, autoSetLanguageResponse.method, autoSetLanguageResponse.message);
            yield put(deviceInfoActions.setAppLanguageModalErrors(autoSetLanguageResponse.message));
            Alert.showToast('Something went wrong...', 5000);
            return;
          }

          autoLangSelect = true;

          // Assemble data
          Response.language = autoSetLanguageResponse.language;
          Response.languageGUID = autoSetLanguageResponse.languageGUID;

          formattedResponse = Response;
        } else if (Response.Languages.length === 1) {
          // Only One Language Then no popup
          const autoSetLanguageResponse = yield call(
            autoSetLanguage,
            Response.Languages[0].LanguageGUID,
          );

          if (autoSetLanguageResponse.Confirmation === 'FAIL') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'autoSetLanguage', autoSetLanguageResponse.type, autoSetLanguageResponse.method, autoSetLanguageResponse.message);
            yield put(deviceInfoActions.setAppLanguageModalErrors(autoSetLanguageResponse.message));
            Alert.showToast('Something went wrong...', 5000);
            return;
          }

          autoLangSelect = true;

          // Assemble data
          Response.language = autoSetLanguageResponse.language;
          Response.languageGUID = autoSetLanguageResponse.languageGUID;

          formattedResponse = Response;
        } else {
          // More than one languages
          yield call(updateUserLocalstorage, 'App', null, null);
          formattedResponse = Response;
          userLanguageNotActive = true;
        }
      } else {
        formattedResponse = Response;
      }

      if (!versionCheckResult) {
        // Version mismatch
        formattedResponse = Response;
        yield put(deviceInfoActions.heartbeatV0VersionMismatch(action.payload, formattedResponse));
      } else if (autoLangSelect) {
        // Auto set language
        yield put(
          deviceInfoActions.autoSetLanguageSuccess(action.payload, formattedResponse, false),
        );
      } else {
        // Success heartbeat case
        yield put(
          deviceInfoActions.heartbeatV0Success(
            action.payload,
            formattedResponse,
            userLanguageNotActive,
          ),
        );
      }
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'heartbeatV0', 'Api', '/user/heart_beat_v0', Message);
      yield put(deviceInfoActions.heartbeatV0Errors(Message));
      Alert.showToast('Something went wrong...', 5000);
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'heartbeatV0', err.type, err.method, err.message);
    yield put(deviceInfoActions.heartbeatV0Errors(err.message));
    Alert.showToast('Something went wrong...', 5000);
  }
}

// Api call heartbeat
const heartbeatApi = (params, keycloak) => dxApi('/user/heart_beat', params, true, keycloak);

const userExistCheck = async (userGUID) => {
  const newUser = {
    UserGUID: null,
    IsFirstInstall: true,
  };
  try {
    let found = false;
    const users = await storage.load({
      key: 'Users',
    });

    users.forEach((user) => {
      if (user.UserGUID == userGUID) {
        found = true;
        if (user.IsFirstInstall) {
          user.IsFirstInstall = false;
        }
      }
    });
    if (!found) {
      newUser.UserGUID = userGUID;
      users.push(newUser);
    }
    await storage.save({
      key: 'Users',
      data: users,
    });
    return found;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          newUser.UserGUID = userGUID;
          await storage.save({
            key: 'Users',
            data: [newUser],
          });
          return false;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            message: 'Not found in localstorage (NotFoundError)',
            method: 'userExistCheck',
          });
        }
        break;
      case 'ExpiredError':
        try {
          newUser.UserGUID = userGUID;
          await storage.save({
            key: 'Users',
            data: [newUser],
          });
          return false;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'userExistCheck',
            message: 'Not found in localstorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'userExistCheck',
      message: 'Not found in localstorage',
    });
  }
};

function* heartbeatSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const settingReducer = yield select(selectors.setting);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const formattedParams = {
      Platform: deviceInfo.systemName.toUpperCase(),
      DeviceID: deviceInfo.deviceId,
      IsNightMode: settingReducer.isNightMode,
    };
    // Api call
    const response = yield call(heartbeatApi, formattedParams, keycloak);

    if (response.Data.StatusCode == 403) {
      yield call(logoutSaga);
      return;
    }

    const { Confirmation, Response, Message } = response.Data;
    if (response.Data && Confirmation === 'SUCCESS') {
      // Adding Crashlytics data
      if (deviceInfo.crashlytics) {
        if (deviceInfo.isSkipLoginSuccess && !deviceInfo.isLoginRequired && deviceInfo.isAnonymous) {
          deviceInfo.crashlytics.setUserName('Anonymous');
          deviceInfo.crashlytics.setUserIdentifier(Response.User.UserGUID);
        } else {
          deviceInfo.crashlytics.setUserName(`${Response.User.FirstName} ${Response.User.LastName}`);
          deviceInfo.crashlytics.setUserIdentifier(Response.User.UserGUID);
        }
      }

      let formattedResponse;
      let userLanguageNotActive;
      let autoLangSelect = false;

      // Add user & app info to localStorage
      yield call(addAppDataToLocalStoage, 'App', Response)

      // Check for user exists in local storage
      const userExistCheckRes = yield call(userExistCheck, Response.User.UserGUID);

      // 1.0
      // Check for the version function
      const versionCheckResult = versionCheck(action.payload, Response.Version);

      // Function to check user language active...
      const userLanguageActive = Response.Languages.filter(
        lang => lang.LanguageGUID === deviceInfo.languageGUID,
      );

      // 2.0
      // Check IF user language still active
      if (!userLanguageActive.length) {
        //  CheckList for Languages
        // No language is there then use defaultLanguage
        if (!Response.Languages.length) {
          // THen check userLanguageGUID mathches with defaultlanguage GUID
          Response.Languages = [Response.DefaultLanguage];
          formattedResponse = Response;

          const autoSetLanguageResponse = yield call(
            autoSetLanguage,
            formattedResponse.Languages[0].LanguageGUID,
          );

          if (autoSetLanguageResponse.Confirmation === 'FAIL') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'autoSetLanguage', autoSetLanguageResponse.type, autoSetLanguageResponse.method, autoSetLanguageResponse.message);
            yield put(deviceInfoActions.setAppLanguageModalErrors(autoSetLanguageResponse.message));
            Alert.showToast('Something went wrong...', 5000);
            return;
          }

          autoLangSelect = true;

          // Assemble data
          Response.language = autoSetLanguageResponse.language;
          Response.languageGUID = autoSetLanguageResponse.languageGUID;

          formattedResponse = Response;
        } else if (Response.Languages.length === 1) {
          // Only One Language Then no popup
          const autoSetLanguageResponse = yield call(
            autoSetLanguage,
            Response.Languages[0].LanguageGUID,
          );

          if (autoSetLanguageResponse.Confirmation === 'FAIL') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'autoSetLanguage', autoSetLanguageResponse.type, autoSetLanguageResponse.method, autoSetLanguageResponse.message);
            yield put(deviceInfoActions.setAppLanguageModalErrors(autoSetLanguageResponse.message));
            Alert.showToast('Something went wrong...', 5000);
            return;
          }

          autoLangSelect = true;

          // Assemble data
          Response.language = autoSetLanguageResponse.language;
          Response.languageGUID = autoSetLanguageResponse.languageGUID;

          formattedResponse = Response;
        } else {
          // More than one languages
          yield call(updateUserLocalstorage, 'App', null, null);
          formattedResponse = Response;
          userLanguageNotActive = true;
        }
      } else {
        formattedResponse = Response;
      }

      // Check server sync
      // 1. Download
      // 1.1 download the new exp
      let serverDownloadArr = Response.Download.UserExperienceStreams;
      // serverDownloadArr = _removeDuplicates(serverDownloadArr);
      let serverDeviceDownloadArr = !userExistCheckRes ? [] : Response.Download.UserDeviceExperienceStreams;
      let syncDownloadArr = checkSyncStreamToDownload(serverDownloadArr, serverDeviceDownloadArr);
      // 1.2 update local exp
      let fetchUserDownloadsObj = yield call(filterAndfetchDownloadsFromLocalUserObj, Response.User.UserGUID);
      let syncUpdateDownloadArr = checkSyncStreamToUpdate(serverDeviceDownloadArr, fetchUserDownloadsObj);
      // 1.3 delete local exp
      let syncDeleteDownloadArr = checkSyncStreamToDelete(fetchUserDownloadsObj, serverDownloadArr);

      // 2. Bookmark card
      // 2.1 download the new exp
      let serverBookmarkCardArr = Response.BookmarkCard.UserExperienceStreams;
      // serverBookmarkCardArr = _removeDuplicates(serverBookmarkCardArr);
      let serverDeviceBookmarkCardArr = !userExistCheckRes ? [] : Response.BookmarkCard.UserDeviceExperienceStreams;
      let syncBookmarkCardArr = checkSyncStreamToDownload(serverBookmarkCardArr, serverDeviceBookmarkCardArr);
      // 2.2 update local exp
      let fetchUserBookmarkCardObj = yield call(filterAndfetchBookmarkcardsFromLocalUserObj, Response.User.UserGUID);
      let syncUpdateBookmarkCardArr = checkSyncStreamToUpdate(serverDeviceBookmarkCardArr, fetchUserBookmarkCardObj);
      // 2.3 delete local exp
      let syncDeleteBookmarkCardArr = checkSyncStreamToDelete(fetchUserBookmarkCardObj, serverBookmarkCardArr);

      // 3. Bookmark section
      // 3.1 download the new exp
      let serverBookmarkSectionArr = Response.BookmarkSection.UserExperienceStreams;
      // serverBookmarkSectionArr = _removeDuplicates(serverBookmarkSectionArr);
      let serverDeviceBookmarkSectionArr = !userExistCheckRes ? [] : Response.BookmarkSection.UserDeviceExperienceStreams;
      let syncBookmarkSectionArr = checkSyncStreamToDownloadV2(serverBookmarkSectionArr, serverDeviceBookmarkSectionArr);
      // 3.2 delete local exp
      let fetchUserBookmarkSectionObj = yield call(filterAndfetchBookmarksectionsFromLocalUserObj, Response.User.UserGUID);
      let syncDeleteBookmarkSectionArr = checkSyncStreamToDeleteV2(fetchUserBookmarkSectionObj, serverBookmarkSectionArr);

      // console.log('serverDownloadArr: ', serverDownloadArr);
      // console.log('serverBookmarkCardArr: ', serverBookmarkCardArr);
      // console.log('serverBookmarkSectionArr: ', serverBookmarkSectionArr);

      // console.log('=================');

      // console.log('serverDeviceDownloadArr: ', serverDeviceDownloadArr);
      // console.log('serverDeviceBookmarkCardArr: ', serverDeviceBookmarkCardArr);
      // console.log('serverDeviceBookmarkSectionArr: ', serverDeviceBookmarkSectionArr);

      // console.log('=================');

      // console.log('fetchUserDownloadsObj: ', fetchUserDownloadsObj);
      // console.log('fetchUserBookmarkCardObj: ', fetchUserBookmarkCardObj);
      // console.log('fetchUserBookmarkSectionObj: ', fetchUserBookmarkSectionObj);

      // console.log('=================');

      // console.log('syncDownloadArr: ', syncDownloadArr);
      // console.log('syncUpdateDownloadArr: ', syncUpdateDownloadArr);
      // console.log('syncDeleteDownloadArr: ', syncDeleteDownloadArr);

      // console.log('=================');

      // console.log('syncBookmarkCardArr: ', syncBookmarkCardArr);
      // console.log('syncUpdateBookmarkCardArr: ', syncUpdateBookmarkCardArr);
      // console.log('syncDeleteBookmarkCardArr: ', syncDeleteBookmarkCardArr);

      // console.log('=================');

      // console.log('syncBookmarkSectionArr: ', syncBookmarkSectionArr);
      // console.log('syncDeleteBookmarkSectionArr: ', syncDeleteBookmarkSectionArr);


      if (!versionCheckResult) {
        // Version mismatch
        formattedResponse = Response;
        yield put(deviceInfoActions.heartbeatVersionMismatch(action.payload, formattedResponse));
      } else if (autoLangSelect) {
        // Auto set language
        yield put(
          deviceInfoActions.autoSetLanguageSuccess(
            action.payload,
            formattedResponse,
            true,
            syncDownloadArr,
            syncUpdateDownloadArr,
            syncDeleteDownloadArr,

            syncBookmarkCardArr,
            syncUpdateBookmarkCardArr,
            syncDeleteBookmarkCardArr,

            syncBookmarkSectionArr,
            syncDeleteBookmarkSectionArr,
          ),
        );
      } else {
        // If token refresh update the local storage
        if (response.isTokenRefreshed) {
          yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
          yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
        }

        // Success heartbeat case
        yield put(
          deviceInfoActions.heartbeatSuccess(
            action.payload,
            formattedResponse,
            userLanguageNotActive,

            syncDownloadArr,
            syncUpdateDownloadArr,
            syncDeleteDownloadArr,

            syncBookmarkCardArr,
            syncUpdateBookmarkCardArr,
            syncDeleteBookmarkCardArr,

            syncBookmarkSectionArr,
            syncDeleteBookmarkSectionArr,
          ),
        );
      }
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'heartbeat', 'Api', '/user/heart_beat', Message);
      yield put(deviceInfoActions.heartbeatErrors(Message));
      Alert.showToast('Something went wrong...', 5000);
      // yield call(logoutSaga);
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'heartbeat', err.type, err.method, err.message);
    Alert.showToast('Something went wrong...', 5000);
    yield put(deviceInfoActions.heartbeatErrors(err.message));
    // yield call(logoutSaga);
  }
}

const checkSyncStreamToDownload = (userExpStreamArray, userDeviceExpStreamArray) => {
  const resultArray = [];
  userExpStreamArray.forEach((userExpItem) => {
    let found = false;
    userDeviceExpStreamArray.forEach((userDeviceItem) => {
      if (userExpItem.ExperienceStreamGUID === userDeviceItem.ExperienceStreamGUID && userExpItem.UserExperienceStreamGUID === userDeviceItem.UserExperienceStreamGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(userExpItem);
    }
  });
  return resultArray;
};

const checkSyncStreamToUpdate = (serverUserDeviceExpStreamArray, localUserDeviceExpStreamArray) => {
  const resultArray = [];
  serverUserDeviceExpStreamArray.forEach((ser) => {
    localUserDeviceExpStreamArray.forEach((loc) => {
      // only the server sync at greater than the local sync, we update the downloaded data
      if (ser.ExperienceStreamGUID === loc.ExperienceStreamGUID
        && helpers.getCurrentDateTime(ser.SyncedAt) > helpers.getCurrentDateTime(loc.SyncedAt)) {
        resultArray.push(ser);
      }
    });
  });
  return resultArray;
};

const checkSyncStreamToDelete = (localUserDeviceExpStreamArray, userExpStreamArray) => {
  const resultArray = [];
  localUserDeviceExpStreamArray.forEach((loc) => {
    let found = false;
    userExpStreamArray.forEach((ser) => {
      if (loc.ExperienceStreamGUID === ser.ExperienceStreamGUID) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(loc);
    }
  });
  return resultArray;
};

const checkSyncStreamToDownloadV2 = (userExpStreamArray, userDeviceExpStreamArray) => {
  const resultArray = [];
  userExpStreamArray.forEach((userExpItem) => {
    let found = false;
    userDeviceExpStreamArray.forEach((userDeviceItem) => {
      if (userExpItem.ExperienceStreamGUID === userDeviceItem.ExperienceStreamGUID
        && userExpItem.SectionGUID === userDeviceItem.SectionGUID
        && userExpItem.UserExperienceStreamGUID === userDeviceItem.UserExperienceStreamGUID
      ) {
        found = true;
      }
    });
    if (!found) {
      resultArray.push(userExpItem);
    }
  });
  return resultArray;
};

const checkSyncStreamToDeleteV2 = (localUserDeviceExpStreamArray, userExpStreamArray) => {
  const resultArray = [];
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


// Fetch user download and bookmarks
const filterAndfetchDownloadsFromLocalUserObj = async (userGUID) => {
  try {
    const getDownloads = await storage.load({
      key: `${userGUID}-DOWNLOADS`,
    });
    return getDownloads;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key: `${userGUID}-DOWNLOADS`,
            data: [],
          });

          const getDownloads = await storage.load({
            key: `${userGUID}-DOWNLOADS`,
          });

          return getDownloads;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'filterAndfetchDownloadsFromLocalUserObj',
            message: 'Cannot save into localStorage (NotFoundError)',
          });
        }
      case 'ExpiredError':
        try {
          await storage.save({
            key: `${userGUID}-DOWNLOADS`,
            data: [],
          });

          const getDownloads = await storage.load({
            key: `${userGUID}-DOWNLOADS`,
          });

          return getDownloads;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'filterAndfetchDownloadsFromLocalUserObj',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
      default:
        break;
    }
    throw new Object({
      type: 'Localstorage',
      method: 'filterAndfetchDownloadsFromLocalUserObj',
      message: 'Not found error',
    });
  }
};
const filterAndfetchBookmarkcardsFromLocalUserObj = async (userGUID) => {
  try {
    const getBookmarkCards = await storage.load({
      key: `${userGUID}-BOOKMARKCARDS`,
    });
    return getBookmarkCards;
  } catch (error) {
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key: `${userGUID}-BOOKMARKCARDS`,
            data: [],
          });

          const getBookmarkCards = await storage.load({
            key: `${userGUID}-BOOKMARKCARDS`,
          });
          return getBookmarkCards;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'filterAndfetchBookmarkcardsFromLocalUserObj',
            message: 'Cannot save into localStorage (NotFoundError)',
          });
        }
      case 'ExpiredError':
        try {
          await storage.save({
            key: `${userGUID}-BOOKMARKCARDS`,
            data: [],
          });

          const getBookmarkCards = await storage.load({
            key: `${userGUID}-BOOKMARKCARDS`,
          });
          return getBookmarkCards;
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'filterAndfetchBookmarkcardsFromLocalUserObj',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
      default:
        break;
    }
    throw new Object({
      type: 'Localstorage',
      method: 'filterAndfetchBookmarkcardsFromLocalUserObj',
      message: 'Not found error',
    });
  }
};

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

const syncDownloadDataApi = async (params, keycloak, downloadData, userReducer, deviceInfo) => {
  try {
    const response = await dxApi('/user/v2/mobile_view_sync', params, true, keycloak);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      const oldStream = Response.ExperienceStream;
      const newStream = Response.UpdatedExperienceStream;
      const res = await addDownloadSaga(downloadData, userReducer, oldStream, deviceInfo);
      if (res.Confirmation !== 'SUCCESS') {
        return {
          Confirmation: 'FAIL',
          type: res.type,
          method: res.method,
          message: res.message,
        }
      }
      return res;
    } else {
      return {
        Confirmation: 'FAIL',
        domain: 'Download',
        type: 'Download',
        method: '/user/v2/mobile_view_sync',
        message: Message,
      };
    }
  } catch (err) {
    return {
      Confirmation: err.Confirmation,
      domain: 'Download',
      type: err.type,
      method: err.method,
      message: err.message,
    };
  }
};

const addDownloadSaga = async (downloadData, userReducer, stream, deviceInfo) => {
  try {
    const {
      folderName,
      streamFolderName,
    } = downloadData;

    // 1. Create the folder with name of the ExperienceStreamGUID
    const createFolderRes = await createFolder(folderName, userReducer.userGUID, streamFolderName);

    // 2. Check the folder exists
    const checkStreamFolder = await isFolderExists(folderName, userReducer.userGUID, streamFolderName);

    if (checkStreamFolder.Confirmation === 'SUCCESS') {
      // 3. Download all the files inside that directory
      await downloadXiFolder(folderName, userReducer.userGUID, streamFolderName, stream.Experience.ExperienceGUID);

      // 4. local storage
      await checkAndUpdateLocalStorage(stream.ExperienceStreamGUID, stream, userReducer.userGUID);
      
      // 4.1. Update New Structure boolean
      await UpdateIsNewStructureLocalStorage(stream.ExperienceStreamGUID, userReducer.userGUID);

      return {
        Confirmation: 'SUCCESS',
      };
    } else {
      return ({
        Confirmation: 'FAIL',
        type: checkStreamFolder.type,
        method: checkStreamFolder.method,
        message: checkStreamFolder.message,
      })
    }
  } catch (err) {
    return ({
      Confirmation: 'FAIL',
      type: err.type,
      method: err.method,
      message: err.message,
    });
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


const syncBookmarkCardDataApi = async (params, keycloak, userReducer, deviceInfo) => {
  try {
    const response = await dxApi('/user/v2/mobile_view_sync', params, true, keycloak);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      const oldStream = Response.ExperienceStream;
      const newStream = Response.UpdatedExperienceStream;
      if (newStream) {
        return await checkAndUpdateLocalStorageV2(oldStream, 'BOOKMARKCARDS', userReducer.userGUID);
      }
      return await checkAndUpdateLocalStorageV2(oldStream, 'BOOKMARKCARDS', userReducer.userGUID);
    } else {
      return ({
        Confirmation: 'FAIL',
        domain: 'Api',
        type: 'Api',
        method: '/user/v2/mobile_view_sync',
        message: Message,
      })
    }
  } catch (err) {
    return ({
      Confirmation: 'FAIL',
      domain: 'Localstorage',
      type: err.type,
      method: err.method,
      message: err.message,
    });
  }
};

const checkAndUpdateLocalStorage = (experienceStreamGUID, response, userGUID) => new Promise((resolve, reject) => {
  response.isDownloaded = true;
  response.downloadedAt = response.DownloadedAt;
  response.recentlyViewedAt = response.RecentlyViewedAt;
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
        response.numberOfClicks = 1;
        downloadArr.push(response);
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({
              Confirmation: 'SUCCESS',
            });
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
        // Retrieve old completion
        if (ret.Experience.UpdatedAt == response.Experience.UpdatedAt) {
          response.numberOfClicks = ret.numberOfClicks ? ret.numberOfClicks + 1 : 1;
        } else {
          response.numberOfClicks = 1;
        }
        downloadArr[index] = response;
        // Replace storage
        storage
          .save({
            key: `${userGUID}-DOWNLOADS`,
            data: downloadArr,
          })
          .then(() => {
            resolve({
              Confirmation: 'SUCCESS',
            });
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
          response.numberOfClicks = 1;
          storage
            .save({
              key: `${userGUID}-DOWNLOADS`,
              data: [response],
            })
            .then(() => {
              resolve({
                Confirmation: 'SUCCESS',
              });
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
          response.numberOfClicks = 1;
          storage
            .save({
              key: `${userGUID}-DOWNLOADS`,
              data: [response],
            })
            .then(() => {
              resolve({
                Confirmation: 'SUCCESS',
              });
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

const syncBookmarkSectionDataApi = async (params, keycloak, userReducer, deviceInfo) => {
  try {
    const response = await dxApi('/user/v2/sync_stream_bookmark_sync', params, true, keycloak);
        
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      let audioCompletionArr = Response.UserExperienceStreamData.AudioCompletionArr;
      audioCompletionArr = JSON.parse(audioCompletionArr);

      let section = Response.UserExperienceStreamData.Data;
      section = JSON.parse(section);

      if (audioCompletionArr && audioCompletionArr.length){
        section.CurrentTime = audioCompletionArr[0].CurrentTime;
      }

      return await checkAndUpdateLocalStorageV2(section, 'BOOKMARKSECTIONS', userReducer.userGUID);
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

const checkAndUpdateLocalStorageV2 = (response, type, userGUID) => new Promise((resolve, reject) => {
  response.bookmarkedAt = response.BookmarkedAt;
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


function* getUserInfo(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const nav = yield select(selectors.nav);
    const modal = yield select(selectors.modal);
    const userReducer = yield select(selectors.user);
    const feed = yield select(selectors.feed);
    const isConnected = deviceInfo.internetInfo.isConnected;
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };
    const {
      syncDownloadArr,
      syncUpdateDownloadArr,
      syncDeleteDownloadArr,

      syncBookmarkCardArr,
      syncUpdateBookmarkCardArr,
      syncDeleteBookmarkCardArr,

      syncBookmarkSectionArr,
      syncDeleteBookmarkSectionArr,
    } = deviceInfo;

    // console.log('syncDownloadArr: ', syncDownloadArr);
    // console.log('syncUpdateDownloadArr: ', syncUpdateDownloadArr);
    // console.log('syncDeleteDownloadArr: ', syncDeleteDownloadArr);
    // console.log('syncBookmarkCardArr: ', syncBookmarkCardArr);
    // console.log('syncUpdateBookmarkCardArr: ', syncUpdateBookmarkCardArr);
    // console.log('syncDeleteBookmarkCardArr: ', syncDeleteBookmarkCardArr);
    // console.log('syncBookmarkSectionArr: ', syncBookmarkSectionArr);
    // console.log('syncDeleteBookmarkSectionArr: ', syncDeleteBookmarkSectionArr);

    if (isConnected) {
      // 1. Download
      // 1.1 download
      for (const i in syncDownloadArr) {
        const item = syncDownloadArr[i];
        const downloadData = {
          folderName: 'downloadFeeds',
          streamFolderName: item.ExperienceStreamGUID,
        };
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'DOWNLOAD',
        };
        const syncDownloadDataRes = yield call(syncDownloadDataApi, params, keycloak, downloadData, userReducer, deviceInfo);
      }
      // 1.2 update
      for (const i in syncUpdateDownloadArr) {
        const item = syncUpdateDownloadArr[i];
        const downloadData = {
          folderName: 'downloadFeeds',
          streamFolderName: item.ExperienceStreamGUID,
        };
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'DOWNLOAD',
        };
        const syncDownloadDataRes = yield call(syncDownloadDataApi, params, keycloak, downloadData, userReducer, deviceInfo);
      }
      // 1.3 delete
      for (const i in syncDeleteDownloadArr) {
        const item = syncDeleteDownloadArr[i];
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'DOWNLOAD',
          SectionGUID: '',
        };
        const deleteSyncDownloadDataRes = yield call(deleteSyncDownloadDataApi, params, keycloak, userReducer, deviceInfo);

        if (deleteSyncDownloadDataRes.Confirmation != 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncDownloadDataRes.domain, 'getUserInfo', deleteSyncDownloadDataRes.type, deleteSyncDownloadDataRes.method, deleteSyncDownloadDataRes.message);
        }
      }

      // 2. Bookmark card
      // 2.1 download
      for (const i in syncBookmarkCardArr) {
        const item = syncBookmarkCardArr[i];
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'BOOKMARK_CARD',
        };
        const syncBookmarkCardDataRes = yield call(syncBookmarkCardDataApi, params, keycloak, userReducer, deviceInfo);

        if (syncBookmarkCardDataRes.Confirmation != 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkCardDataRes.domain, 'getUserInfo', syncBookmarkCardDataRes.type, syncBookmarkCardDataRes.method, syncBookmarkCardDataRes.message);
        }
      }
      // 2.2 update
      for (const i in syncUpdateBookmarkCardArr) {
        const item = syncUpdateBookmarkCardArr[i];
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'BOOKMARK_CARD',
        };
        const syncBookmarkCardDataRes = yield call(syncBookmarkCardDataApi, params, keycloak, userReducer, deviceInfo);
        if (syncBookmarkCardDataRes.Confirmation != 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkCardDataRes.domain, 'getUserInfo', syncBookmarkCardDataRes.type, syncBookmarkCardDataRes.method, syncBookmarkCardDataRes.message);
        }
      }
      // 2.3 delete
      for (const i in syncDeleteBookmarkCardArr) {
        const item = syncDeleteBookmarkCardArr[i];
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          ExperienceStreamGUID: item.ExperienceStreamGUID,
          Type: 'BOOKMARK_CARD',
          SectionGUID: '',
        };

        const deleteSyncBookmarkDataRes = yield call(deleteSyncBookmarkDataApi, params, keycloak, userReducer.userGUID, 'BOOKMARKCARDS', item.ExperienceStreamGUID);
        if (deleteSyncBookmarkDataRes.Confirmation != 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'getUserInfo', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
        }
      }
      // 3. Bookmark section
      // 3.1 download
      for (const i in syncBookmarkSectionArr) {
        const item = syncBookmarkSectionArr[i];
        const params = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          UserExperienceStreamGUID: item.UserExperienceStreamGUID,
        };
        const syncBookmarkSectionDataRes = yield call(syncBookmarkSectionDataApi, params, keycloak, userReducer, deviceInfo);

        if (syncBookmarkSectionDataRes.Confirmation != 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, syncBookmarkSectionDataRes.domain, 'getUserInfo', syncBookmarkSectionDataRes.type, syncBookmarkSectionDataRes.method, syncBookmarkSectionDataRes.message);
        }
      }
      // 3.2 delete
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
          helpers.crashlyticsRecord(deviceInfo.crashlytics, deleteSyncBookmarkDataRes.domain, 'getUserInfo', deleteSyncBookmarkDataRes.type, deleteSyncBookmarkDataRes.method, deleteSyncBookmarkDataRes.message);
        }
      }
    }

    // Fetch user data
    const fetchUserDownloadsObj = yield call(
      filterAndfetchDownloadsFromLocalUserObj,
      action.payload,
    );

    const fetchUserbookmarkcardsObj = yield call(
      filterAndfetchBookmarkcardsFromLocalUserObj,
      action.payload,
    );

    const fetchUserBookmarksectionsObj = yield call(
      filterAndfetchBookmarksectionsFromLocalUserObj,
      action.payload,
    );

    // Filtering card only and card with pages
    const cardOnly = fetchUserbookmarkcardsObj.filter(item => item.Experience.ExperienceType === '0');

    const cardWithPages = fetchUserbookmarkcardsObj.filter(item => item.Experience.ExperienceType === '1');
      console.log("fetchUserBookmarksectionsObj: ", fetchUserBookmarksectionsObj);

    // Filtering sections based on type
    const pdfArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'EMBED_PDF');
    const editorArray = fetchUserBookmarksectionsObj.filter(item => (item.Type === 'EDITOR' || item.Type === 'ACCORDION'));
    const videoArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'VIDEO');
    const imageArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'IMAGE');
    const linkArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'LINK');
    const h5pArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'H5P');
    const audioArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'AUDIO');
     
     
    const formatLocalData = {
      downloads: fetchUserDownloadsObj,
      bookmarkCards: fetchUserbookmarkcardsObj,
      bookmarkSections: fetchUserBookmarksectionsObj,
      pdfArray,
      editorArray,
      videoArray,
      imageArray,
      linkArray,
      h5pArray,
      audioArray,
      cardOnly,
      cardWithPages,

      liveExit: false,
      liveJump: false,
      updatedExperienceStream: null,
    };

    // Live jump
    if (syncUpdateDownloadArr.length) {
      if ((nav.currentTab == 'Section' && feed.currentExperienceStreamGUID)
        || (nav.currentTab == 'Video' && nav.previousEmbedTab == 'Section' && feed.currentExperienceStreamGUID)) {
        console.log('hit live jump card and page case');

        // #1. Section page for: card and pages case
        const filterExperienceStream = syncUpdateDownloadArr.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
        if (filterExperienceStream.length && fetchUserDownloadsObj.length) {
          const targetExperienceStreamArr = fetchUserDownloadsObj.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
          const targetExperienceStream = targetExperienceStreamArr[0];
          if (targetExperienceStream) {
            formatLocalData.liveJump = true;
            
            targetExperienceStream.Experience.ExperiencePages = helpers.assembleTree(targetExperienceStream.Experience.ExperiencePages, targetExperienceStream.CompletionArr, targetExperienceStream.AudioCompletionArr);
            targetExperienceStream.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = targetExperienceStream.CurrentLevelExperiencePageGUID;
            targetExperienceStream.Experience.ExperiencePages.IsFeedbackCompleted = targetExperienceStream.IsFeedbackCompleted == '1';
            formatLocalData.updatedExperienceStream = targetExperienceStream;
          }
        }
      } else if ((modal.modalType == 'CARDONLY' && modal.modalOpen)
        || (nav.currentTab == 'Video' && modal.modalType == 'CARDONLY' && modal.modalOpen)) {
        console.log('hit live jump card only case');

        // #2. Card only modal opened
        const filterExperienceStream = syncUpdateDownloadArr.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
        if (filterExperienceStream.length && fetchUserDownloadsObj.length) {
          const targetExperienceStreamArr = fetchUserDownloadsObj.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
          const targetExperienceStream = targetExperienceStreamArr[0];
          if (targetExperienceStream) {
            formatLocalData.liveJump = true;
            formatLocalData.updatedExperienceStream = targetExperienceStream;
          }
        }
      }
    }

    // Live exit
    if (syncDeleteDownloadArr.length) {
      if ((nav.currentTab == 'Section' && feed.currentExperienceStreamGUID)
        || (nav.currentTab == 'Video' && nav.previousEmbedTab == 'Section' && feed.currentExperienceStreamGUID)) {
        console.log('hit live exit card and page case');

        // #1. Section page for: card and pages case
        const filterExperienceStream = syncDeleteDownloadArr.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
        const targetExperienceStream = filterExperienceStream[0];
        if (targetExperienceStream) {
          formatLocalData.liveExit = true;
        }
      } else if (modal.modalType == 'CARDONLY' && modal.modalOpen
        || (nav.currentTab == 'Video' && modal.modalType == 'CARDONLY' && modal.modalOpen)) {
        console.log('hit live exit card only case');

        // #2. Card only modal opened
        const filterExperienceStream = syncDeleteDownloadArr.filter(item => item.ExperienceStreamGUID == feed.currentExperienceStreamGUID);
        const targetExperienceStream = filterExperienceStream[0];
        if (targetExperienceStream) {
          formatLocalData.liveExit = true;
          // navigation differentital to the previous tab for card only / card pages
          formatLocalData.updatedExperienceStream = {
            Experience: {
              ExperienceType: '0',
            },
          };
        }
      }
    }
    yield put(deviceInfoActions.fetchUserInfoSuccess(formatLocalData));
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getUserInfo', err.type, err.method, err.message);
    yield put(deviceInfoActions.fetchUserInfoErrors(err.message));
  }
}


const deleteSyncDownloadDataApi = async (params, keycloak, userReducer, deviceInfo) => {
  try {
    // 1. Check Experience Stream folder exist
    const checkStreamFolder = await isFolderExists('downloadFeeds', userReducer.userGUID, params.ExperienceStreamGUID);
    if (checkStreamFolder.Confirmation === 'SUCCESS') {
      const deleteFileResponse = await deleteDownloadedFiles(params.ExperienceStreamGUID, userReducer.userGUID);
      if (deleteFileResponse) {
        const deleteDataResponse = await deleteLocalStorageData(params.ExperienceStreamGUID, userReducer.userGUID);
        // Sync bookmark data
        await updateBookmarkLocalStorage(params.ExperienceStreamGUID, false, userReducer.userGUID);
        if (deleteDataResponse) {
          const res = await dxApi('/user/v2/remove_stream', params, true, keycloak);

          const { Confirmation, Message } = res.Data;
          if (Confirmation === 'SUCCESS') {
            return ({ Confirmation: 'SUCCESS' });
          } else {
            return ({
              Confirmation: 'FAIL',
              domain: 'Api',
              type: 'API',
              method: '/user/v2/remove_stream',
              message: Message,
            });
          }
        }
      }
    } else {
      return ({
        Confirmation: 'FAIL',
        type: checkStreamFolder.type,
        method: checkStreamFolder.method,
        message: checkStreamFolder.message,
      });
    }
  } catch (err) {
    return ({
      Confirmation: 'FAIL',
      domain: 'Localstorage',
      type: 'LocalStorage',
      method: 'deleteSyncDownloadDataApi',
      message: err.message,
    });
  }
};
const deleteDownloadedFiles = (experienceStreamGUID, userGUID) => new Promise((resolve, reject) => {
  deleteFile('downloadFeeds', userGUID, experienceStreamGUID)
    .then(() => {
      resolve({ Confirmation: 'SUCCESSS' });
    })
    .catch((error) => {
      reject({
        type: 'Download',
        method: 'deleteDownloadedFiles',
        message: error,
      });
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
            reject({
              type: 'Localstorage',
              method: 'deleteLocalStorageData',
              message: error,
            });
          });
      } else {
        reject({
          type: 'Localstorage',
          method: 'deleteLocalStorageData',
          message: error,
        });
      }
    })
    .catch((error) => {
      reject({
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
        bookmarkArr[index].downloadedAt = toggle ? helpers.getUtcCurrentDateTime() : null;
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

// Language/View api call
function* autoSetLanguage(languageGUID) {
  try {
    const params = {
      OrgUrl: config.keycloakUrl,
      LanguageGUID: languageGUID,
    };

    const response = yield call(setLanguageBeforeLoginApi, params);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      // Update Localstorage
      const updatedAppObj = yield call(
        updateUserLocalstorage,
        'App',
        languageGUID,
        Response.Language,
      );

      return updatedAppObj;
    } else {
      return {
        Confirmation: 'FAIL',
        type: 'Api',
        method: '/user/view_language_v0',
        message: Message
      }
    }
  } catch (err) {
    return {
      Confirmation: 'FAIL',
      type: 'Localstorage',
      method: '/user/view_language_v0',
      message: err,
    };
  }
}

// Api call Language Api without token
const setLanguageBeforeLoginApi = params => dxAdminApi('/user/view_language_v0', params, true, null);

function* setLanguageModalSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const params = {
      OrgUrl: config.keycloakUrl,
      LanguageGUID: action.payload,
    };

    // Api call
    const response = yield call(setLanguageBeforeLoginApi, params);
    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      // Update Localstorage
      const updateUserObj = yield call(
        updateUserLocalstorage,
        'App',
        action.payload,
        Response.Language,
      );
      yield put(deviceInfoActions.setAppLanguageModalSuccess(updateUserObj));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'setLanguageModalSaga', 'Api', '/user/view_language_v0', Message);
      yield put(deviceInfoActions.setAppLanguageModalErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'setLanguageModalSaga', err.type, err.method, err.message);
    yield put(deviceInfoActions.setAppLanguageModalErrors(err.message));
  }
}

// Api call Language Api without token after Login
const setLanguageAfterLoginApi = (params, keycloak) => dxApi('/user/view_language', params, true, keycloak);

function* setLanguageSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    let response;
    if (deviceInfo.languageGUID === action.payload.languageGUID.LanguageGUID) {
      response = {
        Confirmation: 'SUCCESS',
        Response: {
          Language: deviceInfo.language,
        },
      };
    } else {
      // Api call
      response = yield call(setLanguageAfterLoginApi, action.payload.languageGUID, keycloak);
    }

    const { Confirmation, Response, Message } = response.Data;
    if (Confirmation === 'SUCCESS') {
      // Update Localstorage
      const updateUserObj = yield call(
        updateUserLocalstorage,
        'App',
        action.payload.languageGUID.LanguageGUID,
        Response.Language,
      );
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      yield put(
        deviceInfoActions.setAppLanguageSuccess(updateUserObj, action.payload.isLanguageModal),
      );
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'setLanguageAfterLoginApi', 'Api', '/user/view_language', Message);
      yield put(deviceInfoActions.setAppLanguageErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'setLanguageAfterLoginApi', err.type, err.method, err.message);
    yield put(deviceInfoActions.setAppLanguageErrors(err.message));
  }
}

const addAuthdataToStorage = async (key, authData) => {
  try {
    const getItem = await storage.load({
      key,
    });
    getItem.userGUID = authData.userGUID;
    getItem.isNightMode = authData.isNightMode;
    getItem.isAuthenticated = true;
    getItem.loginType = authData.loginType;
    getItem.token = authData.accessToken;
    getItem.refreshToken = authData.refreshToken;
    getItem.expiryDate = authData.accessTokenExpirationDate;
    getItem.isAnonymousLogin = authData.isAnonymousLogin;
    await storage.save({
      key,
      data: getItem,
    });
    return getItem;
  } catch (error) {
    const data = {
      isNightMode: authData.isNightMode,
      userGUID: authData.userGUID,
      isAuthenticated: true,
      loginType: authData.loginType,
      token: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiryDate: authData.accessTokenExpirationDate,
      isAnonymousLogin: authData.isAnonymousLogin,
    };
    switch (error.name) {
      case 'NotFoundError':
        try {
          await storage.save({
            key,
            data,
          });
        } catch (err) {
          throw new Object({
            type: 'Localstorage',
            method: 'addAuthdataToStorage',
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
          throw new Object({
            type: 'Localstorage',
            method: 'addAuthdataToStorage',
            message: 'Cannot save into localStorage (ExpiredError)',
          });
        }
        break;
      default:
    }
    throw new Object({
      type: 'Localstorage',
      method: 'addAuthdataToStorage',
      message: 'Not found error',
    });
  }
};

// Login Saga
const authState = async (keyConfig) => {
  try {
    const response = await authorize(keyConfig);
    return response;
  } catch (err) {
    return err;
  }
};

function* loginSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const languageCheck = langLabels || [];
    const loginScreenLabel = languageCheck.LoginScreen ? languageCheck.LoginScreen : [];
    let loginMsgLabel;

    loginScreenLabel.map((label) => {
      if (label.Type === 'LOGIN_MSG') {
        loginMsgLabel = label.Content;
      }
    });

    const loginAuth = yield call(authState, keycloakConfig);
    if (loginAuth.accessToken) {

      const userInfo = helpers.parseJwt(loginAuth.idToken);
      loginAuth.userGUID = userInfo.sub;
      loginAuth.isNightMode = userInfo.IsNightMode;
      loginAuth.isAnonymousLogin = false;
      let updateLocal = yield call(addAuthdataToStorage, 'App', loginAuth);
      Alert.showToast(loginMsgLabel, 1000, 'success');
      yield put(loginActions.loginSuccess(updateLocal));
    } else {

      if (loginAuth.message != 'User cancelled.') {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'loginSaga', 'Api', 'login', 'Failed Login');
        Alert.showToast('Something went wrong', 5000);
        yield put(loginActions.loginErrors({
          Message: 'Failed Login',
        }));
      } else {
        yield put(loginActions.loginErrors({
          Message: 'Failed Login',
        }));
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'loginSaga', err.type, err.method, err.message);
    yield put(loginActions.loginErrors(err.message));
  }
}

// Api call Language Api without token after Login
const logoutApi = keycloak => dxApi('/user/logout', null, true, keycloak);
const logoutAndClearLocalData = async (key) => {
  try {
    const getItem = await storage.load({
      key,
    });
    getItem.userGUID = null;
    getItem.userDeviceGUID = null;
    getItem.isNightMode = false;
    getItem.isLoginRequired = false;
    getItem.isSelfRegister = false;
    getItem.isAnonymous = false;
    getItem.isActivePasscode = false;

    getItem.loginType = null;
    getItem.isAnonymousLogin = false;
    getItem.isAuthenticated = false;
    getItem.token = null;
    getItem.refreshToken = null;
    getItem.expiryDate = null;
    await storage.save({
      key,
      data: getItem,
    });

    const getItem2 = await storage.load({
      key,
    });
    return getItem2;
  } catch (error) {
    throw new Object({
      type: 'Localstorage',
      method: 'logoutAndClearLocalData',
      message: 'Not found error',
    });
  }
};

export function* logoutSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const languageCheck = langLabels || [];
    const loginScreenLabel = languageCheck.LoginScreen ? languageCheck.LoginScreen : [];
    let logoutLabel;

    loginScreenLabel.map((label) => {
      if (label.Type === 'LOGOUT_MSG') {
        logoutLabel = label.Content;
      }
    });

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const isConnected = deviceInfo.internetInfo.isConnected;
    const offlineReopenApp = deviceInfo.offlineReopenApp;
    if (isConnected) {
      const response = yield call(logoutApi, keycloak);
      const { Confirmation, Response, Message } = response.Data;

      if (Confirmation != 'SUCCESS') {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'logoutSaga', 'Api', '/user/logout', Message);
      }

      // Clear local Data
      const clearLocal = yield call(logoutAndClearLocalData, 'App');
      yield put(loginActions.logoutSuccess(clearLocal));
      Alert.showToast(logoutLabel, 2000, 'success');

    } else {
      // Clear local Data
      const clearLocal = yield call(logoutAndClearLocalData, 'App');
      yield put(loginActions.logoutSuccess(clearLocal));
      if (!isConnected && offlineReopenApp) {
        Alert.showToast('Please connect to internet to login', 8000, 'danger');
      } else {
        Alert.showToast(logoutLabel, 2000, 'success');
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'logoutSaga', err.type, err.method, err.message);
    // Clear local Data
    const clearLocal = yield call(logoutAndClearLocalData, 'App');
    yield put(loginActions.logoutSuccess(clearLocal));
  }
}

// Anonymous Login Saga
const anonymousLoginApi = params => dxAdminApi('/user/anonymous_login', params, true);
function* anonymousLoginSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const languageCheck = langLabels || [];
    const loginScreenLabel = languageCheck.LoginScreen ? languageCheck.LoginScreen : [];

    loginScreenLabel.map((label) => {
      if (label.Type === 'LOGIN_MSG') {
        loginMsgLabel = label.Content;
      }
    });

    const params = {
      OrgUrl: config.keycloakUrl,
      AnonymousUserGUID: deviceInfo.deviceId,
    };
    const response = yield call(anonymousLoginApi, params);
    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      const keycloak = Response.Keycloak;
      const loginAuth = {
        userGUID: Response.User.UserGUID,
        isNightMode: Response.User.IsNightMode,
        loginType: 'ANONYMOUS',
        accessToken: keycloak.access_token,
        refreshToken: keycloak.refresh_token,
        accessTokenExpirationDate: helpers.dateTimeByParams(keycloak.expires_in),
        isAnonymousLogin: true,
      };
      const updateLocal = yield call(addAuthdataToStorage, 'App', loginAuth);
      yield put(loginActions.anonymousLoginSuccess(updateLocal));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'anonymousLoginSaga', 'Api', '/user/anonymouse_login', Message);
      Alert.showToast('Something went wrong', 5000);
      yield put(loginActions.anonymousLoginErrors({ Message: 'Failed Login' }));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'anonymousLoginSaga', err.type, err.method, err.message);
    yield put(loginActions.anonymousLoginErrors(err.message));
  }
}

// close card only modal
export const userSyncApi = (params, keycloak) => dxApi('/user/v2/sync_stream', params, true, keycloak);
function* closeCardOnlyModalSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const userReducer = yield select(selectors.user);
    const feed = yield select(selectors.feed);
    const tempExperienceStreamWithChannelInfo = feed.experienceStreamWithChannelInfo;

    // ADD CURRENT TIME ON EXIT
    tempExperienceStreamWithChannelInfo.SyncedAt = helpers.getUtcCurrentDateTime();
    // report 1
    tempExperienceStreamWithChannelInfo.endedAt = helpers.getUtcCurrentDateTime();
    if (!tempExperienceStreamWithChannelInfo.timeSpent) {
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
    }
    if (!tempExperienceStreamWithChannelInfo.startedAt) {
      tempExperienceStreamWithChannelInfo.startedAt = helpers.getUtcCurrentDateTime();
    }
    if (!tempExperienceStreamWithChannelInfo.numberOfImpressions) {
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 1;
    }
    tempExperienceStreamWithChannelInfo.numberOfImpressions += 1;
    tempExperienceStreamWithChannelInfo.timeSpent += moment(tempExperienceStreamWithChannelInfo.endedAt).diff(moment(tempExperienceStreamWithChannelInfo.startedAt), 'seconds');

    // Update local storage
    const syncedAt = helpers.getCurrentDateTime();
    if (deviceInfo.internetInfo.isConnected) {
      tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
    }
    const response = yield call(updateLocalStorage, tempExperienceStreamWithChannelInfo.ExperienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

    if (deviceInfo.internetInfo.isConnected) {
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
        Type: 'DOWNLOAD',
        ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
          SyncedAt: syncedAt,
          TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
          NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
        },
      };
      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'closeCardOnlyModalSaga', 'Api', '/user/v2/sync_stream', Message);
        } else {

        }
      }
    }

    yield put(modalActions.closeCardOnlyModalSuccess());
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'closeCardOnlyModalSaga', err.type, err.method, err.message);
    yield put(modalActions.closeCardOnlyModalSuccess());
    // yield put(loginActions.logoutSuccess());
  }
}


function* closeVideoCardOnlySaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const searchReducer = yield select(selectors.search);

  try {
    const userReducer = yield select(selectors.user);
    const feed = yield select(selectors.feed);
    const tempExperienceStreamWithChannelInfo = feed.experienceStreamWithChannelInfo;

    // ADD CURRENT TIME ON EXIT
    tempExperienceStreamWithChannelInfo.SyncedAt = helpers.getUtcCurrentDateTime();
    // report 1
    tempExperienceStreamWithChannelInfo.endedAt = helpers.getUtcCurrentDateTime();
    if (!tempExperienceStreamWithChannelInfo.timeSpent) {
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
    }
    if (!tempExperienceStreamWithChannelInfo.startedAt) {
      tempExperienceStreamWithChannelInfo.startedAt = helpers.getUtcCurrentDateTime();
    }
    if (!tempExperienceStreamWithChannelInfo.numberOfImpressions) {
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 1;
    }
    tempExperienceStreamWithChannelInfo.timeSpent += moment(tempExperienceStreamWithChannelInfo.endedAt).diff(moment(tempExperienceStreamWithChannelInfo.startedAt), 'seconds');

    // Update local storage
    const syncedAt = helpers.getCurrentDateTime();
    if (deviceInfo.internetInfo.isConnected) {
      tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
    }
    const response = yield call(updateLocalStorage, tempExperienceStreamWithChannelInfo.ExperienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

    if (deviceInfo.internetInfo.isConnected) {
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
        Type: 'DOWNLOAD',
        ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
        Data: {
          CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
          SyncedAt: syncedAt,
          TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
          NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
        },
      };
      const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
      const { Confirmation, Response, Message } = userSync.Data;
      if (userSync) {
        if (Confirmation !== 'SUCCESS') {
          helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'closeVideoCardOnlySaga', 'Api', '/user/v2/sync_stream', Message);
        } else {

        }
      }
    }

    yield put(videoActions.closeVideoCardOnlySuccess(searchReducer.currentIndex, searchReducer.isSearch, deviceInfo.isTagEnable));
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'closeVideoCardOnlySaga', err.type, err.method, err.message);
    yield put(modalActions.closeCardOnlyModalSuccess());
    // yield put(loginActions.logoutSuccess());
  }
}

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
        response.isNewStructure = downloadArr[index].isNewStructure;
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
                      Confirmation: 'FAIL',
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
            reject({
              Confirmation: 'FAIL',
              type: 'Localstorage',
              method: 'updateLocalStorage',
              message: error,
            });
          });
      }
    })
    .catch((error) => {
      reject({
        Confirmation: 'FAIL',
        type: 'Localstorage',
        method: 'updateLocalStorage',
        message: error,
      });
    });
});


function* minimizeAppSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const nav = yield select(selectors.nav);
    const modal = yield select(selectors.modal);
    const userReducer = yield select(selectors.user);
    const feed = yield select(selectors.feed);
    const tempExperienceStreamWithChannelInfo = feed.experienceStreamWithChannelInfo;

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    if (nav.currentTab == 'Section'
      || (nav.currentTab == 'Video' && nav.previousEmbedTab == 'Section')) {
      // #1. Section page for: card and pages case

      console.log('mini card and page case');

      // ADD CURRENT TIME ON EXIT
      tempExperienceStreamWithChannelInfo.SyncedAt = helpers.getUtcCurrentDateTime();
      // report 1
      tempExperienceStreamWithChannelInfo.endedAt = helpers.getUtcCurrentDateTime();
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 0;

      // Update local storage
      const syncedAt = helpers.getCurrentDateTime();
      if (deviceInfo.internetInfo.isConnected) {
        tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
      }

      let tempExperienceStreamWithChannelInfoV2 = JSON.parse(JSON.stringify(tempExperienceStreamWithChannelInfo));

      // * replace the data arr back to stream
      if (feed.dataType == 'NEW_DATA' && !feed.isFetchNewData) {
        if (tempExperienceStreamWithChannelInfoV2.DataArr && tempExperienceStreamWithChannelInfoV2.DataArr.length) {
          tempExperienceStreamWithChannelInfoV2.Experience.ExperiencePages = tempExperienceStreamWithChannelInfoV2.DataArr;
        }
      }
      tempExperienceStreamWithChannelInfoV2.CurrentLevelExperiencePageGUID = feed.current_level_section.ExperiencePageGUID;

      const response = yield call(updateLocalStorage, tempExperienceStreamWithChannelInfoV2.ExperienceStreamGUID, tempExperienceStreamWithChannelInfoV2, userReducer.userGUID);

      // Sync Api...
      if (deviceInfo.internetInfo.isConnected) {
        tempExperienceStreamWithChannelInfoV2.Experience.ExperiencePages.CurrentLevelExperiencePageGUID = feed.current_level_section.ExperiencePageGUID;
        const formattedUserSyncParams = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: (nav.previousTab == 'Bookmark'
            || nav.previousTab == 'BookmarkCardPage'
            || nav.previousTab == 'PAGES') ? 'BOOKMARK_CARD' : 'DOWNLOAD',
          ExperienceStreamGUID: tempExperienceStreamWithChannelInfoV2.ExperienceStreamGUID,
          Data: {
            CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfoV2.CurrentLevelExperiencePageGUID || "",
            SyncedAt: syncedAt,
            TimeSpent: tempExperienceStreamWithChannelInfoV2.timeSpent || "0",
            NumberOfImpressions: tempExperienceStreamWithChannelInfoV2.numberOfImpressions || "0",
            CompletionArr: tempExperienceStreamWithChannelInfoV2.CompletionArr,
            AudioCompletionArr: tempExperienceStreamWithChannelInfoV2.AudioCompletionArr,
            IsTrainingCompleted: tempExperienceStreamWithChannelInfoV2.IsTrainingCompleted,
          },
        };
        const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
        const { Confirmation, Response, Message } = userSync.Data;
        if (userSync) {
          if (Confirmation !== 'SUCCESS') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'minimizeAppSaga', 'Api', '/user/v2/sync_stream', Message);
            throw new Error();
          } else {

          }
        }
      }

      yield put(deviceInfoActions.minimizeAppActionSuccess());

    } else if ((modal.modalType == 'CARDONLY' && modal.modalOpen)
      || (nav.currentTab == 'Video' && modal.modalType == 'CARDONLY' && modal.modalOpen)) {
      console.log('mini card only case');
      // #2. Card only modal opened

      // ADD CURRENT TIME ON EXIT
      tempExperienceStreamWithChannelInfo.SyncedAt = helpers.getUtcCurrentDateTime();
      // report 1
      tempExperienceStreamWithChannelInfo.endedAt = helpers.getUtcCurrentDateTime();
      tempExperienceStreamWithChannelInfo.timeSpent = 0;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = 0;

      // Update local storage
      const syncedAt = helpers.getCurrentDateTime();
      if (deviceInfo.internetInfo.isConnected) {
        tempExperienceStreamWithChannelInfo.SyncedAt = syncedAt;
      }
      const response = yield call(updateLocalStorage, tempExperienceStreamWithChannelInfo.ExperienceStreamGUID, tempExperienceStreamWithChannelInfo, userReducer.userGUID);

      if (deviceInfo.internetInfo.isConnected) {
        // Sync Api...
        const formattedUserSyncParams = {
          Platform: deviceInfo.systemName.toUpperCase(),
          DeviceID: deviceInfo.deviceId,
          Type: 'DOWNLOAD',
          ExperienceStreamGUID: tempExperienceStreamWithChannelInfo.ExperienceStreamGUID,
          Data: {
            CurrentLevelExperiencePageGUID: tempExperienceStreamWithChannelInfo.CurrentLevelExperiencePageGUID || "",
            SyncedAt: syncedAt,
            TimeSpent: tempExperienceStreamWithChannelInfo.timeSpent || "0",
            NumberOfImpressions: tempExperienceStreamWithChannelInfo.numberOfImpressions || "0",
          },
        };
        const userSync = yield call(userSyncApi, formattedUserSyncParams, keycloak);
        const { Confirmation, Response, Message } = userSync.Data;
        if (userSync) {
          if (Confirmation !== 'SUCCESS') {
            helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'minimizeAppSaga', 'Api', '/user/v2/sync_stream', Message);
            throw new Error();
          } else {

          }
        }
      }

      yield put(deviceInfoActions.minimizeAppActionSuccess());

    } else {

      // #3 normal case
      console.log('mini normal case');
      yield put(deviceInfoActions.minimizeAppActionSuccess());
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'minimizeAppSaga', err.type, err.method, err.message);
    yield put(deviceInfoActions.minimizeAppActionSuccess());
    // yield put(loginActions.logoutSuccess());
  }
}


function* getLoadFirstInfo(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const fetchAppObj = yield call(fetchFromLocalAppObj, 'App');
    const userGUID = fetchAppObj.userGUID;
    if (!userGUID) {
      yield put(loginActions.logoutSuccess());
      return;
    }

    // Fetch user data
    const fetchUserDownloadsObj = yield call(
      filterAndfetchDownloadsFromLocalUserObj,
      userGUID,
    );

    const fetchUserbookmarkcardsObj = yield call(
      filterAndfetchBookmarkcardsFromLocalUserObj,
      userGUID,
    );

    const fetchUserBookmarksectionsObj = yield call(
      filterAndfetchBookmarksectionsFromLocalUserObj,
      userGUID,
    );

    // Filtering card only and card with pages
    const cardOnly = fetchUserbookmarkcardsObj.filter(item => item.Experience.ExperienceType === '0');

    const cardWithPages = fetchUserbookmarkcardsObj.filter(item => item.Experience.ExperienceType === '1');

    // Filtering sections based on type
    const pdfArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'EMBED_PDF');
    const editorArray = fetchUserBookmarksectionsObj.filter(item => (item.Type === 'EDITOR' || item.Type === 'ACCORDION'));
    const videoArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'VIDEO');
    const imageArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'IMAGE');
    const linkArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'LINK');
    const h5pArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'H5P');
    const audioArray = fetchUserBookmarksectionsObj.filter(item => item.Type === 'AUDIO');

    const formatLocalData = {
      downloads: fetchUserDownloadsObj,
      bookmarkCards: fetchUserbookmarkcardsObj,
      bookmarkSections: fetchUserBookmarksectionsObj,
      pdfArray,
      editorArray,
      videoArray,
      imageArray,
      linkArray,
      h5pArray,
      cardOnly,
      cardWithPages,
      audioArray,
    };
    yield put(deviceInfoActions.fetchLoadFirstSuccess(formatLocalData));
  } catch (err) {
    Alert.showToast('Something went wrong', 5000);
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getLoadFirstInfo', err.type, err.method, err.message);
    yield put(loginActions.logoutSuccess());
  }
}

export default function* MainSaga() {
  yield takeLatest(globalConstants.GET_APP_INFO_REQUEST, getAppInfo);
  yield takeLatest(globalConstants.GET_USER_INFO_REQUEST, getUserInfo);
  yield takeLatest(globalConstants.GET_HEARTBEAT_V0_REQUEST, heartbeatV0Saga);
  yield takeLatest(globalConstants.GET_HEARTBEAT_REQUEST, heartbeatSaga);
  yield takeLatest(globalConstants.SET_APP_LANGUAGE_REQUEST, setLanguageSaga);
  yield takeLatest(globalConstants.SET_APP_LANGUAGE_MODAL_REQUEST, setLanguageModalSaga);
  yield takeLatest(globalConstants.LOGIN_REQUEST, loginSaga);
  yield takeLatest(globalConstants.LOGOUT_REQUEST, logoutSaga);
  yield takeLatest(globalConstants.ANONYMOUS_LOGIN_REQUEST, anonymousLoginSaga);

  yield takeLatest(globalConstants.CLOSE_CARD_ONLY_MODAL_REQUEST, closeCardOnlyModalSaga);
  yield takeLatest(globalConstants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_REQUEST, closeVideoCardOnlySaga);

  yield takeLatest(globalConstants.DX_MINIMIZE_APP_REQUEST, minimizeAppSaga);

  yield takeLatest(globalConstants.GET_FIRST_LOAD_REQUEST, getLoadFirstInfo);
}

const _removeDuplicates = (arr) => {
  const output = [];
  arr.forEach(item1 => {
    let filterArr = output.filter(item2 => item2.ExperienceStreamGUID == item1.ExperienceStreamGUID);
    if (!filterArr.length) {
      output.push(item1);
    }
  })
  return output;
}