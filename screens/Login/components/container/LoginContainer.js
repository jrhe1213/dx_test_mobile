import React, { Component } from 'react';

import {
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';

// Redux
import actions from '../../actions';
import registerActions from '../../../Register/actions';

// Utils
import Alert from '../../../../utils/alert';

// Constants
import * as colors from '../../../../styles/variables';

// Config
import * as config from '../../../../config';

// Fonts
import fonts from '../../../../styles/fonts';

// Libraries
import FastImage from 'react-native-fast-image';

const PublishXIlogoImg = require('../../../../assets/images/publishXi.png');


const styles = {

  logoContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 150,
  },
  emailContainerStyle: {
    alignItems: 'stretch',
    paddingLeft: 36,
    paddingRight: 36,
    marginTop: 36,
  },
  pwdContainerStyle: {
    alignItems: 'stretch',
    paddingLeft: 36,
    paddingRight: 36,
    marginTop: 36,
  },
  btnContainerStyle: {
    backgroundColor: colors.btnBlue,
    width: Dimensions.get('window').width - 24,
    borderRadius: 5,
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 12,
    justifyContent: 'center',
    marginTop: 24,
    height: 48,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    // paddingTop: Platform.OS === 'ios' ? 6 : 0,
    fontFamily: fonts.regular,
    letterSpacing: 1,
    paddingRight: 12,
    lineHeight: 48,
  },
  logoImgStyle: {
    width: '100%',
    height: '100%',
  },
  logoDefaultImgStyle: {
  },
};

class LoginContainer extends Component {
  static propTypes = {
    language: PropTypes.object,
    loginRequest: PropTypes.func,
    isConnected: PropTypes.bool,
    orgImageGUID: PropTypes.string,
    isLoaded: PropTypes.bool,
    isLoginRequired: PropTypes.bool,
    isSelfRegister: PropTypes.bool,
    isAnonymous: PropTypes.bool,
    anonymousLoginRequest: PropTypes.func,
    languageGUID: PropTypes.string,
  }

  handleLoginPress = (internetLabel) => {
    if (!this.props.isConnected) {
      Alert.showToast(internetLabel, 1000, 'danger');
    } else {
      this.props.loginRequest();
    }
  }

  handleSkipPress = (internetLabel) => {
    const {
      isFetching,
      isRequesting,
      isConnected,
    } = this.props;

    if (!isConnected) {
      Alert.showToast(internetLabel, 1000, 'danger');
    } else if (!isFetching && !isRequesting) {
      this.props.anonymousLoginRequest();
    }
  }

  renderLogo = (orgImageGUID) => {
    const logoImage = config.formatImageLink(orgImageGUID);

    if (!orgImageGUID) {
      return <FastImage
        source={PublishXIlogoImg}
        resizeMode="contain"
        style={styles.logoImgStyle}
      />;
    }
    return <FastImage
      source={{ uri: logoImage }}
      style={styles.logoImgStyle}
      resizeMode="contain"
    />;
  };

  renderButtons = (loginLabel, signupLabel, skipLabel, internetLabel) => {
    const {
      theme,
      isLoginRequired,
      isSelfRegister,
      isAnonymous,
    } = this.props;
    const {
      btnContainerStyle,
      buttonText,
    } = styles;

    return (
      isLoginRequired && <View>
        <TouchableOpacity
          style={[btnContainerStyle, { backgroundColor: theme.primaryColor }]}
          onPress={() => this.handleLoginPress(internetLabel)}
        >
          <Text style={buttonText}>{loginLabel}{isSelfRegister && ` / ${signupLabel}`}</Text>
        </TouchableOpacity>
        {
          isAnonymous && <TouchableOpacity
            style={[btnContainerStyle, { backgroundColor: 'grey', marginTop: 12 }]}
            onPress={() => this.handleSkipPress(internetLabel)}
          >
            <Text style={buttonText}>{skipLabel}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }


  render() {
    const {
      language, orgImageGUID, isLoaded, languageGUID,
    } = this.props;

    const {
      logoContainerStyle,
    } = styles;

    const langCheck = language || {};
    const loginLabels = langCheck.LoginScreen ? langCheck.LoginScreen : [];
    const messageLabels = langCheck.Message ? langCheck.Message : [];

    // Destructing Labels for the page
    let loginLabel;
    let signupLabel;
    let skipLabel;
    let internetLabel;


    loginLabels.map((label) => {
      if (label.Type === 'LOGIN') { loginLabel = label.Content; }
      if (label.Type === 'LOGIN_SIGNUP') { signupLabel = label.Content; }
      if (label.Type === 'LOGIN_SKIP') {
        skipLabel = label.Content;
      }
    });

    messageLabels.map((label) => {
      if (label.Type === 'INTERNET') { internetLabel = label.Content; }
    });

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {
          isLoaded ? <React.Fragment>
            <View
              style={logoContainerStyle}
            >{this.renderLogo(orgImageGUID)}
            </View>
            {
              languageGUID ? this.renderButtons(loginLabel, signupLabel, skipLabel, internetLabel) : null
            }
          </React.Fragment>
            : null
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.setting.theme,
  language: state.deviceInfo.language,
  keyboardToggle: state.login.keyboardToggle,
  orgImageGUID: state.deviceInfo.orgImageGUID,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  isLoaded: state.deviceInfo.isLoaded,
  isAnonymous: state.deviceInfo.isAnonymous,
  isLoginRequired: state.deviceInfo.isLoginRequired,
  isSelfRegister: state.deviceInfo.isSelfRegister,
  languageGUID: state.deviceInfo.languageGUID,

  isFetching: state.deviceInfo.isFetching,
  isRequesting: state.deviceInfo.isRequesting,
});

const mapDispatchToProps = dispatch => ({
  loginRequest: () => dispatch(actions.loginRequest()),
  anonymousLoginRequest: () => dispatch(actions.anonymousLoginRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(LoginContainer));
