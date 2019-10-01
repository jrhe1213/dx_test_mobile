import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  FlatList,
  Platform,
  ActivityIndicator
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../../Search/actions';

// Libraries
import _ from 'lodash';

// Components
import TagsListItem from '../presentation/TagsListItem';
import Spinner from './Spinner';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

const styles = {
  contentWrapperStyle: {
    flex: 1,
  },
  errorMessageStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    height: Dimensions.get('window').height - 64 - 48,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
};

class TagsTabContainer extends Component {
  static propTypes = {
  };

  state = {
    limit: 15,
  }

  componentDidMount = () => {
    const {
      languageGUID,
      currentIndex,
      isConnected,
      searchValue,
      searchToggle,
    } = this.props;
    if (isConnected) {
      if (languageGUID && currentIndex === 0 && searchToggle) {
        this.handleTagsList(1, true, searchValue);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { searchValue, pageNumberTags, currentIndex, isConnected } = this.props;

    if (nextProps.isConnected) {
      // Switching tabs search
      if ((currentIndex !== nextProps.currentIndex) && (nextProps.currentIndex == 0)) {
        this.searchTagsList(nextProps.searchValue, true);
      }
  
      // Search Tags
      if (searchValue !== nextProps.searchValue && (nextProps.currentIndex == 0)) {
        this.searchTagsList(nextProps.searchValue, true);
      }
  
      // LOADMORE
      if (searchValue === nextProps.searchValue && pageNumberTags < nextProps.pageNumberTags) {
        this.handleTagsList(nextProps.pageNumberTags, false, nextProps.searchValue);
      }
    }
  }

  handleTagsList = (pageNumberTags, isFirstLoad, searchValue) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;

    let offsetCalc = (limit * (pageNumberTags - 1));

    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "TAG_NAME",
        SearchField: searchValue
      }
    }
    this.props.getTagListRequest(formmattedParam, isFirstLoad);
  }

  searchTagsList = _.debounce((searchValue, isFirstLoad) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;
    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: "0",
      Extra: {
        SearchType: "TAG_NAME",
        SearchField: searchValue
      },
      isSearch: true,
    }
    this.props.getTagListRequest(formmattedParam, isFirstLoad);
  }, 1000);

  keyExtractor = (item) => (item.ExperienceStreamTagGUID);

  handleTagClick = (tag) => {
    const { languageGUID } = this.props;
    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: "5",
      Offset: "0",
      Extra: {
        SearchType: "TAG_NAME",
        SearchField: tag.TagName,
        FilterType: "",
        FilterField: "",
      }
    }
    this.props.getTagExpRequest(formmattedParam, tag, true);
  }

  renderItem = (tag) => {
    const { theme } = this.props;
    return <TagsListItem 
      tag={tag}
      handleTagClick={(tag) => this.handleTagClick(tag)}
      theme={theme}
    />
  }

  handleLoadMore = () => {
    const { isUpdating, totalTagsRecord, pageNumberTags } = this.props;
    const { limit } = this.state;
    if (!isUpdating && totalTagsRecord > 15 && totalTagsRecord > pageNumberTags * limit) {
      this.props.updateTagsListPageNumber();
    }
  }
  

  render() {
    const {
      contentWrapperStyle,
      errorMessageStyle,
      errorMessageTextStyle
    } = styles;
    
    const {
      theme,
      tagsList,
      isLoadingTags,
      pageNumberTags,
      currentIndex,
      tagNotFoundLabel,
      isFirstLoadingTags,
    } = this.props;
    
    if (currentIndex != 0) {
      return null;
    }
    
    return (
      <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor2 }]}>
        {
          isFirstLoadingTags ?
          <Spinner isLoading={isFirstLoadingTags} theme={theme} />
          :
          tagsList && tagsList.length > 0 
          ?
          <FlatList
            ref="_flatListView"
            contentContainerStyle={{  paddingTop: 12, paddingBottom: 16 }}
            keyExtractor={this.keyExtractor}
            data={tagsList}
            renderItem={({ item }) => this.renderItem(item)}
            onScrollToIndexFailed={() => { }}
            ListFooterComponent={isLoadingTags && <ActivityIndicator size="small" animating />}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd < -100 && pageNumberTags === 1) {
                return;
              }
              this.handleLoadMore();
            }}
            onEndReachedThreshold={Platform.OS == 'android' ? 0.5 : 0.2}
            // scrollEventThrottle={1000}
          /> 
          : 
          (
            <View style={errorMessageStyle}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {tagNotFoundLabel}
              </Text>
            </View>
          )
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  languageGUID: state.deviceInfo.languageGUID,
  currentIndex: state.search.currentIndex,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  
  searchValue: state.search.searchValue,
  tagsList: state.search.tagsList,
  totalTagsRecord: state.search.totalTagsRecord,
  isLoadingTags: state.search.isLoadingTags,
  isFirstLoadingTags: state.search.isFirstLoadingTags,
  pageNumberTags: state.search.pageNumberTags,
  isUpdating: state.search.isUpdating,
  searchToggle: state.search.searchToggle,
});

const dispatchToProps = dispatch => ({
  getTagListRequest: (params, isFirstLoad) => dispatch(searchActions.getTagListRequest(params, isFirstLoad)),
  updateTagsListPageNumber: params => dispatch(searchActions.updateTagsListPageNumber(params)),
  getTagExpRequest: (params, clickedTag, isFirstLoading) => dispatch(searchActions.getTagExpRequest(params, clickedTag, isFirstLoading)),
});

export default connect(mapStateToProps, dispatchToProps)(TagsTabContainer);
