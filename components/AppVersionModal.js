import React, { Component } from 'react';
import {
  View,
  Dimensions,
  Platform,
  Image,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  CardItem,
  Body,
  Button,
} from 'native-base';

// Images
import androidDownloadIcon from '../assets/images/androidDownloadIcon.png';
import iosDownloadIcon from '../assets/images/appleDownloadIcon.png';

// Components
import { TextSize } from '../styles/types';
// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

// Libraries
import FastImage from 'react-native-fast-image';

const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width - 24,
  },
  headerCardItemStyle: {
    flexDirection: 'column',
    marginBottom: 2,
    paddingTop: 25,
  },
  headerContentStyle: {

  },
  closeButtonStyle: {
    flex: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
  },
  mainHeadingStyle: {
    fontFamily: fonts.bold,
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
    lineHeight: 23,
    textAlign: 'center',
  },
  FooterContentStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: Dimensions.get('window').width < 375 ? 0 : 16,
    paddingBottom: Dimensions.get('window').width < 375 ? 0 : 16,
  },
  footerButton: {
    backgroundColor: 'transparent',
  },
};

class AppVersionModal extends Component {
  static propTypes = {
    newAppVersion: PropTypes.string,
    links: PropTypes.array,
    updateApplicationLabel: PropTypes.string,
    updateApplicationDescLabel: PropTypes.string,
  }

  handleStoreRedirect = () => {
    const { links } = this.props;

    let link;
    if (Platform.OS === 'ios') {
      link = links.filter(item => item.PLATFORM === 'IOS');
    } else if (Platform.OS === 'android') {
      link = links.filter(item => item.PLATFORM === 'ANDROID');
    }

    Linking.openURL(`${link[0].LINK}`).catch(err => console.error('An error occurred', err));
  }

  render() {
    const {
      newAppVersion,
      updateApplicationLabel,
      updateApplicationDescLabel,
      theme,
    } = this.props;

    return (
      <View style={[styles.containerContentStyle, { backgroundColor: theme.bgColor2 }]}>
        <CardItem style={{
          backgroundColor: theme.bgColor, alignItems: 'center', justifyContent: 'center', height: 60, paddingBottom: 0, marginBottom: 0,
        }}>
          <View style={[styles.headerContentStyle, { backgrundColor: theme.bgColor2 }]}>
            <TextSize small={Dimensions.get('window').width < 375} base={Dimensions.get('window').width >= 375} style={[styles.mainHeadingStyle, { color: theme.textColor }]}>{updateApplicationLabel || 'UPDATE APPLICATION'}</TextSize>
          </View>
        </CardItem>
        <CardItem style={{ backgroundColor: theme.bgColor2, height: 100 }}>
          <Body style={[styles.invitationBodyStyle, { backgroundColor: theme.bgColor2 }]}>
            <TextSize small={Dimensions.get('window').width < 375} base={Dimensions.get('window').width >= 375}style={[styles.consentQuestionStyle, { color: theme.textColor }]}>{`${updateApplicationDescLabel || 'Please update your app to version '} ${newAppVersion}`}</TextSize>
          </Body>
        </CardItem>
        <CardItem style={[styles.invitationFooterStyle, { backgroundColor: theme.bgColor }]}>
          <View style={[styles.FooterContentStyle, { backgroundColor: theme.bgColor }]}>
            <Button style={styles.footerButton} onPress={this.handleStoreRedirect}>
            {
              Platform.OS === 'ios' ? (
                <FastImage style={{ width: 150, height: 43 }} source={iosDownloadIcon}/>
              ) : <FastImage style={{ width: 150, height: 44 }} source={androidDownloadIcon}/>
            }
            </Button>
          </View>
        </CardItem>
      </View>
    );
  }
}

export default AppVersionModal;
