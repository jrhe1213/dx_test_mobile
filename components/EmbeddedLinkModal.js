import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

// Libraries
import { Button } from 'native-base';
import FastImage from 'react-native-fast-image';

// Constants
import { headerForIphoneX } from '../helpers';

const styles = {
  webViewStyle: {
    width: Dimensions.get('window').width - 36,
    height: '100%',
  },
  webViewContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 55,
    paddingBottom: 55,
    paddingLeft: 0,
    paddingRight: 0,
  },
  closeStyle: {
    alignSelf: 'flex-end',
    paddingRight: 30,
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: 38,
    right: 3,
    height: 36,
    width: 36,
    zIndex: 99,
  },
  closeButtonStyle: {
    height: 36,
    width: 36,
  },
  closeImgStyle: {
    height: 36,
    width: 36,
  },
};

class EmbeddedLinkModal extends Component {
  static propTypes = {
    link: PropTypes.string,
  };

  render() {
    const { link } = this.props;

    const {
      webViewStyle,
      webViewContainerStyle,
    } = styles;
   
    const closeImg = require('../assets/images/Icons/closeIcon.png');

    if (!link) {
      return null;
    }
    
    return (
      <React.Fragment>
        <View style={webViewContainerStyle}>
          <View style={styles.closeButtonContainerStyle}>
            <Button
              style={styles.closeButtonStyle}
              transparent
              onPress={() => this.props.handleCloseModal()}
            >
              <FastImage
                style={styles.closeImgStyle}
                source={closeImg}
              />
            </Button>
          </View>
          <WebView
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: `${link}` }}
            style={webViewStyle}
          />
        </View>
      </React.Fragment>
    );
  }
}

export default EmbeddedLinkModal;
