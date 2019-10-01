import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import { View } from 'react-native';

// Components
import { connect } from 'react-redux';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import SettingContainer from '../container/SettingContainer';

// Redux

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  contentContainerStyle: {
    flex: 1,
  },
};

class SettingPage extends Component {
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

    const languageCheck = language || {};
    const sidebarLabels = languageCheck.SideBar ? languageCheck.SideBar : [];
    const settingLabels = languageCheck.SettingScreen ? languageCheck.SettingScreen : [];
    const languageScreenLabels = languageCheck.LanguageScreen ? languageCheck.LanguageScreen : [];

    // Destructing Labels for the page
    let languageLabel;
    let nightModeLabel;
    let settingLabel;
    let doneLabel;

    languageScreenLabels.map((label) => {
      if (label.Type === 'DONE') {
        doneLabel = label.Content;
      }
    });

    settingLabels.map((label) => {
      if (label.Type === 'NIGHT_MODE') {
        nightModeLabel = label.Content;
      }
    });

    sidebarLabels.map((label) => {
      if (label.Type === 'LANGUAGE') {
        languageLabel = label.Content;
      }
      if (label.Type === 'SETTINGS') {
        settingLabel = label.Content;
      }
    });

    const {
      contentContainerStyle,
    } = styles;

    if (currentTab !== 'Settings') {
      return null;
    }

    // console.log('Setting page', doneLabel);

    return (
      <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isAddIcon={false}
          isBackIcon={false}
          settingLabel={settingLabel}
        />
        <View style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
          <SettingContainer languageLabel={languageLabel} nightModeLabel={nightModeLabel} />
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingPage);
