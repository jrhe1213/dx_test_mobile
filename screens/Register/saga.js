import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import {
  AsyncStorage,
} from 'react-native';
import Storage from 'react-native-storage';

import actions from './actions';
import loginActions from '../Login/actions';

import constants from './constants';

// Api
import {
  dxApi,
} from '../../helpers/apiManager';
import * as helpers from '../../helpers';

// Utils
import Alert from '../../utils/alert';
import * as selectors from '../../utils/selector';

const storage = new Storage({
  // maximum capacity, default 1000
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: false,
  sync: {},
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

// Email check
export const emailCheckApi = (params, keycloak) => dxApi('/user/sync_email', params, true, keycloak);

function* emailCheckSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const languageCheck = langLabels || [];
    const loginScreenLabel = languageCheck.RegisterScreen ? languageCheck.RegisterScreen : [];

    let emailError3Label;

    loginScreenLabel.map((label) => {
      if (label.Type === 'EMAIL_ERROR_3') {
        emailError3Label = label.Content;
      }
    });

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const formattedParams = {
      Email: action.payload.email,
    };

    if (deviceInfo.internetInfo.isConnected) {
      const response = yield call(emailCheckApi, formattedParams, keycloak);

      const { Confirmation, Response, Message } = response.Data;

      if (Confirmation === 'SUCCESS') {
        // If token refresh update the local storage
        if (response.isTokenRefreshed) {
          yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
          yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
        }
        yield put(actions.handleEmailCheckSuccess(Message));
      } else {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'emailCheckSaga', 'Api', '/user/sync_email', Message);
        yield put(actions.handleEmailCheckErrors(emailError3Label));
      }
    } else {
      yield put(actions.handleEmailCheckSuccess('offline'));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'emailCheckSaga', err.type, err.method, err.message);
    yield put(actions.handleEmailCheckSuccess());

    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}


// Register
const logoutAndClearLocalData = async (key) => {
  try {
    const getItem = await storage.load({
      key,
    });
    getItem.isAnonymousLogin = false;
    getItem.isAuthenticated = false;
    getItem.expiryDate = null;
    getItem.token = null;
    getItem.refreshToken = null;
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
export const migrateAnonymousUserApi = (params, keycloak) => dxApi('/user/migrate_anonymous_user', params, true, keycloak);

function* registerSaga(action) {
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

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const {
      firstName,
      lastName,
      email,
      password,
    } = action.payload.authData;
    const formattedParams = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
    };

    const response = yield call(migrateAnonymousUserApi, formattedParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      yield call(logoutAndClearLocalData, 'App');
      Alert.showToast(loginMsgLabel, 2000, 'success');
      yield put(actions.registerSuccess(Message));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'registerSaga', 'Api', '/user/migrate_anonymous_user', Message);
      yield put(actions.registerErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'registerSaga', err.type, err.method, err.message);

    yield put(actions.registerSuccess(''));

    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}

export default function* RegisterSaga() {
  yield takeLatest(constants.DX_EMAIL_CHECK_REQUEST, emailCheckSaga);
  yield takeLatest(constants.DX_REGISTER_REQUEST, registerSaga);
}
