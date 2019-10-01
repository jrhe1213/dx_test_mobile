import constants from './constants';

const INITIAL_STATE = {
  isLoading: false,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  isEmailAccepted: null,
  emailError: '',
  emailSuccess: '',
};

export default (state = INITIAL_STATE, action) => {
  let tempFirstName = state.firstName;
  let tempLastName = state.lastName;
  let tempEmail = state.email;
  let tempPassword = state.password;
  let tempConfirmPassword = state.confirmPassword;

  switch (action.type) {
    case constants.UPDATE_REGISTER_INPUT:
      if (action.payload.name === 'firstName') {
        tempFirstName = action.payload.val;
      } else if (action.payload.name === 'lastName') {
        tempLastName = action.payload.val;
      } else if (action.payload.name === 'email') {
        tempEmail = action.payload.val;
      } else if (action.payload.name === 'password') {
        tempPassword = action.payload.val;
      } else if (action.payload.name === 'confirmPassword') {
        tempConfirmPassword = action.payload.val;
      }
      return {
        ...state,
        firstName: tempFirstName,
        lastName: tempLastName,
        email: tempEmail,
        password: tempPassword,
        confirmPassword: tempConfirmPassword,
      };

    case constants.DX_EMAIL_CHECK_SUCCESS:
      return {
        ...state,
        isEmailAccepted: true,
        emailSuccess: action.payload.success,
      };

    case constants.DX_EMAIL_CHECK_ERRORS:
      return {
        ...state,
        isEmailAccepted: false,
        emailError: action.payload.error,
      };

    case constants.DX_REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case constants.DX_REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        emailError: '',
        emailSuccess: '',
      };

    case constants.DX_REGISTER_ERRORS:
      return {
        ...state,
        isLoading: false,
      };

    case constants.CLOSE_REGISTER_PAGE:
      return {
        ...state,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        emailError: '',
        emailSuccess: '',
      };

    default:
      return state;
  }
};
