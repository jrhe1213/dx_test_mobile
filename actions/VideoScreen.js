import constants from '../constants';

export default {
  redirectVideoScreen: (data, experienceType, isFirstOpen) => ({
    type: constants.DX_VIDEO_SCREEN,
    payload: {
      data, experienceType, isFirstOpen,
    },
  }),
  closeVideo: (isTagEnable) => ({
    type: constants.DX_VIDEO_SCREEN_CLOSE,
    payload: {
      isTagEnable,
    }
  }),

  closeVideoCardOnlyRequest: () => ({
    type: constants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_REQUEST,
    payload: {}
  }),
  closeVideoCardOnlySuccess: (currentIndex, isSearch, isTagEnable) => ({
    type: constants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_SUCCESS,
    payload: {
      currentIndex,
      isSearch,
      isTagEnable
    }
  }),
};
