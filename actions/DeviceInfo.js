import constants from '../constants';

export default {
  getDeviceID: (deviceId, systemName, crashlytics) => ({
    type: constants.GET_USER_PHONE_UNIQUE_ID,
    payload: { deviceId, systemName, crashlytics },
  }),

  getInternetInfo: isconnected => ({
    type: constants.GET_INTERNET_INFO,
    payload: isconnected,
  }),

  fetchAppInfoRequest: userData => ({
    type: constants.GET_APP_INFO_REQUEST,
    payload: {
      userData,
    },
  }),

  fetchAppInfoSuccess: (appVersion, localAppData) => ({
    type: constants.GET_APP_INFO_SUCCESS,
    payload: { appVersion, localAppData },
  }),

  fetchAppInfoErrors: data => ({
    type: constants.GET_APP_INFO_ERRORS,
    payload: data,
  }),

  fetchUserInfoRequest: userGUID => ({
    type: constants.GET_USER_INFO_REQUEST,
    payload: userGUID,
  }),

  fetchUserInfoSuccess: localData => ({
    type: constants.GET_USER_INFO_SUCCESS,
    payload: { localData },
  }),

  fetchUserInfoErrors: data => ({
    type: constants.GET_USER_INFO_ERRORS,
    payload: data,
  }),

  heartbeatV0Request: appVersion => ({
    type: constants.GET_HEARTBEAT_V0_REQUEST,
    payload: appVersion,
  }),

  heartbeatV0Success: (appVersion, data, userLangInactive) => ({
    type: constants.GET_HEARTBEAT_V0_SUCCESS,
    payload: {
      appVersion,
      data,
      userLangInactive,
    },
  }),

  heartbeatV0VersionMismatch: (appVersion, data) => ({
    type: constants.GET_HEARTBEAT_V0_VERSION_MISMATCH,
    payload: {
      appVersion,
      data,
    },
  }),

  heartbeatV0Errors: error => ({
    type: constants.GET_HEARTBEAT_V0_ERRORS,
    payload: { error },
  }),

  heartbeatRequest: appVersion => ({
    type: constants.GET_HEARTBEAT_REQUEST,
    payload: appVersion,
  }),

  heartbeatSuccess: (appVersion, data, userLangInactive,
    syncDownloadArr, syncUpdateDownloadArr, syncDeleteDownloadArr,
    syncBookmarkCardArr, syncUpdateBookmarkCardArr, syncDeleteBookmarkCardArr,
    syncBookmarkSectionArr, syncDeleteBookmarkSectionArr) => ({
      type: constants.GET_HEARTBEAT_SUCCESS,
      payload: {
        appVersion,
        data,
        userLangInactive,

        syncDownloadArr,
        syncUpdateDownloadArr,
        syncDeleteDownloadArr,

        syncBookmarkCardArr,
        syncUpdateBookmarkCardArr,
        syncDeleteBookmarkCardArr,

        syncBookmarkSectionArr,
        syncDeleteBookmarkSectionArr,
      },
    }),

  heartbeatVersionMismatch: (appVersion, data) => ({
    type: constants.GET_HEARTBEAT_VERSION_MISMATCH,
    payload: {
      appVersion,
      data,
    },
  }),

  heartbeatErrors: error => ({
    type: constants.GET_HEARTBEAT_ERRORS,
    payload: { error },
  }),

  getAppState: appState => ({
    type: constants.GET_APPSTATE,
    payload: appState,
  }),

  languageModalOpen: () => ({
    type: constants.OPEN_LANGUAGE_MODAL,
  }),

  languagePageOpen: () => ({
    type: constants.OPEN_LANGUAGE_PAGE,
  }),

  languagePageClose: () => ({
    type: constants.CLOSE_LANGUAGE_PAGE,
  }),

  setAppLanguageRequest: (languageGUID, isLanguageModal) => ({
    type: constants.SET_APP_LANGUAGE_REQUEST,
    payload: { languageGUID, isLanguageModal },
  }),

  setAppLanguageSuccess: (localData, isLanguageModal) => ({
    type: constants.SET_APP_LANGUAGE_SUCCESS,
    payload: { localData, isLanguageModal },
  }),

  setAppLanguageErrors: errors => ({
    type: constants.SET_APP_LANGUAGE_ERRORS,
    payload: errors,
  }),

  setAppLanguageModalRequest: languageData => ({
    type: constants.SET_APP_LANGUAGE_MODAL_REQUEST,
    payload: languageData,
  }),

  setAppLanguageModalSuccess: localData => ({
    type: constants.SET_APP_LANGUAGE_MODAL_SUCCESS,
    payload: localData,
  }),

  setAppLanguageModalErrors: errors => ({
    type: constants.SET_APP_LANGUAGE_MODAL_ERRORS,
    payload: errors,
  }),

  selectedLanguageSuccess: languageData => ({
    type: constants.SELECT_LANGUAGE_SUCCESS,
    payload: languageData,
  }),


  autoSetLanguageSuccess: (appVersion, languageData, isLoggedIn,
    syncDownloadArr, syncUpdateDownloadArr, syncDeleteDownloadArr,
    syncBookmarkCardArr, syncUpdateBookmarkCardArr, syncDeleteBookmarkCardArr,
    syncBookmarkSectionArr, syncDeleteBookmarkSectionArr) => ({
      type: constants.AUTO_SET_LANGUAGE,
      payload: {
        appVersion,
        languageData,
        isLoggedIn,
        syncDownloadArr,
        syncUpdateDownloadArr,
        syncDeleteDownloadArr,

        syncBookmarkCardArr,
        syncUpdateBookmarkCardArr,
        syncDeleteBookmarkCardArr,

        syncBookmarkSectionArr,
        syncDeleteBookmarkSectionArr,
      },
    }),

  minimizeAppActionRequest: () => ({
    type: constants.DX_MINIMIZE_APP_REQUEST,
  }),

  minimizeAppActionSuccess: () => ({
    type: constants.DX_MINIMIZE_APP_SUCCESS,
  }),

  minimizeAppActionErrors: errors => ({
    type: constants.DX_MINIMIZE_APP_ERRORS,
    payload: {
      errors,
    },
  }),

  refreshTokenUpdate: keycloak => ({
    type: constants.DX_REFRESH_TOKEN_UPDATE,
    payload: { keycloak },
  }),

  openHomePage: () => ({
    type: constants.DX_OPEN_HOME_PAGE,
    payload: {},
  }),

  openExplorePage: () => ({
    type: constants.DX_OPEN_EXPLORE_PAGE,
    payload: {},
  }),

  openBookmarkPage: () => ({
    type: constants.DX_OPEN_BOOKMARK_PAGE,
    payload: {},
  }),


  // Load first flow
  fetchLoadFirstRequest: () => ({
    type: constants.GET_FIRST_LOAD_REQUEST,
    payload: {},
  }),

  fetchLoadFirstSuccess: localData => ({
    type: constants.GET_FIRST_LOAD_SUCCESS,
    payload: { localData },
  }),

  fetchLoadFirstErrors: errors => ({
    type: constants.GET_FIRST_LOAD_ERRORS,
    payload: {
      errors
    },
  }),

};
