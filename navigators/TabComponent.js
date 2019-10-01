import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Icon } from 'native-base';
// Redux
import { connect } from 'react-redux';
import fonts from '../styles/fonts';

import actions from '../actions/DeviceInfo';
import tagsActions from '../actions/Tags';

const styles = {
  containerStyle: {
    height: 80,
    flexDirection: 'row',
    // flex: 1,
  },
  buttonWrapperStyle: {
    flex: 1,
    paddingTop: 12,
  },
  buttonContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    juustifyContent: 'center',
  },
  buttonTextStyle: {
    fontSize: 12,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  icoStyle: {
    width: 32,
    height: 32,
  },
};

class TabComponent extends Component {
  static propTypes = {
    theme: PropTypes.object,
    language: PropTypes.object,
    openExplorePage: PropTypes.func,
    openHomePage: PropTypes.func,
    openBookmarkPage: PropTypes.func,
    currentTab: PropTypes.string,
  }

  render() {
    const languageCheck = this.props.language || {};
    const homeLabels = languageCheck.HomeScreen ? languageCheck.HomeScreen : [];
    const channelLabels = languageCheck.ExploreScreen ? languageCheck.ExploreScreen : [];
    const bookmarkLabels = languageCheck.BookmarkScreen ? languageCheck.BookmarkScreen : [];

    // Destructing Labels for the page
    let homeLabel;
    let exploreLabel;
    let bookmarkLabel;

    homeLabels.map((label) => {
      if (label.Type === 'HOME') {
        homeLabel = label.Content;
      }
    });

    channelLabels.map((label) => {
      if (label.Type === 'EXPLORE') { exploreLabel = label.Content; }
    });

    bookmarkLabels.map((label) => {
      if (label.Type === 'BOOKMARK') {
        bookmarkLabel = label.Content;
      }
    });


    const {
      theme,
      currentTab,
      isTagEnable,
    } = this.props;

    return (
      <View style={[styles.containerStyle, { backgroundColor: theme.bgColor2 }]}>
        <TouchableOpacity onPress={currentTab !== 'Home' ? () => this.props.openHomePage() : null} style={styles.buttonWrapperStyle}>
          <View style={styles.buttonContainerStyle}>
            <Icon
              name="ios-home"
              style={[{ color: theme.textColor2, marginLeft: 8 }, styles.icoStyle, currentTab === 'Home' ? { color: theme.primaryColor } : null]}
            />
            <Text style={[styles.buttonTextStyle, { color: theme.textColor2 }, currentTab === 'Home' ? { color: theme.primaryColor } : null]}>{homeLabel}</Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={currentTab !== 'Explore' ? () => this.props.openExplorePage() : null} style={styles.buttonWrapperStyle}>
          <View style={styles.buttonContainerStyle}>
            <Icon
              name="ios-compass"
              style={[{ color: theme.textColor2, marginLeft: 6 }, styles.icoStyle, currentTab === 'Explore' ? { color: theme.primaryColor } : null]}
            />
            <Text style={[styles.buttonTextStyle, { color: theme.textColor2 }, currentTab === 'Explore' ? { color: theme.primaryColor } : null]}>{exploreLabel}</Text>
          </View>
        </TouchableOpacity> */}
        {/* { isTagEnable && <TouchableOpacity onPress={currentTab !== 'TagsListView' ? () => this.props.openTagsPage() : null} style={styles.buttonWrapperStyle}>
          <View style={styles.buttonContainerStyle}>
            <Icon
              name="ios-pricetags"
              style={[{ color: theme.textColor2, marginLeft: 6 }, styles.icoStyle, currentTab === 'TagsListView' ? { color: theme.primaryColor } : null]}
            />
            <Text style={[styles.buttonTextStyle, { color: theme.textColor2 }, currentTab === 'TagsListView' ? { color: theme.primaryColor } : null]}>Tags</Text>
          </View>
        </TouchableOpacity>} */}
        <TouchableOpacity onPress={currentTab !== 'Bookmark' ? () => this.props.openBookmarkPage() : null} style={styles.buttonWrapperStyle}>
          <View style={styles.buttonContainerStyle}>
            <Icon
              name="ios-bookmark"
              style={[{ color: theme.textColor2, marginLeft: 8 }, styles.icoStyle, currentTab === 'Bookmark' ? { color: theme.primaryColor } : null]}
            />
            <Text style={[styles.buttonTextStyle, { color: theme.textColor2 }, currentTab === 'Bookmark' ? { color: theme.primaryColor } : null]}>{bookmarkLabel}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.setting.theme,
  language: state.deviceInfo.language,
  currentTab: state.nav.currentTab,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const mapDispatchToProps = dispatch => ({
  openHomePage: () => dispatch(actions.openHomePage()),
  openExplorePage: () => dispatch(actions.openExplorePage()),
  openBookmarkPage: () => dispatch(actions.openBookmarkPage()),
  openTagsPage: () => dispatch(tagsActions.openTagsPage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabComponent);
