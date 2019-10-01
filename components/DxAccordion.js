import React, { Component } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Accordion, Icon, Button } from 'native-base';
import FastImage from 'react-native-fast-image';

// Components
import DxHtmlReader3 from './DxHtmlReader3';
import DxModal from './DxModal';
import DxHtmlReader from './DxHtmlReader';
import EmbeddedLinkModal from './EmbeddedLinkModal';

// Redux
import { connect } from 'react-redux';
import modalActions from '../actions/Modal';

// Config
import config from '../config';

// Constants
import { headerForIphoneX } from '../helpers';

const closeImg = require('../assets/images/Icons/closeIcon.png');

const styles = {
  contentContainerStyle: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
  },
  accordianTitleContainerStyle: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.get('window').width,
  },
  accordianCotentContainerStyle: {
    padding: 10,
  },
  containerStyle: {
    width: Dimensions.get('window').width,
    minHeight: 60,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 6,
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

class DxAccordion extends Component {
  static propTypes = {
  };

  state = {
    activeSections: [],
  };

  _updateSections = activeSections => {
    this.setState({ activeSections });
  };

  handleOpenPopup = () => {
    this.props.openModal('ACCORDION', this.props.targetSectionGUID);
  };

  handlecloseModal = () => {
    this.props.closeModal();
  }

  renderCustomHeader = (item, expanded) => {
    const { contentWidth, searchValue } = this.props;

    return <View style={Object.assign({}, styles.accordianTitleContainerStyle, { backgroundColor: item.AccordionTitleBgColor ? item.AccordionTitleBgColor : '#fff' })}>
      <DxHtmlReader3
        source={item.AccordionTitle}
        contentWidth={contentWidth}
        searchValue={searchValue}
      />
      {
        expanded
          ? <Icon style={{ fontSize: 25 }} name="arrow-up" />
          : <Icon style={{ fontSize: 25 }} name="arrow-down" />
      }
    </View>
  }

  renderCustomContent = (item, type) => {
    const {
      contentWidth,
      searchValue
    } = this.props;

    let isBigImg = true;
    if (type == 'MODAL') {
      isBigImg = false;
    }

    return (
      <View style={Object.assign({}, styles.accordianCotentContainerStyle, { backgroundColor: item.AccordionContentBgColor ? item.AccordionContentBgColor : '#fff' })}>
        <DxHtmlReader3
          source={item.AccordionContent}
          isBigImg={isBigImg}
          contentWidth={contentWidth}
          searchValue={searchValue}
          openEmbeddedLinkModal={link => this.props.openEmbeddedLinkModal(link)}
        />
      </View>
    )
  }


  render() {
    const {
      modal: {
        modalOpen,
        modalType,
        modalSectionGUID,
        embeddedLinkModalOpen,
        modalData,
      },
      accordionData,
      currentTab,
      targetSectionGUID,
    } = this.props;

    const {
      containerStyle,
      buttonStyle,
      webViewStyle,
      webViewContainerStyle,
      overlayStyle
    } = styles;

    if (!accordionData.length) {
      return;
    }

    return (
      <React.Fragment>
        {
          modalOpen && modalType == 'ACCORDION' && modalSectionGUID == targetSectionGUID && (
            <DxModal canClose={false} modalOpen={modalOpen} closeModal={() => this.handlecloseModal()}>
              <View style={webViewStyle}>
                <View style={webViewContainerStyle}>
                  <View style={styles.closeButtonContainerStyle}>
                    <Button
                      style={styles.closeButtonStyle}
                      transparent
                      onPress={() => this.handlecloseModal()}
                    >
                      <FastImage style={styles.closeImgStyle} source={closeImg} />
                    </Button>
                  </View>
                  <ScrollView>
                    <TouchableWithoutFeedback>
                      <View style={styles.contentContainerStyle}>
                        <Accordion
                          // sections={accordionData}
                          // activeSections={this.state.activeSections}
                          // renderHeader={this.renderCustomHeader}
                          // renderContent={(item) => this.renderCustomContent(item, 'MODAL')}
                          // onChange={this._updateSections}

                          dataArray={accordionData}
                          renderHeader={this.renderCustomHeader}
                          renderContent={(item) => this.renderCustomContent(item, 'MODAL')}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </ScrollView>
                </View>
              </View>

              {/* Emebedded Link Modal */}
              <DxModal
                modalOpen={embeddedLinkModalOpen}
              >
                <EmbeddedLinkModal link={modalData} handleCloseModal={() => this.props.closeEmbeddedLinkModal()} />
              </DxModal>
            </DxModal>
          )}
        {
          currentTab === 'Bookmark'
            ?
            <View>
              <TouchableOpacity style={overlayStyle} onPress={() => this.handleOpenPopup()}></TouchableOpacity>
              <View
                style={[
                  containerStyle,
                  {
                    backgroundColor: accordionData.length && accordionData[0].AccordionTitleBgColor
                  },
                  currentTab === 'Bookmark' ? {
                    height: 145,
                    width: 145,
                  } : null,
                ]}
              >
                {
                  accordionData.length
                    ?
                    <DxHtmlReader3
                      source={accordionData[0].AccordionTitle}
                    />
                    :
                    'Accordion'
                }
              </View>
            </View>
            :
            <TouchableWithoutFeedback>
              <View style={styles.contentContainerStyle}>
                <Accordion
                  // sections={accordionData}
                  // activeSections={this.state.activeSections}
                  // renderHeader={this.renderCustomHeader}
                  // renderContent={(item) => this.renderCustomContent(item, 'SECTION')}
                  // onChange={this._updateSections}

                  dataArray={accordionData}
                  renderHeader={this.renderCustomHeader}
                  renderContent={(item) => this.renderCustomContent(item, 'SECTION')}
                />
              </View>
            </TouchableWithoutFeedback>
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
  openEmbeddedLinkModal: link => dispatch(modalActions.openEmbeddedLinkModal(link)),
  closeEmbeddedLinkModal: () => dispatch(modalActions.closeEmbeddedLinkModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DxAccordion);
