import React, { Component } from 'react';
import {
  View,
  Image,
  Dimensions,
  ScrollView,
  Platform,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Button,
} from 'native-base';
import FastImage from 'react-native-fast-image';

// fonts
import fonts from '../styles/fonts';

const styles = {
  containerWrapperStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 20,
    paddingRight: 20,
  },
  containerContentStyle: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: -15,
    right: -13,
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
  channelTitle: {
    color: '#000',
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 8,
  },
  channelDesc: {
    fontFamily: fonts.light,
    fontSize: 14,
    lineHeight: 16,
  },
};

class ChannelInfoModal extends Component {
  render() {
    const { channelInfo, handleCloseModal } = this.props;

    return (
      <View style={styles.containerWrapperStyle}>
        <View style={styles.containerContentStyle}>
          <View style={styles.closeButtonContainerStyle}>
            <Button
              style={styles.closeButtonStyle}
              transparent
              onPress={handleCloseModal}
            >
              <FastImage
                style={styles.closeImgStyle}
                source={require('../assets/images/Icons/closeIcon.png')}
              />
            </Button>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1, paddingTop: 18, paddingBottom: 18, paddingLeft: 12, paddingRight: 12,
            }}
          >
            <View>
              <Text style={[styles.channelTitle, channelInfo.channelColor && { color: channelInfo.channelColor }]}>{channelInfo.channelName}</Text>
              <Text style={styles.channelDesc}>{channelInfo.channelDescription}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

ChannelInfoModal.propTypes = {
  closeModal: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default ChannelInfoModal;
