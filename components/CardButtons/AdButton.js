import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Icon } from 'native-base';
import FastImage from 'react-native-fast-image';

// Components
import DxHtmlReader2 from '../DxHtmlReader2';

const styles = {
  container: {
    flex: 1,
    minHeight: 50,
    height: 150,
    alignItems: 'center',
  },
  buttonStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonWrapperStyle: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  tagStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
};

class DxAddButton extends Component {
  static propTypes = {
    btnContent: PropTypes.string,
    adBtnImg: PropTypes.string,
    adBtnColor: PropTypes.string,
    section: PropTypes.object,
    handleNavigate: PropTypes.func,
    isCompleted: PropTypes.bool,
    isRecommended: PropTypes.bool,
  };

  handleNavigate = (section) => {
    this.props.handleNavigate(section);
  }

  render() {
    const {
      adBtnColor,
      btnContent,
      section,
      isCompleted,
      isRecommended,
      contentWidth,
      theme,
      isNightMode,
    } = this.props;

    const {
      container,
      buttonStyle,
      imageStyle,
      buttonWrapperStyle,
      tagStyle,
    } = styles;

    // Colos change for recommended and is complete
    let leftElement = <View />;
    if (isCompleted) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: theme.primaryColor })} />;
    } else if (isRecommended) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: "#000" })} />;
    }


    return (
      <View style={container}>
        <FastImage style={imageStyle} source={{ uri: this.props.uri }} />
        <View style={
          Object.assign({}, styles.overlay, {
            backgroundColor: section.AdBtnImgOpacityColor,
          }, {
            opacity: section.AdBtnImgOpacity / 100,
          })
        }
        />

        <View style={buttonWrapperStyle}>
          {leftElement}
          <TouchableOpacity style={buttonStyle} onPress={() => this.handleNavigate(section)}>
            <View style={{
              width: '95%',
              minHeight: 50,
              height: 150,
              justifyContent: 'center',
            }}>
              <DxHtmlReader2
                source={btnContent}
                contentWidth={contentWidth}
              />
            </View>
            <Icon style={{ fontSize: 24, color: adBtnColor }} name="ios-arrow-forward" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default DxAddButton;
