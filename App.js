import React, { Component } from 'react';
import {
  AppState,
  Platform,
} from 'react-native';

import NetInfo from "@react-native-community/netinfo";

// Components

// Libraries
import DeviceInfo from 'react-native-device-info';
import {
  Root,
} from 'native-base';

import axios from 'axios';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import deviceInfoActions from './actions/DeviceInfo';

// Fonts
import AppContainer from './AppContainer';

const Fabric = require('react-native-fabric');

class App extends Component {
  // Fetching the device unique Id
  componentDidMount() {
    // Crashlytics
    const { Crashlytics } = Fabric;

    // Unique device ID
    const deviceId = DeviceInfo.getUniqueID();
    const getSystemName = DeviceInfo.getSystemName();
    store.dispatch(deviceInfoActions.getDeviceID(deviceId, getSystemName, Crashlytics));

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);

    // Detect the app State
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleConnectionChange = (isConnected) => {
    if (Platform.OS == 'ios') {
      store.dispatch(deviceInfoActions.getInternetInfo(isConnected));
    } else {
      axios
        .get('https://google.ca', {
          timeout: 1000 * 5,
        })
        .then((response) => {
          store.dispatch(deviceInfoActions.getInternetInfo(true));
        })
        .catch((error) => {
          store.dispatch(deviceInfoActions.getInternetInfo(false));
        });
    }
  }

  handleAppStateChange = (nextAppState) => {
    store.dispatch(deviceInfoActions.getAppState(nextAppState));
  }

  render() {
    return (
      <Provider store={store}>
        <Root>
          <AppContainer />
        </Root>
      </Provider>
    );
  }
}

export default App;
