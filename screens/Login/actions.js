import globalConstants from '../../constants';

// Actions
export default {

  // Keycloak login mode
  loginRequest: () => ({
    type: globalConstants.LOGIN_REQUEST,
    payload: {},
  }),

  loginSuccess: authData => ({
    type: globalConstants.LOGIN_SUCCESS,
    payload: { authData },
  }),

  loginErrors: errors => ({
    type: globalConstants.LOGIN_ERRORS,
    payload: { errors },
  }),

  // Logout
  logoutRequest: () => ({
    type: globalConstants.LOGOUT_REQUEST,
    payload: {},
  }),

  logoutSuccess: localData => ({
    type: globalConstants.LOGOUT_SUCCESS,
    payload: {
      localData,
    },
  }),

  logoutErrors: errors => ({
    type: globalConstants.LOGOUT_ERRORS,
    payload: {
      errors,
    },
  }),

  // Anonymous login
  anonymousLoginRequest: () => ({
    type: globalConstants.ANONYMOUS_LOGIN_REQUEST,
    payload: {},
  }),

  anonymousLoginSuccess: authData => ({
    type: globalConstants.ANONYMOUS_LOGIN_SUCCESS,
    payload: { authData },
  }),

  anonymousLoginErrors: errors => ({
    type: globalConstants.ANONYMOUS_LOGIN_ERORRS,
    payload: { errors },
  }),

};
