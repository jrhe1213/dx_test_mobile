import constants from '../constants';
import feedConstants from '../screens/Feed/constants';
import bookmarkConstants from '../screens/Bookmark/constants';
import channelConstants from '../screens/Channel/constants';

const initialState = {
  modalOpen: false,
  modalType: null,
  modalSectionGUID: null,
  userClickedstream: null,
  downloadData: null,
  olduserClickedstream: null,
  modalData: null,
  embeddedLinkModalOpen: false,
  embeddedLinkModalType: null,

  updateBS: false,
  serverBookmarkSectionArr: [],
  isSameDevice: false
};

export default (state = initialState, action) => {
  let tempModalOpen;
  let tempModalType;
  switch (action.type) {
    case constants.OPEN_MODAL:
      return {
        ...state,
        modalOpen: true,
        modalType: action.payload.type,
        modalSectionGUID: action.payload.sectionGUID,
      };

    case constants.CLOSE_MODAL:
    case constants.CLOSE_CARD_ONLY_MODAL_SUCCESS:
      return {
        ...state,
        modalOpen: action.payload,
        modalType: null,
        modalSectionGUID: null,
      };

    case channelConstants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_REQUEST:
    case constants.DX_VIDEO_SCREEN_CLOSE:
    case constants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_SUCCESS:
      return {
        ...state,
        modalOpen: false,
        modalType: null,
        modalSectionGUID: null,
      };

    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
      // New flow in section: first popup
      // if (action.payload.experiences.numberOfClicks == 1) {
      //   return {
      //     ...state,
      //     modalOpen: true,
      //     modalType: 'CARDPAGE',
      //     modalSectionGUID: null,
      //     userClickedstream: null,
      //     olduserClickedstream: action.payload.experiences,
      //   };
      // }
      tempModalOpen = state.modalOpen;
      tempModalType = state.modalType;
      if (tempModalType === "DOWNLOAD" || tempModalType === "UPDATEUSERSYNC" || tempModalType === "UPDATEUSERCONSENT") {
        tempModalOpen = false;
        tempModalType = null;
      }

      return {
        ...state,
        modalOpen: tempModalOpen,
        modalType: tempModalType,
        userClickedstream: action.payload.experiences,
      };

    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
      return {
        ...state,
        modalOpen: true,
        modalType: 'CARDONLY',
        userClickedstream: null,
        olduserClickedstream: action.payload.experiences,
      };

    case feedConstants.DX_ADD_DOWNLOAD_REQUEST:
    case bookmarkConstants.DX_BOOKMARK_ADD_DOWNLOAD_REQUEST:
      return {
        ...state,
        modalOpen: true,
        modalType: 'DOWNLOAD',
      };

    case constants.GET_HEARTBEAT_VERSION_MISMATCH:
    case constants.GET_HEARTBEAT_V0_VERSION_MISMATCH:
      // App version popup
      return {
        ...state,
        modalOpen: true,
        modalType: 'APPVERSION',
        modalSectionGUID: null,
      };

    case constants.OPEN_LANGUAGE_MODAL:
      // Language popup
      return {
        ...state,
        modalOpen: true,
        modalType: 'LANGUAGESELECT',
        modalSectionGUID: null,
      };

    case constants.SET_APP_LANGUAGE_MODAL_SUCCESS:
    case constants.SET_APP_LANGUAGE_SUCCESS:
      return {
        ...state,
        modalOpen: false,
        modalType: null,
      };

    case constants.GET_APPSTATE:
      if (action.payload !== 'active') {
        if (state.modalType == 'CARDONLY' || state.modalType == 'CARDPAGE') {
          return state;
        }
      }
      return {
        ...state,
        modalOpen: false,
        modalType: null,
      };


    case constants.DX_MINIMIZE_APP_SUCCESS:
      if (state.modalType == 'CARDONLY' || state.modalType == 'CARDPAGE') {
        return state;
      }
      return {
        ...state,
        modalOpen: false,
        modalType: null,
      };

    case feedConstants.DX_OPEN_UPDATE_USER_CONSENT_MODAL:
      return {
        ...state,
        modalOpen: true,
        modalType: 'UPDATEUSERCONSENT',
        userClickedstream: action.payload.stream,
        olduserClickedstream: action.payload.originalStream,
        downloadData: action.payload.downloadData,
        serverBookmarkSectionArr: action.payload.serverBookmarkSectionArr,
        isSameDevice: action.payload.isSameDevice,
      };

    case feedConstants.DX_OPEN_UPDATE_USER_SYNC_MODAL:
      return {
        ...state,
        modalOpen: true,
        modalType: 'UPDATEUSERSYNC',
        userClickedstream: action.payload.updatedStream,
        olduserClickedstream: action.payload.originalStream,
        updateBS: action.payload.updateBS
      };

    case constants.OPEN_INFO_MODAL:
      return {
        ...state,
        modalOpen: true,
        modalType: 'CHANNELINFO',
        modalData: action.payload.channelInfo,
      };

    case constants.OPEN_EMBEDDED_LINK_MODAL:
      return {
        ...state,
        embeddedLinkModalOpen: true,
        embeddedLinkModalType: 'EMBEDDEDLINK',
        modalData: action.payload.link,
      };

    case constants.CLOSE_EMBEDDED_LINK_MODAL:
      return {
        ...state,
        embeddedLinkModalOpen: false,
        embeddedLinkModalType: null,
        modalData: null,
      };

    case constants.GET_USER_INFO_SUCCESS:
      if (action.payload.localData.liveExit) {
        return {
          ...state,
          modalOpen: false,
          modalType: null,
        };
      }
      return state;

    case constants.CLOSE_AUDIO_MODAL:
      return {
        ...state,
        modalOpen: false,
        modalType: null,
      }

    default:
      return state;
  }
};
