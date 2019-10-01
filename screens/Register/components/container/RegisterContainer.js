import React, { Component } from 'react';

import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';

// Library
import {
  Form, Item, Input, Label, Icon,
} from 'native-base';


import { withNavigation } from 'react-navigation';

// Components
import { connect } from 'react-redux';

// Redux
import actions from '../../actions';

// Utils
import Alert from '../../../../utils/alert';

// Constants
import * as colors from '../../../../styles/variables';

// Config
import * as config from '../../../../config';

// Helpers
import { isValidateEmail } from '../../../../helpers';

// Fonts
import * as fonts from '../../../../styles/fonts';

const styles = {
  btnContainerStyle: {
    backgroundColor: colors.btnBlue,
    width: Dimensions.get('window').width - 24,
    borderRadius: 5,
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 12,
    justifyContent: 'center',
    marginTop: 28,
    height: 48,
    marginBottom: 24,
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
  itemStyle: {
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: 12,
  },
  errorStyle: {
    color: 'red',
    marginTop: 6,
    fontFamily: fonts.light,
    fontSize: 12,
    letterSpacing: 1,
  },
  labelStyle: {
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  inputStyle: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    paddingTop: 15,
    paddingBottom: 3,
    width: '100%',
    fontSize: 16,
    letterSpacing: 1,
  },
};

class RegisterContainer extends Component {
  static propTypes = {
    theme: PropTypes.object,
    isNightMode: PropTypes.bool,
    register: PropTypes.object,
    handleEmailCheckRequest: PropTypes.func,
    updateRegisterInput: PropTypes.func,
    registerRequest: PropTypes.func,
    isEmailAccepted: PropTypes.bool,
  }

  state = {
    errors: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    emailSuccess: '',
  }

  componentWillReceiveProps = (nextProps) => {
    if (!this.props.emailError && nextProps.emailError) {
      const errorState = { ...this.state.errors };
      errorState.email = nextProps.emailError;

      this.setState({
        errors: errorState,
      });
    }

    if (!this.props.isEmailAccepted && nextProps.isEmailAccepted) {
      const errorState = { ...this.state.errors };
      errorState.email = null;
      this.setState({
        errors: errorState,
      });
    }
  }

  handleRegisterPress = () => {
    Keyboard.dismiss();
    const {
      isLoading,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.props.register;
    const {
      isRequesting,
      isConnected,
      firstNameErrorLabel,
      lastNameErrorLabel,
      emailError1Label,
      emailError2Label,
      passwordError1Label,
      passwordError2Label,
      confirmPasswordErrorLabel,
      internetLabel,
    } = this.props;

    const errors = {};

    const emailValidation = isValidateEmail(email);

    if (!emailValidation) {
      errors.email = emailError2Label;
    }

    // Error handling
    if (firstName === '') {
      errors.firstName = firstNameErrorLabel;
    }

    if (lastName === '') {
      errors.lastName = lastNameErrorLabel;
    }

    if (email === '') {
      errors.email = emailError1Label;
    }

    if (password === '') {
      errors.password = passwordError1Label;
    }

    if (password && password.length < 6) {
      errors.password = passwordError2Label;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = confirmPasswordErrorLabel;
    }

    this.setState({ errors });

    if (!Object.keys(errors).length) {
      const data = {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      };
      if (!isLoading) {
        if (!isConnected) {
          Alert.showToast(internetLabel, 1000, 'danger');
          return;
        }
        if (!isRequesting) {
          this.props.registerRequest(data);
        }
      }
    }
  }

  handleOnChange = (val, name) => {
    this.props.updateRegisterInput(name, val);
  }

  handleErrorClear = (type) => {
    if (type === 'firstName') {
      const errorState = { ...this.state.errors };
      errorState.firstName = null;

      this.setState({
        errors: errorState,
      });
    } else if (type === 'lastName') {
      const errorState = {
        ...this.state.errors,
      };
      errorState.lastName = null;

      this.setState({
        errors: errorState,
      });
    } else if (type === 'password') {
      const errorState = {
        ...this.state.errors,
      };
      errorState.password = null;

      this.setState({
        errors: errorState,
      });
    } else if (type === 'confirmPassword') {
      const errorState = {
        ...this.state.errors,
      };
      errorState.confirmPassword = null;

      this.setState({
        errors: errorState,
      });
    } else if (type === 'email') {
      const errorState = {
        ...this.state.errors,
      };
      errorState.email = null;

      this.setState({
        errors: errorState,
      });
    }
  }

  render() {
    const {
      theme, register: {
        email, firstName, lastName, password, confirmPassword,
      }, isEmailAccepted, confirmPasswordErrorLabel, passwordError2Label, passwordError1Label, firstNameLabel,
      lastNameLabel, emailLabel, passwordLabel, confirmPasswordLabel,
      signUpLabel, emailError1Label,
    } = this.props;
    const { errors } = this.state;

    const emailValidation = isValidateEmail(email);

    return (
      <View style={{ flex: 1, alignItems: 'center', marginTop: 18 }}>
        <Form style={{ padding: 12, backgroundColor: theme.bgColor2 }}>
          <View style={styles.itemStyle}>
            <TextInput
              onBlur={(firstName && errors.firstName) ? this.handleErrorClear('firstName') : null
              }
              placeholder={firstNameLabel}
              style={[{ color: theme.textColor, borderBottomColor: errors.firstName ? 'red' : 'grey' }, styles.inputStyle]}
              placeholderTextColor={theme.textColor2}
              onChangeText={text => this.handleOnChange(text, 'firstName')}
            />
            {errors.firstName ? <Text style={styles.errorStyle}>{errors.firstName}</Text> : null}
          </View>

          <View style={styles.itemStyle}>
            <TextInput
              onBlur={
                (lastName && errors.lastName) ? this.handleErrorClear('lastName') : null
              }
              style={[{ color: theme.textColor, borderBottomColor: errors.lastName ? 'red' : 'grey' }, styles.inputStyle]}
              placeholder={lastNameLabel}
              placeholderTextColor={theme.textColor2}
              onChangeText={text => this.handleOnChange(text, 'lastName')}
            />
            {errors.lastName ? <Text style={styles.errorStyle}>{errors.lastName}</Text> : null}
          </View>

          <View style={styles.itemStyle}>
            <TextInput
              onBlur={(emailValidation && email)
                ? () => this.props.handleEmailCheckRequest(email) : email && (errors.email === emailError1Label) ? this.handleErrorClear('email') : null
              }
              style={[{ color: theme.textColor, borderBottomColor: errors.email ? 'red' : 'grey' }, styles.inputStyle]}
              placeholder={emailLabel}
              placeholderTextColor={theme.textColor2}
              onChangeText={text => this.handleOnChange(text, 'email')}
            />
            {errors.email ? <Text style={styles.errorStyle}>{errors.email}</Text> : null}
          </View>

          <View style={styles.itemStyle}>
            <TextInput
              onBlur={
                (password && errors.password === passwordError1Label) || (password.length >= 6 && errors.password === passwordError2Label) ? this.handleErrorClear('password') : null
              }
              secureTextEntry={true}
              placeholder={passwordLabel}
              placeholderTextColor={theme.textColor2}
              style={[{ color: theme.textColor, borderBottomColor: errors.password ? 'red' : 'grey' }, styles.inputStyle]}
              onChangeText={text => this.handleOnChange(text, 'password')}
            />
            {errors.password ? <Text style={styles.errorStyle}>{errors.password}</Text> : null}
          </View>

          <View style={styles.itemStyle}>
            <TextInput
              onBlur={
                (password === confirmPassword && errors.confirmPassword === confirmPasswordErrorLabel) ? this.handleErrorClear('confirmPassword') : null
              }
              secureTextEntry={true}
              placeholder={confirmPasswordLabel}
              placeholderTextColor={theme.textColor2}
              style={[{ color: theme.textColor, borderBottomColor: errors.confirmPassword ? 'red' : 'grey' }, styles.inputStyle]}
              onChangeText={text => this.handleOnChange(text, 'confirmPassword')}
            />
            {errors.confirmPassword ? <Text style={styles.errorStyle}>{errors.confirmPassword}</Text> : null}
          </View>
          <TouchableOpacity
            style={[styles.btnContainerStyle, { backgroundColor: theme.primaryColor }]}
            onPress={this.handleRegisterPress}
          >
            <Text style={styles.buttonText}>{signUpLabel}</Text>
          </TouchableOpacity>
        </Form>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  keyboardToggle: state.login.keyboardToggle,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  theme: state.setting.theme,
  register: state.register,
  isEmailAccepted: state.register.isEmailAccepted,
  emailSuccess: state.register.emailSuccess,
  emailError: state.register.emailError,

  isRequesting: state.deviceInfo.isRequesting
});

const mapDispatchToProps = dispatch => ({
  registerRequest: authData => dispatch(actions.registerRequest(authData)),
  updateRegisterInput: (name, val) => dispatch(actions.updateRegisterInput(name, val)),
  handleEmailCheckRequest: email => dispatch(actions.handleEmailCheckRequest(email)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(RegisterContainer));
