
import {
  call, put, takeLatest, select,
} from 'redux-saga/effects';

import {
  AsyncStorage,
} from 'react-native';

// Library
import Storage from 'react-native-storage';

// Actions
import actions from './actions';
import deviceInfoActions from '../../actions/DeviceInfo';

// Constants
import constants from './constants';

// Config
import config from '../../config';

// Selector
import * as selectors from '../../utils/selector';

// Action
import loginActions from '../Login/actions';

// Api
import * as helpers from '../../helpers';
import { dxApi } from '../../helpers/apiManager';

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

// featured
const featuredApi = (params, keycloak) => dxApi('/user/stream_list', params, true, keycloak);
const featuredInnerApi = (params, keycloak) => dxApi('/user/stream_list_inner', params, true, keycloak);

function* getFeaturedSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const nav = yield select(selectors.nav);
  try {
    const downloadReducer = yield select(selectors.download);
    const bookmarkReducer = yield select(selectors.bookmark);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(nav.currentTab == 'Home' ? featuredApi : featuredInnerApi, action.payload.featuredParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      update_experience_streams_is_download(action.payload.downloads, Response.ExperienceStreams);
      yield put(actions.getFeaturedCardsSuccess(response.Data, downloadReducer.storageDownloads, bookmarkReducer.bookmarks.cards, action.payload.featuredParams.isSearch));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getFeaturedSaga', 'Api', '/user/stream_list', Message);
      yield put(actions.getFeaturedCardsErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getFeaturedSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// Most popular
const mostPopularApi = (params, keycloak) => dxApi('/user/stream_list_v2', params, true, keycloak);
const mostPopularInnerApi = (params, keycloak) => dxApi('/user/stream_list_v2_inner', params, true, keycloak);

function* getmostPopularSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const nav = yield select(selectors.nav);
  try {
    const downloadReducer = yield select(selectors.download);
    const bookmarkReducer = yield select(selectors.bookmark);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(nav.currentTab == 'Home' ? mostPopularApi : mostPopularInnerApi, action.payload.mostPopularParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      update_experience_streams_is_download(action.payload.downloads, Response.ExperienceStreams);

      yield put(actions.getMostPopularSuccess(response.Data, downloadReducer.storageDownloads, bookmarkReducer.bookmarks.cards, action.payload.mostPopularParams.isSearch));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getmostPopularSaga', 'Api', '/user/stream_list_v2', Message);
      yield put(actions.getMostPopularErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getmostPopularSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// trending
const trendingApi = (params, keycloak) => dxApi('/user/stream_list_v2', params, true, keycloak);
const trendingInnerApi = (params, keycloak) => dxApi('/user/stream_list_v2_inner', params, true, keycloak);

function* getTrendingSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const nav = yield select(selectors.nav);

  try {
    const downloadReducer = yield select(selectors.download);
    const bookmarkReducer = yield select(selectors.bookmark);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(nav.currentTab == 'Home' ?  trendingApi : trendingInnerApi, action.payload.trendingParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      // If token refresh update the local storage
      if (response.isTokenRefreshed) {
        yield call(updateTokenDataLocalStorage, 'App', response.keycloak);
        yield put(deviceInfoActions.refreshTokenUpdate(response.keycloak));
      }

      update_experience_streams_is_download(action.payload.downloads, Response.ExperienceStreams);

      yield put(actions.getTrendingSuccess(response.Data, downloadReducer.storageDownloads, bookmarkReducer.bookmarks.cards, action.payload.trendingParams.isSearch));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getTrendingSaga', 'Api', '/user/stream_list_v2', Message);
      yield put(actions.getTrendingErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getTrendingSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// New releases
const newReleasesApi = (params, keycloak) => dxApi('/user/stream_list_v2', params, true, keycloak);
const newReleasesInnerApi = (params, keycloak) => dxApi('/user/stream_list_v2_inner', params, true, keycloak);

function* getNewReleasesSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const nav = yield select(selectors.nav);
  
  try {
    const downloadReducer = yield select(selectors.download);
    const bookmarkReducer = yield select(selectors.bookmark);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(nav.currentTab == 'Home' ? newReleasesApi : newReleasesInnerApi, action.payload.newReleaseParams, keycloak);

    const { Confirmation, Response, Message } = response.Data;

    if (Confirmation === 'SUCCESS') {
      update_experience_streams_is_download(action.payload.downloads, Response.ExperienceStreams);

      yield put(actions.getNewReleaseSuccess(response.Data, downloadReducer.storageDownloads, bookmarkReducer.bookmarks.cards, action.payload.newReleaseParams.isSearch));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getNewReleasesSaga', 'Api', '/user/stream_list_v2', Message);
      yield put(actions.getNewReleaseErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getNewReleasesSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// Get channel exp
const fetchExperienceStreamsApi = (params, keycloak) => dxApi('/user/stream_list', params, true, keycloak);

const fetchChannelExp = async (experienceChannels, languageGUID, keycloak, downloads) => {

  let tasks = [];
  experienceChannels.map((channel) => {
    const formattedParams = {
      Limit: "10",
      Offset: "0",
      ChannelLanguageGUID: languageGUID,
      Extra: {
        ExperienceChannelGUID: channel.ExperienceChannelGUID
      }
    };
    let task = new Promise(async (resolve, reject) => {
      try {
        const response = await fetchExperienceStreamsApi(formattedParams, keycloak);
        const {
          Confirmation,
          Response
        } = response.Data;
        if (Confirmation === 'SUCCESS') {
          update_experience_streams_is_download(downloads, Response.ExperienceStreams);

          channel.ExperienceStreams = Response.ExperienceStreams;
          resolve(channel);
          return;
        } else {
          resolve(channel);
          return;
        }
      } catch (error) {
        resolve(channel);
        return;
      }
    })
    tasks.push(task);
  })

  await Promise.all(tasks);
  return experienceChannels;
}

// My channels list
const getMyChannelsListApi = (params, keycloak) => dxApi('/user/channel_list_v3', params, true, keycloak);

function* getMyChannelsListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  try {
    const downloadReducer = yield select(selectors.download);
    const bookmarkReducer = yield select(selectors.bookmark);

    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(getMyChannelsListApi, action.payload.myChannelParams, keycloak, action.payload.downloads);

    const {
      Confirmation,
      Response,
      Message
    } = response.Data;
    
    if (Confirmation === 'SUCCESS') {
      // Remove feaured
      const formattedResponse = Response.ExperienceChannels.filter(item => item.ChannelType !== "3");
  
      // Fetch channel exp's
      const updatedRes = yield call(fetchChannelExp, formattedResponse, deviceInfo.languageGUID, keycloak)
      yield put(actions.getMyChannelsListSuccess(updatedRes, downloadReducer.storageDownloads, bookmarkReducer.bookmarks.cards, action.payload.myChannelParams.isSearch, Response.TotalRecord));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getMyChannelsListApi', 'Api', '/user/channel_list_v3', Message);
      yield put(actions.getMyChannelsListErrors(Message));
    }
  } catch (err) {
    console.log("err: ", err);
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getMyChannelsListSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

export default function* HomeSaga() {
  yield takeLatest(constants.DX_GET_FEATURED_CARDS_REQUEST, getFeaturedSaga);
  yield takeLatest(constants.DX_GET_NEW_RELEASES_CARDS_REQUEST, getNewReleasesSaga);
  yield takeLatest(constants.DX_GET_MOST_POPULAR_CARDS_REQUEST, getmostPopularSaga);
  yield takeLatest(constants.DX_GET_TRENDING_CARDS_REQUEST, getTrendingSaga);
  yield takeLatest(constants.DX_GET_MY_CHANNELS_LIST_REQUEST, getMyChannelsListSaga)
}

const update_experience_streams_is_download = (downloads, experience) => {
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
      }
    }
  }
};
