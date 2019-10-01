import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { CardItem } from 'native-base';
import { Thumbnail } from 'react-native-thumbnail-video';
import FastImage from 'react-native-fast-image';

// Utils
import { validateVideoPlatform } from '../../helpers';

// Image
import videoPlay from '../../assets/images/Icons/videoPlay.png';

const styles = {
  cardItemStyle: {
  },
  contentContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    marginTop: -10,
    height: 110,
  },
  imageWrapperStyle: {},
  imageStyle: {
    height: '100%',
    width: '100%',
  },
  overlay: {
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
  playIcon: {
    width: 50,
    height: 50,
  },
  errorMessage: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

class VideoThumbnail extends Component {
  state = {
    vimeoThumbnailUrl: null,
  }

  componentDidMount() {
    this._isMounted = true;
    const response = validateVideoPlatform(this.props.videoLink);
    if (response.type === 'VIMEO' && this.props.isConnected) {
      global.fetch(`https://player.vimeo.com/video/${response.videoID}/config`)
        .then(res => res.json())
        .then((res) => {
          if (this._isMounted) {
            this.setState({
              vimeoThumbnailUrl: res.video.thumbs['640'],
            });
          }
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      videoLink,
      handlePressCard,
      disableClick,
      isConnected,
      videoNotAvailableLabel,
      theme,
    } = this.props;

    const { vimeoThumbnailUrl } = this.state;
    const response = validateVideoPlatform(videoLink);

    return (
      <CardItem button style={Object.assign({}, styles.cardItemStyle, { backgroundColor: theme.bgColor2 })} onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={styles.contentContainerStyle}>
        {
          isConnected ? <View style={Object.assign({}, styles.imageWrapperStyle, { flex: 1 })}>
            {
              response.type === 'VIMEO'
                ? (<View style={{ width: '100%', height: 110 }}>
                  <View style={styles.overlay}>
                    <FastImage style={styles.playIcon} source={videoPlay} />
                  </View>
                  {vimeoThumbnailUrl ? <FastImage
                    style={{ width: '100%', height: '100%' }}
                    source={{ uri: vimeoThumbnailUrl }}
                  /> : null}
                </View>)
                : <View>
                  <View style={styles.overlay}>
                    <FastImage style={styles.playIcon} source={videoPlay} />
                  </View>
                  <Thumbnail onPress={() => { }} showPlayIcon={false} imageWidth="100%" imageHeight="100%" url={`https://www.youtube.com/watch?v=${response.videoID}`} />
                </View>
            }
          </View> : <View style={styles.errorMessage}><Text style={{ color: '#fff' }}>{videoNotAvailableLabel}</Text></View>
        }
        </View>
      </CardItem>
    );
  }
}

VideoThumbnail.propTypes = {
  videoLink: PropTypes.string,
  handlePressCard: PropTypes.func,
  currentTab: PropTypes.string,
  disableClick: PropTypes.bool,
};

export default VideoThumbnail;
