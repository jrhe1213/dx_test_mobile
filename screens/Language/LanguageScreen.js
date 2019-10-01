import React, { Component } from 'react';
import {
  View, Dimensions, Text, Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { List } from 'native-base';

// Redux
import { connect } from 'react-redux';

// Actions
import deviceInfo from '../../actions/DeviceInfo';


// Components
import { DxContainer } from '../../styles/grid';
import Header from '../../components/Header';
import LanguageListItem from './components/presentation/LanguageListItem';

// Constants
import * as colors from '../../styles/variables';
import fonts from '../../styles/fonts';
import config from '../../config';

const styles = {
  containerContentStyle: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 24,
  },
};

class LanguageScreen extends Component {
  static propTypes = {
    languages: PropTypes.array,
    setAppLanguageRequest: PropTypes.func,
    selectedLanguage: PropTypes.object,
    languagePageClose: PropTypes.func,
    currentTab: PropTypes.string,
    language: PropTypes.object,
  };

  state = {
    selectedLanguageGUID: this.props.selectedLanguage.LanguageGUID,
  }

  updateLanguage = (languageGUID) => {
    this.setState({
      selectedLanguageGUID: languageGUID,
    });
  }

  handleUpdateLanguage = () => {
    const {
      isRequesting
    } = this.props;
    const { selectedLanguageGUID } = this.state;
    const data = {
      LanguageGUID: selectedLanguageGUID,
    };

    if (!isRequesting) {
      this.props.setAppLanguageRequest(data, false);
    }
  }

  handleCloseLanguagePage = () => {
    this.props.languagePageClose();
  }

  render() {
    const {
      languages,
      currentTab,
      language,
      isConnected,
      selectedLanguage,
      theme,
    } = this.props;

    const { containerContentStyle } = styles;
    const { selectedLanguageGUID } = this.state;

    if (currentTab !== 'Language') {
      return null;
    }

    // Get language Labels
    const languageCheck = language || {};
    const languageLabels = languageCheck.LanguageScreen ? language.LanguageScreen : [];

    // Destructing Labels
    let languageLabel;
    let doneLabel;

    languageLabels.map((label) => {
      if (label.Type === 'LANGUAGE') {
        languageLabel = label.Content;
      }
      if (label.Type === 'DONE') {
        doneLabel = label.Content;
      }
    });

    return (
      <DxContainer>
        <Header
          title={languageLabel || 'Language'}
          isBackIcon={true}
          isSearchIcon={false}
          inputPlaceholder={false}
          isSearch={false}
          isClose={false}
          isLanguage={true}
          doneLabel={doneLabel}
          isLanguageSelectActive={
            selectedLanguageGUID !== selectedLanguage.LanguageGUID
          }
          handleBackIconPress={this.handleCloseLanguagePage}
          handleUpdateLanguage={() => this.handleUpdateLanguage()}
          theme={theme}
        />
        <View style={[containerContentStyle, { backgroundColor: theme.bgColor }]}>
          {
            languages.map(item => <LanguageListItem
              key={item.LanguageGUID}
              language={item}
              updateLanguage={
                languageGUID => this.updateLanguage(languageGUID)
              }
              isActive={selectedLanguageGUID === item.LanguageGUID}
              theme={theme}
            />)
          }
        </View>
      </DxContainer>
    );
  }
}

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  languages: state.deviceInfo.languages,
  language: state.deviceInfo.language,
  selectedLanguage: state.deviceInfo.selectedLanguage,
  isConnected: state.deviceInfo.internetInfo.isConnected,

  theme: state.setting.theme,

  isRequesting: state.deviceInfo.isRequesting
});

const mapDispatchToProps = dispatch => ({
  setAppLanguageRequest: (languageGUID, isLanguageModal) => dispatch(deviceInfo.setAppLanguageRequest(languageGUID, isLanguageModal)),
  languagePageClose: () => dispatch(deviceInfo.languagePageClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguageScreen);
