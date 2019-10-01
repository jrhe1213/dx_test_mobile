import React, { Component } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button } from 'native-base';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';

// Redux
import { connect } from 'react-redux';
import modalActions from '../actions/Modal';

// Components
import DxHtmlReader3 from './DxHtmlReader3';
import DxModal from './DxModal';
import SectionMediaElement from './SectionMediaElement';
import SectionMediaElementBookmark from './SectionMediaElementBookmark';

// Config
import config from '../config';

import * as helpers from '../helpers';

import fonts from '../styles/fonts';

// Constants
import { headerForIphoneX } from '../helpers';

// import sampleTrack from '../assets/sampleAudio.mp3';

// Image
import audioIcon from '../assets/images/Icons/audioWhite.png';
import audioModalIcon from '../assets/images/audioModalIcon.png';

const minImgHeight = 160;
const maxImgHeight = 600;

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
  webViewContainerStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeStyle: {
    alignSelf: 'flex-end',
    paddingRight: 30,
  },
  closeButtonContainerStyle: {
    position: 'absolute',
    top: headerForIphoneX ? 40 : 24,
    right: 12,
    height: 36,
    width: 36,
    zIndex: 99,
    zIndex: 999,
  },
  closeButtonStyle: {
    height: 36,
    width: 36,
  },
  closeImgStyle: {
    height: 36,
    width: 36,
  },
  mediaPlayer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 122,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  playIcon: {
    width: 50,
    height: 50,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
  }
};

class DxAudio extends Component {
  static propTypes = {
  };

  state = {
    currentTime: 0,
    duration: 0,
    isFullScreen: false,
    isLoading: true,
    paused: false,
    playerState: PLAYER_STATES.PLAYING,

    cWidth: null,
    cHeight: null,
    width: null,
    height: null,

    widthV2: null,
    heightV2: null,
  };

  componentDidMount = () => {
    const {
      section,
      currentTab,
    } = this.props;

    const formattedWidth = Number(section.Width) || config.defaultElementImageWidth;
    const formattedHeight = Number(section.Height) || config.defaultElementImageHeight;
    let ratio = formattedWidth / formattedHeight;

    // 1. inner img
    let maxWidth;
    let maxHeight;

    let maxWidthV2;
    let maxHeightV2;

    if (currentTab == 'Bookmark') {
      maxWidth = 140;
      maxHeight = 140;
      maxWidthV2 = 300;
      maxHeightV2 = 300;
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

      maxWidthV2 = 300;
      maxHeightV2 = 300;
    }



    const innerDimension = helpers.imageAlg(formattedWidth, formattedHeight, maxWidth, maxHeight);
    let innerDimensionV2;
    if (currentTab == 'Section' || currentTab == 'Bookmark') {
      innerDimensionV2 = helpers.imageAlg(formattedWidth, formattedHeight, maxWidthV2, maxHeightV2);
    }

    this.setState({

      cWidth: maxWidth,
      cHeight: maxHeight,

      width: innerDimension.tmpWidth,
      height: innerDimension.tmpHeight,

      widthV2: innerDimensionV2 ? innerDimensionV2.tmpWidth : 0,
      heightV2: innerDimensionV2 ? innerDimensionV2.tmpHeight : 0,
    });
  }


  handleOpenPopup = () => {
    this.props.openModal('AUDIO', this.props.targetSectionGUID);
  }

  onSeek = seek => {
    this.videoPlayer.seek(seek);
  };

  onPaused = playerState => {
    this.setState({
      paused: !this.state.paused,
      playerState,
    });
  };

  onReplay = () => {
    this.setState({ playerState: PLAYER_STATES.PLAYING });
    this.videoPlayer.seek(0);
  };

  onProgress = data => {
    const { isLoading, playerState } = this.state;
    // Video Player will continue progress even if the video already ended
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      this.setState({ currentTime: data.currentTime });
    }
  };

  onLoad = data => {
    const { section } = this.props;
    if (section.CurrentTime) {
      this.videoPlayer.seek(Number(section.CurrentTime));
    }
    this.setState({ duration: data.duration, isLoading: false });
  }

  onLoadStart = data => this.setState({ isLoading: true });

  onEnd = () => {
    this.videoPlayer.seek(0);
    this.setState({ playerState: PLAYER_STATES.ENDED })
  };

  onError = () => alert('Oh! ', error);

  exitFullScreen = () => { };

  enterFullScreen = () => { };

  onFullScreen = () => { };

  renderToolbar = () => (
    <View style={styles.toolbar}>

    </View>
  );
  onSeeking = (currentTime) => {
    this.setState({ currentTime })
  };

  handleCloseAudioModal = () => {
    const {
      section,
      experienceStreamWithChannelInfo,
      currentTab,
      current_level_section
    } = this.props;

    let sectionData;
    if (currentTab === 'Bookmark') {
      sectionData = {
        ExperienceGUID: section.ExperienceGUID,
        ExperienceStreamGUID: section.ExperienceStreamGUID,
        SectionGUID: section.SectionGUID,
        CurrentTime: this.state.currentTime.toFixed(2),
      }
    } else {
        sectionData = {
          ExperiencePageGUID: current_level_section.ExperiencePageGUID,
          SectionGUID: section.SectionGUID,
          CurrentTime: this.state.currentTime.toFixed(2),
        }
    }

    this.props.closeAudioModal(sectionData);
  }

  render() {
    const {
      modal: {
        modalOpen,
        modalType,
        modalSectionGUID,
        modalData,
      },
      targetSectionGUID,
      source,
      audioLabel,
      audioBgColor,
      audioFilename,
      contentWidth,
      currentTab,
      searchValue,
      isImageCover,
      imgSource,
      blurImageSource,
      section,
      sectionCardHeight,
      subTab,
    } = this.props;

    const {
      cWidth,
      cHeight,
      width,
      height,
      widthV2,
      heightV2,
    } = this.state;

    const {
      containerStyle,
      buttonStyle,
      webViewStyle,
      webViewContainerStyle,
      webViewContentStyle,
    } = styles;

    const opacityColor = section.AudioImgOpacityColor;
    const opacityValue = section.AudioImgOpacity / 100;

    let formattedTitle;
    formattedTitle = audioLabel.replace(/<[^>]*>/gi, "");
    formattedTitle =  formattedTitle.trim();

    const closeImg = require('../assets/images/Icons/closeIcon.png');
    return (
      <React.Fragment>
        {
          currentTab === 'Bookmark' 
            ? 
            <React.Fragment>
              {
                isImageCover 
                ? 

                <View>
                  {
                    subTab === 'InnerPage' 
                    ? 
                    <SectionMediaElement 
                      imgSource={imgSource} 
                      blurImageSource={blurImageSource} 
                      section={section} 
                      handleOpenPopup={() => this.handleOpenPopup()}
                      contentWidth={contentWidth}
                      currentTab={currentTab}
                      searchValue={searchValue}
                    />
                    :
                    <SectionMediaElementBookmark 
                      imgSource={imgSource} 
                      blurImageSource={blurImageSource} 
                      section={section} 
                      handleOpenPopup={() => this.handleOpenPopup()}
                      contentWidth={contentWidth}
                      currentTab={currentTab}
                      searchValue={searchValue}
                    />
                  }
                </View>
                :
                <TouchableOpacity 
                  style={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    backgroundColor: audioBgColor || '#fff', 
                    paddingTop: 20, 
                    paddingBottom: 20,
                    paddingLeft: 6, 
                    paddingRight: 6,
                    height: sectionCardHeight ? sectionCardHeight : 'auto'
                  }} 
                  onPress={() => this.handleOpenPopup()}
                >
                  <DxHtmlReader3
                    source={audioLabel || audioFilename}
                    contentWidth={contentWidth}
                    searchValue={searchValue}
                  />
                </TouchableOpacity> 
              }
            </React.Fragment>
            :
            <React.Fragment>
              {
                isImageCover 
                ? 
                <View>
                  <SectionMediaElement 
                    imgSource={imgSource} 
                    blurImageSource={blurImageSource} 
                    section={section} 
                    handleOpenPopup={() => this.handleOpenPopup()}
                    contentWidth={contentWidth}
                    currentTab={currentTab}
                    searchValue={searchValue}
                  />
                </View>
                :
                <TouchableOpacity 
                  style={{ backgroundColor: audioBgColor || '#fff',  }} 
                  onPress={() => this.handleOpenPopup()}
                >
                  <View 
                    style={[containerStyle, currentTab !== 'Section' ? { minHeight: 150 } : null, { marginBottom: this.props.marginBottom ? this.props.marginBottom : 0 }]}
                  >
                    <View
                      style={buttonStyle}
                    >
                      <DxHtmlReader3
                        source={audioLabel || audioFilename}
                        contentWidth={contentWidth}
                        searchValue={searchValue}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              } 
            </React.Fragment>
        }
        {
          modalOpen
          && modalType == 'AUDIO'
          && modalSectionGUID == targetSectionGUID
          && <DxModal
            canClose={false}
            modalOpen={modalOpen}
            closeAudioModal={() => closeAudioModal()}>
            <View style={webViewContainerStyle}>
              <View style={styles.closeButtonContainerStyle}>
                <Button
                  style={styles.closeButtonStyle}
                  transparent
                  onPress={this.handleCloseAudioModal}
                >
                  <FastImage
                    style={styles.closeImgStyle}
                    source={closeImg}
                  />
                </Button>
              </View>
              <View style={styles.mediaPlayer}>
                <View style={{ position: 'absolute', top: 6, left: 12, right : 12 }}>
                  <Text style={{ fontSize: 16, color: "#fff", fontFamily: fonts.regular }}>{formattedTitle}</Text>
                </View>

                <View style={{ width: 300, height: 300, }}>
                  {
                    isImageCover 
                      ? 
                      <View style={styles.imageContainerStyle}>
                        <FastImage
                          style = {
                            {
                              width: widthV2,
                              height: heightV2
                            }
                          }
                          source={{
                            uri: imgSource,
                            priority: FastImage.priority.low,
                          }}
                        />
                      </View>
                      :
                      <View style={styles.imageContainerStyle}>
                        <FastImage
                          style = {
                            {
                              width:'100%',
                              height: '100%'
                            }
                          }
                          source={audioModalIcon}
                        />
                      </View>
                  }

                  {/* <View style={Object.assign({}, styles.overlay, {
                      backgroundColor: opacityColor,
                      opacity: opacityValue,
                    })} /> */}
                </View>
                
                <Video
                  // audioOnly={true}
                  controls={true}
                  onEnd={this.onEnd}
                  onLoad={this.onLoad}
                  onLoadStart={this.onLoadStart}
                  onProgress={this.onProgress}
                  paused={this.state.paused}
                  ref={videoPlayer => (this.videoPlayer = videoPlayer)}
                  source={{ uri: source }}
                  style={{ width: '100%', height: 45, marginTop: 24  }}
                  // poster={isImageCover && imgSource}
                  // volume={0.0}
                />
              </View>
              {
                Platform.OS == 'android' &&
                <MediaControls
                  duration={this.state.duration}
                  isLoading={this.state.isLoading}
                  mainColor={'black'}
                  onFullScreen={this.onFullScreen}
                  onPaused={this.onPaused}
                  onReplay={this.onReplay}
                  onSeek={this.onSeek}
                  onSeeking={this.onSeeking}
                  playerState={this.state.playerState}
                  progress={this.state.currentTime}
                  toolbar={this.renderToolbar()}
                />
              }
            </View>
          </DxModal>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  modal: state.modal,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  current_level_section: state.feed.current_level_section,
});

const mapDispatchToProps = dispatch => ({
  closeAudioModal: (sectionData) => dispatch(modalActions.closeAudioModal(sectionData)),
  openModal: (type, sectionGUID) => dispatch(modalActions.openModal(type, sectionGUID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DxAudio);
