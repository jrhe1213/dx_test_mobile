import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import { View } from 'react-native';

// Components
import { connect } from 'react-redux';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import TagContainer from '../container/TagContainer';

// Redux

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    flex: 1,
  },
};

class TagPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
  }

  render() {
    const {
      currentTab,
      language,
      theme,
      clickedTag,
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

    if (currentTab !== 'Tag') {
      return null;
    }

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isAddIcon={false}
          isBackIcon={true}
          tagNameLabel={clickedTag.TagName}
          searchLabel={searchLabel}
        />
        <View style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <TagContainer contentNotFoundLabel={contentNotFoundLabel} />
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
  clickedTag: state.search.clickedTag,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(TagPage);
