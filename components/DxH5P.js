import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

// Libraries
import { Button } from 'native-base';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import modalActions from '../actions/Modal';

// Components
import DxModal from './DxModal';
import DxHtmlReader3 from './DxHtmlReader3';

// Config
import config from '../config';

// Constants
import { headerForIphoneX } from '../helpers';

const styles = {
  containerStyle: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 3,
    paddingBottom: 3,
  },
  buttonStyle: {
    width: Dimensions.get('window').width - 12,
  },
  webViewStyle: {
    width: Dimensions.get('window').width - 36,
    height: '100%',
  },
  webViewContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 55,
    paddingBottom: 55,
    paddingLeft: 0,
    paddingRight: 0,
  },
  closeStyle: {
    alignSelf: 'flex-end',
    paddingRight: 30,
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: 38,
    right: 3,
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
};

class DxH5P extends Component {
  static propTypes = {
    h5p: PropTypes.string,
    h5pFilename: PropTypes.string,
    h5pLabel: PropTypes.string,
    modal: PropTypes.object,
    modalOpen: PropTypes.bool,
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    h5pBgColor: PropTypes.string,
  };

  handleOpenPopup = () => {
    this.props.openModal('H5P', this.props.targetSectionGUID);
  }

  render() {
    const {
      h5p,
      h5pFilename,
      h5pLabel,
      modal: {
        modalOpen,
        modalType,
        modalSectionGUID,
      },
      closeModal,
      targetSectionGUID,
      contentWidth,
      h5pBgColor,
      currentTab,
    } = this.props;

    const {
      containerStyle,
      buttonStyle,
      webViewStyle,
      webViewContainerStyle,
    } = styles;

    const formatSource = `${config.h5pBaseLink}${h5p}`;

    const closeImg = require('../assets/images/Icons/closeIcon.png');
    return (
      <React.Fragment>
        {
          currentTab === 'Bookmark' ? <TouchableOpacity style={{
            backgroundColor: h5pBgColor || '#fff', flex: 1, paddingTop: 20, paddingBottom: 20, paddingLeft: 6, paddingRight: 6,
          }} onPress={() => this.handleOpenPopup()}>
            <DxHtmlReader3
              source={
                h5pLabel || h5pFilename
              }
              contentWidth={
                contentWidth
              }
            />
          </TouchableOpacity> : <TouchableOpacity style={{ backgroundColor: h5pBgColor || '#fff' }} onPress={() => this.handleOpenPopup()}>
              <View style={[containerStyle, currentTab !== 'Section' ? { minHeight: 150 } : null, { marginBottom: this.props.marginBottom ? this.props.marginBottom : 0 }]}>
                <View
                  style={buttonStyle}
                >
                  <DxHtmlReader3
                    source={h5pLabel || h5pFilename}
                    contentWidth={contentWidth}
                    searchValue={this.props.searchValue}
                  />
                </View>
              </View>
            </TouchableOpacity>
        }
        {
          modalOpen
          && modalType == 'H5P'
          && modalSectionGUID == targetSectionGUID
          && <DxModal
            canClose={false}
            modalOpen={modalOpen}
            closeModal={() => closeModal()}>
            <View style={webViewContainerStyle}>
              <View style={styles.closeButtonContainerStyle}>
                <Button
                  style={styles.closeButtonStyle}
                  transparent
                  onPress={() => this.props.closeModal()}
                >
                  <FastImage
                    style={styles.closeImgStyle}
                    source={closeImg}
                  />
                </Button>
              </View>
              <WebView
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                source={{ uri: formatSource }}
                style={webViewStyle}
              />
            </View>
          </DxModal>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  modal: state.modal,
});

const mapDispatchToProps = dispatch => ({
  closeModal: () => dispatch(modalActions.closeModal()),
  openModal: (type, sectionGUID) => dispatch(modalActions.openModal(type, sectionGUID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DxH5P);
