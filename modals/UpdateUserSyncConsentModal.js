import React, { Component } from 'react';
import { View, Dimensions, Text } from 'react-native';
import PropTypes from 'prop-types';

import {
  CardItem,
  Icon,
  ListItem,
  Radio,
  Left,
} from 'native-base';

// Redux
import { connect } from 'react-redux';
import feedActions from '../screens/Feed/actions';
import bookmarkActions from '../screens/Bookmark/actions';

// Libraries

// Components
import { TextSize } from '../styles/types';
// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width - 24,
  },
  headerCardItemStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingBottom: 0,
    marginBottom: 0,
  },
  headerContentStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonStyle: {
    flex: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
  },
  closeButtonTextStyle: {
    color: colors.black,
  },
  mainHeadingStyle: {
    fontFamily: fonts.bold,
    color: colors.black,
    letterSpacing: 2,
  },
  invitationBodyStyle: {
    paddingLeft: Dimensions.get('window').width < 375 ? 6 : 18,
    paddingRight: Dimensions.get('window').width < 375 ? 6 : 18,
    paddingTop: Dimensions.get('window').width < 375 ? 0 : 10,
    paddingBottom: Dimensions.get('window').width < 375 ? 0 : 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContentStyle: {
    textAlign: 'justify',
    lineHeight: 23,
    fontFamily: fonts.light,
    letterSpacing: 2,
  },
  consentQuestionStyle: {
    fontFamily: fonts.light,
    // lineHeight: 20,
    textAlign: 'center',
  },
  inputItemStyle: {
    marginTop: 20,
    borderColor: 'transparent',
    width: '100%',
    height: 50,
  },
  inputStyle: {
    fontFamily: fonts.regular,
    fontSize: Dimensions.get('window').width < 375 ? 16 : 18,
  },
  invitationFooterStyle: {
  },
  FooterContentStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    backgroundColor: 'transparent',
  },
  drawerItemIcon: {
    fontSize: 26,
    width: 28,
    marginRight: 5,
  },
  subHeadingIngfo: {
    color: 'grey',
    fontFamily: fonts.light,
    fontSize: 12,
    letterSpacing: 1,
  },
};

class UpdateUserSyncConsentModal extends Component {
  static propTypes = {

  };

  state = {
    radioBtnOne: true,
    radioBtnTwo: false,
  };

  handleConfirmUserConsent = () => {

    const {
      userClickedstream,
      olduserClickedstream,
      updateBS,
    } = this.props;
    const {
      radioBtnOne,
    } = this.state;

    if (radioBtnOne) {
      // Update
      this.props.updateUserContentRequest(userClickedstream, true, updateBS);
    } else {
      // Stay
      this.props.updateUserContentRequest(olduserClickedstream, false, updateBS);
    }
  };

  handleDownloadPress = (btn) => {
    if (btn === 'radioBtnOne') {
      this.setState({
        radioBtnOne: true,
        radioBtnTwo: false,
      });
    } else if (btn === 'radioBtnTwo') {
      this.setState({
        radioBtnTwo: true,
        radioBtnOne: false,
      });
    }
  };

  render() {
    const { radioBtnOne, radioBtnTwo } = this.state;
    const { theme, language } = this.props;

    const langCheck = language || {};
    const consentLabels = langCheck.ConsentScreen ? langCheck.ConsentScreen : [];

    // Destructing Labels for the page
    let consentUserSyncTitleLabel;
    let consentUserSyncAcceptLabel;
    let consentUserSyncSkipLabel;
    let consentUserSyncBtnLabel;


    consentLabels.map((label) => {
      if (label.Type === 'CONSENT_USER_SYNC_TITLE') {
        consentUserSyncTitleLabel = label.Content;
      }
      if (label.Type === 'CONSENT_USER_SYNC_ACCEPT') {
        consentUserSyncAcceptLabel = label.Content;
      }
      if (label.Type === 'CONSENT_USER_SYNC_SKIP') {
        consentUserSyncSkipLabel = label.Content;
      }
      if (label.Type === 'CONSENT_USER_SYNC_BTN') {
        consentUserSyncBtnLabel = label.Content;
      }
    });

    return (
      <View style={[styles.containerContentStyle, { backgroundColor: theme.bgColor }]}>
        <CardItem style={[styles.headerCardItemStyle, { backgroundColor: theme.bgColor }]}>
          <View style={styles.headerContentStyle}>
            {/* <Icon style={styles.drawerItemIcon} name="ios-update" /> */}
            <TextSize
              small={Dimensions.get('window').width < 375}
              base={Dimensions.get('window').width >= 375}
              style={[styles.mainHeadingStyle, { color: theme.textColor }]}
            >
              {consentUserSyncTitleLabel}
            </TextSize>
          </View>
        </CardItem>

        <CardItem style={{ backgroundColor: theme.bgColor2 }}>
          <View style={{ padding: 0, flex: 1 }}>
            <ListItem
              noBorder
              onPress={() => this.handleDownloadPress('radioBtnOne')}
            >
              <Left>
                <View style={{ width: 20 }}>
                  <Radio
                    color="black"
                    selectedColor="green"
                    selected={radioBtnOne}
                    onPress={() => this.handleDownloadPress('radioBtnOne')}
                  />
                </View>

                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <TextSize
                      small={Dimensions.get('window').width < 375}
                      base={Dimensions.get('window').width >= 375}
                      style={[styles.consentQuestionStyle, { color: theme.textColor }]}
                    >
                      {consentUserSyncAcceptLabel}
                    </TextSize>
                  </View>
                </View>

              </Left>
            </ListItem>

            <ListItem
              noBorder
              onPress={() => this.handleDownloadPress('radioBtnTwo')}
            >
              <Left>
                <View style={{ width: 20 }}>
                  <Radio
                    color="black"
                    selectedColor="red"
                    selected={radioBtnTwo}
                    onPress={() => this.handleDownloadPress('radioBtnTwo')}
                  />
                </View>
                <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <TextSize
                    small={Dimensions.get('window').width < 375}
                    base={Dimensions.get('window').width >= 375}
                    style={[styles.consentQuestionStyle, { color: theme.textColor }]}
                  >
                    {consentUserSyncSkipLabel}
                  </TextSize>
                </View>

              </Left>
            </ListItem>
          </View>
        </CardItem>
        <CardItem
          button
          style={[
            styles.invitationFooterStyle,
            radioBtnOne ? { backgroundColor: 'green' } : { backgroundColor: 'red' },
          ]}
          onPress={this.handleConfirmUserConsent}
        >
          <View style={[styles.FooterContentStyle, { paddingTop: 6, paddingBottom: 6 }]}>
            <TextSize
              small={Dimensions.get('window').width < 375}
              base={Dimensions.get('window').width >= 375}
              style={[styles.consentQuestionStyle, { color: '#fff', fontFamily: fonts.bold }]}
            >
              {consentUserSyncBtnLabel || 'Update'}
            </TextSize>
          </View>
        </CardItem>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userClickedstream: state.modal.userClickedstream,
  olduserClickedstream: state.modal.olduserClickedstream,
  updateBS: state.modal.updateBS,

  theme: state.setting.theme,
  language: state.deviceInfo.language,
});

const mapDispatchToProps = dispatch => ({
  updateUserContentRequest: (stream, isUpdate, updateBS) => dispatch(feedActions.updateUserContentRequest(stream, isUpdate, updateBS)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdateUserSyncConsentModal);
