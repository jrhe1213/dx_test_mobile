import React, { Component } from 'react';
import {
  Platform,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import ImageZoom from 'react-native-image-pan-zoom';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import DxModal from './DxModal';
import modalActions from '../actions/Modal';

// Constants
import colors from '../constants/colors';

import closeImg from '../assets/images/Icons/closeIcon.png';

// Config
import config from '../config';
import * as helpers from '../helpers';

const minImgHeight = 160;
const maxImgHeight = 600;

class DxImage extends Component {
  static propTypes = {
    source: PropTypes.string,
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    modal: PropTypes.object,
    modalOpen: PropTypes.bool,
    section: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      cWidth: null,
      cHeight: null,
      width: null,
      height: null,
      popupWidth: null,
      popupHeight: null,
    };
  }

  componentDidMount = () => {
    const { section, currentTab } = this.props;

    const formattedWidth = Number(section.Width) || config.defaultElementImageWidth;
    const formattedHeight = Number(section.Height) || config.defaultElementImageHeight;
    let ratio = formattedWidth / formattedHeight;

    // 1. inner img
    let maxWidth;
    let maxHeight;
    if (currentTab == 'Bookmark') {
      maxWidth = 140;
      maxHeight = 140;
    } else {
      let constMaxWidth = Dimensions.get('window').width;
      let constMaxHeight;
      // 1. determine the size of container
      // constMaxWidth is fixed
      if (formattedWidth >= constMaxWidth) {
        // 1.1 
        // image width greater than device width
        // image width => device width
        // image height => ratio image height
        // image container height => ratio image height
        constMaxHeight = constMaxWidth / ratio;
      } else {
        // 1.2
        // image width small than device width
        // image blur effect visible
        // image container height => image height
        constMaxHeight = formattedHeight;
      }
      if (constMaxHeight < minImgHeight) {
        constMaxHeight = minImgHeight;
      } else if (constMaxHeight > maxImgHeight) {
        constMaxHeight = maxImgHeight;
      }

      maxWidth = constMaxWidth;
      maxHeight = constMaxHeight;
    }
    const innerDimension = helpers.imageAlg(formattedWidth, formattedHeight, maxWidth, maxHeight);

    // 2. Popup img
    const maxPopupWidth = Dimensions.get('window').width;
    const maxPopupHeight = Dimensions.get('window').height;
    const outterDimension = helpers.imageAlg(formattedWidth, formattedHeight, maxPopupWidth, maxPopupHeight);

    this.setState({

      cWidth: maxWidth,
      cHeight: maxHeight,

      width: innerDimension.tmpWidth,
      height: innerDimension.tmpHeight,

      popupWidth: outterDimension.tmpWidth,
      popupHeight: outterDimension.tmpHeight,
    });
  }

  handlePopup = () => {
    this.props.openModal('SECTION', this.props.targetSectionGUID);
  };

  render() {
    const {
      index,
      source,
      blurSource,
      section,
      modal: { modalOpen, modalType, modalSectionGUID },
      closeModal,
      currentTab,
    } = this.props;

    const {
      cWidth,
      cHeight,
      width,
      height,
      popupWidth,
      popupHeight,
    } = this.state;

    const {
      container,
      webViewContainerStyle,
      closeStyle,
      closeImgStyle,
    } = styles;

    const opacityColor = section.ImgOpacityColor;
    const opacityValue = section.ImgOpacity / 100;
    return (
      <View style={[container, styles.relative]}>
        {/* Popup */}
        {
          modalOpen
          && modalType == 'SECTION'
          && modalSectionGUID == this.props.targetSectionGUID
          && <DxModal
            transparent={false}
            modalOpen={modalOpen}
            closeModal={() => closeModal()}>
            <View style={webViewContainerStyle}>
              <TouchableOpacity
                style={closeStyle}
                onPress={() => closeModal()}
              >
                <FastImage
                  style={closeImgStyle}
                  source={closeImg}
                />
              </TouchableOpacity>
              {
                <ImageZoom
                  cropWidth={Dimensions.get('window').width}
                  cropHeight={Dimensions.get('window').height}
                  imageWidth={popupWidth}
                  imageHeight={popupHeight}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <FastImage
                    style={{
                      width: '100%',
                      height: '100%',
                      flex: 1,
                    }}
                    source={{ uri: source }}
                  />
                </ImageZoom>
              }
            </View>
          </DxModal>
        }

        {/* Card View */}
        {currentTab === 'Bookmark'
          ?
          <View style={{ borderRadius: 5, overflow: 'hidden' }}>
            {
              section.ImgBgType === 'BACKGROUND_COLOR'
                ?
                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: section.ImgBgColor,
                }} />
                :
                // blur img
                <FastImage
                  style={{ width: 140, height: 140 }}
                  source={{ uri: blurSource }}
                />
            }
            <View style={styles.imageContainerStyle}>
              {/* ratio img */}
              <FastImage
                style={{ width, height }}
                source={{ uri: source }}
              />
            </View>
            <TouchableOpacity
              style={Object.assign({}, styles.overlay, {
                backgroundColor: opacityColor,
                opacity: opacityValue,
              })}
              onPress={() => this.handlePopup()}
            />
          </View>
          :
          <View>
            {
              section.ImgBgType === 'BACKGROUND_COLOR'
                ?
                <View style={{
                  width: cWidth,
                  height: cHeight,
                  backgroundColor: section.ImgBgColor,
                }} />
                :
                // blur img
                <FastImage
                  style={{
                    width: cWidth,
                    height: cHeight
                  }}
                  source={{
                    uri: blurSource,
                    priority: FastImage.priority.high,
                  }}
                />
            }
            <View style={styles.imageContainerStyle}>
              {/* ratio img */}
              <FastImage
                style={{ width, height }}
                source={{
                  uri: source,
                  priority: FastImage.priority.low,
                }}
              />
            </View>
            <TouchableOpacity
              style={Object.assign({}, styles.overlay, {
                backgroundColor: opacityColor,
                opacity: opacityValue,
              })}
              onPress={() => this.handlePopup()}
            />
          </View>
        }
      </View>
    );
  }
}

const styles = {
  container: {
    backgroundColor: colors.whiteColor,
    paddingRight: 0,
  },
  webViewContainerStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeStyle: {
    position: 'absolute',
    top: helpers.headerForIphoneX ? 40 : 24,
    right: 12,
    zIndex: 30,
  },
  closeButtonStyle: {
    color: '#fff',
    fontSize: 16,
    marginTop: Dimensions.get('window').height >= 736 ? 20 : 10,
    marginBottom: 10,
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
  closeImgStyle: {
    height: 36,
    width: 36,
  },
};

const mapStateToProps = state => ({
  modal: state.modal,
});

const mapDispatchToProps = dispatch => ({
  closeModal: () => dispatch(modalActions.closeModal()),
  openModal: (type, sectionGUID) => dispatch(modalActions.openModal(type, sectionGUID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DxImage);
