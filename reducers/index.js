import { combineReducers } from 'redux';
import { NavigationActions } from 'react-navigation';

import { RootNavigator } from '../navigators/AppNavigator';

import {
  ChannelReducer,
  FeedReducer,
  BookmarkReducer,
  HomeReducer,
  LoginReducer,
  DownloadReducer,
  SettingReducer,
  CarouselReducer,
  RegisterReducer,
  SearchReducer
} from '../screens';
import constants from '../constants';
import feedScreenContants from '../screens/Feed/constants';
import settingScreenContants from '../screens/Setting/constants';
import bookmarkScreenContants from '../screens/Bookmark/constants';
import downloadScreenContants from '../screens/Download/constants';
import CarouselContants from '../screens/Carousel/constants';
import RegisterContants from '../screens/Register/constants';
import SearchConstants from '../screens/Search/constants';
import homeConstants from '../screens/Home/constants';
import channelConstants from '../screens/Channel/constants';

// Global reducers
import deviceInfo from './DeviceInfo';
import UserReducer from './UserInfo';
import modal from './Modal';
import video from './Video';

// Start with two routes: The Main screen, with the Login screen on top.
const firstAction = RootNavigator.router.getActionForPathAndParams('Main');
const tempNavState = RootNavigator.router.getStateForAction(firstAction);
const secondAction = RootNavigator.router.getActionForPathAndParams('Login');
const initialNavState = RootNavigator.router.getStateForAction(
  secondAction,
  tempNavState,
);
initialNavState.currentTab = 'Login';
initialNavState.history = 'Home,';

function nav(state = initialNavState, action) {
  let nextState;
  let tempRouteName;
  let tempActiveRoute;
  let tempPreviousTab;
  let tempCurrentIndex;

  switch (action.type) {

    case 'Navigation/NAVIGATE':
      nextState = RootNavigator.router.getStateForAction(
        action,
        state,
      );
      nextState.previousTab = nextState.currentTab;
      nextState.currentTab = action.routeName;
      if (action.routeName == 'Feed') {
        nextState.previousEmbedTab = null;
      }
      break;

    // New first load flow
    case constants.GET_FIRST_LOAD_SUCCESS:
      state.currentTab = 'Home';
      state.previousTab = 'Login';
      state.history = 'Home,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Home' }),
        state,
      );
      break;

    case constants.GET_USER_INFO_SUCCESS:
      // version 2: data sync content exit
      if (
        (state.currentTab == 'Section' && action.payload.localData.liveExit)
        || (state.currentTab == 'Video' && state.previousEmbedTab == 'Section' && action.payload.localData.liveExit)
      ) {
        state.currentTab = 'Home';
        state.previousTab = 'Section';
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.navigate({ routeName: 'Home' }),
          state,
        );
      }
      else if ((state.currentTab == 'Video'
        && action.payload.localData.updatedExperienceStream
        && action.payload.localData.updatedExperienceStream.Experience.ExperienceType == '0'
        && action.payload.localData.liveExit)
      ) {
        state.currentTab = 'Home';
        state.previousTab = 'Video';
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.navigate({ routeName: 'Home' }),
          state,
        );
      }
      else if (
        state.currentTab == 'BookmarkCardPage'
        || state.currentTab == 'PAGES'
        || state.currentTab == 'COVER'
        || state.currentTab == 'IMAGES'
        || state.currentTab == 'PDF'
        || state.currentTab == 'VIDEOS'
        || state.currentTab == 'TEXT'
        || state.currentTab == 'LINKS'
        || state.currentTab == 'H5P'
        || state.currentTab == 'TEXT'
        || state.currentTab == 'AUDIO'
      ) {
        state.previousTab = state.currentTab;
        state.currentTab = 'Bookmark';
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.navigate({
            routeName: 'Bookmark'
          }),
          state,
        );
      } else if (state.currentTab == 'Download') {
        state.previousTab = state.currentTab;
        state.currentTab = 'Home';
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.navigate({
            routeName: 'Home'
          }),
          state,
        );
      } else {
        nextState = RootNavigator.router.getStateForAction(action, state);
      }
      break;

    case RegisterContants.DX_REGISTER_SUCCESS:
    case constants.LOGOUT_SUCCESS:
      state.previousTab = state.currentTab;
      state.currentTab = 'Login';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Login' }),
        state,
      );
      break;

    case feedScreenContants.DX_FEED_BACK:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Feedback' }),
        state,
      );
      break;

    case constants.DX_VIDEO_SCREEN:
      state.previousEmbedTab = state.currentTab;
      state.currentTab = 'Video';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Video',
        }),
        state,
      );
      break;

    case constants.DX_VIDEO_SCREEN_CLOSE:
    case constants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_SUCCESS:
      state.currentTab = state.previousEmbedTab;
      state.previousEmbedTab = 'Video';
    
      tempCurrentIndex = !action.payload.isTagEnable ? 1 : 2;
      // If in searchmode remove embedTab
      if (action.payload.currentIndex === tempCurrentIndex && action.payload.isSearch) {
        state.previousEmbedTab = null;
      }
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.back(),
        state,
      );
      break;

    case feedScreenContants.DX_BROWSER:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Section' }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case feedScreenContants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
      if (action.payload.isContinousCall) {
        nextState = RootNavigator.router.getStateForAction(action, state);
        break;
      }
      if (!(action.payload.acceptedUpdate && state.currentTab == 'Video')) {
        state.previousTab = state.currentTab;
      }
      state.currentTab = 'Section';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Section',
        }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedScreenContants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
      if (action.payload.acceptedUpdate) {
        if (state.currentTab == 'Video') {
          if (action.payload.experiences.Experience.ExperienceCard.Type != 'VIDEO') {
            state.currentTab = state.previousEmbedTab;
            nextState = RootNavigator.router.getStateForAction(
              NavigationActions.navigate({
                routeName: state.currentTab,
              }),
              state,
            );
            break;
          }
        }
      }
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;

    case feedScreenContants.DX_BROWSE_TO_CHANNEL_PAGE:
      state.currentTab = 'Explore';
      state.previousEmbedTab = null;
      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Explore',
        }),
        state,
      );
      break;

    case feedScreenContants.DX_BROWSE_TO_PREVIOUS_TAB:

      tempPreviousTab = state.history.match(/[^,]+,/g);
      if (!tempPreviousTab.length) {
        tempPreviousTab = 'Home';
      } else {
        if (tempPreviousTab.length < 2) {
          tempPreviousTab = tempPreviousTab[0];
        } else {
          tempPreviousTab = tempPreviousTab[tempPreviousTab.length - 2];
        }
        tempPreviousTab = tempPreviousTab.replace(',', '');
      }

      if (tempPreviousTab === 'MostPopular'
        || tempPreviousTab === 'Featured'
        || tempPreviousTab === 'NewReleases'
        || tempPreviousTab === 'Trending') {
        tempRouteName = 'Carousel';
      } else if (tempPreviousTab === 'PAGES'
        || tempPreviousTab === 'COVER') {
        tempRouteName = 'BookmarkCardPage';
      } else {
        tempRouteName = tempPreviousTab;
      }
      
      state.previousTab = state.currentTab;
      state.currentTab = tempPreviousTab;
      state.previousEmbedTab = null;

      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: tempRouteName,
        }),
        state,
      );
      break;

    case settingScreenContants.DX_PREFERENCE:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Preference' }),
        state,
      );
      break;

    case settingScreenContants.DX_OPEN_SETTINGS_PAGE:
      state.previousTab = state.currentTab;
      state.previousNavTab = state.currentTab;
      state.currentTab = 'Settings';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Settings',
        }),
        state,
      );
      break;

    case settingScreenContants.DX_CLOSE_SETTINGS_PAGE:
      state.currentTab = state.previousNavTab;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'MainScreen',
        }),
        state,
      );
      break;

    case settingScreenContants.DX_HELP:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Help' }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_FEED_BACK_W:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'FeedbackW' }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_BROWSER_W:
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'SectionW' }),
        state,
      );
      break;

    case feedScreenContants.DX_FEED_BACK_SUCCESS:
      state.currentTab = 'Feedback';
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;


    case feedScreenContants.DX_HOME_BROWSER_BACK:
    case feedScreenContants.DX_BROWSER_BACK:
    case feedScreenContants.DX_FEED_BACK_COMPLETE:

      state.currentTab = state.previousTab;
      state.previousTab = 'Section';
      state.previousEmbedTab = null;

      if (state.currentTab === 'MostPopular'
        || state.currentTab === 'Featured'
        || state.currentTab === 'NewReleases'
        || state.currentTab === 'Trending') {
        tempRouteName = 'Carousel';
      } else if (state.currentTab === 'PAGES' || state.currentTab === 'COVER') {
        tempRouteName = 'BookmarkCardPage';
      } else {
        tempRouteName = state.currentTab;
      }

      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: tempRouteName }),
        state,
      );
      break;

    case downloadScreenContants.DX_DOWNLOAD_PAGE_OPEN:
      state.previousTab = state.currentTab;
      state.previousNavTab = state.currentTab;
      state.currentTab = 'Download';
      state.previousEmbedTab = null;
      state.history += 'Download,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Download',
        }),
        state,
      );
      break;

    case downloadScreenContants.DX_DOWNLOAD_PAGE_CLOSE:
      state.previousTab = state.currentTab;
      state.currentTab = state.previousNavTab;
      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'MainScreen',
        }),
        state,
      );
      break;

    case CarouselContants.DX_FEATURED_PAGE_OPEN:
    case CarouselContants.DX_MOST_POPULAR_PAGE_OPEN:
    case CarouselContants.DX_NEW_RELEASES_PAGE_OPEN:
    case CarouselContants.DX_TRENDING_PAGE_OPEN:
      state.previousTab = 'Home';
      if (action.payload.pageType === 'Featured') {
        tempRouteName = 'Featured';
      } else if (action.payload.pageType === 'MostPopular') {
        tempRouteName = 'MostPopular';
      } else if (action.payload.pageType === 'NewReleases') {
        tempRouteName = 'NewReleases';
      } else if (action.payload.pageType === 'Trending') {
        tempRouteName = 'Trending';
      }

      state.currentTab = tempRouteName;
      state.history += `${tempRouteName},`;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Carousel',
        }),
        state,
      );
      break;

    case CarouselContants.DX_FEATURED_PAGE_CLOSE:
    case CarouselContants.DX_MOST_POPULAR_PAGE_CLOSE:
    case CarouselContants.DX_NEW_RELEASES_PAGE_CLOSE:
    case CarouselContants.DX_TRENDING_PAGE_CLOSE:
      state.currentTab = 'Home';
      state.previousEmbedTab = null;

      if (action.payload.pageType === 'Featured') {
        tempRouteName = 'Featured';
      } else if (action.payload.pageType === 'MostPopular') {
        tempRouteName = 'MostPopular';
      } else if (action.payload.pageType === 'NewReleases') {
        tempRouteName = 'NewReleases';
      } else if (action.payload.pageType === 'Trending') {
        tempRouteName = 'Trending';
      }

      state.previousTab = tempRouteName;
      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'MainScreen',
        }),
        state,
      );
      break;

    case homeConstants.DX_MY_CHANNELS_BACK:
      state.previousTab = state.currentTab;
      state.currentTab = 'Home';
      state.previousEmbedTab = null;
      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Home',
        }),
        state,
      );
      break;

    case channelConstants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES:
      state.previousTab = state.currentTab;
      state.currentTab = 'Feed';
      state.history += `Feed,`;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Feed',
        }),
        state,
      );
      break;

    case channelConstants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES_V2:
      state.previousTab = state.currentTab;
      state.currentTab = 'Feed';
      state.history += `Feed,`;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Feed',
        }),
        state,
      );
      break;

    case constants.OPEN_LANGUAGE_PAGE:
      state.previousTab = state.currentTab;

      state.currentTab = 'Language';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Language',
        }),
        state,
      );
      break;

    case constants.CLOSE_LANGUAGE_PAGE:
      state.currentTab = 'Settings';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Settings',
        }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_OPEN_BOOKMARK_CARDS_PAGE:
      state.currentTab = 'BookmarkCardPage';
      state.previousTab = 'Bookmark';
      state.previousEmbedTab = null;
      state.history += 'BookmarkCardPage,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'BookmarkCardPage',
        }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_CLOSE_BOOKMARK_CARDS_PAGE:
      state.currentTab = 'Bookmark';
      state.previousTab = 'BookmarkCardPage';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Bookmark',
        }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_OPEN_BOOKMARK_SECTION_PAGE:
      state.previousTab = 'Bookmark';
      state.previousEmbedTab = null;

      if (action.payload.sectionType === 'Image') {
        tempRouteName = 'IMAGES';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Pdf') {
        tempRouteName = 'PDF';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Video') {
        tempRouteName = 'VIDEOS';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Text') {
        tempRouteName = 'TEXT';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Link') {
        tempRouteName = 'LINKS';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Other') {
        tempRouteName = 'H5P';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Audio') {
        tempRouteName = 'AUDIO';
        tempActiveRoute = 'BookmarkSectionPage';
      } else if (action.payload.sectionType === 'Cover') {
        tempRouteName = 'COVER';
        tempActiveRoute = 'BookmarkCardPage';
      } else if (action.payload.sectionType === 'Page') {
        tempRouteName = 'PAGES';
        tempActiveRoute = 'BookmarkCardPage';
      }

      state.currentTab = tempRouteName;
      state.history += `${tempRouteName},`;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: tempActiveRoute,
        }),
        state,
      );
      break;

    case bookmarkScreenContants.DX_CLOSE_BOOKMARK_SECTION_PAGE:
      state.currentTab = 'Bookmark';

      if (action.payload.sectionType === 'IMAGES') {
        tempRouteName = 'IMAGES';
      } else if (action.payload.sectionType === 'PDF') {
        tempRouteName = 'PDF';
      } else if (action.payload.sectionType === 'VIDEOS') {
        tempRouteName = 'VIDEOS';
      } else if (action.payload.sectionType === 'TEXT') {
        tempRouteName = 'TEXT';
      } else if (action.payload.sectionType === 'LINKS') {
        tempRouteName = 'LINKS';
      } else if (action.payload.sectionType === 'H5P') {
        tempRouteName = 'H5P';
      } else if (action.payload.sectionType === 'COVER') {
        tempRouteName = 'COVER';
      } else if (action.payload.sectionType === 'PAGES') {
        tempRouteName = 'PAGES';
      } else {
        tempRouteName = 'BookmarkCardPage';
      }

      state.history = state.history.replace(new RegExp('[^,]+,$'), '');
      state.previousTab = tempRouteName;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Bookmark',
        }),
        state,
      );
      break;

    case constants.SET_APP_LANGUAGE_SUCCESS:

      if (!action.payload.isLanguageModal) {
        state.currentTab = 'Settings';
        nextState = RootNavigator.router.getStateForAction(
          NavigationActions.back(),
          state,
        );
      }
      break;

    case constants.DX_OPEN_HOME_PAGE:
      state.currentTab = 'Home';
      state.history = 'Home,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Home',
        }),
        state,
      );
      break;

    case constants.DX_OPEN_EXPLORE_PAGE:
      state.previousTab = state.currentTab;
      state.currentTab = 'Explore';
      state.history = 'Explore,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Explore',
        }),
        state,
      );
      break;

    case constants.DX_OPEN_BOOKMARK_PAGE:
      state.currentTab = 'Bookmark';
      state.history = 'Bookmark,';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Bookmark',
        }),
        state,
      );
      break;

    case RegisterContants.OPEN_REGISTER_PAGE:
      state.previousTab = state.currentTab;
      state.currentTab = 'Register';
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: 'Register',
        }),
        state,
      );
      break;

    case RegisterContants.CLOSE_REGISTER_PAGE:
      state.currentTab = state.previousTab;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: state.previousTab,
        }),
        state,
      );
      break;

    case SearchConstants.DX_GET_TAG_EXP_REQUEST:
      state.previousTab = state.currentTab;
      state.currentTab = 'Tag'
      state.history += `Tag,`;
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: state.currentTab,
        }),
        state,
      );
      break;

    case constants.DX_OPEN_TAGS_LIST_VIEW_PAGE:
      state.previousTab = state.currentTab;
      state.currentTab = 'TagsListView'
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: state.currentTab,
        }),
        state,
      );
      break;

    case SearchConstants.DX_SEARCH_TOGGLE:
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;

    default:
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;
  }
  return nextState || state;
}

const AppReducer = combineReducers({
  nav,
  deviceInfo,
  modal,
  video,
  search: SearchReducer,
  channel: ChannelReducer,
  feed: FeedReducer,
  bookmark: BookmarkReducer,
  explore: HomeReducer,
  login: LoginReducer,
  download: DownloadReducer,
  setting: SettingReducer,
  user: UserReducer,
  carousel: CarouselReducer,
  register: RegisterReducer,
});

export default AppReducer;
