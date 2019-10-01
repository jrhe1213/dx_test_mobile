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

class UserConsentModal extends Component {
  static propTypes = {
    skipTheContentUpdateRequest: PropTypes.func,
    addDownloadRequest: PropTypes.func,
    userClickedstream: PropTypes.object,
    olduserClickedstream: PropTypes.object,
    downloadData: PropTypes.object,
    isConnected: PropTypes.bool,
    previousTab: PropTypes.string,
    bookmarkSkipTheContentUpdateRequest: PropTypes.func,
    bookmarkAddDownloadRequest: PropTypes.func,
    isForcedContentUpdate: PropTypes.bool,
    theme: PropTypes.object,
    language: PropTypes.object,
  };

  state = {
    radioBtnOne: true,
    radioBtnTwo: false,
  };

  handleUserConsent = () => {
    const { downloadData, userClickedstream, previousTab } = this.props;
    if (previousTab == 'Bookmark'
      || previousTab == 'BookmarkCardPage'
      || previousTab == 'PAGES') {
      this.props.bookmarkAddDownloadRequest(userClickedstream, downloadData, true);
    } else {
      this.props.addDownloadRequest(userClickedstream, downloadData, true);
    }
  };

  handleSkipUpdate = () => {
    const { olduserClickedstream, previousTab } = this.props;
    if (previousTab == 'Bookmark'
      || previousTab == 'BookmarkCardPage'
      || previousTab == 'PAGES') {
      this.props.bookmarkSkipTheContentUpdateRequest(olduserClickedstream);
    } else {
      this.props.skipTheContentUpdateRequest(olduserClickedstream);
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

    const { theme, language, isForcedContentUpdate } = this.props;

    const langCheck = language || {};
    const consentLabels = langCheck.ConsentScreen ? langCheck.ConsentScreen : [];

    // Destructing Labels for the page
    let consentTitleLabel;
    let consentAcceptTitleLabel;
    let consentAcceptDescLabel;
    let consentRecommendLabel;
    let consentSkipTitleLabel;
    let consentSkipDescLabel;
    let consentAcceptBtnLabel;
    let consentSkipBtnLabel;


    consentLabels.map((label) => {
      if (label.Type === 'CONSENT_TITLE') {
        consentTitleLabel = label.Content;
      }
      if (label.Type === 'CONSENT_ACCEPT_TITLE') {
        consentAcceptTitleLabel = label.Content;
      }
      if (label.Type === 'CONSENT_ACCEPT_DESC') {
        consentAcceptDescLabel = label.Content;
      }
      if (label.Type === 'CONSENT_RECOMMEND') {
        consentRecommendLabel = label.Content;
      }
      if (label.Type === 'CONSENT_SKIP_TITLE') {
        consentSkipTitleLabel = label.Content;
      }
      if (label.Type === 'CONSENT_SKIP_DESC') {
        consentSkipDescLabel = label.Content;
      }
      if (label.Type === 'CONSENT_ACCEPT_BTN') {
        consentAcceptBtnLabel = label.Content;
      }
      if (label.Type === 'CONSENT_SKIP_BTN') {
        consentSkipBtnLabel = label.Content;
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
              {consentTitleLabel}
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
                      {consentAcceptTitleLabel}
                    </TextSize>
                    {Dimensions.get('window').width > 400 && <TextSize
                      small={Dimensions.get('window').width < 375}
                      base={Dimensions.get('window').width >= 375}
                      style={[styles.consentQuestionStyle, radioBtnOne && { color: 'green' }, { marginTop: 3, marginLeft: 3, fontSize: 12 }, !radioBtnOne && { color: theme.textColor }]}
                    >
                      {`${consentRecommendLabel}`}
                    </TextSize>
                    }
                  </View>
                  {Dimensions.get('window').width < 399 && <TextSize
                    small={Dimensions.get('window').width < 375}
                    base={Dimensions.get('window').width >= 375}
                    style={[radioBtnOne && { color: 'green' }, { fontSize: 12, fontFamily: fonts.light, lineHeight: 20 }, !radioBtnOne && { color: theme.textColor }]}
                  >
                    {`${consentRecommendLabel}`}
                  </TextSize>
                  }
                  <Text style={styles.subHeadingIngfo}>{consentAcceptDescLabel}</Text>
                </View>

              </Left>
            </ListItem>

            {!isForcedContentUpdate && <ListItem
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
                    {consentSkipTitleLabel}
                  </TextSize>
                  <Text style={styles.subHeadingIngfo}>
                    {consentSkipDescLabel}
                  </Text>
                </View>

              </Left>
            </ListItem>
            }
          </View>
        </CardItem>

        {
          !isForcedContentUpdate
            ? <CardItem
              button
              style={[
                styles.invitationFooterStyle,
                radioBtnOne ? { backgroundColor: 'green' } : { backgroundColor: 'red' },
              ]}
              onPress={radioBtnOne ? this.handleUserConsent : this.handleSkipUpdate}
            >
              <View style={[styles.FooterContentStyle, { paddingTop: 6, paddingBottom: 6 }]}>
                <TextSize
                  small={Dimensions.get('window').width < 375}
                  base={Dimensions.get('window').width >= 375}
                  style={[styles.consentQuestionStyle, { color: '#fff', fontFamily: fonts.bold }]}
                >
                  {radioBtnOne ? consentAcceptBtnLabel || 'Update' : consentSkipBtnLabel || 'Skip'}
                </TextSize>
              </View>
            </CardItem> : <CardItem
              button
              style={[
                styles.invitationFooterStyle,
                radioBtnOne ? { backgroundColor: 'green' } : { backgroundColor: 'red' },
              ]}
              onPress={this.handleUserConsent}
            >
              <View style={[styles.FooterContentStyle, { paddingTop: 6, paddingBottom: 6 }]}>
                <TextSize
                  small={Dimensions.get('window').width < 375}
                  base={Dimensions.get('window').width >= 375}
                  style={[styles.consentQuestionStyle, { color: '#fff', fontFamily: fonts.bold }]}
                >
                  {consentAcceptBtnLabel || 'Update'}
                </TextSize>
              </View>
            </CardItem>
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userClickedstream: state.modal.userClickedstream,
  downloadData: state.modal.downloadData,
  olduserClickedstream: state.modal.olduserClickedstream,
  previousTab: state.nav.previousTab,
  theme: state.setting.theme,
  language: state.deviceInfo.language,
  isForcedContentUpdate: state.deviceInfo.isForcedContentUpdate,
});

const mapDispatchToProps = dispatch => ({
  // Feed
  addDownloadRequest: (stream, downloadData, acceptedUpdate) => dispatch(feedActions.addDownloadRequest(stream, downloadData, acceptedUpdate)),
  skipTheContentUpdateRequest: stream => dispatch(feedActions.skipTheContentUpdateRequest(stream)),

  // Bookmark
  bookmarkAddDownloadRequest: (stream, downloadData, acceptedUpdate) => dispatch(bookmarkActions.addDownloadRequest(stream, downloadData, acceptedUpdate)),
  bookmarkSkipTheContentUpdateRequest: stream => dispatch(bookmarkActions.bookmarkSkipTheContentUpdateRequest(stream)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserConsentModal);
