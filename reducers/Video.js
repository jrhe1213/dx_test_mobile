import constants from '../constants';
import bookmarkScreenContants from '../screens/Bookmark/constants';
import feedScreenContants from '../screens/Feed/constants';

const initialState = {
  videoLink: '',
  experienceType: null,
  isFirstOpen: false,
};

export default (state = initialState, action) => {

  let tempUpdatedExperienceStream;

  switch (action.type) {
    case constants.DX_VIDEO_SCREEN:
      return {
        ...state,
        videoLink: action.payload.data,
        experienceType: action.payload.experienceType,
        isFirstOpen: action.payload.isFirstOpen,
      };

    case constants.DX_VIDEO_SCREEN_CLOSE:
    case constants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_SUCCESS:
      return {
        ...state,
        videoLink: '',
        experienceType: null,
        isFirstOpen: false,
      };

    case constants.GET_USER_INFO_SUCCESS:
      if (action.payload.localData.liveJump) {
        tempUpdatedExperienceStream = action.payload.localData.updatedExperienceStream;
        if (tempUpdatedExperienceStream.Experience.ExperienceType == '0') {
          return {
            ...state,
            videoLink: tempUpdatedExperienceStream.Experience.ExperienceCard.Content,
            experienceType: "0",
          };
        }
      }
      return state;

    case bookmarkScreenContants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedScreenContants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
      if (action.payload.acceptedUpdate) {
        if (action.payload.currentTab == 'Video') {
          if (action.payload.experiences.Experience.ExperienceCard.Type == 'VIDEO') {
            return {
              ...state,
              videoLink: action.payload.experiences.Experience.ExperienceCard.Content,
            };
          }
        }
      }
      return state;

    default:
      return state;
  }
};
