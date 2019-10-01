import React, { Component } from 'react';
import {
  Platform,
  Dimensions,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Components
import DxHtmlReader2 from '../DxHtmlReader2';

// Utils
import { getRootPath } from '../../utils/fileSystem';
import * as config from '../../config';
import * as helpers from '../../helpers';

// Libraries
import FastImage from 'react-native-fast-image';

const styles = {
  contentContainerStyle: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  imageWrapperStyle: {
    flex: 1,
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
  imageStyle: {
    height: '100%',
    width: '100%',
  },
  textWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 4,
    justifyContent: 'center',
    // paddingLeft: 3,
    // paddingRight: 3,
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

class BackgroundImageText extends Component {
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

    const maxHeight = this.props.contentHeight;
    const maxWidth = this.props.contentWidth;

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
      contentWidth,
      userGUID,
      contentHeight,
      isContentUpdated,
    } = this.props;

    const {
      width,
      height,
    } = this.state;

    // Filter Image
    const filterImage = experienceCard.Settings.filter(data => data.Type === 'IMAGE');

    // Filter Image  BG Type
    const filterImageBgType = filterImage[0].ImgBgType ? filterImage[0].ImgBgType : null;

    // Filter Image  BG Color
    const filterImageBgColor = filterImage[0].ImgBgColor ? filterImage[0].ImgBgColor : null;

    // Opacity Color
    const filterOpacityColor = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY_COLOR',
    );

    // Opacity
    const filterOpacity = experienceCard.Settings.filter(
      data => data.Type === 'OPACITY',
    );
    const opacityValue = filterOpacity[0].Default / 100;

    const picValue = filterImage[0].Default ? filterImage[0].Default : filterImage[0].Value;
    let imageSrc = config.formatImageLink(picValue);
    let blurImageSrc = `${config.formatImageLink(picValue)}&Type=BLUR`;

    if (localData && !isContentUpdated) {
      imageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}.jpg`;
      blurImageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}_blur.jpg`;
    }

    return (
      <TouchableOpacity onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={[styles.contentContainerStyle, Platform.OS === 'android' ? { width: 135 } : null]}>

          <View style={Object.assign({}, styles.imageWrapperStyle, styles.relative)}>
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
                />
            }
            <View style={styles.imageContainerStyle}>
              <FastImage
                style={{ width, height }}
                source={{ uri: imageSrc }}
              />
            </View>

            <View style={
              Object.assign({}, styles.overlay, filterOpacityColor && {
                backgroundColor: filterOpacityColor[0].Default,
              }, { opacity: opacityValue })}
            />
            <View style={[styles.textWrapper, {
              width: 140,
              height: 140,
            }]}>
              <View style={{ flexWrap: 'wrap' }}>
                <DxHtmlReader2
                  source={experienceCard.Content}
                  contentWidth={contentWidth}
                  contentHeight={contentHeight}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

BackgroundImageText.propTypes = {
  experienceCard: PropTypes.object,
  handlePressCard: PropTypes.func,
  disableClick: PropTypes.bool,
  folderName: PropTypes.string,
  localData: PropTypes.bool,
  contentWidth: PropTypes.number,
  currentTab: PropTypes.string,
  userGUID: PropTypes.string,
  contentHeight: PropTypes.number,
};

export default BackgroundImageText;
