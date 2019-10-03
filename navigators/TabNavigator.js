import React from 'react';

// Navigation
import {
  createBottomTabNavigator,
} from 'react-navigation';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import TabComponent from './TabComponent';

// Libraries

// Components
import {
  HomeScreen,
  ChannelScreen,
  BookmarkScreen,
} from '../screens';

// Constants
import colors from '../constants/colors';

const iconSize = 36;

// Main Tab Navigator
const MainRootTabNavigator = createBottomTabNavigator({

  Home: {
    screen: HomeScreen,
    // navigationOptions: {
    // tabBarLabel: 'Home',
    // tabBarIcon: ({ tintColor }) => (
    //   <Icon
    //     name="ios-home"
    //     color={tintColor}
    //     size={iconSize}
    //   />
    // ),
    // },
  },
  Explore: {
    screen: ChannelScreen,
    // navigationOptions: {
    //   // tabBarLabel: 'Explore',
    //   tabBarIcon: ({ tintColor }) => (
    //     <Icon
    //       name="ios-compass"
    //       color={tintColor}
    //       size={iconSize}
    //     />
    //   ),
    // },
  },
  Bookmark: {
    screen: BookmarkScreen,
    // navigationOptions: {
    //   // tabBarLabel: 'Bookmarks',
    //   tabBarIcon: ({ tintColor }) => (
    //     <Icon
    //       color={tintColor}
    //       size={iconSize}
    //     />
    //   ),
    // },
  },

}, {
  lazy: false,
  tabBarComponent: props => <TabComponent />,
  initialRouteName: 'Home',
  swipeEnabled: false,
  animationEnabled: true,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    showIcon: true,
    showLabel: false,
    inactiveTintColor: colors.inactiveColor,
    activeTintColor: colors.activeColor,
    pressColor: colors.activeColor,
    IndicatorStyle: {
      backgroundColor: colors.activeColor,
    },
    style: {
      backgroundColor: colors.whiteColor,
      height: 60,
      borderTopColor: 'transparent',
      shadowColor: colors.greyColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    labelStyle: {
      fontSize: 14,
    },
  },
});

export default MainRootTabNavigator;
