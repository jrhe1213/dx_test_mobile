import React, { Component } from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Button,
} from 'native-base';

// Components
import DxHtmlReader5 from './DxHtmlReader5';
import { TextSize } from '../styles/types';

// fonts
import fonts from '../styles/fonts';

// Constants
import { headerForIphoneX } from '../helpers';

// Libraries
import FastImage from 'react-native-fast-image';

const contentTopMarginV1 = headerForIphoneX ? 60 : Platform.OS == 'ios' ? 48 : 60;
const contentTopMarginV2 = headerForIphoneX ? 36 : 12;

const styles = {
  containerContentStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStyle: {
    width: Dimensions.get('window').width,
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: headerForIphoneX ? 40 : 24,
    right: 12,
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
  contentWrapperStyle: {
    paddingLeft: 6,
    paddingRight: 6,
    width: Dimensions.get('window').width,
    paddingBottom: headerForIphoneX ? 20 : null,
  },

  bottomBtnContainerStyle: {
    height: 70,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  bottomBtnWrapperStyle: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  bottomBtnLabelStyle: {
    flex: 8,
    display: 'flex',
    flexDirection: 'column',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    color: '#000000',
    fontFamily: fonts.regular,
  },
  subtitleStyle: {
    color: '#C3C9CE',
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
};

class BackgroundTextModal extends Component {
  render() {
    const {
      experienceCard,
    } = this.props;

    // Filter background color
    const filterBackgroundColor = experienceCard.Settings.filter(
      data => data.Type === 'BACKGROUND_COLOR',
    );
    return (
      <View style={styles.containerContentStyle}>
        {
          this.props.type == 0
            ? <View style={styles.closeButtonContainerStyle}>
              <Button
                style={styles.closeButtonStyle}
                transparent
                onPress={this.props.handleCloseModal}
              >
                <FastImage
                  style={styles.closeImgStyle}
                  source={require('../assets/images/Icons/closeIcon.png')}
                />
              </Button>
            </View>
            : null
        }
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <View
            transparent
            style={Object.assign({}, styles.cardStyle, {
              backgroundColor: filterBackgroundColor[0].Default,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              minHeight:
                this.props.type == 0
                  ? Dimensions.get('window').height - (Platform.OS == 'android' ? StatusBar.currentHeight : 0)
                  : Dimensions.get('window').height - 70 - (Platform.OS == 'android' ? StatusBar.currentHeight : 0),
            })}
          >
            <View style={Object.assign({}, styles.contentWrapperStyle, this.props.type == 0 ? { marginTop: contentTopMarginV1 } : { marginTop: contentTopMarginV2 })}>
              <DxHtmlReader5
                source={experienceCard.Content}
                contentWidth={`width: calc(${Dimensions.get('window').width});`}
              />
            </View>
          </View>
        </ScrollView>
        {
          this.props.type == 1
            ? <View style={styles.bottomBtnContainerStyle}>
              <TouchableOpacity
                style={styles.bottomBtnWrapperStyle}
                onPress={this.props.handleCloseModal}
              >
                <View style={styles.bottomBtnLabelStyle}>
                  <TextSize small style={styles.titleStyle}>
                    {this.props.title}
                  </TextSize>
                  <TextSize
                    small
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={Object.assign({}, styles.subtitleStyle, {
                      flexShrink: 1,
                    })}
                  >
                    {this.props.subtitle}
                  </TextSize>
                </View>
              </TouchableOpacity>
            </View>
            : null
        }
      </View>
    );
  }
}

BackgroundTextModal.propTypes = {
  closeModal: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default BackgroundTextModal;
