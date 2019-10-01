import React from 'react';
import {
  Dimensions,
} from 'react-native';

// Navigation
import { createDrawerNavigator } from 'react-navigation';

// Tab navigator
import MainRootTabNavigator from './TabNavigator';

// Components
import SideBar from './SideBar';

import {
  HomeScreen,
  ChannelScreen,
  BookmarkScreen,
} from '../screens';

// Main Drawer Navigator
const MainRootDrawerNavigator = createDrawerNavigator({
  MainScreen: { screen: MainRootTabNavigator },
  Home: { screen: HomeScreen },
  Explore: { screen: ChannelScreen },
  Bookmark: { screen: BookmarkScreen },
}, {
  initialRouteName: 'MainScreen',
  drawerWidth: Dimensions.get('window').width * 0.65,
  contentComponent: props => <SideBar {...props} />,
  drawerPosition: 'right',
});

export default MainRootDrawerNavigator;
