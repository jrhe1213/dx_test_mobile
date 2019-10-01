import constants from './constants';

// Actions
export default {

  // Keycloak login mode
  registerRequest: authData => ({
    type: constants.DX_REGISTER_REQUEST,
    payload: {
      authData,
    },
  }),

  registerSuccess: data => ({
    type: constants.DX_REGISTER_SUCCESS,
    payload: { data },
  }),

  registerErrors: errors => ({
    type: constants.DX_REGISTER_ERRORS,
    payload: { errors },
  }),

  openRegisterPage: () => ({
    type: constants.OPEN_REGISTER_PAGE,
    payload: {},
  }),

  closeRegisterPage: () => ({
    type: constants.CLOSE_REGISTER_PAGE,
    payload: {},
  }),

  updateRegisterInput: (name, val) => ({
    type: constants.UPDATE_REGISTER_INPUT,
    payload: {
      name, val,
    },
  }),

  handleEmailCheckRequest: email => ({
    type: constants.DX_EMAIL_CHECK_REQUEST,
    payload: {
      email,
    },
  }),

  handleEmailCheckSuccess: success => ({
    type: constants.DX_EMAIL_CHECK_SUCCESS,
    payload: {
      success,
    },
  }),

  handleEmailCheckErrors: error => ({
    type: constants.DX_EMAIL_CHECK_ERRORS,
    payload: { error },
  }),
};
