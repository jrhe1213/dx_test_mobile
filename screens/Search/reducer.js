import constants from './constants';
import feedConstants from '../Feed/constants';
import channelConstants from '../Channel/constants';
import bookmarkScreenContants from '../Bookmark/constants';
import deviceInfoConstants from '../../constants';

const initialState = {
  searchValue: null,
  searchValueSection: null,
  searchToggle: false,
  searchToggleSection: false,
  searchType: null,
  currentIndex: 0,

  tagsList: [],
  totalTagsRecord: null,
  isLoadingTags: false,
  isFirstLoadingTags: false,
  pageNumberTags: 1,

  channelList: [],
  totalChannelsRecord: null,
  isLoadingChannels: false,
  isFirstLoadingChannels: false,
  pageNumberChannels: 1,

  contentList: [],
  totalContentRecord: null,
  isLoadingContent: false,
  isFirstLoadingContent: false,
  pageNumberContent: 1,

  tagExpList: [],
  totalTagExpRecord: null,
  isLoadingTagExp: false,
  isFirstLoadingTagExp: false,
  pageNumberTagExp: 1,

  isUpdating: false,

  clickedTag: null,

  isSearch: false,
  isSearchSection: false,

  currentTabIndex: 0,

  sectionListArr: [],
  searchSectionListArr: [],
  pageNumberSectionSearch: 1,
  isFirstLoadingSearchSection: false,
  isLoadingSearchSection: false,

  isV2Search: false,

  isInsideSection: false,
};

export default (state = initialState, action) => {
  let tempTagsList = state.tagsList;
  let tempTotalTagsRecord = state.totalTagsRecord;
  let tempPageNumberTags = state.pageNumberTags;

  let tempChannelList = state.channelList;
  let tempTotalChannelsRecord = state.totalChannelsRecord;
  let tempPageNumberChannels = state.pageNumberChannels;

  let tempContentList = state.contentList;
  let tempTotalContentRecord = state.totalContentRecord;
  let tempPageNumberContent = state.pageNumberContent;

  let tempCurrentIndex = state.currentIndex;
  let tempSearchToggle;
  let tempHistory;

  let tempTagExpList = state.tagExpList;
  let tempTotalTagExpRecord = state.totalTagExpRecord;
  let tempPageNumberTagExp = state.pageNumberTagExp;

  let tempSectionListArr;
  let tempSearchSectionListArr;

  let tempIsFirstLoadingSearchSection;

  switch (action.type) {
    case constants.DX_SEARCH_TOGGLE:
      if (action.payload.toggle === false) {
        tempChannelList = [];
        tempTotalChannelsRecord = null;
        tempPageNumberChannels = 1;
        tempContentList = [];
        tempTotalContentRecord = null;
        tempPageNumberContent = 1;
      }
      return {
        ...state,
        searchToggle: action.payload.toggle,
        searchType: action.payload.type,
        tagsList: [],
        totalTagsRecord: null,
        pageNumberTags: 1,
        channelList: tempChannelList,
        totalChannelsRecord: tempTotalChannelsRecord,
        pageNumberChannels: tempPageNumberChannels,
        contentList: tempContentList,
        totalContentRecord: tempTotalContentRecord,
        pageNumberContent: tempPageNumberContent,
        currentIndex: 0,
        currentTabIndex: 0,

        isSearch: action.payload.toggle,
        pageNumberSectionSearch: 1,
        searchSectionListArr: [],
        searchValue: null,
        isV2Search: false,
      };

    case constants.DX_SEARCH_SECTION_TOGGLE:
      return {
        ...state,
        searchToggleSection: action.payload.toggle,
        searchValueSection: null,
        // searchType: action.payload.type,

        currentTabIndex: 0,
        isSearchSection: action.payload.toggle,
        pageNumberSectionSearch: 1,
        searchSectionListArr: [],
        isV2Search: false,
      };
    
    case deviceInfoConstants.GET_INTERNET_INFO:
      if (!action.payload) {
        return {
          ...state,
          tagsList: [],
          totalTagsRecord: null,
          pageNumberTags: 1,
        }
      }

      return {
        ...state,
      }

    case constants.DX_INPUT_CHANGE:
      return {
        ...state,
        searchValue: action.payload.val,
        pageNumberTags: 1,
      };

    case constants.DX_SECTION_INPUT_CHANGE:
      return {
        ...state,
        isFirstLoadingSearchSection: true,
        searchValueSection: action.payload.val,
        pageNumberSectionSearch: 1,
        searchSectionListArr: [],
        totalsearchSectionListArrRecords: 0,
      }

    case constants.DX_HANDLE_CURRENT_TAB:
      return {
        ...state,
        currentIndex: action.payload.index,
        pageNumberChannels: 1,
        pageNumberContent: 1,
        pageNumberTags: 1,
      };

    case channelConstants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES:
    case channelConstants.DX_OPEN_CLICKED_CHANNEL_EXPERIENCES_V2:
      return {
        ...state,
        searchToggle: false,
        isSearch: action.payload.isSearch,
      }

    // TagList actions
    case constants.DX_GET_TAGS_LIST_REQUEST:
      return {
        ...state,
        isLoadingTags: true,
        isFirstLoadingTags: action.payload.isFirstLoad,
      }


    case constants.DX_GET_TAGS_LIST_SUCCESS:
      tempTagsList = action.payload.tagsListData.ExperienceStreamTags;

      // loadmore or search list
      if (!action.payload.isSearch) {
        tempTagsList = [...state.tagsList, ...tempTagsList];
      }

      return {
        ...state,
        tagsList: tempTagsList,
        totalTagsRecord: action.payload.tagsListData.TotalRecord,
        isLoadingTags: false,
        isFirstLoadingTags: false,
        isUpdating: false,

        tagExpList: [],
        totalTagExpRecord: null,
        pageNumberTagExp: 1,
      }

    case constants.DX_GET_TAGS_LIST_ERRORS:
      return {
        ...state,
        isLoadingTags: false,
        isFirstLoadingTags: false,
        isUpdating: false,
      }

    case constants.DX_UPDATE_TAGS_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumberTags: state.pageNumberTags + 1,
        isUpdating: true,
      }

    // Channels List Action
    case constants.DX_GET_CHANNELS_LIST_REQUEST:
      return {
        ...state,
        isLoadingChannels: true,
        isFirstLoadingChannels: action.payload.isFirstLoading,
      }

    case constants.DX_GET_CHANNELS_LIST_SUCCESS:
      tempChannelList = action.payload.channelListData.ExperienceChannels;

      // loadmore or search list
      if (!action.payload.isSearch) {
        tempChannelList = [...state.channelList, ...tempChannelList];
      }

      return {
        ...state,
        channelList: tempChannelList,
        totalChannelsRecord: action.payload.channelListData.TotalRecord,
        isUpdating: false,
        isLoadingChannels: false,
        isFirstLoadingChannels: false,
      }

    case constants.DX_GET_CHANNELS_LIST_ERRORS:
      return {
        ...state,
        isLoadingChannels: false,
        isFirstLoadingChannels: false,
        isUpdating: false,
      }

    case constants.DX_UPDATE_CHANNELS_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumberChannels: state.pageNumberChannels + 1,
        isUpdating: true,
      }

    // Contents List Action

    case constants.DX_GET_CONTENT_LIST_REQUEST:
      return {
        ...state,
        isLoadingContent: true,
        isFirstLoadingContent: action.payload.isFirstLoading,
      }

    case constants.DX_GET_CONTENT_LIST_SUCCESS:
      tempContentList = action.payload.contentListData.ExperienceStreams;

      // loadmore or search list
      if (!action.payload.isSearch) {
        tempContentList = [...state.contentList, ...tempContentList];
      }

      return {
        ...state,
        contentList: tempContentList,
        totalContentRecord: action.payload.contentListData.TotalRecord,
        isUpdating: false,
        isLoadingContent: false,
        isFirstLoadingContent: false,
      }

    case constants.DX_GET_CONTENT_LIST_ERRORS:
      return {
        ...state,
        sUpdating: false,
        isLoadingContent: false,
        isFirstLoadingContent: false,
      }

    // Tag CLick

    case constants.DX_UPDATE_TAG_EXP_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumberTagExp: state.pageNumberTagExp + 1,
        isUpdating: true,
      }

    case constants.DX_GET_TAG_EXP_REQUEST:
      return {
        ...state,
        isLoadingTagExp: true,
        clickedTag: action.payload.clickedTag,
        searchToggle: false,
        isFirstLoadingTagExp: action.payload.isFirstLoading,
      }

    case constants.DX_GET_TAG_EXP_SUCCESS:
      tempTagExpList = action.payload.tagExpListData.ExperienceStreams;

      // Add default boolean for download and bookmarks
      tempTagExpList = tempTagExpList.map((stream) => {
        stream.isDownloaded = false;
        return stream;
      });

      // Add the true to isDownloaded if match
      format_array_of_experiences(action.payload.downloads, tempTagExpList);
      // console.log("tempTagExpList: ", tempTagExpList)
      // loadmore or Tag Exp list
      tempTagExpList = [...state.tagExpList, ...tempTagExpList];

      // Move the clicked tag to beginning
      tempTagExpList = sortTagList(tempTagExpList, state.clickedTag);

      return {
        ...state,
        tagExpList: tempTagExpList,
        totalTagExpRecord: action.payload.tagExpListData.TotalRecord,
        isUpdating: false,
        isLoadingTagExp: false,
        isFirstLoadingTagExp: false,
      }

    case constants.DX_UPDATE_CONTENT_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumberContent: state.pageNumberContent + 1,
        isUpdating: true,
      }

    case feedConstants.DX_BROWSE_TO_PREVIOUS_TAB:

      tempSearchToggle = false;
      tempHistory = action.payload.history.replace(new RegExp('[^,]+,$'), '');

      switch (tempHistory) {
        case 'Home,':
        case 'Home,Feed,':
        case 'Home,Download,Feed,':
        case 'Home,Featured,':
        case 'Home,MostPopular,':
        case 'Home,NewReleases,':
        case 'Home,Trending,':
        case 'Home,MostPopular,Feed,':
        case 'Home,NewReleases,Feed,':
        case 'Home,Trending,Feed,':
        case 'Explore,':
        case 'Explore,Feed,':
        case 'Bookmark,BookmarkCardPage,Feed,':
        case 'Bookmark,COVER,Feed,':
        case 'Bookmark,PAGES,Feed,':
          tempSearchToggle = true;
          break;
      }

      tempSearchToggle = state.isSearch && tempSearchToggle;

      return {
        ...state,
        searchToggle: tempSearchToggle,

        tagsList: [],
        totalTagsRecord: null,
        pageNumberTags: 1,
      }

    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_REQUEST:
    case bookmarkScreenContants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_REQUEST:
      return {
        ...state,
        isInsideSection: true,
      }

    case bookmarkScreenContants.DX_POST_BOOKMARK_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_AND_PAGE_INFO_SUCCESS:
    case bookmarkScreenContants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:
    case feedConstants.DX_POST_STREAM_EXPRERIENCE_CARD_ONLY_INFO_SUCCESS:

      // Search func
      if (action.payload.experiences.Experience.ExperienceType == '1') {
        tempSearchSectionListArr = action.payload.experiences.DataArr;
        tempSectionListArr = [];
        tempSearchSectionListArr.forEach(item1 => {
          item1.Sections.forEach(item2 => {
            if (item2.Type != 'AD_BUTTON_2'
              && item2.Type != 'AD_BUTTON'
              && item2.Type != 'BUTTON'
              && item2.Type != 'SPLASH') {
              item2.PageGUID = item1.PageGUID;
              tempSectionListArr.push(item2);
            }
          })
        })
      } else {
        tempSectionListArr = [];
      }

      tempTagExpList = tempTagExpList.map(item => {
        if (item.ExperienceStreamGUID === action.payload.experiences.ExperienceStreamGUID) {
          item.isDownloaded = true;
        }
        return item;
      });
      // tempSearchToggle = state.searchToggle;
      // if (state.searchToggle) {
      //   tempSearchToggle = false;
      // }
      return {
        ...state,
        // searchToggle: tempSearchToggle,
        tagExpList: tempTagExpList,

        sectionListArr: tempSectionListArr,
        totalsearchSectionListArrRecords: tempSectionListArr.length,
        isLoadingSearchSection: false,
        isFirstLoadingSearchSection: false,
        isUpdating: false,
      }

    case feedConstants.DX_HOME_BROWSER_BACK:
    case feedConstants.DX_BROWSER_BACK:
    case feedConstants.DX_FEED_BACK_COMPLETE:
    case deviceInfoConstants.CLOSE_CARD_ONLY_MODAL_REQUEST:
    case deviceInfoConstants.DX_VIDEO_SCREEN_CARD_ONLY_CLOSE_SUCCESS:
      tempCurrentIndex = !action.payload.isTagEnable ? 1 : 2;

      return {
        ...state,
        searchToggle: state.currentIndex === tempCurrentIndex && state.isSearch,
        isInsideSection: false,
      }

    case constants.DX_UPDATE_CURRENT_SECTION_SEARCH_TAB:
      if (state.currentTab !== 'Section'){
        tempIsFirstLoadingSearchSection = true;
      }
      return {
        ...state,
        currentTabIndex: action.payload.currentTabIndex,
        pageNumberSectionSearch: 1,
        searchSectionListArr: [],
        isV2Search: false,
        isFirstLoadingSearchSection: tempIsFirstLoadingSearchSection,

      }


    case constants.DX_UPDATE_SEARCH_SECTION_LIST_PAGE_NUMBER:
      return {
        ...state,
        pageNumberSectionSearch: state.pageNumberSectionSearch + 1,
        isUpdating: true,
      }

    case deviceInfoConstants.DX_VIDEO_SCREEN:
      return {
        ...state,
        searchToggle: false,
      }

    case deviceInfoConstants.DX_VIDEO_SCREEN_CLOSE:
      return {
        ...state,
        searchToggle: state.isSearch && state.isInsideSection,
      }

    // Search Section List
    case constants.DX_GET_SEARCH_LIST_REQUEST:
      return {
        ...state,
        isLoadingSearchSection: true,
        isFirstLoadingSearchSection: state.pageNumberSectionSearch === 1,
      };

    case constants.DX_GET_SEARCH_LIST_V2_REQUEST:
      return {
        ...state,
        isLoadingSearchSection: true,
        isFirstLoadingSearchSection: state.pageNumberSectionSearch === 1,
        isV2Search: true,
      }

    case constants.DX_GET_SEARCH_LIST_SUCCESS:
      tempSearchSectionListArr = action.payload.searchData;
       // Add default boolean for download
      tempSearchSectionListArr = tempSearchSectionListArr.map((stream) => {
        stream.isBookmarked = false;
        return stream;
      });

      update_experience_streams_boolean(tempSearchSectionListArr, action.payload.bookmarkSections);
      // loadmore or search list
      if (!action.payload.isSearch) {
        tempSearchSectionListArr = [...state.searchSectionListArr, ...tempSearchSectionListArr];
      }

      return {
        ...state,
        searchSectionListArr: tempSearchSectionListArr,
        totalsearchSectionListArrRecords: action.payload.totalRecord,
        isLoadingSearchSection: false,
        isFirstLoadingSearchSection: false,
        isUpdating: false,
      };

    // Delete bookmark for section
    case bookmarkScreenContants.DX_DELETE_BOOKMARK_SECTIONS_SUCCESS:
      tempSearchSectionListArr = state.searchSectionListArr;
      tempSearchSectionListArr.forEach((item) => {
        if (item.SectionGUID === action.payload.SectionGUID) {
          item.isBookmarked = false;
        }
      });
      
      return {
        ...state,
        searchSectionListArr: tempSearchSectionListArr,
      };

    case constants.DX_GET_SEARCH_LIST_V2_SUCCESS:

      tempSearchSectionListArr = action.payload.searchData;

      // Add default boolean for download
      tempSearchSectionListArr = tempSearchSectionListArr.map((stream) => {
        stream.isBookmarked = false;
        return stream;
      });

      update_experience_streams_boolean(tempSearchSectionListArr, action.payload.bookmarkSections);

      return {
        ...state,
        searchSectionListArr: tempSearchSectionListArr,
        isLoadingSearchSection: false,
        isFirstLoadingSearchSection: false,
        isUpdating: false,
      };

    case constants.DX_GET_SEARCH_LIST_ERRORS:
    case constants.DX_GET_SEARCH_LIST_V2_ERRORS:
      return {
        ...state,
        errors: action.payload,
        isFirstLoadingSearchSection: false,
        isLoadingSearchSection: false,
      };

    case constants.DX_HANDLE_GO_TO_PAGE:
      return {
        ...state,
        searchToggleSection: false,
        isSearchSection: false,
        currentTabIndex: null,
        searchValueSection: null,

        searchSectionListArr: [],
        pageNumberSectionSearch: 1,
        isFirstLoadingSearchSection: false,
        isLoadingSearchSection: false,
      }

    case deviceInfoConstants.CLOSE_AUDIO_MODAL:
      tempSectionListArr = state.sectionListArr;
      // Add current time to searchSection
      if (tempSectionListArr && tempSectionListArr.length) {
        tempSectionListArr.map(item => {
          if (item.SectionGUID === action.payload.sectionData.SectionGUID) {
            item.CurrentTime = action.payload.sectionData.CurrentTime;
          }
        })
      }

      tempSearchSectionListArr = state.searchSectionListArr;
      // Add current time to searchSectionList
      if (tempSearchSectionListArr && tempSearchSectionListArr.length) {
        tempSearchSectionListArr.map(item => {
          if (item.SectionGUID === action.payload.sectionData.SectionGUID) {
            item.CurrentTime = action.payload.sectionData.CurrentTime;
          }
        })
      }

      return {
        ...state,
        sectionListArr: tempSectionListArr,
        searchSectionListArr: tempSearchSectionListArr,
      }

    default:
      return state;
  }
};


const sortTagList = (tagExpList, clickedTag) => {
  if (!clickedTag) {
    return;
  }

  let tempTagExpList = tagExpList;
  let formattedTaglist;

  if (tagExpList.length) {
    tempTagExpList = tagExpList.map(item => {
      formattedTaglist = item.Experience.Tags;

      // Compare and shift
      formattedTaglist = formattedTaglist.filter(item => item.toLowerCase() !== clickedTag.TagName.toLowerCase());
      formattedTaglist.unshift(clickedTag.TagName);

      item.Experience.Tags = formattedTaglist;
      return item;
    })
  }

  return tempTagExpList;
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

const update_experience_streams_boolean = (sections, bookmarks) => {
  if (!bookmarks.length || !sections.length) {
    return sections;
  }
  for (let i = 0; i < sections.length; i++) {
    const item1 = sections[i];
    for (let j = 0; j < bookmarks.length; j++) {
      const item2 = bookmarks[j];
      if (item1.SectionGUID === item2.SectionGUID) {
        sections[i].isBookmarked = true;
      }
    }
  }
};