import React, { Component } from 'react';
import {
  Dimensions, View, Text
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import SearchContainer from './components/container/SearchContainer';

// Constants
import * as colors from '../../styles/variables';
import fonts from '../../styles/fonts';
import config from '../../config';

// utils
import { headerForIphoneX } from '../../helpers';

import * as Animated from 'react-native-animatable';

const headerHeight = headerForIphoneX ? 82 : 62;
const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - headerHeight,
    position: 'absolute',
    top: headerHeight,
    left: 0,
  },
  errorMessageStyle: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  height: Dimensions.get('window').height - 64 - 48,
  fontFamily: fonts.light,
  letterSpacing: 1,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
  },
};

class SearchScreen extends Component {
  static propTypes = {
  };

  render() {
    const {
      theme, searchToggle, language, isConnected
    } = this.props;

    const { containerContentStyle, errorMessageStyle, errorMessageTextStyle } = styles;

    // Get language Labels
    const languageCheck = language || {};
    const searchLabels = languageCheck.SearchScreen ? language.SearchScreen : [];
    const messageLabels = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels
    let tagLabel;
    let channelLabel;
    let contentLabel;
    let tagNotFoundLabel;
    let channelNotFoundLabel;
    let contentNotFoundLabel;
    let internetLabel;

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_TAG') {
        tagLabel = label.Content;
      }
      if (label.Type === 'SEARCH_PAGE_CHANNEL') {
        channelLabel = label.Content;
      }
      if (label.Type === 'SEARCH_PAGE_CONTENT') {
        contentLabel = label.Content;
      }
      if (label.Type === 'SEARCH_PAGE_EMPTY_TAG') {
        tagNotFoundLabel = label.Content;
      }
      if (label.Type === 'SEARCH_PAGE_EMPTY_CHANNEL') {
        channelNotFoundLabel = label.Content;
      }
      if (label.Type === 'SEARCH_PAGE_EMPTY_CONTENT') {
        contentNotFoundLabel = label.Content;
      }
    });

    messageLabels.map((label) => {
      if (label.Type === 'INTERNET') { internetLabel = label.Content; }
    });

    return (
      <Animated.View useNativeDriver duration={200} animation={searchToggle ? "fadeInUp" : "fadeOut"} style={Object.assign({}, containerContentStyle, { backgroundColor: theme.bgColor2,  })}>
        {
          isConnected
            ? <SearchContainer
              tagLabel={tagLabel}
              channelLabel={channelLabel}
              contentLabel={contentLabel}
              tagNotFoundLabel={tagNotFoundLabel}
              channelNotFoundLabel={channelNotFoundLabel}
              contentNotFoundLabel={contentNotFoundLabel}
            /> :
            <View style={[errorMessageStyle, { backgroundColor: theme.bgColor }]}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {internetLabel}
              </Text>
            </View>
        }
      </Animated.View>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.setting.theme,
  searchToggle: state.search.searchToggle, 
  language: state.deviceInfo.language,
  isConnected: state.deviceInfo.internetInfo.isConnected,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
