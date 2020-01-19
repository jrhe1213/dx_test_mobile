import mainConstants from '../../constants';
import constants from './constants';
import bookmarkConstants from '../Bookmark/constants';
import homeConstants from '../Home/constants';
import searchConstants from '../Search/constants';

// helpers
import { isObjectEmpty } from '../../helpers';

const INITIAL_STATE = {

  feedChannel: null,

  menuToggle: false,
  experienceStreamWithChannelInfo: {},
  currentExperienceChannelGUID: null,
  currentExperienceStreamGUID: null,
  experienceStream: {},
  document: {},
  current_experience_card: {},
  current_level_section: {
    Title: 'Feed',
  },
  current_suggest_section: {},
  experiences: [],
  isUpdating: false,
  isLoading: false,
  isFirstLoading: false,
  errors: {},
  feedback: {
    alreadyDone: false,
    content: {},
    feed: {},
  },
  downloadData: null,
  isArchived: false,
  totalExpRecords: null,
  pageNumber: 1,
  pullUpRefresh: false,

  totalSections: 0,
  currentPageIndex: 0,

  isFirstGetIn: false,
  acceptedUpdate: false,

  originalFeedChannel: null,

  isFetchNewData: false,
  dataType: null,
};

export default (state = INITIAL_STATE, action) => {
  let tmp_current_level_section;
  let tmp_current_suggest_section;
  let tmp_suggest_parent_node;
  let tempExperiences;
  let tempFormattedOldData;
  let tempCurrentExperiencePageGUID;
  let tempExperienceStreamWithChannelInfo;
  let tempIndex;
  let tempFound;
  let tempExperienceStream;
  let tempDownloads;
  let tempBookmarkCards;
  let tempUpdatedExperienceStream;
  let tempAcceptedUpdate = false;
  let tempFeedChannel = state.feedChannel;

  switch (action.type) {

    case mainConstants.GET_USER_INFO_SUCCESS:
      tempExperiences = Object.assign([], state.experiences);
      tempDownloads = action.payload.localData.downloads;
      tempBookmarkCards = action.payload.localData.bookmarkCards;

      // Add default boolean for download
      tempExperiences = tempExperiences.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        return stream;
      });
      // Add the true to isDownloaded if match
      format_array_of_experiences(tempDownloads, tempExperiences);
      update_experience_streams_boolean(tempExperiences, tempBookmarkCards);


      // Live jump
      tempUpdatedExperienceStream = action.payload.localData.updatedExperienceStream;
      if (action.payload.localData.liveJump && tempUpdatedExperienceStream) {
        if (tempUpdatedExperienceStream.Experience.ExperienceType == 1) {
          // #1. Card and pages

          // update experiences arr from synced data
          tempFound = false;
          action.payload.localData.bookmarkCards.map((item) => {
            if (item.ExperienceStreamGUID === tempUpdatedExperienceStream.ExperienceStreamGUID) {
              tempFound = true;
            }
          })
          if (!tempFound) {
            tempUpdatedExperienceStream.isBookmarked = false;
          }

          tmp_current_level_section = Object.assign({}, tempUpdatedExperienceStream.Experience.ExperiencePages);
          tempCurrentExperiencePageGUID = tmp_current_level_section.CurrentLevelExperiencePageGUID;

          // -1. retrieve from previous home back
          if (tempCurrentExperiencePageGUID) {
            tempFormattedOldData = [];
            assembleOldDataIntoOneDimensionArr(tmp_current_level_section, tempFormattedOldData);
            tmp_current_level_section = retrieveCurrentLevelFromHistory(
              tempFormattedOldData,
              tempCurrentExperiencePageGUID,
            );
            tmp_current_level_section.ExperienceStreamGUID = tempUpdatedExperienceStream.ExperienceStreamGUID;
          }

          // 0. format bookmark boolean
          if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
            tmp_current_level_section.Sections.forEach(item => {
              item.isBookmarked = false;
            })
          }
          update_current_level_bookmark_boolean(
            tmp_current_level_section,
            action.payload.localData.bookmarkSections,
            tempUpdatedExperienceStream.ExperienceStreamGUID,
          );
          // 1. update the content section completed
          update_level_content_complete(
            find_node_by_node(
              tempUpdatedExperienceStream.Experience.ExperiencePages,
              tmp_current_level_section.SectionGUID,
            ),
          );
          update_level_content_complete(tmp_current_level_section);
          // 1.1 add sections to completion arr
          add_sections_to_completion_arr(tmp_current_level_section, tempUpdatedExperienceStream);
          // 2. update parent level section completed
          update_parent_level_section_complete(
            tmp_current_level_section,
            tempUpdatedExperienceStream.Experience.ExperiencePages,
            tempUpdatedExperienceStream
          );
          // 3. update current level section
          tmp_current_level_section = find_node_by_node(
            tempUpdatedExperienceStream.Experience.ExperiencePages,
            tmp_current_level_section.SectionGUID,
          );
          // 4. find the suggest section
          // 4.1 retrieve from previous home back
          if (tempCurrentExperiencePageGUID) {
            update_suggest_section(tmp_current_level_section);
            tmp_current_suggest_section = find_next_suggest(
              tempUpdatedExperienceStream.Experience.ExperiencePages,
              tmp_current_level_section.SectionGUID,
            );
          } else {
            // 4.2 no history applied
            update_suggest_section(tmp_current_level_section);
            tmp_current_suggest_section = find_next_suggest(
              tmp_current_level_section,
              tmp_current_level_section.SectionGUID,
            );
          }

          if (!tmp_current_suggest_section) {
            tmp_current_suggest_section = {
              Type: 'FEEDBACK',
              Title: 'CONTINUE TO FEEDBACK',
              IsCompleted: tempUpdatedExperienceStream.Experience.ExperiencePages.IsFeedbackCompleted,
            };
          } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
            tmp_current_suggest_section = Object.assign(
              {},
              tempUpdatedExperienceStream.Experience.ExperiencePages,
            );
          }

          return {
            ...state,
            experiences: tempExperiences,

            menuToggle: false,
            isLoading: false,
            experienceStreamWithChannelInfo: tempUpdatedExperienceStream,
            currentExperienceStreamGUID: tempUpdatedExperienceStream.ExperienceStreamGUID,
            experienceStream: tempUpdatedExperienceStream,
            document: tempUpdatedExperienceStream.Experience.ExperiencePages,
            current_level_section: tmp_current_level_section,
            current_suggest_section: tmp_current_suggest_section,
            current_experience_card: tempUpdatedExperienceStream.Experience.ExperienceCard,
          };
        } else if (tempUpdatedExperienceStream.Experience.ExperienceType == 0) {
          // #2. Card only

          // update experiences arr from synced data
          tempFound = false;
          action.payload.localData.bookmarkCards.map((item) => {
            if (item.ExperienceStreamGUID === tempUpdatedExperienceStream.ExperienceStreamGUID) {
              tempFound = true;
            }
          })
          if (!tempFound) {
            tempUpdatedExperienceStream.isBookmarked = false;
          }

          return {
            ...state,
            experiences: tempExperiences,

            isLoading: false,
            experienceStreamWithChannelInfo: tempUpdatedExperienceStream,
            currentExperienceStreamGUID: tempUpdatedExperienceStream.ExperienceStreamGUID,
            current_experience_card: tempUpdatedExperienceStream.Experience.ExperienceCard,
          };
        }
      } else {
        return {
          ...state,
          experiences: tempExperiences
        };
      }

    case constants.DX_FEED_CHANNEL_CHANGE:
      return {
        ...state,
        feedChannel: action.payload.channel,
        experiences: [],
        pageNumber: 1,
        totalExpRecords: null,
      };

    case constants.UPDATE_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: state.pageNumber + 1,
        isUpdating: true,
        pullUpRefresh: action.payload.pullUpRefresh,
      };

    case constants.SET_RESET_ARCHIVE:
      return {
        ...state,
        isArchived: false,
      };

    // Get the channel experience list
    case constants.DX_POST_STREAM_EXPRERIENCE_LIST_REQUEST:
      tmp_current_level_section = Object.assign({}, state.current_level_section);

      return {
        ...state,
        isLoading: true,
        isFirstLoading: state.pageNumber === 1,
        current_level_section: tmp_current_level_section,
        currentExperienceChannelGUID: action.payload.data.Extra.ExperienceChannelGUID,
      };

    case constants.DX_POST_STREAM_EXPRERIENCE_LIST_SUCCESS:
      const {
        bookmarks,
        downloads,
        experiences: {
          Response: { ExperienceStreams, TotalRecord },
        },
        isSearch,
      } = action.payload;

      // Add default boolean for download and bookmarks
      tempExperiences = ExperienceStreams.map((stream) => {
        stream.isDownloaded = false;
        stream.isBookmarked = false;
        stream.isContentUpdated = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(downloads, tempExperiences);

      // Add the true to isBookmarked if match
      update_experience_streams_boolean(tempExperiences, bookmarks.cards);

      // loadmore or pullup or search list
      if (state.pullUpRefresh && !isSearch) {
        tempExperiences = [...tempExperiences, ...state.experiences];
      } else if (!state.pullUpRefresh && !isSearch) {
        tempExperiences = [...state.experiences, ...tempExperiences];
      }

      return {
        ...state,
        experiences: tempExperiences,
        isUpdating: false,
        isLoading: false,
        isFirstLoading: false,
        totalExpRecords: TotalRecord,
      };

    case constants.DX_POST_STREAM_EXPRERIENCE_LIST_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoading: false,
      };

    case constants.DX_BROWSE_TO_CHANNEL_PAGE:
      tmp_current_level_section = Object.assign({}, state.current_level_section);

      return {
        ...state,
        current_level_section: tmp_current_level_section,
        experiences: [],
        pageNumber: 1,
        feedChannel: null
      };

    // ================================
    // Card and pages
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case constants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:

      // update experiences arr from synced data
      tempFound = false;
      // Bookmark cards
      action.payload.bookmarkCards.map((item) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
        }
      })
      if (!tempFound) {
        action.payload.experiences.isBookmarked = false;
      }

      tmp_current_level_section = Object.assign(
        {},
        action.payload.experiences.Experience.ExperiencePages,
      );
        
      tempCurrentExperiencePageGUID = tmp_current_level_section.CurrentLevelExperiencePageGUID;

      // -1. retrieve from previous home back
      if (tempCurrentExperiencePageGUID) {
        tempFormattedOldData = [];
        assembleOldDataIntoOneDimensionArr(tmp_current_level_section, tempFormattedOldData);
        tmp_current_level_section = retrieveCurrentLevelFromHistory(
          tempFormattedOldData,
          tempCurrentExperiencePageGUID,
        );
        tmp_current_level_section.ExperienceStreamGUID = action.payload.experienceStreamGUID;
      }

      // 0. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        action.payload.experienceStreamGUID,
      );

      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(
          action.payload.experiences.Experience.ExperiencePages,
          tmp_current_level_section.SectionGUID,
        ),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, action.payload.experiences);
      // 2. update parent level section completed
      update_parent_level_section_complete(
        tmp_current_level_section,
        action.payload.experiences.Experience.ExperiencePages,
        action.payload.experiences
      );
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        action.payload.experiences.Experience.ExperiencePages,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      // 4.1 retrieve from previous home back
      if (tempCurrentExperiencePageGUID) {
        update_suggest_section(tmp_current_level_section);
        tmp_current_suggest_section = find_next_suggest(
          action.payload.experiences.Experience.ExperiencePages,
          tmp_current_level_section.SectionGUID,
        );
      } else {
        // 4.2 no history applied
        update_suggest_section(tmp_current_level_section);
        tmp_current_suggest_section = find_next_suggest(
          tmp_current_level_section,
          tmp_current_level_section.SectionGUID,
        );
      }

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: action.payload.experiences.Experience.ExperiencePages.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          action.payload.experiences.Experience.ExperiencePages,
        );
      }

      tempExperiences = Object.assign([], state.experiences);
      tempExperiences.forEach((item) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          item.isDownloaded = true;
        }
      });

      if (action.payload.acceptedUpdate) {
        tempAcceptedUpdate = action.payload.acceptedUpdate;
        action.payload.experiences.Experience.ExperiencePages.Sections.map((item) => {
          if (item.isBookmarked) {
            item.isBookmarked = false;
          }
        });
        tempExperienceStream = state.experienceStream;
      }

      if (action.payload.isSkipPageUpdate) {
        return {
          ...state,
          menuToggle: false,
          isLoading: false,
          experiences: tempExperiences,
          experienceStreamWithChannelInfo: action.payload.experiences,
          currentExperienceStreamGUID: action.payload.experienceStreamGUID,
          experienceStream: tempExperienceStream,
          document: action.payload.experiences.Experience.ExperiencePages,
          current_experience_card: action.payload.experienceCard,
          isFirstGetIn: action.payload.isFirstGetIn,
          acceptedUpdate: tempAcceptedUpdate,

          isFetchNewData: action.payload.experiences.isFetchNewData,
          dataType: action.payload.experiences.dataType,

          current_level_section: tmp_current_level_section,
        }
      }

      return {
        ...state,
        menuToggle: false,
        isLoading: false,
        experiences: tempExperiences,
        experienceStreamWithChannelInfo: action.payload.experiences,
        currentExperienceStreamGUID: action.payload.experienceStreamGUID,
        experienceStream: tempExperienceStream,
        document: action.payload.experiences.Experience.ExperiencePages,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        current_experience_card: action.payload.experienceCard,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0,

        isFirstGetIn: action.payload.isFirstGetIn,
        acceptedUpdate: tempAcceptedUpdate,

        isFetchNewData: action.payload.experiences.isFetchNewData,
        dataType: action.payload.experiences.dataType,
      };

    // ================================
    // Card only
    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case constants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:

      // update experiences arr from synced data
      tempFound = false;
      action.payload.bookmarkCards.map((item) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
        }
      })
      if (!tempFound) {
        action.payload.experiences.isBookmarked = false;
      }

      tempFound = false;
      tempExperiences = Object.assign([], state.experiences);
      tempExperiences.map((item, i) => {
        if (item.ExperienceStreamGUID === action.payload.experienceStreamGUID) {
          tempFound = true;
          tempIndex = i;
        }
      });
      if (tempFound) {
        action.payload.experiences.isDownloaded = true;
        tempExperiences.splice(tempIndex, 1, action.payload.experiences);
      }
      return {
        ...state,
        isLoading: false,
        experiences: tempExperiences,
        experienceStreamWithChannelInfo: action.payload.experiences,
        currentExperienceStreamGUID: action.payload.experienceStreamGUID,
        current_experience_card: action.payload.experienceCard,

        isFirstGetIn: action.payload.isFirstGetIn,
        isFetchNewData: action.payload.experiences.isFetchNewData,
        dataType: action.payload.experiences.dataType,
      };

    case constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isLoading: false,
      };

    case constants.DX_SECTION_MENU_TOGGLE:
      // report 1
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;
      return {
        ...state,
        menuToggle: action.payload.toggle,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
      };

    case mainConstants.OPEN_MODAL:
      // report 1
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.IsMenuClick = true;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;
      return {
        ...state,
        menuToggle: false,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
      };

    case mainConstants.CLOSE_MODAL:
      // report 1
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;
      return {
        ...state,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
      };

    case mainConstants.DX_VIDEO_SCREEN:
      // report 1
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;
      return {
        ...state,
        menuToggle: false,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
      };

    case mainConstants.DX_VIDEO_SCREEN_CLOSE:
      // report 1
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;
      return {
        ...state,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
      };

    case constants.DX_SCROLL:
      if (!isObjectEmpty(state.document)) {
        tmp_current_level_section = Object.assign(
          {},
          find_node_by_node(state.document, state.current_level_section.SectionGUID),
        );
        // 1. update the completion of progress bar
        tmp_current_level_section.Completion = action.payload.completion;
        tmp_current_level_section.IsBottom = action.payload.isBottom;
        return {
          ...state,
          current_level_section: tmp_current_level_section,
        };
      }
      // GO TO FEEDBACK PAGE
      return {
        ...state,
      };

    case constants.DX_BROWSER:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tmp_current_level_section = Object.assign({}, action.payload.document);
      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(action.payload.document, tmp_current_level_section.SectionGUID),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(tmp_current_level_section, action.payload.document, tempExperienceStreamWithChannelInfo);
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        action.payload.document,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        tmp_current_level_section,
        tmp_current_level_section.SectionGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: action.payload.document.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }

      return {
        ...state,
        document: action.payload.document,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo
      };

    case constants.DX_HOME_BROWSER_BACK:
    case constants.DX_BROWSER_BACK:
    case constants.DX_TRAINING_COMPLETE:
      // 1. feed current section
      tmp_current_level_section = {
        Title: 'Feed',
      };
      return {
        ...state,
        document: {},
        current_level_section: tmp_current_level_section,
        experienceStreamWithChannelInfo: {},

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0
      };

    case constants.DX_HOME_BACK_SUCCESS:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tmp_current_level_section = Object.assign({}, state.document);

      // 0. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        state.currentExperienceStreamGUID,
      );
      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(tmp_current_level_section, tmp_current_level_section.SectionGUID),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(tmp_current_level_section, tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        tmp_current_level_section,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        tmp_current_level_section,
        tmp_current_level_section.SectionGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: tmp_current_level_section.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }
      return {
        ...state,
        menuToggle: false,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo
      };

    case constants.DX_SECTION_BROWSER:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      tmp_current_level_section = Object.assign({}, action.payload.current_level_section);

      // 0. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        state.experienceStreamWithChannelInfo.ExperienceStreamGUID,
      );
      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(state.document, tmp_current_level_section.SectionGUID),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(tmp_current_level_section, state.document, tempExperienceStreamWithChannelInfo);
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        state.document,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        state.document,
        tmp_current_level_section.SectionGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: state.document.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }

      // report 1
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;

      return {
        ...state,
        menuToggle: false,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0
      };

    case constants.DX_SECTION_BROWSER_BACK:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      // 1. find parent level section
      tmp_current_level_section = find_parent_node_by_child_node(
        state.document,
        state.current_level_section.SectionGUID,
      );
      update_level_content_complete(
        find_node_by_node(state.document, tmp_current_level_section.SectionGUID),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(tmp_current_level_section, state.document, tempExperienceStreamWithChannelInfo);
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        state.document,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        state.document,
        tmp_current_level_section.SectionGUID,
      );
      // 5. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        state.currentExperienceStreamGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: state.document.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }

      // report 1
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;

      return {
        ...state,
        menuToggle: false,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0
      };

    case constants.DX_FEED_BACK_SUCCESS:
      // 1. feed back current section
      tmp_current_level_section = {
        SectionGUID: state.document.SectionGUID,
        Type: 'FEEDBACK',
        Title: 'FEEDBACK',
      };
      tmp_current_suggest_section = {
        SectionGUID: state.document.SectionGUID,
        Title: 'THANK YOU',
      };
      return {
        ...state,
        document: {},
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        experienceStreamWithChannelInfo: action.payload.experienceStreamWithChannelInfo,
      };

    case constants.DX_FEED_BACK_COMPLETE_SUCCESS:
      // 1. feed back current section
      tmp_current_level_section = {
        Title: 'Feed',
      };
      return {
        ...state,
        current_level_section: tmp_current_level_section,
        experienceStreamWithChannelInfo: {}
      };

    case constants.DX_SECTION_SUGGEST_BROWSER:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      // 1. Check which level currently in
      tmp_current_level_section = state.current_level_section;
      tmp_current_suggest_section = state.current_suggest_section;
      tmp_suggest_parent_node = find_parent_node_by_child_node(
        state.document,
        tmp_current_suggest_section.SectionGUID,
      );

      if (tmp_suggest_parent_node && tmp_suggest_parent_node.IsRoot && !tmp_current_level_section.IsRoot) {
        // go the top menu
        tmp_current_level_section = Object.assign({}, state.document);
        // 1. update the content section completed
        update_level_content_complete(
          find_node_by_node(state.document, tmp_current_level_section.SectionGUID),
        );
        update_level_content_complete(tmp_current_level_section);
        // 1.1 add sections to completion arr
        add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
        // 2. update parent level section completed
        update_parent_level_section_complete(tmp_current_level_section, state.document, tempExperienceStreamWithChannelInfo);
        // 3. update current level section
        tmp_current_level_section = find_node_by_node(
          state.document,
          tmp_current_level_section.SectionGUID,
        );
        // 4. find the suggest section
        update_suggest_section(tmp_current_level_section);
        tmp_current_suggest_section = find_next_suggest(
          state.document,
          tmp_current_level_section.SectionGUID,
        );
        if (!tmp_current_suggest_section) {
          tmp_current_suggest_section = {
            Type: 'FEEDBACK',
            Title: 'CONTINUE TO FEEDBACK',
            IsCompleted: state.document.IsFeedbackCompleted,
          };
        } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
          tmp_current_suggest_section = Object.assign(
            {},
            tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
          );
        }
      } else {
        // go the suggestion
        tmp_current_level_section = Object.assign({}, state.current_suggest_section);
        // 0. format bookmark boolean
        if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
          tmp_current_level_section.Sections.forEach(item => {
            item.isBookmarked = false;
          })
        }
        update_current_level_bookmark_boolean(
          tmp_current_level_section,
          action.payload.bookmarks,
          state.experienceStreamWithChannelInfo.ExperienceStreamGUID,
        );

        // 1. update the content section completed
        update_level_content_complete(
          find_node_by_node(state.document, tmp_current_level_section.SectionGUID),
        );
        update_level_content_complete(tmp_current_level_section);
        // 1.1 add sections to completion arr
        add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
        // 2. update parent level section completed
        update_parent_level_section_complete(tmp_current_level_section, state.document, tempExperienceStreamWithChannelInfo);
        // 3. update current level section
        tmp_current_level_section = find_node_by_node(
          state.document,
          tmp_current_level_section.SectionGUID,
        );
        // 4. find the suggest section
        update_suggest_section(tmp_current_level_section);
        tmp_current_suggest_section = find_next_suggest(
          state.document,
          tmp_current_level_section.SectionGUID,
        );

        if (!tmp_current_suggest_section) {
          tmp_current_suggest_section = {
            Type: 'FEEDBACK',
            Title: 'CONTINUE TO FEEDBACK',
            IsCompleted: state.document.IsFeedbackCompleted,
          };
        } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
          tmp_current_suggest_section = Object.assign(
            {},
            tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
          );
        }
      }

      // report 1
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;

      return {
        ...state,
        menuToggle: false,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0
      };

    case constants.POST_FEEDBACK:
      return {
        ...state,
        feedback: {
          alreadyDone: true,
          content: action.payload,
          feed: {},
        },
      };

    // Add bookmark for cards
    case bookmarkConstants.DX_ADD_BOOKMARK_CARDS_SUCCESS:
      tempExperiences = Object.assign([], state.experiences);
      tempExperiences.forEach((item) => {
        if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
          item.isBookmarked = true;
        }
      });
      return {
        ...state,
        experiences: tempExperiences,
      };

    // Add bookmark for elements
    case bookmarkConstants.DX_ADD_BOOKMARK_SECTIONS_SUCCESS:
      tmp_current_level_section = Object.assign({}, state.current_level_section);
      tmp_current_level_section.Sections.forEach((item) => {
        if (item.SectionGUID === action.payload.SectionGUID) {
          item.isBookmarked = true;
        }
      });
      return {
        ...state,
        current_level_section: tmp_current_level_section,
      };

    // Delete bookmark for cards
    case bookmarkConstants.DX_DELETE_BOOKMARK_CARDS_SUCCESS:
      tempExperiences = Object.assign([], state.experiences);
      tempExperiences.forEach((item) => {
        if (item.ExperienceStreamGUID === action.payload.data.ExperienceStreamGUID) {
          item.isBookmarked = false;
        }
      });
      return {
        ...state,
        experiences: tempExperiences,
      };

    // Delete bookmark for section
    case bookmarkConstants.DX_DELETE_BOOKMARK_SECTIONS_SUCCESS:
      tmp_current_level_section = Object.assign({}, state.current_level_section);
      if (tmp_current_level_section.Sections) {
        tmp_current_level_section.Sections.forEach((item) => {
          if (item.SectionGUID === action.payload.SectionGUID) {
            item.isBookmarked = false;
          }
        });
      }
      return {
        ...state,
        current_level_section: tmp_current_level_section,
      };

    // Archive experience
    case constants.DX_ARCHIVE_SUCCESS:
      tmp_current_level_section = Object.assign(
        {},
        action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages,
      );
      // 0. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        state.currentExperienceStreamGUID,
      );
      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(
          action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages,
          tmp_current_level_section.SectionGUID,
        ),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, action.payload.experienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(
        tmp_current_level_section,
        action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages,
        action.payload.experienceStreamWithChannelInfo
      );
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        tmp_current_level_section,
        tmp_current_level_section.SectionGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted:
            action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages
              .IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }

      // report 1
      tempExperienceStreamWithChannelInfo = action.payload.experienceStreamWithChannelInfo;
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;

      return {
        ...state,
        menuToggle: false,
        isLoading: false,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
        currentExperienceStreamGUID: action.payload.experienceStreamWithChannelInfo.ExperienceStreamGUID,
        experienceStream: action.payload.experienceStreamWithChannelInfo.Experience,
        document: action.payload.experienceStreamWithChannelInfo.Experience.ExperiencePages,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        current_experience_card: action.payload.experienceStreamWithChannelInfo.Experience.ExperienceCard,
        isArchived: true,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0
      };

    case mainConstants.LOGOUT_REQUEST:
      return {
        ...state,
        experiences: [],
        totalExpRecords: null,
        pageNumber: 1,
      };

    case constants.UPDATE_SECTION_PAGE_NUMBER:
      return {
        ...state,
        currentPageIndex: state.currentPageIndex + 1,
      };

    case bookmarkConstants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST:
    case constants.DX_POST_STREAM_EXPRERIENCE_CARD_INFO_V2_REQUEST:
      return {
        ...state,
        isFirstGetIn: false,
        acceptedUpdate: false
      };

    case homeConstants.DX_MY_CHANNELS_BACK:
    case constants.DX_BROWSE_TO_PREVIOUS_TAB:
      return {
        ...state,
        // feedChannel: null,
        experiences: [],
        pageNumber: 1,
        totalExpRecords: null,
      }

    case searchConstants.DX_SEARCH_TOGGLE:
      if (!action.payload.toggle) {
        tempFeedChannel = state.originalFeedChannel;
      } else {
        tempFeedChannel = state.feedChannel;
      }

      return {
        ...state,
        feedChannel: tempFeedChannel,
        originalFeedChannel: state.feedChannel,
      }

    case searchConstants.DX_HANDLE_GO_TO_PAGE:

      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo;
      // go the target page
      tmp_current_level_section = find_node_by_node_v2(
        state.document,
        action.payload.section.PageGUID,
      );
      // 0. format bookmark boolean
      if (tmp_current_level_section.Sections && tmp_current_level_section.Sections.length) {
        tmp_current_level_section.Sections.forEach(item => {
          item.isBookmarked = false;
        })
      }
      update_current_level_bookmark_boolean(
        tmp_current_level_section,
        action.payload.bookmarks,
        state.experienceStreamWithChannelInfo.ExperienceStreamGUID,
      );

      // 1. update the content section completed
      update_level_content_complete(
        find_node_by_node(state.document, tmp_current_level_section.SectionGUID),
      );
      update_level_content_complete(tmp_current_level_section);
      // 1.1 add sections to completion arr
      add_sections_to_completion_arr(tmp_current_level_section, tempExperienceStreamWithChannelInfo);
      // 2. update parent level section completed
      update_parent_level_section_complete(tmp_current_level_section, state.document, tempExperienceStreamWithChannelInfo);
      // 3. update current level section
      tmp_current_level_section = find_node_by_node(
        state.document,
        tmp_current_level_section.SectionGUID,
      );
      // 4. find the suggest section
      update_suggest_section(tmp_current_level_section);
      tmp_current_suggest_section = find_next_suggest(
        state.document,
        tmp_current_level_section.SectionGUID,
      );

      if (!tmp_current_suggest_section) {
        tmp_current_suggest_section = {
          Type: 'FEEDBACK',
          Title: 'CONTINUE TO FEEDBACK',
          IsCompleted: state.document.IsFeedbackCompleted,
        };
      } else if (tmp_current_suggest_section && !tmp_current_suggest_section.Sections) {
        tmp_current_suggest_section = Object.assign(
          {},
          tempExperienceStreamWithChannelInfo.Experience.ExperiencePages,
        );
      }

      // report 1
      tempExperienceStreamWithChannelInfo.numberOfImpressions = tempExperienceStreamWithChannelInfo.numberOfImpressions + 1;

      return {
        ...state,

        menuToggle: false,
        current_level_section: tmp_current_level_section,
        current_suggest_section: tmp_current_suggest_section,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,

        totalSections: tmp_current_level_section.Sections ? tmp_current_level_section.Sections.length : 0,
        currentPageIndex: 0,
        feedChannel: state.originalFeedChannel,
      }


    case mainConstants.CLOSE_AUDIO_MODAL:
      tempExperienceStreamWithChannelInfo = state.experienceStreamWithChannelInfo

      tempFound = false;

      // Add current time to AudioArr
      if (!tempExperienceStreamWithChannelInfo.AudioCompletionArr) {
        tempExperienceStreamWithChannelInfo.AudioCompletionArr = [];
      }

      if (tempExperienceStreamWithChannelInfo.AudioCompletionArr.length) {
        tempExperienceStreamWithChannelInfo.AudioCompletionArr
          .map((item, i) => {
          if ((item.SectionGUID === action.payload.sectionData.SectionGUID) && (item.ExperiencePageGUID === action.payload.sectionData.ExperiencePageGUID)) {
            tempIndex = i;
            tempFound = true;
          }
        })
      }

      if (tempFound) {
        tempExperienceStreamWithChannelInfo.AudioCompletionArr.splice(tempIndex, 1, action.payload.sectionData);
      } else {
        tempExperienceStreamWithChannelInfo.AudioCompletionArr.push(action.payload.sectionData);
      }

      // Add current time to original Section
      if (tempExperienceStreamWithChannelInfo.Experience && tempExperienceStreamWithChannelInfo.Experience.ExperienceType === "1") {
        tempExperienceStreamWithChannelInfo.Experience.ExperiencePages.Sections.map(item => {
          if (item.SectionGUID === action.payload.sectionData.SectionGUID) {
            item.CurrentTime = action.payload.sectionData.CurrentTime;
          }
        })
      }

      tmp_current_level_section = state.current_level_section;
      // Add current time to currentLevelSection as well
      if (tmp_current_level_section.Sections) {
        tmp_current_level_section.Sections.map(item => {
          if (item.SectionGUID === action.payload.sectionData.SectionGUID) {
            item.CurrentTime = action.payload.sectionData.CurrentTime;
          }
        })
      }

      return {
        ...state,
        experienceStreamWithChannelInfo: tempExperienceStreamWithChannelInfo,
        current_level_section: tmp_current_level_section,
      }

    default:
      return state;
  }
};

// FUNCTION
const find_parent_node_by_child_node = (currentNode, id) => {
  let i;
  let currentChild;
  let result;
  if (currentNode.Sections) {
    for (i = 0; i < currentNode.Sections.length; i += 1) {
      currentChild = currentNode.Sections[i];
      if (currentChild.SectionGUID == id) {
        return currentNode;
      }
    }
    for (i = 0; i < currentNode.Sections.length; i += 1) {
      currentChild = currentNode.Sections[i];
      result = find_parent_node_by_child_node(currentChild, id);

      if (result) {
        return result;
      }
    }
  } else {
    return false;
  }
};

const find_node_by_node = (currentNode, id) => {
  let i;
  let currentChild;
  let result;
  if (currentNode.SectionGUID == id) {
    return currentNode;
  }
  if (!currentNode.Sections) {
    return false;
  }
  for (i = 0; i < currentNode.Sections.length; i += 1) {
    currentChild = currentNode.Sections[i];
    result = find_node_by_node(currentChild, id);
    if (result) {
      return result;
    }
  }
};

const find_node_by_node_v2 = (currentNode, id) => {
  let i;
  let currentChild;
  let result;
  if (currentNode.PageGUID == id) {
    return currentNode;
  }
  if (!currentNode.Sections) {
    return false;
  }
  for (i = 0; i < currentNode.Sections.length; i += 1) {
    currentChild = currentNode.Sections[i];
    result = find_node_by_node_v2(currentChild, id);
    if (result) {
      return result;
    }
  }
};

const update_level_content_complete = (current_level_section) => {
  if (!current_level_section.Sections) {
    return;
  }
  for (let i = 0; i < current_level_section.Sections.length; i++) {
    const section = current_level_section.Sections[i];
    if (section.IsContent) {
      section.IsCompleted = true;
    }
    current_level_section.Sections[i] = section;
  }
};

const update_parent_level_section_complete = (current_level_section, document, experienceStream) => {
  if (!current_level_section.Sections) {
    return;
  }
  let all_completed = true;
  for (let i = 0; i < current_level_section.Sections.length; i++) {
    const section = current_level_section.Sections[i];
    if (!section.IsCompleted) {
      all_completed = false;
    }
  }
  if (all_completed) {
    const currentNode = find_node_by_node(document, current_level_section.SectionGUID);
    currentNode.IsCompleted = true;

    // completion for page: PageGUID
    if (!experienceStream.CompletionArr) {
      experienceStream.CompletionArr = [];
    }
    if (!experienceStream.CompletionArr.includes(currentNode.PageGUID)) {
      experienceStream.CompletionArr.push(currentNode.PageGUID);
    }

    const parentNode = find_parent_node_by_child_node(document, current_level_section.SectionGUID);
    if (parentNode) {
      update_parent_level_section_complete(parentNode, document, experienceStream);
    }
  }
};

const update_suggest_section = (current_level_section) => {
  if (!current_level_section.Sections) {
    return;
  }
  const dataArr = current_level_section.Sections;
  for (let i = 0; i < dataArr.length; i++) {
    const section = dataArr[i];
    if (!section.IsCompleted) {
      section.IsRecommended = true;
      break;
    }
  }
  current_level_section.Sections = dataArr;
};

const find_next_suggest = (document, id) => {
  let result = false;
  let parentNode;

  const currentNode = find_node_by_node(document, id);
  if (!currentNode.Sections) {
    return false;
  }
  for (let i = 0; i < currentNode.Sections.length; i++) {
    if (!currentNode.Sections[i].IsCompleted) {
      result = true;
      return currentNode.Sections[i];
    }
  }
  if (!result) {
    parentNode = find_parent_node_by_child_node(document, id);
    if (parentNode) {
      return find_next_suggest(document, parentNode.SectionGUID);
    }
    // Completed
    return false;
  }
};

const format_array_of_experiences = (downloads, experience) => {
  if (!downloads) {
    return;
  }
  if (!experience) {
    return;
  }

  for (let i = 0; i < downloads.length; i++) {
    const item1 = downloads[i];
    for (let j = 0; j < experience.length; j++) {
      const item2 = experience[j];
      if (item1.ExperienceStreamGUID === item2.ExperienceStreamGUID) {
        experience[j].isDownloaded = true;

        // Check for updATE
        if (item2.UpdatedAt != item1.UpdatedAt) {
          experience[j].isContentUpdated = true;
        }
      }
    }
  }
};

const update_current_level_bookmark_boolean = (
  current_section,
  bookmarks,
  currentExperienceStreamGUID,
) => {
  if (!bookmarks) {
    return;
  }
  if (!current_section.Sections || !bookmarks.length) {
    return current_section;
  }
  for (let i = 0; i < current_section.Sections.length; i++) {
    const item1 = current_section.Sections[i];
    for (let j = 0; j < bookmarks.length; j++) {
      const item2 = bookmarks[j];

      // Same experience streamed in different channel: different ExperienceStreamGUID
      if (
        item1.SectionGUID === item2.SectionGUID
        && item2.ExperienceStreamGUID === currentExperienceStreamGUID
      ) {
        current_section.Sections[i].isBookmarked = true;
      }
    }
  }
  return current_section;
};

const update_experience_streams_boolean = (experienceStreams, bookmarks) => {
  if (!bookmarks.length || !experienceStreams.length) {
    return experienceStreams;
  }
  for (let i = 0; i < experienceStreams.length; i++) {
    const item1 = experienceStreams[i];
    for (let j = 0; j < bookmarks.length; j++) {
      const item2 = bookmarks[j];
      if (item1.ExperienceStreamGUID === item2.ExperienceStreamGUID) {
        experienceStreams[i].isBookmarked = true;
      }
    }
  }
};

const assembleOldDataIntoOneDimensionArr = (oldData, formattedOldData) => {
  formattedOldData.push(oldData);
  if (oldData.Sections) {
    for (let i = 0; i < oldData.Sections.length; i++) {
      assembleOldDataIntoOneDimensionArr(oldData.Sections[i], formattedOldData);
    }
  } else {
  }
};

const retrieveCurrentLevelFromHistory = (array, experiencePageGUID) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].ExperiencePageGUID == experiencePageGUID) {
      return array[i];
    }
  }
};

const add_sections_to_completion_arr = (current_level_section, experienceStream) => {
  if (!current_level_section.Sections) {
    return;
  }
  if (!experienceStream.CompletionArr) {
    experienceStream.CompletionArr = [];
  }
  for (let i = 0; i < current_level_section.Sections.length; i++) {
    let item = current_level_section.Sections[i];
    if (!item.Sections) {
      // completion for section: SectionGUID
      if (!experienceStream.CompletionArr.includes(item.SectionGUID)) {
        experienceStream.CompletionArr.push(item.SectionGUID);
      }
    }
  }
}
