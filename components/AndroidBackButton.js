import { BackHandler } from 'react-native';

const handleAndroidBackButton = (callback) => {
  BackHandler.removeEventListener('hardwareBackPress');
  BackHandler.addEventListener('hardwareBackPress', () => {
    callback();
    return true;
  });
};

const removeAndroidBackButtonHandler = () => {
  BackHandler.removeEventListener('hardwareBackPress');
  BackHandler.addEventListener('hardwareBackPress', () => {
    BackHandler.exitApp();
  });
};
export { handleAndroidBackButton, removeAndroidBackButtonHandler };
