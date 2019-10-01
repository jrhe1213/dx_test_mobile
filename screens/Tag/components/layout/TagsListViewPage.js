import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import { View, FlatList, Text, Dimensions} from 'react-native';
import { ListItem, Left, Body, Right } from "native-base";


// Components
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../../Search/actions';

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    height: Dimensions.get('window').height - 60,
    borderWidth: 1,
    borderColor: 'red',
  },
};


class TagsListViewPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
  }
  
  state = {
    limit: 15,
  }
  componentDidMount = () => {
    const { isConnected, languageGUID } = this.props;
     if (isConnected) {
      if (languageGUID) {
        this.handleTagsList(1, true);
      }
    }
  }

  handleTagsList = (pageNumberTags, isFirstLoad) => {
    const { languageGUID } = this.props;
    const { limit } = this.state;

    let offsetCalc = (limit * (pageNumberTags - 1));

    const formmattedParam = {
      ChannelLanguageGUID: languageGUID,
      Limit: limit.toString(),
      Offset: offsetCalc.toString(),
      Extra: {
        SearchType: "TAG_NAME",
        SearchField: ""
      }
    }
    this.props.getTagListRequest(formmattedParam, isFirstLoad);
  }

  renderTagsItems = (item) => {
    if (item.group) {
      return (
        <React.Fragment>

          <ListItem style={{ marginLeft: 0 }}>
            <Body>
              <Text style={{ fontWeight: "bold" }}>{item.group}</Text>
            </Body>
          </ListItem>

          <ListItem itemDivider>
            <Left />
            <Body style={{ marginRight: 40 }}>
              { item.data.map(tag => <Text key={tag.ExperienceStreamTagGUID} style={{ height: 350, }}>
                {tag.TagName}
              </Text>)
              }
            </Body>
            <Right />
          </ListItem>
        </React.Fragment>
      );
    }
  }

  render() {
    const {
      currentTab,
      language,
      theme,
      tagsList
    } = this.props;

    const languageCheck = language || {};
    
    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    let contentNotFoundLabel;
    let searchLabel;

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_EMPTY_CONTENT') {
        contentNotFoundLabel = label.Content;
      }

      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchLabel = label.Content;
      }
    });

    const {
      contentContainerStyle,
    } = styles;

    if (currentTab !== 'TagsListView') {
      return null;
    }
    
    let formattedList;
    formattedList = tagsList.reduce((r, e) => {
      // get first letter of name of current element
      let group = e.TagName[0];
      // if there is no property in accumulator with this letter create it
      if(!r[group]) r[group] = {group, data: [e]}
      // if there is push current element to children array for that letter
      else r[group].data.push(e);
      // return accumulator
      return r;
    }, {})

    formattedList = Object.values(formattedList);
  
    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isAddIcon={false}
          isBackIcon={true}
          tagNameLabel='Tags'
          searchLabel={searchLabel}
        />
        <View style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <FlatList
            data={formattedList}
            renderItem={({ item }) => this.renderTagsItems(item)}
            keyExtractor={item => item.group}
            stickyHeaderIndices={formattedList}
          />
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  languageGUID: state.deviceInfo.languageGUID,

  theme: state.setting.theme,

  tagsList: state.search.tagsList,
  totalTagsRecord: state.search.totalTagsRecord,
  isLoadingTags: state.search.isLoadingTags,
  isFirstLoadingTags: state.search.isFirstLoadingTags,
  pageNumberTags: state.search.pageNumberTags,
});

const mapDispatchToProps = dispatch => ({
  getTagListRequest: (params, isFirstLoad) => dispatch(searchActions.getTagListRequest(params, isFirstLoad))
});

export default connect(mapStateToProps, mapDispatchToProps)(TagsListViewPage);
