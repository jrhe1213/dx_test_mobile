import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

// Components
import { connect } from 'react-redux';
import RegisterContainer from '../container/RegisterContainer';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';

// Redux

// Constants
import colors from '../../../../constants/colors';

const styles = {
  contentContainerStyle: {
    flex: 1,
  },
};

class RegisterPage extends Component {
  static propTypes = {
    currentTab: PropTypes.string,
    language: PropTypes.object,
    theme: PropTypes.object,
  };

  render() {
    const {
      currentTab,
      language,
      theme,
    } = this.props;

    const {
      contentContainerStyle,
    } = styles;

    if (currentTab != 'Register') {
      return null;
    }

    const languageCheck = language || {};
    const registerScreenLabels = languageCheck.RegisterScreen ? languageCheck.RegisterScreen : [];
    const sidebarLabels = languageCheck.SideBar ? languageCheck.SideBar : [];
    const messageLabels = languageCheck.Message ? languageCheck.Message : [];

    // Destructing Labels for the page
    let registerLabel;
    let firstNameLabel;
    let lastNameLabel;
    let emailLabel;
    let passwordLabel;
    let confirmPasswordLabel;
    let firstNameErrorLabel;
    let lastNameErrorLabel;
    let emailError1Label;
    let emailError2Label;
    let emailError3Label;
    let passwordError1Label;
    let passwordError2Label;
    let confirmPasswordErrorLabel;
    let signUpLabel;

    let internetLabel;

    messageLabels.map((label) => {
      if (label.Type === 'INTERNET') {
        internetLabel = label.Content;
      }
    });

    sidebarLabels.map((label) => {
      if (label.Type === 'REGISTER') {
        registerLabel = label.Content;
      }
    });

    registerScreenLabels.map((label) => {
      if (label.Type === 'FIRST_NAME') {
        firstNameLabel = label.Content;
      }

      if (label.Type === 'LAST_NAME') {
        lastNameLabel = label.Content;
      }

      if (label.Type === 'EMAIL') {
        emailLabel = label.Content;
      }

      if (label.Type === 'PASSWORD') {
        passwordLabel = label.Content;
      }

      if (label.Type === 'CONFIRM_PASSWORD') {
        confirmPasswordLabel = label.Content;
      }

      if (label.Type === 'FIRST_NAME_ERROR') {
        firstNameErrorLabel = label.Content;
      }

      if (label.Type === 'LAST_NAME_ERROR') {
        lastNameErrorLabel = label.Content;
      }

      if (label.Type === 'EMAIL_ERROR_1') {
        emailError1Label = label.Content;
      }

      if (label.Type === 'EMAIL_ERROR_2') {
        emailError2Label = label.Content;
      }

      if (label.Type === 'EMAIL_ERROR_3') {
        emailError3Label = label.Content;
      }

      if (label.Type === 'PASSWORD_ERROR_1') {
        passwordError1Label = label.Content;
      }

      if (label.Type === 'PASSWORD_ERROR_2') {
        passwordError2Label = label.Content;
      }

      if (label.Type === 'CONFIRM_PASSWORD_ERROR') {
        confirmPasswordErrorLabel = label.Content;
      }
      if (label.Type === 'SIGN_UP') {
        signUpLabel = label.Content;
      }
    });

    return (
        <DxContainer>
        <HeaderNavigator
          isSearchIcon={false}
          isAddIcon={false}
          isBackIcon={false}
          registerLabel={registerLabel}
        />
        <View style={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
        <KeyboardAvoidingView
          behavior={(Platform.OS === 'ios') ? 'padding' : null}
          enabled
          style={contentContainerStyle}
        >
          <RegisterContainer
            handleDimissKeyboard={Keyboard.dismiss}
            firstNameLabel={firstNameLabel}
            lastNameLabel={lastNameLabel}
            emailLabel={emailLabel}
            passwordLabel={passwordLabel}
            confirmPasswordLabel={confirmPasswordLabel}
            firstNameErrorLabel={firstNameErrorLabel}
            lastNameErrorLabel={lastNameErrorLabel}
            emailError1Label={emailError1Label}
            emailError2Label={emailError2Label}
            emailError3Label={emailError3Label}
            passwordError1Label={passwordError1Label}
            passwordError2Label={passwordError2Label}
            confirmPasswordErrorLabel={confirmPasswordErrorLabel}
            internetLabel={internetLabel}
            signUpLabel={signUpLabel}
          />
        </KeyboardAvoidingView>
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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
