// Libraries
import {
  Toast,
} from 'native-base';

// Constants
import colors from '../constants/colors';

const Alert = {
  showToast: (message, duration = 1000, type = 'danger') => {
    Toast.show({
      text: message,
      buttonText: 'x',
      position: 'top',
      buttonTextStyle: {
        color: colors.whiteColor,
        fontSize: 16,
      },
      buttonStyle: {
        backgroundColor: 'transparent',
      },
      duration,
      type,
    });
  },
};

export default Alert;
