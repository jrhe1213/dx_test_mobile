import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import { View } from 'react-native';

// Components
import { connect } from 'react-redux';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import DownloadContainer from '../container/DownloadContainer';
import Spinner from '../container/Spinner';

// Redux

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    flex: 1,
  },
};

class DownloadPage extends Component {
  static propTypes = {
    language: PropTypes.object,
    currentTab: PropTypes.string,
  }

  render() {
    const {
      currentTab,
      language,
      theme,
    } = this.props;

    const {
      contentContainerStyle,
    } = styles;

    if (currentTab != 'Download') {
      return null;
    }

    const languageCheck = language || {};
    const downloadLabels = languageCheck.DownloadScreen ? languageCheck.DownloadScreen : [];
    const dxCardLabels = languageCheck.DxCard ? languageCheck.DxCard : [];
    const feedScreenLabels = languageCheck.FeedScreen ? languageCheck.FeedScreen : [];
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let downloadLabel;
    let searchLabel;
    let emptyLabel;
    let postByLabel;
    let videoNotAvailableLabel;
    let postsLabel;

    downloadLabels.map((label) => {
      if (label.Type === 'DOWNLOAD') {
        downloadLabel = label.Content;
      }
      if (label.Type === 'EMPTY') {
        emptyLabel = label.Content;
      }
      if (label.Type === 'SEARCH') {
        searchLabel = label.Content;
      }
    });

    dxCardLabels.map((label) => {
      if (label.Type === 'POST') {
        postByLabel = label.Content;
      }
    });

    feedScreenLabels.map((label) => {
      if (label.Type === 'POST') {
        postsLabel = label.Content;
      }
    });

    errorMessage.map((label) => {
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    // console.log('download page');

    return (
      <DxContainer>
        <HeaderNavigator
          downloadLabel={downloadLabel}
          postsLabel={postsLabel}
          searchLabel={searchLabel}
          isSearchIcon={true}
          isAddIcon={true}
          isBackIcon={false}
        />
        <View style={[contentContainerStyle, { backgroundColor:  theme.bgColor }]}>
          <Spinner />
          <DownloadContainer
            emptyLabel={emptyLabel}
            postByLabel={postByLabel}
            videoNotAvailableLabel={videoNotAvailableLabel}
          />
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPage);
