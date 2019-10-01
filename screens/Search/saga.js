
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

// Constants
import constants from './constants';

// Config
import config from '../../config';

// Selector
import * as selectors from '../../utils/selector';

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

// Tags list
const getTagsListApi = (params, keycloak) => dxApi('/user/tag_list', params, true, keycloak);

function* getTagsListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);

  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(getTagsListApi, action.payload.tagListParams, keycloak);

    const {
      Confirmation,
      Response,
      Message
    } = response.Data;

    if (Confirmation === 'SUCCESS') {

      yield put(actions.getTagListSuccess(Response, action.payload.tagListParams.isSearch));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getTagsListSaga', 'Api', '/user/tag_list', Message);
      yield put(actions.getTagListErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getTagsListSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// Channels list
const getChannelListApi = (params, keycloak) => dxApi('/user/channel_list', params, true, keycloak);

function* getChannelListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);

  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    let tempResponse;

    if (action.payload.channelListParams.isSearch && !action.payload.channelListParams.Extra.SearchField) {
      tempResponse = {
        ExperienceChannels: [],
        TotalRecord: null,
      }
      yield put(actions.getChannelListSuccess(tempResponse, action.payload.channelListParams.isSearch));
    } else {
      const response = yield call(getChannelListApi, action.payload.channelListParams, keycloak);

      const {
        Confirmation,
        Response,
        Message
      } = response.Data;
      tempResponse = Response;
      if (Confirmation === 'SUCCESS') {
        yield put(actions.getChannelListSuccess(tempResponse, action.payload.channelListParams.isSearch));
      } else {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getChannelListSaga', 'Api', '/user/channel_list', Message);
        yield put(actions.getChannelListErrors(Message));
      }
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getChannelListSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// Content list
const getContentListApi = (params, keycloak) => dxApi('/user/stream_list_v3', params, true, keycloak);

function* getContentListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);

  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };


    let tempResponse;

    if (action.payload.contentListParams.isSearch && !action.payload.contentListParams.Extra.SearchField) {
      tempResponse = {
        ExperienceStreams: [],
        TotalRecord: null,
      }

      yield put(actions.getContentListSuccess(tempResponse, action.payload.contentListParams.isSearch));
    } else {
      const response = yield call(getContentListApi, action.payload.contentListParams, keycloak);

      const {
        Confirmation,
        Response,
        Message
      } = response.Data;

      tempResponse = Response;

      if (Confirmation === 'SUCCESS') {
        yield put(actions.getContentListSuccess(tempResponse, action.payload.contentListParams.isSearch));
      } else {
        helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getContentListSaga', 'Api', '/user/stream_list_v3', Message);
        yield put(actions.getContentListErrors(Message));
      }
    }

  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getContentListSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}

// Content list
const getTagExpListApi = (params, keycloak) => dxApi('/user/stream_list_v4', params, true, keycloak);

function* getTagExpListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const downloadReducer = yield select(selectors.download)
  try {
    const keycloak = {
      isSkipLoginSuccess: deviceInfo.isSkipLoginSuccess,
      deviceId: deviceInfo.deviceId,
      expiryDate: deviceInfo.expiryDate,
      token: deviceInfo.token,
      refreshToken: deviceInfo.refreshToken,
    };

    const response = yield call(getTagExpListApi, action.payload.tagParams, keycloak);

    const {
      Confirmation,
      Response,
      Message
    } = response.Data;

    if (Confirmation === 'SUCCESS') {

      yield put(actions.getTagExpSuccess(Response, downloadReducer.storageDownloads));
    } else {
      helpers.crashlyticsRecord(deviceInfo.crashlytics, 'Api', 'getTagExpListSaga', 'Api', '/user/stream_list_v4', Message);
      yield put(actions.getTagExpErrors(Message));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getTagExpListSaga', err.type, err.method, err.message);
    // yield put(loginActions.logoutRequest());
  }
}


function* getSearchListSaga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const bookmarkReducer = yield select(selectors.bookmark);
  try {
    const searchReducer = yield select(selectors.search);
    let response = JSON.parse(JSON.stringify(searchReducer.sectionListArr));

    if (response.length) {
      let formattedResponse;
      let tempCurentTabIndex = action.payload.searchParams.currentTabIndex;

      // Filter Based on the Tab
      if (tempCurentTabIndex === 0) {
        formattedResponse = response;
      } else if (tempCurentTabIndex === 1) {
        formattedResponse = handleSectionTypeSearch(response, "IMAGE")
      } else if (tempCurentTabIndex === 2) {
        formattedResponse = handleSectionTypeSearch(response, "VIDEO")
      } else if (tempCurentTabIndex === 3) {
        formattedResponse = handleSectionTypeSearch(response, "AUDIO")
      } else if (tempCurentTabIndex === 4) {
        formattedResponse = handleSectionTypeSearch(response, "EMBED_PDF")
      } else if (tempCurentTabIndex === 5) {
        formattedResponse = handleSectionTypeSearch(response, "EDITOR");
        const accordionResponse = handleSectionTypeSearch(response, "ACCORDION");
        formattedResponse = formattedResponse.concat(accordionResponse);
      } else if (tempCurentTabIndex === 6) {
        formattedResponse = handleSectionTypeSearch(response, "LINK")
      } else if (tempCurentTabIndex === 7) {
        formattedResponse = handleSectionTypeSearch(response, "H5P")
      } else if (!tempCurentTabIndex) {
        formattedResponse = [];
      } 
      let totalRecord = formattedResponse.length;
      formattedResponse = formattedResponse.slice(action.payload.searchParams.Offset).slice(0, action.payload.searchParams.Limit);
      yield put(actions.getSearchDataListSuccess(formattedResponse, action.payload.searchParams.isSearch, totalRecord, bookmarkReducer.bookmarks.sections));
    }
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getSearchListSaga', err.type, err.method, err.message);
    yield put(actions.getSearchDataListErrors(err));
  }
}


function* getSearchListV2Saga(action) {
  const deviceInfo = yield select(selectors.deviceInfo);
  const bookmarkReducer = yield select(selectors.bookmark);
  try {
    const formattedResponse = action.payload.searchParams.output;
    yield put(actions.getSearchDataListV2Success(formattedResponse, action.payload.searchParams.isSearch, bookmarkReducer.bookmarks.sections));
  } catch (err) {
    helpers.crashlyticsRecord(deviceInfo.crashlytics, 'LocalStorage', 'getSearchListSaga', err.type, err.method, err.message);
    yield put(actions.getSearchDataListV2Errors(err));
  }
}


export default function* SearchSaga() {
  yield takeLatest(constants.DX_GET_TAGS_LIST_REQUEST, getTagsListSaga);
  yield takeLatest(constants.DX_GET_CHANNELS_LIST_REQUEST, getChannelListSaga);
  yield takeLatest(constants.DX_GET_CONTENT_LIST_REQUEST, getContentListSaga);
  yield takeLatest(constants.DX_GET_TAG_EXP_REQUEST, getTagExpListSaga);
  yield takeLatest(constants.DX_GET_SEARCH_LIST_REQUEST, getSearchListSaga);
  yield takeLatest(constants.DX_GET_SEARCH_LIST_V2_REQUEST, getSearchListV2Saga);
}

const handleSectionTypeSearch = (sectionListArr, SearchType) => {
  let output = [];
  for (let i = 0; i < sectionListArr.length; i++) {
    let item = sectionListArr[i];
    if (item.Type == SearchType) {
      output.push(item);
    }
  }
  return output;
}
