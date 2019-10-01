import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import {
  View,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import { Fab, Icon } from 'native-base';
import modalActions from '../../../../actions/Modal';

import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import ChannelContainer from '../container/ChannelContainer';
import Spinner from '../container/Spinner';

// fonts
import fonts from '../../../../styles/fonts';

// Constants
import * as colors from '../../../../styles/variables';

class ChannelPage extends Component {
  static propTypes = {
    openModal: PropTypes.func,
    language: PropTypes.object,
  }

  state = {
    active: 'true',
  };

  handleClickHandle = () => {
    this.props.openModal('PROMO');
  };

  renderContainer = (readMoreLabel, showLessLabel, noDescLabel, passcodeBarLabel, emptyChannelLabel, contentLabel) => <ChannelContainer
      readMoreLabel={readMoreLabel}
      showLessLabel={showLessLabel}
      noDescLabel={noDescLabel}
      passcodeBarLabel={passcodeBarLabel}
      emptyChannelLabel={emptyChannelLabel}
      contentLabel={contentLabel}
    />


  render() {
    const {
      currentTab,
      deviceInfo: {
        internetInfo: {
          isConnected,
        },
      },
      language,
      theme,
      isNightMode,
      isActivePasscode,
    } = this.props;

    const {
      errorMessageStyle,
      errorMessageTextStyle,
    } = styles;

    if (currentTab != 'Explore') {
      return null;
    }

    const languageCheck = language || {};
    const channelLabels = languageCheck.ExploreScreen ? languageCheck.ExploreScreen : [];
    const messageLabels = languageCheck.Message ? languageCheck.Message : [];
    const searchLabels = languageCheck.SearchScreen ? languageCheck.SearchScreen : [];

    // Destructing Labels for the page
    let exploreLabel;
    let readMoreLabel;
    let showLessLabel;
    let noDescLabel;
    let passcodeBarLabel;
    let searchChannelLabel;
    let emptyChannelLabel;
    let internetLabel;
    let contentLabel;

    channelLabels.map((label) => {
      if (label.Type === 'EXPLORE') { exploreLabel = label.Content; }
      if (label.Type === 'READ_MORE') { readMoreLabel = label.Content; }
      if (label.Type === 'SHOW_LESS') { showLessLabel = label.Content; }
      if (label.Type === 'NO_DESC') { noDescLabel = label.Content; }
      if (label.Type === 'PASS_CODE_BAR') { passcodeBarLabel = label.Content; }
      if (label.Type === 'EMPTY') { emptyChannelLabel = label.Content; }
      if (label.Type === 'CONTENT') { contentLabel = label.Content; }
    });

    searchLabels.map((label) => {
      if (label.Type === 'SEARCH_PAGE_INPUT') {
        searchChannelLabel = label.Content;
      }
    });

    messageLabels.map((label) => {
      if (label.Type === 'INTERNET') { internetLabel = label.Content; }
    });

    // console.log('channel page');

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={true}
          isAddIcon={true}
          exploreLabel={exploreLabel}
          searchChannelLabel={searchChannelLabel}
          isLogo={true}
        />
        {/* <Spinner /> */}

        {
          isConnected
            ? this.renderContainer(readMoreLabel,
              showLessLabel,
              noDescLabel,
              passcodeBarLabel,
              emptyChannelLabel, contentLabel)
            : <View style={[errorMessageStyle, { backgroundColor: theme.bgColor }]}>
              <Text style={[errorMessageTextStyle, { color: theme.textColor2 }]}>
                {internetLabel}
              </Text>
            </View>
        }

        {
          isActivePasscode ? <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{ }}
            style={{ backgroundColor: isNightMode ? theme.textColor : theme.primaryColor }}
            position="bottomRight"
            onPress={this.handleClickHandle}
          >
            <Icon name="add" style={Object.assign({}, {
              fontSize: 46, paddingTop: 10, marginTop: 12, color: isNightMode ? theme.bgColor2 : theme.bgColor2,
            }, Platform.OS == 'android' ? { paddingTop: 0, marginTop: 0 } : null)} />
          </Fab> : null
        }
      </DxContainer>
    );
  }
}

const styles = {
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

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  isActivePasscode: state.deviceInfo.isActivePasscode,
});

const mapDispatchToProps = dispatch => ({
  openModal: type => dispatch(modalActions.openModal(type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelPage);
