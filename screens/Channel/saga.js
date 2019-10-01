import {
  call, put, takeLatest, select,
} from 'redux-saga/effects';
import { AsyncStorage } from 'react-native';

// Library
import Storage from 'react-native-storage';

// Actions
import actions from './actions';
import deviceInfoActions from '../../actions/DeviceInfo';
import loginActions from '../Login/actions';

// Constants
import constants from './constants';

// Api
import { dxApi } from '../../helpers/apiManager';

// Utils
import Alert from '../../utils/alert';
import * as helpers from '../../helpers';
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
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (notFoundError)',
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
            method: 'updateUserLocalstorageByUserGUID',
            message: 'Cannot save into localstorage (ExpiredError)',
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

// Api call for channel list
export const postChannelListApi = (params, keycloak) => dxApi('/user/channel_list_v2', params, true, keycloak);

function* postChannelListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const channelReducer = yield select(selectors.channel);
  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    // Update timestamp in params based on loadmore or refres
    let formattedParams = action.payload.data;
    let firstLoadTimeStamp;
    let pullupRefreshTimeStamp;

    if (formattedParams.isFirstFetch) {

      // Add current current Timestamp for first load
      formattedParams.Extra.TimeStamp = helpers.getCurrentDateTime();

      firstLoadTimeStamp = formattedParams.Extra.TimeStamp;
      pullupRefreshTimeStamp = formattedParams.Extra.TimeStamp;
    } else if (action.payload.pullupRefresh) {
     
      // Add current current Timestamp for pullup
      formattedParams.Extra.TimeStamp = channelReducer.channelPullupRefreshTimeStamp;
      pullupRefreshTimeStamp = helpers.getCurrentDateTime() 
    } else {

      // USe reducer timeStamp
      formattedParams.Extra.TimeStamp = channelReducer.channelLoadmoreTimeStamp
      firstLoadTimeStamp = channelReducer.channelLoadmoreTimeStamp;
      pullupRefreshTimeStamp = channelReducer.channelPullupRefreshTimeStamp;
    }
    
    const channels = yield call(postChannelListApi, formattedParams, keycloak);

    const { Confirmation, Response, Message } = channels.Data;
    // console.log('fetch channel list api', channels);

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (channels.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', channels.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(channels.keycloak));
      }

      yield put(actions.postChannelListSuccess(Response, action.payload.data.isSearch, action.payload.pullupRefresh, firstLoadTimeStamp, pullupRefreshTimeStamp));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postChannelListSaga', 'Api', '/user/channel_list_v2', Message);
      yield put(actions.postChannelListFailure(Message));
      Alert.showToast(Message, 1000);
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postChannelListSaga', err.type, err.method, err.message);
    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}

// Api call for channel list
export const subscribeChannelApi = (params, keycloak) => dxApi('/user/subscribe_channel', params, true, keycloak);

function* postChannelSubscribeSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const subscribeChannel = yield call(subscribeChannelApi, action.payload, keycloak);

    const { Confirmation, Response, Message } = subscribeChannel.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (subscribeChannel.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', subscribeChannel.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(subscribeChannel.keycloak));
      }

      yield put(actions.postChannelSubscribeSuccess(subscribeChannel));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postChannelSubscribeSaga', 'Api', '/user/subscribe_channel', Message);
      yield put(actions.postChannelSubscribeFailure(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postChannelSubscribeSaga', err.type, err.method, err.message);
    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}

// Api call for channel list
export const subscribeInviteChannelApi = (params, keycloak) => dxApi('/user/subscribe_invite_channel', params, true, keycloak);

function* postSubscribeInviteChannelSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    // Getting language labels
    const langLabels = yield select(selectors.languageLabels);
    const languageCheck = langLabels || [];
    const channelSubscribeLabel = languageCheck.Message ? languageCheck.Message : [];
    let subscribedLabel;
    let failSubscribeLabel;
    let dupSubscribeLabel;

    channelSubscribeLabel.map((label) => {
      if (label.Type === 'PASS_CODE_SUCCESS') {
        subscribedLabel = label.Content;
      }
      if (label.Type === 'PASS_CODE_ERROR') {
        failSubscribeLabel = label.Content;
      }
      if (label.Type === 'PASS_CODE_DUPLICATE_ERROR') {
        dupSubscribeLabel = label.Content;
      }
      if (label.Type === 'PASS_CODE_REQUIRED_ERROR') {
        emptyPromoInputLabel = label.Content;
      }
    });

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const subscribeChannel = yield call(subscribeInviteChannelApi, action.payload, keycloak);

    const { Confirmation, Response, Message } = subscribeChannel.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (subscribeChannel.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', subscribeChannel.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(subscribeChannel.keycloak));
      }

      yield put(actions.postSubscribeInviteChannelSuccess(subscribeChannel));
      Alert.showToast(subscribedLabel, 1000, 'success');

    } else {

      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'postSubscribeInviteChannelSaga', 'Api', '/user/subscribe_invite_channel', Message);

      const erorrLabels = Message === 'Experience channel not found' ? failSubscribeLabel : Message === 'Invitation channel already subscribed' ? dupSubscribeLabel : null;
      Alert.showToast(erorrLabels);
      yield put(actions.postSubscribeInviteChannelFailure(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'postSubscribeInviteChannelSaga', err.type, err.method, err.message);
    // Logout if api fails
    // yield put(loginActions.logoutRequest());
  }
}

export default function* ChannelSaga() {
  yield takeLatest(constants.DX_POST_CHANNEL_LIST_REQUEST, postChannelListSaga);
  yield takeLatest(constants.DX_POST_CHANNEL_SUBSCRIBE_REQUEST, postChannelSubscribeSaga);
  yield takeLatest(constants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_REQUEST, postSubscribeInviteChannelSaga);
}
