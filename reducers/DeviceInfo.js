import constants from '../constants';
import registerConstants from '../screens/Register/constants';
import feedConstants from '../screens/Feed/constants';
import bookmarkConstants from '../screens/Bookmark/constants';
import channelConstants from '../screens/Channel/constants';
import homeConstants from '../screens/Home/constants';
import downloadConstants from '../screens/Download/constants';
import settingConstants from '../screens/Setting/constants';
import searchConstants from '../screens/Search/constants';

const initialState = {

  crashlytics: null,

  isFetching: false, // auto api call
  isRequesting: false, // user interaction api call

  loginType: null,
  reopenApp: false,
  offlineReopenApp: false,
  offlineUserGUID: null,

  isSkipLoginSuccess: false,
  deviceId: null,
  userDeviceGUID: null,
  internetInfo: {
    isConnected: true,
  },
  isLoaded: false,
  isForcedContentUpdate: false,
  systemName: null,
  currentAppVersion: null,
  newAppVersion: null,
  storeConfig: {},
  languages: [],
  isUserInfoFetched: false,
  appState: null,
  languageGUID: null,
  language: null,
  selectedLanguage: null,
  links: [],
  isAppInfoFetched: false,
  isHeartBeatV0Done: false,
  isHeartBeatDone: false,
  isAuthenticated: false,
  isLanguageSetSuccess: false,
  isLoggingIn: false,
  token: null,
  refreshToken: null,
  expiryDate: null,
  orgImageGUID: null,
  isLoginRequired: false,
  isSelfRegister: false,
  isAnonymous: false,
  isActivePasscode: false,


  syncDownloadArr: [],
  syncUpdateDownloadArr: [],
  syncDeleteDownloadArr: [],
  syncBookmarkCardArr: [],
  syncUpdateBookmarkCardArr: [],
  syncDeleteBookmarkCardArr: [],
  syncBookmarkSectionArr: [],
  syncDeleteBookmarkSectionArr: [],
  isSyncing: false,

  errors: {},

  isFetchFirstLoadDone: false,

  isTagEnable: false,

  isFeaturedEnable: false,
  isMostPopularEnable: false,
  isNewReleaseEnable: false,
  isTrendingEnable: false,
  isMyChannelEnable: false,
};

export default (state = initialState, action) => {
  let tempOfflineReopenApp;
  let tempIsHeartBeatDone;
  let tempIsHeartBeatV0Done;

  switch (action.type) {

    case constants.GET_FIRST_LOAD_SUCCESS:
      return {
        ...state,
        isFetchFirstLoadDone: true
      };

    case constants.GET_USER_PHONE_UNIQUE_ID:
      return {
        ...state,
        deviceId: action.payload.deviceId,
        systemName: action.payload.systemName,
        crashlytics: action.payload.crashlytics,
      };

    case constants.GET_INTERNET_INFO:
      return {
        ...state,
        internetInfo: {
          isConnected: action.payload,
        },
        isHeartBeatDone: !action.payload ? false : state.isHeartBeatDone,
      };

    // Fetch App Info
    case constants.GET_APP_INFO_REQUEST:
      return {
        ...state,
      };

    case constants.GET_APP_INFO_SUCCESS:

      tempOfflineReopenApp = false;
      if (!action.payload.localAppData.isConnected
        && action.payload.localAppData.token) {
        tempOfflineReopenApp = true;
      }
      return {
        ...state,
        isAppInfoFetched: true,
        languageGUID: action.payload.localAppData.languageGUID,
        language: action.payload.localAppData.language,
        selectedLanguage: action.payload.localAppData.language,
        currentAppVersion: action.payload.appVersion,
        isSkipLoginSuccess: action.payload.localAppData.isAnonymousLogin,

        isAuthenticated: action.payload.localAppData.isAuthenticated,
        token: action.payload.localAppData.token,
        refreshToken: action.payload.localAppData.refreshToken,
        expiryDate: action.payload.localAppData.expiryDate,
        loginType: action.payload.localAppData.loginType,

        reopenApp: !!action.payload.localAppData.token,
        offlineReopenApp: tempOfflineReopenApp,
        offlineUserGUID: action.payload.localAppData.userGUID,

        // #
        userDeviceGUID: action.payload.localAppData.userDeviceGUID,
        isLoginRequired: action.payload.localAppData.isLoginRequired,
        isSelfRegister: action.payload.localAppData.isSelfRegister,
        isAnonymous: action.payload.localAppData.isAnonymous,
        isActivePasscode: action.payload.localAppData.isActivePasscode,
      };

    case constants.GET_APP_INFO_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    case constants.GET_HEARTBEAT_V0_REQUEST:
      return {
        ...state,
        isFetching: true,
      };

    case constants.GET_HEARTBEAT_V0_ERRORS:
      return {
        ...state,
        isFetching: false,
      };

    case constants.GET_HEARTBEAT_V0_SUCCESS:
      // User language not active
      if (action.payload.userLangInactive) {
        return {
          ...state,
          currentAppVersion: action.payload.appVersion,
          languages: action.payload.data.Languages,
          storeConfig: action.payload.data.StoreConfig,
          isHeartBeatV0Done: true,
          selectedLanguage: action.payload.data.DefaultLanguage,
          languageGUID: null,
          links: action.payload.data.Links,
          orgImageGUID: action.payload.data.OrgImageGUID,
          isLoaded: true,
          isLoginRequired: action.payload.data.IsLoginRequired == 1,
          isSelfRegister: action.payload.data.IsSelfRegister == 1,
          isAnonymous: action.payload.data.IsAnonymous == 1,
          isActivePasscode: action.payload.data.IsActivePasscode == 1,
          isFetching: false,
          isTagEnable:  action.payload.data.IsTagEnable == 1,

          isFeaturedEnable: action.payload.data.IsFeaturedEnable == 1,
          isMostPopularEnable: action.payload.data.IsMostPopularEnable == 1,
          isNewReleaseEnable: action.payload.data.IsNewReleaseEnable == 1,
          isTrendingEnable: action.payload.data.IsTrendingEnable == 1,
          isMyChannelEnable: action.payload.data.IsMychannelEnable == 1,
        };
      }

      return {
        ...state,
        currentAppVersion: action.payload.appVersion,
        languages: action.payload.data.Languages,
        storeConfig: action.payload.data.StoreConfig,
        isHeartBeatV0Done: true,
        selectedLanguage: state.language ? state.language : action.payload.data.DefaultLanguage,
        links: action.payload.data.Links,
        orgImageGUID: action.payload.data.OrgImageGUID,
        isLoaded: true,
        isLoginRequired: action.payload.data.IsLoginRequired == 1,
        isSelfRegister: action.payload.data.IsSelfRegister == 1,
        isAnonymous: action.payload.data.IsAnonymous == 1,
        isActivePasscode: action.payload.data.IsActivePasscode == 1,
        isFetching: false,
        isTagEnable:  action.payload.data.IsTagEnable == 1,

        isFeaturedEnable: action.payload.data.IsFeaturedEnable == 1,
        isMostPopularEnable: action.payload.data.IsMostPopularEnable == 1,
        isNewReleaseEnable: action.payload.data.IsNewReleaseEnable == 1,
        isTrendingEnable: action.payload.data.IsTrendingEnable == 1,
        isMyChannelEnable: action.payload.data.IsMychannelEnable == 1,
      };

    case constants.GET_HEARTBEAT_REQUEST:
      return {
        ...state,
        isFetching: true,
      };

    case constants.GET_HEARTBEAT_ERRORS:
      return {
        ...state,
        isFetching: false,
      };

    case constants.GET_HEARTBEAT_SUCCESS:
      // User language not active
      if (action.payload.userLangInactive) {
        return {
          ...state,
          currentAppVersion: action.payload.appVersion,
          languages: action.payload.data.Languages,
          storeConfig: action.payload.data.StoreConfig,
          isHeartBeatDone: true,
          selectedLanguage: action.payload.data.DefaultLanguage,
          languageGUID: null,
          language: action.payload.data.DefaultLanguage,
          links: action.payload.data.Links,
          isLanguageSetSuccess: false,
          orgImageGUID: action.payload.data.OrgImageGUID,
          isLoaded: true,
          isForcedContentUpdate: action.payload.data.IsForceContentUpdate === 1,

          // # stored in localstorage
          isLoginRequired: action.payload.data.IsLoginRequired == 1,
          isSelfRegister: action.payload.data.IsSelfRegister == 1,
          isAnonymous: action.payload.data.IsAnonymous == 1,
          isActivePasscode: action.payload.data.IsActivePasscode == 1,
          userDeviceGUID: action.payload.data.Device.UserDeviceGUID,

          syncDownloadArr: action.payload.syncDownloadArr,
          syncUpdateDownloadArr: action.payload.syncUpdateDownloadArr,
          syncDeleteDownloadArr: action.payload.syncDeleteDownloadArr,

          syncBookmarkCardArr: action.payload.syncBookmarkCardArr,
          syncUpdateBookmarkCardArr: action.payload.syncUpdateBookmarkCardArr,
          syncDeleteBookmarkCardArr: action.payload.syncDeleteBookmarkCardArr,

          syncBookmarkSectionArr: action.payload.syncBookmarkSectionArr,
          syncDeleteBookmarkSectionArr: action.payload.syncDeleteBookmarkSectionArr,

          isSyncing: !!((action.payload.syncDownloadArr && action.payload.syncDownloadArr.length)
            || (action.payload.syncUpdateDownloadArr && action.payload.syncUpdateDownloadArr.length)
            || (action.payload.syncDeleteDownloadArr && action.payload.syncDeleteDownloadArr.length)
            || (action.payload.syncBookmarkCardArr && action.payload.syncBookmarkCardArr.length)
            || (action.payload.syncUpdateBookmarkCardArr && action.payload.syncUpdateBookmarkCardArr.length)
            || (action.payload.syncDeleteBookmarkCardArr && action.payload.syncDeleteBookmarkCardArr.length)
            || (action.payload.syncBookmarkSectionArr && action.payload.syncBookmarkSectionArr.length)
            || (action.payload.syncDeleteBookmarkSectionArr && action.payload.syncDeleteBookmarkSectionArr.length)),

          isFetching: false,
          isTagEnable:  action.payload.data.IsTagEnable == 1,

          isFeaturedEnable: action.payload.data.IsFeaturedEnable == 1,
          isMostPopularEnable: action.payload.data.IsMostPopularEnable == 1,
          isNewReleaseEnable: action.payload.data.IsNewReleaseEnable == 1,
          isTrendingEnable: action.payload.data.IsTrendingEnable == 1,
          isMyChannelEnable: action.payload.data.IsMychannelEnable == 1,
        };
      }

      return {
        ...state,
        currentAppVersion: action.payload.appVersion,
        languages: action.payload.data.Languages,
        storeConfig: action.payload.data.StoreConfig,
        isHeartBeatDone: true,
        selectedLanguage: state.language ? state.language : action.payload.data.DefaultLanguage,
        links: action.payload.data.Links,
        orgImageGUID: action.payload.data.OrgImageGUID,
        isLoaded: true,
        isLoginRequired: action.payload.data.IsLoginRequired == 1,
        isSelfRegister: action.payload.data.IsSelfRegister == 1,
        isAnonymous: action.payload.data.IsAnonymous == 1,
        isActivePasscode: action.payload.data.IsActivePasscode == 1,
        userDeviceGUID: action.payload.data.Device.UserDeviceGUID,
        isForcedContentUpdate: action.payload.data.IsForceContentUpdate === 1,

        syncDownloadArr: action.payload.syncDownloadArr,
        syncUpdateDownloadArr: action.payload.syncUpdateDownloadArr,
        syncDeleteDownloadArr: action.payload.syncDeleteDownloadArr,

        syncBookmarkCardArr: action.payload.syncBookmarkCardArr,
        syncUpdateBookmarkCardArr: action.payload.syncUpdateBookmarkCardArr,
        syncDeleteBookmarkCardArr: action.payload.syncDeleteBookmarkCardArr,

        syncBookmarkSectionArr: action.payload.syncBookmarkSectionArr,
        syncDeleteBookmarkSectionArr: action.payload.syncDeleteBookmarkSectionArr,

        isSyncing: !!((action.payload.syncDownloadArr && action.payload.syncDownloadArr.length)
          || (action.payload.syncUpdateDownloadArr && action.payload.syncUpdateDownloadArr.length)
          || (action.payload.syncDeleteDownloadArr && action.payload.syncDeleteDownloadArr.length)
          || (action.payload.syncBookmarkCardArr && action.payload.syncBookmarkCardArr.length)
          || (action.payload.syncUpdateBookmarkCardArr && action.payload.syncUpdateBookmarkCardArr.length)
          || (action.payload.syncDeleteBookmarkCardArr && action.payload.syncDeleteBookmarkCardArr.length)
          || (action.payload.syncBookmarkSectionArr && action.payload.syncBookmarkSectionArr.length)
          || (action.payload.syncDeleteBookmarkSectionArr && action.payload.syncDeleteBookmarkSectionArr.length)),

        isFetching: false,
        isTagEnable:  action.payload.data.IsTagEnable == 1,

        isFeaturedEnable: action.payload.data.IsFeaturedEnable == 1,
        isMostPopularEnable: action.payload.data.IsMostPopularEnable == 1,
        isNewReleaseEnable: action.payload.data.IsNewReleaseEnable == 1,
        isTrendingEnable: action.payload.data.IsTrendingEnable == 1,
        isMyChannelEnable: action.payload.data.IsMychannelEnable == 1,
      };

    case constants.GET_HEARTBEAT_V0_VERSION_MISMATCH:
    case constants.GET_HEARTBEAT_VERSION_MISMATCH:
      return {
        ...state,
        newAppVersion: action.payload.data.Version,
        languages: action.payload.data.Languages,
        links: action.payload.data.Links,
        selectedLanguage: state.language ? state.language : action.payload.data.DefaultLanguage,
        orgImageGUID: action.payload.data.OrgImageGUID,

        isFetching: false,
      };

    case constants.GET_USER_INFO_SUCCESS:
      return {
        ...state,
        isUserInfoFetched: true,
        isSyncing: false,
      };

    case constants.GET_USER_INFO_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case constants.SET_APP_LANGUAGE_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case constants.SET_APP_LANGUAGE_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case constants.SET_APP_LANGUAGE_SUCCESS:
      return {
        ...state,
        language: action.payload.localData.language,
        languageGUID: action.payload.localData.language.LanguageGUID,
        selectedLanguage: action.payload.localData.language,
        isLanguageSetSuccess: true,

        isRequesting: false,
      };

    case constants.SET_APP_LANGUAGE_MODAL_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case constants.SET_APP_LANGUAGE_MODAL_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case constants.SET_APP_LANGUAGE_MODAL_SUCCESS:
      return {
        ...state,
        language: action.payload.language,
        languageGUID: action.payload.language.LanguageGUID,
        selectedLanguage: action.payload.language,
        isLanguageSetSuccess: true,

        isRequesting: false,
      };

    case constants.AUTO_SET_LANGUAGE:
      return {
        ...state,
        currentAppVersion: action.payload.appVersion,
        language: action.payload.languageData.language,
        languageGUID: action.payload.languageData.languageGUID,
        languages: action.payload.languageData.Languages,
        links: action.payload.languageData.Links,
        orgImageGUID: action.payload.languageData.OrgImageGUID,
        isHeartBeatDone: action.payload.isLoggedIn,
        isHeartBeatV0Done: action.payload.isLoggedIn,
        selectedLanguage: action.payload.languageData.language,
        isLanguageSetSuccess: true,
        isLoaded: true,
        isLoginRequired: action.payload.languageData.IsLoginRequired == 1,
        isSelfRegister: action.payload.languageData.IsSelfRegister == 1,
        isAnonymous: action.payload.languageData.IsAnonymous == 1,

        syncDownloadArr: action.payload.syncDownloadArr,
        syncUpdateDownloadArr: action.payload.syncUpdateDownloadArr,
        syncDeleteDownloadArr: action.payload.syncDeleteDownloadArr,

        syncBookmarkCardArr: action.payload.syncBookmarkCardArr,
        syncUpdateBookmarkCardArr: action.payload.syncUpdateBookmarkCardArr,
        syncDeleteBookmarkCardArr: action.payload.syncDeleteBookmarkCardArr,

        syncBookmarkSectionArr: action.payload.syncBookmarkSectionArr,
        syncDeleteBookmarkSectionArr: action.payload.syncDeleteBookmarkSectionArr,

        isSyncing: !!((action.payload.syncDownloadArr && action.payload.syncDownloadArr.length)
          || (action.payload.syncUpdateDownloadArr && action.payload.syncUpdateDownloadArr.length)
          || (action.payload.syncDeleteDownloadArr && action.payload.syncDeleteDownloadArr.length)
          || (action.payload.syncBookmarkCardArr && action.payload.syncBookmarkCardArr.length)
          || (action.payload.syncUpdateBookmarkCardArr && action.payload.syncUpdateBookmarkCardArr.length)
          || (action.payload.syncDeleteBookmarkCardArr && action.payload.syncDeleteBookmarkCardArr.length)
          || (action.payload.syncBookmarkSectionArr && action.payload.syncBookmarkSectionArr.length)
          || (action.payload.syncDeleteBookmarkSectionArr && action.payload.syncDeleteBookmarkSectionArr.length)),

        isFetching: false,
      };

    case constants.SELECT_LANGUAGE_SUCCESS:
      return {
        ...state,
        selectedLanguage: action.payload,
      };


    case constants.GET_APPSTATE:
      tempIsHeartBeatDone = state.isHeartBeatDone;
      tempIsHeartBeatV0Done = state.isHeartBeatV0Done;
      if (action.payload != 'active') {
        tempIsHeartBeatDone = false;
        tempIsHeartBeatV0Done = false;
      }
      return {
        ...state,
        appState: action.payload,
        isHeartBeatDone: tempIsHeartBeatDone,
        isHeartBeatV0Done: tempIsHeartBeatV0Done,
      };

    case constants.DX_MINIMIZE_APP_SUCCESS:
      if (!state.isAuthenticated) {
        return {
          ...state,
          isHeartBeatV0Done: false,
        };
      }
      return {
        ...state,
        isHeartBeatDone: false,
      };

    case constants.DX_MINIMIZE_APP_ERRORS:
      return {
        ...state,
        isFetching: false,
      };

    case constants.LOGIN_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
      };


    case constants.LOGIN_SUCCESS:
      return {
        ...state,
        isSkipLoginSuccess: false,
        isLoggingIn: false,
        isAuthenticated: true,
        token: action.payload.authData.token,
        refreshToken: action.payload.authData.refreshToken,
        expiryDate: action.payload.authData.expiryDate,

        loginType: 'KEYCLOAK',
      };

    case constants.LOGIN_ERRORS:
      return {
        ...state,
        isLoggingIn: false,
      };

    case constants.LOGOUT_REQUEST:
      return {
        ...state,
        isRequesting: true,
        isFetchFirstLoadDone: false,
      };

    case constants.LOGOUT_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        isSkipLoginSuccess: false,
        token: null,
        refreshToken: null,
        expiryDate: null,
        isHeartBeatDone: false,
        isUserInfoFetched: false,
        appState: null,

        isFetching: false,
        isRequesting: false,
        loginType: null,
        reopenApp: false,
        offlineReopenApp: false,
        offlineUserGUID: null,
      };

    case constants.LOGOUT_ERRORS:
      return {
        ...state,

        isFetching: false,
        isRequesting: false,
        loginType: null,
        reopenApp: false,
        offlineReopenApp: false,
        offlineUserGUID: null,
      };

    case constants.ANONYMOUS_LOGIN_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case constants.ANONYMOUS_LOGIN_ERORRS:
      return {
        ...state,
        isRequesting: false,
      };

    case constants.ANONYMOUS_LOGIN_SUCCESS:
      return {
        ...state,
        isSkipLoginSuccess: true,
        isLoggingIn: false,
        isAuthenticated: true,
        token: action.payload.authData.token,
        refreshToken: action.payload.authData.refreshToken,
        expiryDate: action.payload.authData.expiryDate,

        isRequesting: false,
        loginType: 'ANONYMOUS',
      };

    case constants.DX_REFRESH_TOKEN_UPDATE:
      return {
        ...state,
        token: action.payload.keycloak.token,
        refreshToken: action.payload.keycloak.refreshToken,
        expiryDate: action.payload.keycloak.expiryDate,
      };

    case registerConstants.DX_REGISTER_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case registerConstants.DX_REGISTER_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case registerConstants.DX_REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        isSkipLoginSuccess: false,
        token: null,
        refreshToken: null,
        expiryDate: null,
        isHeartBeatDone: false,
        isUserInfoFetched: false,
        appState: null,

        isRequesting: false,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_REQUEST:
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_ERRORS:

    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case constants.CLOSE_CARD_ONLY_MODAL_REQUEST:
    case feedConstants.DX_BROWSER_BACK:
    case feedConstants.DX_TRAINING_COMPLETE:
    case feedConstants.DX_FEED_BACK_COMPLETE:
    case feedConstants.DX_HOME_BROWSER_BACK:
      return {
        ...state,
        isRequesting: true,
      };

    case constants.CLOSE_CARD_ONLY_MODAL_SUCCESS:
    case constants.CLOSE_CARD_ONLY_MODAL_ERRORS:

    case feedConstants.DX_BROWSER_BACK_SUCCESS:
    case feedConstants.DX_BROWSER_BACK_ERRORS:

    case feedConstants.DX_FEED_BACK_COMPLETE_SUCCESS:
    case feedConstants.DX_FEED_BACK_COMPLETE_ERRORS:

    case feedConstants.DX_HOME_BROWSER_BACK_SUCCESS:
    case feedConstants.DX_HOME_BROWSER_BACK_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case channelConstants.DX_POST_CHANNEL_LIST_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case channelConstants.DX_POST_CHANNEL_LIST_SUCCESS:
    case channelConstants.DX_CHANNELS_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_LIST_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_LIST_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_LIST_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case homeConstants.DX_GET_FEATURED_CARDS_REQUEST:
    case homeConstants.DX_GET_MOST_POPULAR_CARDS_REQUEST:
    case homeConstants.DX_GET_NEW_RELEASES_CARDS_REQUEST:
    case homeConstants.DX_GET_TRENDING_CARDS_REQUEST:
    case homeConstants.DX_GET_MY_CHANNELS_LIST_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case homeConstants.DX_GET_FEATURED_CARDS_SUCCESS:
    case homeConstants.DX_GET_FEATURED_CARDS_ERRORS:

    case homeConstants.DX_GET_MOST_POPULAR_CARDS_SUCCESS:
    case homeConstants.DX_GET_MOST_POPULAR_CARDS_ERRORS:

    case homeConstants.DX_GET_NEW_RELEASES_CARDS_SUCCESS:
    case homeConstants.DX_GET_NEW_RELEASES_CARDS_ERRORS:

    case homeConstants.DX_GET_TRENDING_CARDS_SUCCESS:
    case homeConstants.DX_GET_TRENDING_CARDS_ERRORS:

    case homeConstants.DX_GET_MY_CHANNELS_LIST_SUCCESS:
    case homeConstants.DX_GET_MY_CHANNELS_LIST_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case downloadConstants.DX_DELETE_DOWNLOAD_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case downloadConstants.DX_DELETE_DOWNLOAD_SUCCESS:
    case downloadConstants.DX_DELETE_DOWNLOAD_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case bookmarkConstants.DX_ADD_BOOKMARK_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case bookmarkConstants.DX_ADD_BOOKMARK_CARDS_SUCCESS:
    case bookmarkConstants.DX_ADD_BOOKMARK_SECTIONS_SUCCESS:
    case bookmarkConstants.DX_ADD_BOOKMARK_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case bookmarkConstants.DX_DELETE_BOOKMARK_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case bookmarkConstants.DX_DELETE_BOOKMARK_CARDS_SUCCESS:
    case bookmarkConstants.DX_DELETE_BOOKMARK_SECTIONS_SUCCESS:
    case bookmarkConstants.DX_DELETE_BOOKMARK_ERRORS:
      return {
        ...state,
        isRequesting: false,
      };

    case settingConstants.DX_TOGGLE_NIGHT_MODE_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };

    case settingConstants.DX_TOGGLE_NIGHT_MODE_SUCCESS:
    case settingConstants.DX_TOGGLE_NIGHT_MODE_ERORRS:
      return {
        ...state,
        isRequesting: false,
      };

    case searchConstants.DX_GET_TAGS_LIST_REQUEST:
    case searchConstants.DX_GET_CHANNELS_LIST_REQUEST:
    case searchConstants.DX_GET_CONTENT_LIST_REQUEST:
    case searchConstants.DX_GET_TAG_EXP_REQUEST:
      return {
        ...state,
        isRequesting: true,
      }
    
    case searchConstants.DX_GET_TAGS_LIST_SUCCESS:
    case searchConstants.DX_GET_TAGS_LIST_ERRORS:

    case searchConstants.DX_GET_CHANNELS_LIST_SUCCESS:
    case searchConstants.DX_GET_CHANNELS_LIST_ERRORS:

    case searchConstants.DX_GET_CONTENT_LIST_SUCCESS:
    case searchConstants.DX_GET_CONTENT_LIST_ERRORS:

    case searchConstants.DX_GET_TAG_EXP_SUCCESS:
    case searchConstants.DX_GET_TAG_EXP_ERRORS:
      return {
        ...state,
        isRequesting: false,
      }

    default:
      return state;
  }
};
