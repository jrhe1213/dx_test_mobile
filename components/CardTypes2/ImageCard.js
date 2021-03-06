import React, { Component } from 'react';
import {
  Platform,
  Dimensions,
  View,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { CardItem } from 'native-base';
import FastImage from 'react-native-fast-image';

// Constants
import * as fonts from '../../styles/fonts';

// Utils
import { getRootPath } from '../../utils/fileSystem';
import * as config from '../../config';
import * as helpers from '../../helpers';

const styles = {
  topContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    marginTop: -10,
    height: 110,
    width: '100%',
    flexDirection: 'row',
  },
  imageWrapperStyle: {},
  imageStyle: {
    height: '100%',
    width: '100%',
  },
  detailWrapperStyle: {
    paddingLeft: 5,
    paddingRight: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  detailLableStyle: {
    fontFamily: fonts.light,
    padding: 6,
    color: '#FFFFFF',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
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
};

class ImageCard extends Component {
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
      currentTab,
      experienceCard,
    } = this.props;
    const filterImage = experienceCard.Settings[0];
    const {
      Width,
      Height,
    } = filterImage;

    const formattedWidth = Number(Width) || config.default.defaultCardImageWidth;
    const formattedHeight = Number(Height) || config.default.defaultCardImageHeight;

    const maxHeight = 100;
    let maxWidth;
    if (currentTab === 'Home') {
      if (Dimensions.get('window').width <= 320) {
        maxWidth = 80;
      } else if (Dimensions.get('window').width <= 375) {
        maxWidth = 85;
      } else if (Dimensions.get('window').width <= 414) {
        maxWidth = 90;
      } else {
        maxWidth = 90;
      }
    } else if (Dimensions.get('window').width <= 320) {
      maxWidth = 90;
    } else if (Dimensions.get('window').width <= 375) {
      maxWidth = 140;
    } else if (Dimensions.get('window').width <= 414) {
      maxWidth = 150;
    } else {
      maxWidth = 90;
    }

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
      handlePressCard,
      disableClick,
      localData,
      folderName,
      userGUID,
      theme,
      isContentUpdated,
    } = this.props;

    const {
      width,
      height,
    } = this.state;

    // Filter Image
    const filterImage = experienceCard.Settings;

    // Filter Image  BG Type
    const filterImageBgType = filterImage[0].ImgBgType ? filterImage[0].ImgBgType : null;

    // Filter Image  BG Color
    const filterImageBgColor = filterImage[0].ImgBgColor ? filterImage[0].ImgBgColor : null;

    const picValue = filterImage[0].Default ? filterImage[0].Default : filterImage[0].Value;
    let imageSrc = config.formatImageLink(picValue);
    let blurImageSrc = `${config.formatImageLink(picValue)}&Type=BLUR`;

    if (localData && !isContentUpdated) {
      imageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}.jpg`;
      blurImageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}_blur.jpg`;
    }

    // Opacity Color
    const filterOpacityColor = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY_COLOR',
    );

    // Opacity
    const filterOpacity = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY',
    );
    const opacityValue = filterOpacity[0].Default / 100;

    return (
      <CardItem button style={[styles.cardItemStyle, { backgroundColor: theme.bgColor2 }]} onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={styles.contentContainerStyle}>
          <View style={Object.assign({}, styles.imageWrapperStyle, { flex: 1 })}>
            <View style={styles.relative}>
              {
                filterImageBgType === 'BACKGROUND_COLOR'
                  ? <View style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: filterImageBgColor,
                  }} />
                  : <FastImage
                    style={styles.imageStyle}
                    source={{ uri: blurImageSrc }}
                  />}
              <View style={styles.imageContainerStyle}>
                <FastImage
                  style={{ width, height }}
                  source={{ uri: imageSrc }}
                />
              </View>
            </View>
            <View
              style={Object.assign({}, styles.overlay, {
                backgroundColor: filterOpacityColor[0].Default,
                opacity: opacityValue,
              })}
            />
          </View>
        </View>
      </CardItem>
    );
  }
}

ImageCard.propTypes = {
  currentTab: PropTypes.string,
  experienceCard: PropTypes.object,
  handlePressCard: PropTypes.func,
};

export default ImageCard;
