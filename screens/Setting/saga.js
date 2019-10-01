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
import deviceInfoActions from '../../actions/DeviceInfo';
import loginActions from '../Login/actions';

import constants from './constants';

// Api
import { dxApi } from '../../helpers/apiManager';
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

const addAppDataToLocalStoage = async (key, isNightMode) => {
  try {
    const getItem = await storage.load({
      key
    });

    getItem.isNightMode = isNightMode;

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
              isNightMode
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
              isNightMode
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

// Update isNightMOde
export const postIsNightModeApi = (params, keycloak) => dxApi('/user/update_night_mode', params, true, keycloak);

function* updateNightMode(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const formattedParams = {
      IsNightMode: action.payload.mode === true ? '1' : '0',
    };

    // Add IsNightMode to localStorage
    yield call(addAppDataToLocalStoage, 'App', action.payload.mode)

    // OFFLINE
    if (!deviceInfo.internetInfo.isConnected) {
      yield put(actions.changeNightModeSuccess(action.payload.mode));
      return;
    }

    const response = yield call(postIsNightModeApi, formattedParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }
      yield put(actions.changeNightModeSuccess(action.payload.mode));
      
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'updateNightMode', 'Api', '/user/update_night_mode', Message);
      yield put(actions.changeNightModeSuccess(action.payload.mode));

    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'updateNightMode', err.type, err.method, err.message);
    yield put(actions.changeNightModeSuccess(action.payload.mode));

    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}

export default function* SettingSaga() {
  yield takeLatest(constants.DX_TOGGLE_NIGHT_MODE_REQUEST, updateNightMode);
}
