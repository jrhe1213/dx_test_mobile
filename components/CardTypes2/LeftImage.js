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

// Components
import DxHtmlReader2Original from '../DxHtmlReader2Original';

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
    overflow: 'hidden',
  },
  imageWrapperStyle: {
    flex: 1,
    overflow: 'hidden',
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
  detailWrapperStyle: {
    width: '100%',
    justifyContent: 'center',
    flex: 2,
    paddingLeft: 5,
    paddingRight: 5,
  },
  detailLableStyle: {
    flexWrap: 'wrap',
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

class LeftImage extends Component {
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

    const maxHeight = 110;
    let maxWidth;
    if (currentTab === 'Home') {
      if (Dimensions.get('window').width <= 320) {
        maxWidth = 70;
      } else if (Dimensions.get('window').width <= 375) {
        maxWidth = 82;
      } else if (Dimensions.get('window').width <= 414) {
        maxWidth = 93;
      } else {
        maxWidth = 82;
      }
    } else if (Dimensions.get('window').width <= 320) {
      maxWidth = 85;
    } else if (Dimensions.get('window').width <= 375) {
      maxWidth = 102;
    } else if (Dimensions.get('window').width <= 414) {
      maxWidth = 117;
    } else {
      maxWidth = 92;
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
      contentWidth,
      userGUID,
      theme,
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

    // Filter background color
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

    const picValue = filterImage[0].Default ? filterImage[0].Default : filterImage[0].Value;
    let imageSrc = config.formatImageLink(picValue);
    let blurImageSrc = `${config.formatImageLink(picValue)}&Type=BLUR`;

    if (localData && !isContentUpdated) {
      imageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}.jpg`;
      blurImageSrc = `${getRootPath('downloadFeeds', userGUID, folderName)}${picValue}_blur.jpg`;
    }

    return (
      <CardItem button style={{ backgroundColor: theme.bgColor2 }} onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={styles.contentContainerStyle}>
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
            <View style={Object.assign({}, styles.overlay, filterOpacityColor && {
              backgroundColor: filterOpacityColor[0].Default,
            }, { opacity: opacityValue })} />
          </View>
          <View style={
            Object.assign({}, styles.detailWrapperStyle, filterBackgroundColor && {
              backgroundColor: filterBackgroundColor[0].Default,
            })
          }
          >
            <View style={Object.assign({}, styles.detailLableStyle)}>
              <DxHtmlReader2Original
                source={experienceCard.Content}
                contentWidth={contentWidth}
              />
            </View>
          </View>
        </View>
      </CardItem>
    );
  }
}

LeftImage.propTypes = {
  experienceCard: PropTypes.object,
  handlePressCard: PropTypes.func,
  disableClick: PropTypes.bool,
  localData: PropTypes.bool,
  folderName: PropTypes.string,
  contentWidth: PropTypes.string,
  currentTab: PropTypes.string,
};

export default LeftImage;
