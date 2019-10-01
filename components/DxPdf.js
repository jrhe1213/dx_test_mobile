import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button } from 'native-base';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import modalActions from '../actions/Modal';
import DxModal from './DxModal';

// Components
import DxHtmlReader3 from './DxHtmlReader3';
import DxDocReader from './DxDocReader';

// Utils
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
    padding: 5,
  },
  webViewStyle: {
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
  },
  webViewContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 0,
    paddingRight: 0,
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: headerForIphoneX ? 40 : 24,
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
};

class DxPdf extends Component {
  static propTypes = {
    pdfLabel: PropTypes.string,
    modal: PropTypes.object,
    modalOpen: PropTypes.bool,
    closeModal: PropTypes.func,
    openModal: PropTypes.func,
    pdfBgColor: PropTypes.string,
  };

  handleOpenPopup = () => {
    this.props.openModal('PDF', this.props.targetSectionGUID);
  }

  render() {
    const {
      source,
      pdfLabel,
      modal: {
        modalOpen,
        modalType,
        modalSectionGUID,
      },
      closeModal,
      targetSectionGUID,
      contentWidth,
      pdfBgColor,
      currentTab,
    } = this.props;

    const {
      containerStyle,
      buttonStyle,
      webViewContainerStyle,
    } = styles;

    const closeImg = require('../assets/images/Icons/closeIcon.png');

    return (
      <React.Fragment>
        {
          currentTab === 'Bookmark' ? <TouchableOpacity style={{
            backgroundColor: pdfBgColor || '#fff', flex: 1, paddingTop: 20, paddingBottom: 20, paddingLeft: 6, paddingRight: 6,
          }}
            onPress={() => this.handleOpenPopup()} >
            {
              pdfLabel
                ? <DxHtmlReader3
                  source={pdfLabel} contentWidth={contentWidth}
                  searchValue={this.props.searchValue}
                />
                : null
            }
          </TouchableOpacity> : <TouchableOpacity style={{
            backgroundColor: pdfBgColor || '#fff',
          }}
            onPress={() => this.handleOpenPopup()} >
              <View style={[containerStyle, currentTab !== 'Section' ? { minHeight: 150 } : null, { marginBottom: this.props.marginBottom ? this.props.marginBottom : 0 }]}>
                <View style={buttonStyle}>
                  {
                    pdfLabel
                      ?
                      <DxHtmlReader3
                        source={pdfLabel}
                        contentWidth={contentWidth}
                        searchValue={this.props.searchValue}
                      />
                      :
                      null
                  }
                </View>
              </View>
            </TouchableOpacity>

        }
        {
          modalOpen
          && modalType == 'PDF'
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
              <DxDocReader
                key={targetSectionGUID}
                source={source}
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
  userGUID: state.user.userGUID,
});

const mapDispatchToProps = dispatch => ({
  closeModal: () => dispatch(modalActions.closeModal()),
  openModal: (type, sectionGUID) => dispatch(modalActions.openModal(type, sectionGUID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DxPdf);
