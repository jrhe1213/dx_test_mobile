import constants from './constants';
import mainConstants from '../../constants';
import registerConstants from '../Register/constants';

const INITIAL_STATE = {
  isNightMode: false,
  theme: {
    bgColor: '#F6F6F6',
    bgColor2: '#FFFFFF',
    textColor: '#030303',
    textColor2: '#A9A9A9',
    primaryColor: '#000000',
  },
};

export default (state = INITIAL_STATE, action) => {
  let tempNightMode;

  switch (action.type) {
    case constants.DX_TOGGLE_NIGHT_MODE_REQUEST:
      return {
        ...state,
        isNightMode: action.payload.mode,
      };

    case constants.DX_TOGGLE_NIGHT_MODE_SUCCESS:
      return {
        ...state,
        isNightMode: action.payload.mode,
        theme: action.payload.mode === true ? {
          bgColor: '#1F1F1F',
          bgColor2: '#030303',
          textColor: '#FFFFFF',
          textColor2: '#b2b7b9',
          primaryColor: state.theme.primaryColor,
        } : {
          bgColor: '#F6F6F6',
          bgColor2: '#FFFFFF',
          textColor: '#030303',
          textColor2: '#A9A9A9',
          primaryColor: state.theme.primaryColor,
        },
      };

    case mainConstants.GET_APP_INFO_SUCCESS:
      return {
        ...state,
        isNightMode: action.payload.localAppData.isNightMode,
        theme: action.payload.localAppData.isNightMode ? {
          bgColor: '#1F1F1F',
          bgColor2: '#030303',
          textColor: '#FFFFFF',
          textColor2: '#b2b7b9',
          primaryColor: action.payload.localAppData.themeColor,
        } : {
            bgColor: '#F6F6F6',
            bgColor2: '#FFFFFF',
            textColor: '#030303',
            textColor2: '#A9A9A9',
            primaryColor: action.payload.localAppData.themeColor,
          },
      }

    case mainConstants.GET_HEARTBEAT_V0_SUCCESS:
      return {
        ...state,
        isNightMode: false,
        theme: {
          bgColor: '#F6F6F6',
          bgColor2: '#FFFFFF',
          textColor: '#030303',
          textColor2: '#A9A9A9',
          primaryColor: action.payload.data.OrgThemeColor,
        }
      };

    case mainConstants.GET_HEARTBEAT_SUCCESS:
      tempNightMode = action.payload.data.User.Attributes.length && action.payload.data.User.Attributes.filter(item => item.NAME === 'IsNightMode');

      if (tempNightMode.length) {
        tempNightMode = tempNightMode[0].VALUE;
      } else {
        tempNightMode = '0';
      }

      return {
        ...state,
        isNightMode: tempNightMode === '1',
        theme: tempNightMode === '1' ? {
          bgColor: '#1F1F1F',
          bgColor2: '#030303',
          textColor: '#FFFFFF',
          textColor2: '#b2b7b9',
          primaryColor: action.payload.data.OrgThemeColor,
        } : {
            bgColor: '#F6F6F6',
            bgColor2: '#FFFFFF',
            textColor: '#030303',
            textColor2: '#A9A9A9',
            primaryColor: action.payload.data.OrgThemeColor,
          },
      };

    case mainConstants.LOGIN_SUCCESS:
      return {
        ...state,
        isNightMode: action.payload.authData.isNightMode == '1',
      };

    default:
      return state;
  }
};
