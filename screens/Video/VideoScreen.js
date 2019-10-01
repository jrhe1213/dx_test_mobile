import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Content,
  Button,
} from 'native-base';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import videoActions from '../../actions/VideoScreen';

// Components
import {
  DxVimeoPlayer,
  DxYoutubePlayer,
} from '../../components';
import { TextSize } from '../../styles/types';

// Helpers
import { validateVideoPlatform, headerForIphoneX } from '../../helpers';

const styles = {
  containerContentStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'black',
    position: 'relative',
  },
  videoWrapper: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vimeoVideoContainerStyles: {
    minHeight: 210,
    width: Dimensions.get('window').width,
  },
  youtubeVideoContainerStyles: {
    minHeight: 250,
    width: Dimensions.get('window').width,
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

  bottomBtnContainerStyle: {
    height: 70,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  bottomBtnWrapperStyle: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  bottomBtnLabelStyle: {
    flex: 8,
    display: 'flex',
    flexDirection: 'column',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    color: '#000000',
  },
  subtitleStyle: {
    color: '#C3C9CE',
  },
};

const videoHeight = 300;

class VideoScreen extends Component {

  handleGoBack = () => {
    const {
      experienceStreamWithChannelInfo, isTagEnable
    } = this.props;

    if (experienceStreamWithChannelInfo
      && experienceStreamWithChannelInfo.Experience
      && experienceStreamWithChannelInfo.Experience.ExperienceType == '0') {
      this.props.closeVideoCardOnlyRequest();
    } else {
      this.props.closeVideo(isTagEnable);
    }
  }

  render() {
    const response = validateVideoPlatform(this.props.video.videoLink);
    if (!response) {
      return null;
    }
    const {
      isConnected,
      currentTab,
      video: {
        experienceType,
        isFirstOpen,
      },
      language,
    } = this.props;

    if (currentTab != 'Video') {
      return null;
    }

    const languageCheck = language || {};
    let videoNotAvailableLabel;
    const errorMessage = languageCheck.Message ? languageCheck.Message : [];
    errorMessage.map((label) => {
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    const videoContainerHeight = experienceType == '0' ? { height: Dimensions.get('window').height } : { height: Dimensions.get('window').height - 70 - (Platform.OS == 'android' ? StatusBar.currentHeight : 0) };
    return (
      <Content contentContainerStyle={styles.containerContentStyle}>
        <View style={Object.assign({}, styles.videoWrapper, videoContainerHeight)}>
          {
            experienceType == '0' ? <View style={styles.closeButtonContainerStyle}>
              <Button
                style={styles.closeButtonStyle}
                transparent
                onPress={
                  () => this.handleGoBack()
                }
              >
                <FastImage
                  style={styles.closeImgStyle}
                  source={require('../../assets/images/Icons/closeIcon.png')}
                />
              </Button>
            </View>
              : null
          }
          {
            !isConnected
              ? <View>
                <Text style={{ color: '#FFF' }}>{videoNotAvailableLabel}</Text>
              </View>
              : response.type === 'VIMEO'
                ? <View style={styles.vimeoVideoContainerStyles}>
                  <DxVimeoPlayer
                    videoID={response.videoID}
                    height={videoHeight}
                  />
                </View>
                : <View style={styles.youtubeVideoContainerStyles}>
                  <DxYoutubePlayer
                    videoID={response.videoID}
                    height={videoHeight}
                    videoWidth={Dimensions.get('window').width}
                  />
                </View>
          }
        </View>
        {
          experienceType == '1'
            ? <View style={styles.bottomBtnContainerStyle}>
              <TouchableOpacity
                style={styles.bottomBtnWrapperStyle}
                onPress={() => this.handleGoBack()}
              >
                <View style={styles.bottomBtnLabelStyle}>
                  <TextSize small style={styles.titleStyle}>
                    CONTINUE
              </TextSize>
                  <TextSize
                    small
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={Object.assign({}, styles.subtitleStyle, {
                      flexShrink: 1,
                    })}
                  >
                    {
                      isFirstOpen ? 'GO TO HOMEPAGE' : 'GO BACK'
                    }
                  </TextSize>
                </View>
              </TouchableOpacity>
            </View>
            : null
        }
      </Content>
    );
  }
}

VideoScreen.propTypes = {
  closeModal: PropTypes.func,
  experienceCard: PropTypes.object,
  videoData: PropTypes.object,
  Content: PropTypes.string,
  video: PropTypes.object,
  navigation: PropTypes.object,
};

const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  video: state.video,
  isConnected: state.deviceInfo.internetInfo.isConnected,
  language: state.deviceInfo.language,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  closeVideo: (isTagEnable) => dispatch(videoActions.closeVideo(isTagEnable)),
  closeVideoCardOnlyRequest: () => dispatch(videoActions.closeVideoCardOnlyRequest()),
});

export default connect(mapStateToProps, dispatchToProps)(VideoScreen);
