import constants from './constants';

// Actions
export default {

  // Download page
  settingsPageOpen: () => ({
    type: constants.DX_OPEN_SETTINGS_PAGE,
    payload: {},
  }),

  settingsPageClose: () => ({
    type: constants.DX_CLOSE_SETTINGS_PAGE,
    payload: {},
  }),

  changeNightModeRequest: mode => ({
    type: constants.DX_TOGGLE_NIGHT_MODE_REQUEST,
    payload: { mode },
  }),

  changeNightModeSuccess: mode => ({
    type: constants.DX_TOGGLE_NIGHT_MODE_SUCCESS,
    payload: {
      mode,
    },
  }),

  changeNightModeErrors: errors => ({
    type: constants.DX_TOGGLE_NIGHT_MODE_ERORRS,
    payload: {
      errors,
    },
  }),
};
