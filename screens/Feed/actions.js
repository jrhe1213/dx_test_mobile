import constants from './constants';

// Actions
export default {

  updateFeedChannel: (channel) => ({
    type: constants.DX_FEED_CHANNEL_CHANGE,
    payload: {
      channel,
    },
  }),


  updatePageNumber: pullUpRefresh => ({
    type: constants.UPDATE_PAGE_NUMBER,
    payload: {
      pullUpRefresh,
    },
  }),
  

  // Get all channel experiences action
  postStreamExperienceRequest: (data, pullupRefresh) => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_LIST_REQUEST,
    payload: {
      data,
      pullupRefresh,
    },
  }),

  postStreamExperienceSuccess: (experiences, downloads, bookmarks, pageNumber, isSearch) => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_LIST_SUCCESS,
    payload: {
      experiences,
      downloads,
      bookmarks,
      pageNumber,
      isSearch,
    },
  }),

  postStreamExperienceFailure: errors => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_LIST_ERRORS,
    payload: errors,
  }),


  // Mobile view
  postStreamCardContentRequest: data => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_REQUEST,
    payload: data,
  }),

  postStreamCardOnlyContentSucccess: (experiences, bookmarks, experienceCard,
    experienceStreamGUID, acceptedUpdate, currentTab, bookmarkCards, isFirstGetIn, isContinousCall) => ({
      type: constants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS,
      payload: {
        experiences,
        bookmarks,
        experienceCard,
        experienceStreamGUID,
        acceptedUpdate,
        currentTab,
        bookmarkCards,
        isFirstGetIn,
        isContinousCall
      },
    }),

  postStreamCardAndPageContentSucccess: (experiences, bookmarks, experienceCard,
    experienceStreamGUID, acceptedUpdate, currentTab,
    bookmarkCards, isFirstGetIn, isContinousCall, updateBS, isSkipPageUpdate) => ({
      type: constants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS,
      payload: {
        experiences,
        bookmarks,
        experienceCard,
        experienceStreamGUID,
        acceptedUpdate,
        currentTab,
        bookmarkCards,
        isFirstGetIn,
        isContinousCall,
        updateBS,
        isSkipPageUpdate
      },
    }),

  postStreamCardContentErrors: errors => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_ERRORS,
    payload: errors,
  }),


  // V2
  postStreamCardContentV2Request: data => ({
    type: constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST,
    payload: data,
  }),



  // Add Download
  addDownloadRequest: (stream, downloadData, acceptedUpdate) => ({
    type: constants.DX_ADD_DOWNLOAD_REQUEST,
    payload: {
      stream,
      downloadData,
      acceptedUpdate,
    },
  }),

  addDownloadSuccess: stream => ({
    type: constants.DX_ADD_DOWNLOAD_SUCCESS,
    payload: {
      stream,
    },
  }),

  addDownloadErrors: errors => ({
    type: constants.DX_ADD_DOWNLOAD_ERRORS,
    payload: errors,
  }),


  dx_browse_to_channel: () => ({
    type: constants.DX_BROWSE_TO_CHANNEL_PAGE,
  }),

  dx_browse_to_previous_tab: (history) => ({
    type: constants.DX_BROWSE_TO_PREVIOUS_TAB,
    payload: {
      history
    }
  }),

  dx_scroll: (completion, isBottom) => ({
    type: constants.DX_SCROLL,
    payload: {
      completion,
      isBottom,
    },
  }),

  dx_archive: (experienceStreamGUID, experienceStreamWithChannelInfo, bookmarks) => ({
    type: constants.DX_ARCHIVE,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
      bookmarks,
    },
  }),

  dx_archive_success: (experienceStreamWithChannelInfo, bookmarks) => ({
    type: constants.DX_ARCHIVE_SUCCESS,
    payload: {
      experienceStreamWithChannelInfo,
      bookmarks,
    },
  }),

  dx_archive_errors: errors => ({
    type: constants.DX_ARCHIVE_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_feed_back: (experienceStreamGUID, experienceStreamWithChannelInfo) => ({
    type: constants.DX_FEED_BACK,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
    },
  }),

  dx_feed_back_success: (experienceStreamWithChannelInfo) => ({
    type: constants.DX_FEED_BACK_SUCCESS,
    payload: {
      experienceStreamWithChannelInfo
    },
  }),

  dx_feed_back_errors: errors => ({
    type: constants.DX_FEED_BACK_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_feed_back_complete: (experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable) => ({
    type: constants.DX_FEED_BACK_COMPLETE,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
      isTagEnable
    },
  }),

  dx_feed_back_complete_success: () => ({
    type: constants.DX_FEED_BACK_COMPLETE_SUCCESS,
    payload: {},
  }),

  dx_feed_back_complete_errors: errors => ({
    type: constants.DX_FEED_BACK_COMPLETE_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_browser: document => ({
    type: constants.DX_BROWSER,
    payload: {
      document,
    },
  }),

  dx_browser_back: (experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable) => ({
    type: constants.DX_BROWSER_BACK,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
      isTagEnable,
    },
  }),

  dx_browser_back_success: () => ({
    type: constants.DX_BROWSER_BACK_SUCCESS,
    payload: {},
  }),

  dx_browser_back_errors: errors => ({
    type: constants.DX_BROWSER_BACK_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_home_browser_back: (experienceStreamGUID, experienceStreamWithChannelInfo, currentLevelExperiencePageGUID, isTagEnable) => ({
    type: constants.DX_HOME_BROWSER_BACK,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
      currentLevelExperiencePageGUID,
      isTagEnable
    },
  }),

  dx_home_browser_back_success: () => ({
    type: constants.DX_HOME_BROWSER_BACK_SUCCESS,
    payload: {},
  }),

  dx_home_browser_back_errors: errors => ({
    type: constants.DX_HOME_BROWSER_BACK_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_home_back: bookmarks => ({
    type: constants.DX_HOME_BACK,
    payload: {
      bookmarks,
    },
  }),

  dx_home_back_success: bookmarks => ({
    type: constants.DX_HOME_BACK_SUCCESS,
    payload: {
      bookmarks,
    },
  }),

  dx_home_back_errors: errors => ({
    type: constants.DX_HOME_BACK_ERRORS,
    payload: {
      errors,
    },
  }),

  dx_section_toggle_menu: toggle => ({
    type: constants.DX_SECTION_MENU_TOGGLE,
    payload: {
      toggle,
    },
  }),

  dx_section_browser: (current_level_section, bookmarks) => ({
    type: constants.DX_SECTION_BROWSER,
    payload: {
      current_level_section,
      bookmarks,
    },
  }),

  dx_section_browser_back: bookmarks => ({
    type: constants.DX_SECTION_BROWSER_BACK,
    payload: {
      bookmarks,
    },
  }),

  dx_section_suggest_browser: bookmarks => ({
    type: constants.DX_SECTION_SUGGEST_BROWSER,
    payload: { bookmarks },
  }),

  dx_delete_download: feedId => ({
    type: constants.DX_DELETE_DOWNLOAD,
    payload: feedId,
  }),

  dx_add_bookmark: feedId => ({
    type: constants.DX_ADD_BOOKMARK,
    payload: feedId,
    meta: {
      offline: {
        // the network action to execute
        effect: {
          url: '',
          method: 'POST',
          body: JSON.stringify({
            feedId,
          }),
        },
        // action to dispatch when effect succeeds:
        commit: {
          type: 'DX_ADD_BOOKMARK',
          meta: {
            feedId,
          },
        },
        // action to dispatch if network action fails permanently:
        rollback: {
          type: 'DX_ADD_BOOKMARK_ROLLBACK',
          meta: {
            feedId,
          },
        },
      },
    },
  }),

  dx_delete_bookmark: feedId => ({
    type: constants.DX_DELETE_BOOKMARK,
    payload: feedId,
  }),

  // Post feedback
  postFeedback: data => ({
    type: constants.POST_FEEDBACK,
    payload: data,
  }),

  skipTheContentUpdateRequest: stream => ({
    type: constants.DX_SKIP_THE_CONTENT_UPDATE_REQUEST,
    payload: {
      stream,
    },
  }),

  openUpdateUserConsentModal: (stream, downloadData, originalStream, serverBookmarkSectionArr, isSameDevice) => ({
    type: constants.DX_OPEN_UPDATE_USER_CONSENT_MODAL,
    payload: {
      stream,
      downloadData,
      originalStream,
      serverBookmarkSectionArr,
      isSameDevice,
    },
  }),

  openUpdateUserSyncModal:(updatedStream, originalStream, updateBS) => ({
    type: constants.DX_OPEN_UPDATE_USER_SYNC_MODAL,
    payload: {
      updatedStream,
      originalStream,
      updateBS
    },
  }),

  updateUserContentRequest: (stream, isUpdate, updateBS) => ({
    type: constants.DX_UPDATE_USER_THE_CONTENT_REQUEST,
    payload: {
      stream,
      isUpdate,
      updateBS
    },
  }),

  setSectionResetArchive: () => ({
    type: constants.SET_RESET_ARCHIVE,
    payload: {},
  }),

  updateSectionPageNumber: () => ({
    type: constants.UPDATE_SECTION_PAGE_NUMBER,
    payload: {},
  }),


  dx_training_complete: (experienceStreamGUID, experienceStreamWithChannelInfo, currentLevelExperiencePageGUID, isTagEnable) => ({
    type: constants.DX_TRAINING_COMPLETE,
    payload: {
      experienceStreamGUID,
      experienceStreamWithChannelInfo,
      currentLevelExperiencePageGUID,
      isTagEnable
    },
  }),

  dx_training_complete_success: () => ({
    type: constants.DX_TRAINING_COMPLETE_SUCCESS,
    payload: {},
  }),

  dx_training_complete_errors: errors => ({
    type: constants.DX_TRAINING_COMPLETE_ERRORS,
    payload: {
      errors,
    },
  }),

};
