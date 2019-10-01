import constants from './constants';
import downloadConstants from '../Download/constants';
import mainConstants from '../../constants';
import settingsConstants from '../Setting/constants';
import registerConstants from '../Register/constants';
import searchConstants from '../Search/constants';
import feedConstants from '../Feed/constants.js';

const INITIAL_STATE = {
  channels: [],
  subscribedChannels: [],
  errors: {},
  isUpdating: false,
  isLoading: true,
  promoButton: false,
  totalExpRecords: null,
  pageNumber: 1,
  pullUpRefresh: false,
  channelLoadmoreTimeStamp: null,
  channelPullupRefreshTimeStamp: null,

  clickedChannel: null,
};

export default (state = INITIAL_STATE, action) => {
  let tmpChannels = [...state.channels];
  switch (action.type) {
    case constants.UPDATE_PAGE_NUMBER_CHANNEL:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
      };

    case constants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES:
    case constants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES_V2:
      return {
        ...state,
        clickedChannel: action.payload.channelData,
      }

    case feedConstants.DX_BROWSE_TO_PREVIOUS_TAB:
      return {
        ...state,
        clickedChannel: null,
      }
    
    case mainConstants.SET_APP_LANGUAGE_SUCCESS:
      return {
        ...state,
        channels: [],
      };

    case constants.DX_POST_CHANNEL_LIST_REQUEST:
      return {
        ...state,
        isLoading: (action.payload.data.isFirstFetch || action.payload.data.isSearch) ? true : false,
      };

    case constants.DX_POST_CHANNEL_LIST_SUCCESS:
      const {
        isSearch,
        pullUpRefresh,
        channels: {
          ExperienceChannels,
          TotalRecord,
        },
        channelLoadmoreTimeStamp,
        channelPullupRefreshTimeStamp,
      } = action.payload;

      // loadmore or pullup or search list
      if (pullUpRefresh && !isSearch) {
        tmpChannels = [...ExperienceChannels, ...tmpChannels];
      } else if (isSearch) {
        tmpChannels = ExperienceChannels;
      } else if (!pullUpRefresh && !isSearch) {
        tmpChannels = [...tmpChannels, ...ExperienceChannels];
      }

      if (pullUpRefresh) {
        return {
          ...state,
          channels: tmpChannels,
          isLoading: false,
          channelPullupRefreshTimeStamp,
        }
      }

      return {
        ...state,
        channels: tmpChannels,
        isUpdating: false,
        isLoading: false,
        totalExpRecords: TotalRecord,
        channelLoadmoreTimeStamp,
        channelPullupRefreshTimeStamp,
      };

    case constants.DX_CHANNELS_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoading: false,
      };

    // Subscribe channel
    case constants.DX_POST_CHANNEL_SUBSCRIBE_REQUEST:
      return {
        ...state,
      };

    case constants.DX_POST_CHANNEL_SUBSCRIBE_SUCCESS:
      return {
        ...state,
        subscribedChannels: [action.payload.Data.Response.ExperienceChannel, ...state.subscribedChannels],
      };

    case constants.DX_POST_CHANNEL_SUBSCRIBE_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    // open n close promo button
    case constants.DX_OPEN_PROMO_BUTTON_CONSENT_ON_SEARCH_CLICK:
      return {
        ...state,
        promoButton: action.payload,
      };

    case constants.DX_CLOSE_PROMO_BUTTON_CONSENT_ON_SEARCH_CLICK:
      return {
        ...state,
        promoButton: action.payload,
      };

    // Invited channel
    case constants.DX_POST_SUBSCRIBE_INVITE_CHANNEL_SUCCESS:
      tmpChannels.splice(1, 0, action.payload.Data.Response.ExperienceChannel);
      return {
        ...state,
        channels: tmpChannels,
        totalExpRecords: tmpChannels.length,
        subscribedChannels: [action.payload.Data.Response.ExperienceChannel, ...state.subscribedChannels],
      };

    case mainConstants.GET_INTERNET_INFO:
      if (!action.payload) {
        return {
          ...state,
          pageNumber: 1,
          channels: [],
          totalExpRecords: null,
        };
      }
      return {
        ...state,
      };

    case mainConstants.DX_OPEN_HOME_PAGE:
    case mainConstants.DX_OPEN_EXPLORE_PAGE:
    case mainConstants.DX_OPEN_BOOKMARK_PAGE:
    case registerConstants.OPEN_REGISTER_PAGE:
    case downloadConstants.DX_DOWNLOAD_PAGE_OPEN:
    case settingsConstants.DX_OPEN_SETTINGS_PAGE:
      return {
        ...state,
        isLoading: false,
        subscribedChannels: [],
      };

    case mainConstants.LOGOUT_REQUEST:
      return {
        channels: [],
        pageNumber: 1,
        totalExpRecords: null,
        subscribedChannels: [],
        isLoading: false,
      };

    default:
      return state;
  }
};
