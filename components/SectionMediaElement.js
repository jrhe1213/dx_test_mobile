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
import DxHtmlReader2Original from './DxHtmlReader2Original';

// Image
import audioIcon from '../assets/images/Icons/audioWhite.png';

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
    height: '100%',
    width: 150,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageWrapperStyle: {
    flex: 1,
    overflow: 'hidden',
    width: 150,
    height: 150,
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
    flex: 1,
    justifyContent: 'center',
  },
  detailLableStyle: {
    flexWrap: 'wrap',
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 9,
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
  audioIconContainerStyle: { 
    position: 'absolute', 
    zIndex: 3, 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center', 
    width: '100%', 
    height: '100%' 
  }
};

class SectionMediaElement extends Component {
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

    const formattedWidth = Number(section.Width) || 150;
    const formattedHeight = Number(section.Height) || 150;

    const maxHeight = 150;
    const maxWidth = 150;

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
      <TouchableOpacity style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'row', height: 150 }} onPress={this.handleOpenPopup}>
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
          <View style={styles.audioIconContainerStyle}>
            <FastImage
              style={{ width: 30, height: 30 }}
              source={audioIcon}
            />
          </View>
        </View>
        <View style={
          Object.assign({}, styles.detailWrapperStyle, {
            backgroundColor: section.AudioBgColor || '#fff',
          })
        }
        >
          <View style={Object.assign({}, styles.detailLableStyle)}>
            <DxHtmlReader2Original
              source={section.AudioLabel || section.AudioFilename}
              contentWidth={contentWidth}
              searchValue={searchValue}
              height='200%'
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

SectionMediaElement.propTypes = {

};

export default SectionMediaElement;
