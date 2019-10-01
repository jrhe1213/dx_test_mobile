import constants from './constants';

export default {
  updateChannelsPageNumber: () => ({
    type: constants.UPDATE_PAGE_NUMBER_CHANNEL,
    payload: {},
  }),

  // Open channel Page Promo code button
  openPromoButton: () => ({
    type: constants.DX_OPEN_PROMO_BUTTON_CONSENT_ON_SEARCH_CLICK,
    payload: true,
  }),

  closePromoButton: () => ({
    type: constants.DX_CLOSE_PROMO_BUTTON_CONSENT_ON_SEARCH_CLICK,
    payload: false,
  }),

  // Post promo code data
  postSubscribeInviteChannelRequest: data => ({
    type: constants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_REQUEST,
    payload: data,
  }),

  postSubscribeInviteChannelSuccess: channel => ({
    type: constants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_SUCCESS,
    payload: channel,
  }),

  postSubscribeInviteChannelFailure: errors => ({
    type: constants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_ERRORS,
    payload: errors,
  }),

  // Get all channels actions
  postChannelListRequest: (data, pullupRefresh) => ({
    type: constants.DX_POST_CHANNEL_LIST_REQUEST,
    payload: {
      data,
      pullupRefresh,
    },
  }),

  postChannelListSuccess: (channels, isSearch, pullUpRefresh, channelLoadmoreTimeStamp, channelPullupRefreshTimeStamp) => ({
    type: constants.DX_POST_CHANNEL_LIST_SUCCESS,
    payload: {
      channels,
      isSearch,
      pullUpRefresh,
      channelLoadmoreTimeStamp,
      channelPullupRefreshTimeStamp,
    },
  }),

  postChannelListFailure: errors => ({
    type: constants.DX_CHANNELS_ERRORS,
    payload: errors,
  }),

  // Subscribe Channel
  postChannelSubscribeRequest: (UserGUID, ExperienceChannelGUID, IsHardInterest) => ({
    type: constants.DX_POST_CHANNEL_SUBSCRIBE_REQUEST,
    payload: {
      UserGUID,
      ExperienceChannelGUID,
      IsHardInterest,
    },
  }),

  postChannelSubscribeSuccess: data => ({
    type: constants.DX_POST_CHANNEL_SUBSCRIBE_SUCCESS,
    payload: data,
  }),

  postChannelSubscribeFailure: errors => ({
    type: constants.DX_POST_CHANNEL_SUBSCRIBE_FAILURE,
    payload: errors,
  }),

  openClickedChannelExp: (channelData, isSearch, isNavigate) => ({
    type: constants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES,
    payload: {
      channelData,
      isSearch,
      isNavigate
    },
  }),

  openClickedChannelExpV2: (channelData, isSearch, isNavigate) => ({
    type: constants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES_V2,
    payload: {
      channelData,
      isSearch,
      isNavigate
    },
  }),
};
