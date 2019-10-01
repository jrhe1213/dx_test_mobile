import React, { Component } from 'react';
import {
  Platform,
  Dimensions,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { CardItem } from 'native-base';
import FastImage from 'react-native-fast-image';

// Components
import DxHtmlReader2 from './DxHtmlReader2';

// Utils
import * as config from '../config';
import * as helpers from '../helpers';

const styles = {
  topContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    height: 70,
    width: 140,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageWrapperStyle: {
    flex: 1,
    overflow: 'hidden',
    height: 70,
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
    // justifyContent: 'center',
  },
  detailLableStyle: {
    flexWrap: 'wrap',
    height: 140,
    overflow: 'hidden',
    alignItems: 'center',
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

class SectionMediaElementBookmark extends Component {
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
      currentTab, section
    } = this.props;

    const formattedWidth = Number(section.Width) || 140;
    const formattedHeight = Number(section.Height) || 70;

    const maxHeight = 70;
    const maxWidth = 140;

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

  handleOpenPopup = () => {
    this.props.handleOpenPopup();
  }

  render() {
    const {
      section,
      imgSource,
      blurImageSource,
      contentWidth,
      searchValue,
    } = this.props;

    const {
      width,
      height,
    } = this.state;

    const opacityColor = section.AudioImgOpacityColor;
    const opacityValue = section.AudioImgOpacity / 100;
   
    return (
      <TouchableOpacity style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'column', borderRadius: 5, overflow: 'hidden' }} onPress={this.handleOpenPopup}>
        <View style={styles.contentContainerStyle}>
          <View style={Object.assign({}, styles.imageWrapperStyle, styles.relative)}>
            {
              section.AudioImgBgType === 'BACKGROUND_COLOR'
                ? <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: section.AudioImgBgColor,
                }} />
                : <FastImage
                  style={styles.imageStyle}
                  source={{ uri: blurImageSource }}
                />
            }
            <View style={styles.imageContainerStyle}>
              <FastImage
                style={{ width, height }}
                source={{ uri: imgSource }}
              />
            </View>
            <View style={Object.assign({}, styles.overlay, {
              backgroundColor: opacityColor, opacity: opacityValue
            })} />
          </View>
        </View>
        <View style={Object.assign({}, styles.detailWrapperStyle, {
            backgroundColor: section.AudioBgColor || '#fff',  
            width: 140, height: 70,
          })}
        >
          <View style={Object.assign({}, styles.detailLableStyle)}>
            <DxHtmlReader2
              source={section.AudioLabel || section.AudioFilename}
              contentWidth={140}
              contentHeight={70}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

SectionMediaElementBookmark.propTypes = {

};

export default SectionMediaElementBookmark;
