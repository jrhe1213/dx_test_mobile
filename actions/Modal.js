import constants from '../constants';

export default {
  openModal: (type, sectionGUID) => ({
    type: constants.OPEN_MODAL,
    payload: {
      type,
      sectionGUID,
    },
  }),
  closeModal: () => ({
    type: constants.CLOSE_MODAL,
    payload: false,
  }),

  closeAudioModal: (sectionData) => ({
    type: constants.CLOSE_AUDIO_MODAL,
    payload: {
      sectionData
    }
  }),

  closeCardOnlyModalRequest: (isTagEnable) => ({
    type: constants.CLOSE_CARD_ONLY_MODAL_REQUEST,
    payload: {
      isTagEnable
    }
  }),

  closeCardOnlyModalSuccess: () => ({
    type: constants.CLOSE_CARD_ONLY_MODAL_SUCCESS,
    payload: {}
  }),

  openInfoModal: channelInfo => ({
    type: constants.OPEN_INFO_MODAL,
    payload: {
      channelInfo,
    },
  }),

  openEmbeddedLinkModal: link => ({
    type: constants.OPEN_EMBEDDED_LINK_MODAL,
    payload: {
      link,
    },
  }),

  closeEmbeddedLinkModal: () => ({
    type: constants.CLOSE_EMBEDDED_LINK_MODAL,
    payload: {},
  }),
};
