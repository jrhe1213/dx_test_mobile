import constants from '../constants';
import registerConstants from '../screens/Register/constants';

const initialState = {
  userGUID: null,
  firstName: null,
  lastName: null,
  imgUrl: null,
  attributes: [],
  errors: {},
};

export default (state = initialState, action) => {

  switch (action.type) {

    case constants.GET_APP_INFO_SUCCESS:
      return {
        ...state,
        userGUID: action.payload.localAppData.userGUID
      };

    case constants.LOGIN_SUCCESS:
      return {
        ...state,
        userGUID: action.payload.authData.userGUID,
      };

    case constants.GET_HEARTBEAT_SUCCESS:
      return {
        ...state,
        userGUID: action.payload.data.User.UserGUID,
        attributes: action.payload.data.User.Attributes,
        firstName: action.payload.data.User.FirstName,
        lastName: action.payload.data.User.LastName,
        imgUrl: action.payload.data.User.ImgUrl,
      };

    case registerConstants.DX_REGISTER_SUCCESS:
    case constants.LOGOUT_SUCCESS:
      return {
        ...state,
        userGUID: null,
        attributes: null,
      };

    default:
      return state;
  }
};
