import React, { Component } from 'react';
import {
  View, Dimensions, Picker, Text, Platform, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { CardItem, Button, Icon } from 'native-base';

// Redux
import { connect } from 'react-redux';

// Actions
import deviceInfo from '../actions/DeviceInfo';

// Components
import { TextSize } from '../styles/types';

// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerCardItemStyle: {
    flexDirection: 'column',
    alignItems: 'center',
    jsutifyContent: 'center',
    marginBottom: 2,
    paddingTop: 25,
  },
  headerContentStyle: {},
  mainHeadingStyle: {
    fontFamily: fonts.bold,
    letterSpacing: 2,
    fontSize: 18,
  },
  pickerStyle: {
    borderWidth: 1,
    borderColor: 'transparent',
    height: 200,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgColor,
  },
  selectedLanguageStyle: {
    marginTop: 10,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderColor: colors.gray,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 3,
  },
  selectedLanguageTextStyle: {
    fontFamily: fonts.regular,
    letterSpacing: 1,
    fontSize: 18,
  },
  btnContainerStyle: {
    backgroundColor: colors.btnBlue,
    width: Dimensions.get('window').width - 24,
    borderRadius: 5,
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    paddingTop: Platform.OS === 'ios' ? 6 : 0,
    fontFamily: fonts.regular,
    letterSpacing: 1,
    paddingRight: 12,
  },
  pickerContainerStyle: {
    marginTop: 12,
    marginBottom: 12,
  },
};

class LanguageModal extends Component {
  static propTypes = {
    languages: PropTypes.array,
    setAppLanguageModalRequest: PropTypes.func,
    setAppLanguageRequest: PropTypes.func,
    selectedLanguageSuccess: PropTypes.func,
    selectedLanguage: PropTypes.object,
    languageModalClose: PropTypes.func,
    selectLanguageLabel: PropTypes.string,
    language: PropTypes.object,
    isAuthenticated: PropTypes.bool,
  };


  updateLanguage = (itemValue) => {
    const { languages } = this.props;
    const result = languages.filter(item => itemValue === item.LanguageGUID);

    const formattedData = {
      LanguageGUID: itemValue,
      Language: result[0].Language,
      LanguageCode: result[0].LanguageCode,
      FirstInstall: result[0].FirstInstall,
    };

    this.props.selectedLanguageSuccess(formattedData);
  };

  handleButtonPress = (LanguageGUID) => {
    const {
      isFetching,
      isRequesting,

      language,
      isAuthenticated
    } = this.props;

    if (!isFetching && !isRequesting) {
      if (!isAuthenticated) {
        this.props.setAppLanguageModalRequest(LanguageGUID, language);
      }
    } else {
      const data = {
        LanguageGUID,
      };
      this.props.setAppLanguageRequest(data, true);
    }
  }

  handleCloseModal = () => {
    this.props.languageModalClose();
  }

  render() {
    const {
      languages,
      selectedLanguage,
      selectLanguageLabel,
      theme,
    } = this.props;

    return (
      <View style={[styles.containerContentStyle, { backgroundColor: theme.bgColor }]}>
        <CardItem style={[styles.headerCardItemStyle, { backgroundColor: theme.bgColor }]}>
          <View style={styles.headerContentStyle}>
            <TextSize
              small={Dimensions.get('window').width < 375}
              base={Dimensions.get('window').width >= 375}
              style={[styles.mainHeadingStyle, { color: theme.textColor }]}
            >
              {selectLanguageLabel}:
            </TextSize>
          </View>

          {
            Platform.OS === 'android'
              ? (
                <View style={[styles.pickerContainerStyle, { backgroundColor: theme.bgColor }]}>
                  <Picker
                    itemTextStyle={{ fontFamily: fonts.regular, letterSpacing: 1 }}
                    style={{
                      width: Dimensions.get('window').width - 48,
                      height: 48,
                    }}
                    selectedValue={selectedLanguage.LanguageGUID}
                    onValueChange={(itemValue) => {
                      setTimeout(() => {
                        this.updateLanguage(itemValue);
                      }, 10);
                    }}
                  >
                    {languages.map(lang => (
                      <Picker.Item
                        key={lang.LanguageGUID}
                        label={lang.Language}
                        value={lang.LanguageGUID} />
                    ))}
                  </Picker>
                </View>
              )
              : null
          }

          {
            Platform.OS === 'ios'
              ? (<View style={styles.selectedLanguageStyle}>
                <Text style={[styles.selectedLanguageTextStyle, { color: theme.textColor }]}>{selectedLanguage.Language}</Text>
              </View>)
              : null
          }

          <TouchableOpacity style={[styles.btnContainerStyle, { backgroundColor: theme.primaryColor }]}
            onPress={() => this.handleButtonPress(selectedLanguage.LanguageGUID)}
          >
            <Text style={styles.buttonText}>
              {selectedLanguage.Language} ({selectedLanguage.LanguageCode})
            </Text>
            <Icon
              style={{ color: '#fff', alignSelf: 'flex-end' }}
              name="ios-arrow-forward" />
          </TouchableOpacity>

        </CardItem>

        {Platform.OS === 'ios' ? <Picker
          itemTextStyle={{ fontFamily: fonts.regular, letterSpacing: 1 }}
          selectedValue={selectedLanguage.LanguageGUID}
          style={[styles.pickerStyle, { backgroundColor: '#fff' }]}
          onValueChange={itemValue => this.updateLanguage(itemValue)}
        >
          {languages.map(lang => (
            <Picker.Item
              key={lang.LanguageGUID}
              label={lang.Language}
              value={lang.LanguageGUID} />
          ))}
        </Picker> : null}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  language: state.deviceInfo.language,
  isAuthenticated: state.deviceInfo.isAuthenticated,
  theme: state.setting.theme,

  isFetching: state.deviceInfo.isFetching,
  isRequesting: state.deviceInfo.isRequesting,
});

const mapDispatchToProps = dispatch => ({
  setAppLanguageModalRequest: (languageGUID, language) => dispatch(deviceInfo.setAppLanguageModalRequest(languageGUID, language)),
  setAppLanguageRequest: (languageGUID, isLanguageModal) => dispatch(deviceInfo.setAppLanguageRequest(languageGUID, isLanguageModal)),
  languageModalClose: () => dispatch(deviceInfo.languageModalClose()),
  selectedLanguageSuccess: lang => dispatch(deviceInfo.selectedLanguageSuccess(lang)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguageModal);
