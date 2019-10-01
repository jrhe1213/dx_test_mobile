import constants from './constants';
import globalConstants from '../../constants';

const INITIAL_STATE = {

  keyboardToggle: false,
};

export default (state = INITIAL_STATE, action) => {
 
  switch (action.type) {

    case globalConstants.GET_INTERNET_INFO:
      return {
        ...state,
      };

    default:
      return state;
  }
};
