import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';

// Components
import { connect } from 'react-redux';
import LoginContainer from '../container/LoginContainer';

// Redux

// Constants
import colors from '../../../../constants/colors';

class LoginPage extends Component {
  static propTypes = {

  };

  render() {
    const {
      currentTab,
      language,
      languageGUID,
    } = this.props;

    const {
      mainContainerStyle,
    } = styles;

    if (currentTab != 'Login') {
      return null;
    }

    return (
      <KeyboardAvoidingView
        behavior={(Platform.OS === 'ios') ? 'padding' : null}
        enabled
        style={mainContainerStyle}
      >
        {languageGUID
          ? <LoginContainer
            handleDimissKeyboard={Keyboard.dismiss}
            languageLabels={language}
          /> : null}
      </KeyboardAvoidingView>
    );
  }
}

const styles = {
  mainContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.whiteColor,
  },
};

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  language: state.deviceInfo.language,
  languageGUID: state.deviceInfo.languageGUID,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
