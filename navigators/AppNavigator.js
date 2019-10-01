import React from 'react';

// Navigation
import {
  createStackNavigator,
} from 'react-navigation';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';

// DrawerNavigator
import { connect } from 'react-redux';
import MainRootDrawerNavigator from './DrawerNavigator';

// Components
import SectionPage from '../screens/Feed/components/layout/SectionPage';
import FeedbackPage from '../screens/Feed/components/layout/FeedbackPage';
import BookmarkCardPage from '../screens/Bookmark/components/layout/BookmarkCardPage';
import BookmarkSectionPage from '../screens/Bookmark/components/layout/BookmarkSectionPage';
import {
  LoginScreen,
  FeedScreen,
  DownloadScreen,
  VideoScreen,
  LanguageScreen,
  SettingScreen,
  CarouselScreen,
  RegisterScreen,
  TagScreen,
  TagsListViewPage,
} from '../screens';

// Redux

// Redux navigation
const middleware = createReactNavigationReduxMiddleware(
  'root',
  state => state.nav,
);

// Main Stack Navigator - Level 2
const MainRootNavigator = createStackNavigator({
  MainScreen: { screen: MainRootDrawerNavigator },
  // New pages
  Feed: { screen: FeedScreen },
  Section: { screen: SectionPage },
  Feedback: { screen: FeedbackPage },
  Download: { screen: DownloadScreen },
  Video: { screen: VideoScreen },
  Language: { screen: LanguageScreen },
  Settings: { screen: SettingScreen },
  Carousel: { screen: CarouselScreen },
  BookmarkCardPage: { screen: BookmarkCardPage },
  BookmarkSectionPage: { screen: BookmarkSectionPage },
  Register: { screen: RegisterScreen },
  Tag: { screen: TagScreen },
  TagsListView: { screen: TagsListViewPage }
}, {
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false,
  },
});

// Root Stack Navigator - Level 1
const RootNavigator = createStackNavigator({
  Login: { screen: LoginScreen },
  Main: { screen: MainRootNavigator },
}, {
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false,
  },
});
const AppWithNavigationState = reduxifyNavigator(RootNavigator, 'root');

// Redux
const mapStateToProps = state => ({
  state: state.nav,
});

const AppNavigator = connect(mapStateToProps, null)(AppWithNavigationState);

export {
  RootNavigator,
  AppNavigator,
  middleware,
};
