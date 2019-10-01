import React, { Component } from 'react';
import {
  ScrollView, View, TouchableOpacity, Dimensions, Image,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button } from 'native-base';

// Redux
import { connect } from 'react-redux';
import modalActions from '../actions/Modal';

// Components
import DxModal from './DxModal';
import DxHtmlReader from './DxHtmlReader';
import EmbeddedLinkModal from './EmbeddedLinkModal';

// Config
import config from '../config';

// Constants
import { headerForIphoneX } from '../helpers';
import FastImage from 'react-native-fast-image';

const styles = {
  containerStyle: {
    width: Dimensions.get('window').width,
    minHeight: 60,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  webViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewContainerStyle: {
    width: Dimensions.get('window').width - 36,
    height: Dimensions.get('window').height - 36 - 80,
    backgroundColor: '#fff',
  },
  closeStyle: {
    alignSelf: 'flex-end',
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: -18,
    right: -13,
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
  overlayStyle: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 99,
  },
};

class DxHtmlModal extends Component {
  static propTypes = {
    modal: PropTypes.object,
    modalOpen: PropTypes.bool,
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    embeddedLinkModalOpen: PropTypes.bool,
    closeEmbeddedLinkModal: PropTypes.func,
    openEmbeddedLinkModal: PropTypes.func,
    targetSectionGUID: PropTypes.string,
  };

  handleOpenPopup = () => {
    this.props.openModal('EDITOR', this.props.targetSectionGUID);
  };

  render() {
    const {
      modal: {
        modalOpen,
        modalType,
        modalSectionGUID,
        embeddedLinkModalOpen,
        modalData,
      },
      closeModal,
      targetSectionGUID,
      source,
      handlePressContent,
      currentTab,
    } = this.props;
    
    const {
      containerStyle, buttonStyle, webViewStyle, webViewContainerStyle, overlayStyle
    } = styles;

    const closeImg = require('../assets/images/Icons/closeIcon.png');
    return (
      <React.Fragment>
        <TouchableOpacity style={overlayStyle} onPress={() => this.handleOpenPopup()}></TouchableOpacity>
        <View
          style={[
            containerStyle,
            currentTab === 'Bookmark' ? {
              height: 145,
              width: 145,
            } : null,
            currentTab !== 'Section' && currentTab !== 'Bookmark' ? {
              minHeight: 150,
            } : null,
          ]}
        >
          <DxHtmlReader
            source={source}
            isBigImg={true}
            handlePressContent={() => this.handleOpenPopup()}
          />
        </View>

        {modalOpen && modalType == 'EDITOR' && modalSectionGUID == targetSectionGUID && (
          <DxModal canClose={false} modalOpen={modalOpen} closeModal={() => closeModal()}>
            <View style={webViewStyle}>
              <View style={webViewContainerStyle}>
                <View style={styles.closeButtonContainerStyle}>
                  <Button
                    style={styles.closeButtonStyle}
                    transparent
                    onPress={() => this.props.closeModal()}
                  >
                    <FastImage style={styles.closeImgStyle} source={closeImg} />
                  </Button>
                </View>
                <ScrollView>
                  <DxHtmlReader
                    source={source}
                    isBigImg={false}
                    handlePressContent={handlePressContent}
                    openEmbeddedLinkModal={link => this.props.openEmbeddedLinkModal(link)}
                  />
                </ScrollView>
              </View>
            </View>
            <DxModal
              modalOpen={embeddedLinkModalOpen}
            >
              <EmbeddedLinkModal link={modalData} handleCloseModal={() => this.props.closeEmbeddedLinkModal()} />
            </DxModal>
          </DxModal>
        )}
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
  openEmbeddedLinkModal: link => dispatch(modalActions.openEmbeddedLinkModal(link)),
  closeEmbeddedLinkModal: () => dispatch(modalActions.closeEmbeddedLinkModal()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DxHtmlModal);
