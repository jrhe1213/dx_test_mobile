import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Switch,
} from 'react-native';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Components

// Libraries
import {
  ListItem, Left, Right, Button, Body, Icon,
} from 'native-base';

// utils
import { connect } from 'react-redux';
import Alert from '../../../../utils/alert';


// Redux
import actions from '../../actions';
import deviceActions from '../../../../actions/DeviceInfo';

// Utils
import { headerForIphoneX } from '../../../../helpers';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  contentStyle: {
    flex: 1,
    marginTop: 12,
    marginBottom: 24,
  },

  textLabelStyle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    marginTop: 4,
  },

  iconTextLabelStyle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 6,
  },
};


class SettingContainer extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    languagePageOpen: PropTypes.func,
    changeNightModeRequest: PropTypes.func,
    closeDrawer: PropTypes.func,
    currentTab: PropTypes.string,
    languages: PropTypes.array,
    Language: PropTypes.string,
    languageLabel: PropTypes.string,
    isNightMode: PropTypes.bool,
    theme: PropTypes.object,
    isConnected: PropTypes.bool,
  }

  handleLanguageModal = () => {
    const { currentTab } = this.props;
    if (currentTab != 'Language') {
      this.props.languagePageOpen();
    } else {
      this.props.navigation.closeDrawer();
    }
  }

  handleNightMode = () => {
    const {
      isRequesting
    } = this.props;
    if (!isRequesting) {
      this.props.changeNightModeRequest(!this.props.isNightMode);
    }
  }

  render() {
    const {
      contentStyle,
      textLabelStyle,
      iconTextLabelStyle,
      errorMessageStyle,
      errorMessageTextStyle,
    } = styles;

    // console.log('Settings container');
    const {
      languages, Language, languageLabel, isNightMode, theme, nightModeLabel
    } = this.props;

    return (
      <View style={contentStyle}>
        <ListItem icon disabled={languages.length <= 1} onPress={this.handleLanguageModal}>
          <Left>
            <Button onPress={this.handleLanguageModal} style={{ backgroundColor: '#007AFF' }}>
              <Icon active name="globe" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 1 }}>
            <Text style={[textLabelStyle, { color: theme.textColor }]}>{languageLabel}</Text>
          </Body>
          <Right style={{ borderBottomWidth: 1 }}>
            <Text style={[iconTextLabelStyle, { color: theme.textColor }]}>{Language}</Text>
            {
              languages.length !== 1 && <Icon active name="arrow-forward" />
            }
          </Right>
        </ListItem>

        <ListItem icon>
          <Left>
            <Button disabled style={{ backgroundColor: '#000' }}>
              <Icon active name="moon" />
            </Button>
          </Left>
          <Body style={{ borderBottomWidth: 1 }}>
            <Text style={[textLabelStyle, { color: theme.textColor }]}>{nightModeLabel}</Text>
          </Body>
          <Right style={{ borderBottomWidth: 1 }}>
            <Switch
              value={isNightMode}
              onValueChange={this.handleNightMode}
            />
          </Right>
        </ListItem>
      </View>
    );
  }
}

const stateToProps = state => ({
  currentTab: state.nav.currentTab,
  userGUID: state.user.userGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  languages: state.deviceInfo.languages,
  Language: state.deviceInfo.selectedLanguage.Language,
  isNightMode: state.setting.isNightMode,
  theme: state.setting.theme,

  isRequesting: state.deviceInfo.isRequesting
});

const dispatchToProps = dispatch => ({
  languagePageOpen: () => dispatch(deviceActions.languagePageOpen()),
  changeNightModeRequest: mode => dispatch(actions.changeNightModeRequest(mode)),
});

export default connect(stateToProps, dispatchToProps)(withNavigation(SettingContainer));
