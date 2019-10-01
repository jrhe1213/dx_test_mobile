import React, { Component } from 'react';
import {
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Button,
} from 'native-base';
import FastImage from 'react-native-fast-image';

// Components
import DxHtmlReader5 from './DxHtmlReader5';
import { TextSize } from '../styles/types';

// Constants
import * as colors from '../styles/variables';
import * as helpers from '../helpers';

// Config
import config from '../config';

// Utils
import {
  getRootPath,
} from '../utils/fileSystem';

// fonts
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: helpers.headerForIphoneX ? 40 : 24,
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
  imgStyle: {
    width: Dimensions.get('window').width,
    height: 300,
  },
  overlayStyle: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: 300,
    top: 0,
    left: 0,
    zIndex: 3,
  },
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  imageContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

const maxHeight = 295;
let maxWidth;
if (Dimensions.get('window').width <= 320) {
  maxWidth = 270;
} else if (Dimensions.get('window').width <= 375) {
  maxWidth = 325;
} else if (Dimensions.get('window').width <= 414) {
  maxWidth = 364;
} else {
  maxWidth = 280;
}

class BackgroundImageTextModal2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    const {
      experienceCard,
    } = this.props;
    const filterImage = experienceCard.Settings.filter(
      data => data.Type === 'IMAGE',
    )[0];
    
    const {
      Width,
      Height,
    } = filterImage;
    const formattedWidth = Number(Width) || config.defaultCardImageWidth;
    const formattedHeight = Number(Height) || config.defaultCardImageHeight;
    const { tmpWidth, tmpHeight } = helpers.imageAlg(formattedWidth, formattedHeight, maxWidth, maxHeight);
    
    if (this._isMounted) {
      this.setState({
        width: tmpWidth,
        height: tmpHeight,
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      experienceCard,
      experienceStreamGUID,
      userGUID,
    } = this.props;

    const {
      width,
      height,
    } = this.state;

    // Filter Image
    const filterImage = experienceCard.Settings.filter(
      data => data.Type === 'IMAGE',
    );

    // Filter Image  BG Type
    const filterImageBgType = filterImage[0].ImgBgType ? filterImage[0].ImgBgType : null;

    // Filter Image  BG Color
    const filterImageBgColor = filterImage[0].ImgBgColor ? filterImage[0].ImgBgColor : null;

    const picValue = filterImage[0].Default ? filterImage[0].Default : filterImage[0].Value;

    // Filter Color
    const filterBackgroundColor = experienceCard.Settings.filter(
      data => data.Type === 'BACKGROUND_COLOR',
    );

    // Opacity Color
    const filterOpacityColor = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY_COLOR',
    );

    // Opacity
    const filterOpacity = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY',
    );
    const opacityValue = filterOpacity[0].Default / 100;

    const backgroundColor = filterBackgroundColor.length ? { backgroundColor: filterBackgroundColor[0].Default } : null;

    const imageSrc = picValue ? `${getRootPath('downloadFeeds', userGUID, experienceStreamGUID)}${picValue}.jpg` : '';
    const blurImageSrc = picValue ? `${getRootPath('downloadFeeds', userGUID, experienceStreamGUID)}${picValue}_blur.jpg` : '';

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
        <ScrollView contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: 0,
          margin: 0,
        }}>
          <View style={{ position: 'relative', height: 300 }}>
            {
              filterImageBgType === 'BACKGROUND_COLOR'
                ? <View style={{
                  width: Dimensions.get('window').width,
                  height: 300,
                  backgroundColor: filterImageBgColor,
                }} />
                : <FastImage
                  style={styles.imgStyle}
                  source={{ uri: blurImageSrc }}
                />
            }
            <View style={styles.imageContainerStyle}>
              <FastImage
                style={{ width, height }}
                source={{ uri: imageSrc }}
              />
            </View>
            <View
              style={Object.assign({}, styles.overlayStyle, {
                backgroundColor: filterOpacityColor[0].Default,
                opacity: opacityValue,
              })}
            />
          </View>

          <View style={{ backgroundColor: colors.white }}>
            <View
              style={Object.assign({}, backgroundColor, {
                paddingLeft: 6,
                paddinRight: 6,
                paddingBottom: helpers.headerForIphoneX ? 20 : null,
                width: Dimensions.get('window').width,
                minHeight:
                  this.props.type == 0
                    ? Dimensions.get('window').height - 300 - (Platform.OS == 'android' ? StatusBar.currentHeight : 0)
                    : Dimensions.get('window').height - 300 - 70 - (Platform.OS == 'android' ? StatusBar.currentHeight : 0),
              })}
            >
              <DxHtmlReader5
                source={experienceCard.Content}
                contentWidth={`width: calc(${Dimensions.get('window').width}px -18px);`}
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

BackgroundImageTextModal2.propTypes = {
  closeModal: PropTypes.func,
};

export default BackgroundImageTextModal2;
