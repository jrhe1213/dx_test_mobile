import constants from './constants';

// Actions
export default {

  settingsPageOpen: () => ({
    type: constants.DX_OPEN_SETTINGS_PAGE,
    payload: {},
  }),

  dx_preference: () => ({
    type: constants.DX_PREFERENCE,
    payload: {},
  }),

  dx_privacy: () => ({
    type: constants.DX_PRIVACY,
    payload: {},
  }),

  dx_help: () => ({
    type: constants.DX_HELP,
    payload: {},
  }),
};
