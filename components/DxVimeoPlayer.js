import React, { Component } from 'react';
import {
  View,
} from 'react-native';

// Libraries
import VideoPlayer from 'react-native-video-player';

// Constants
import colors from '../constants/colors';

class DxVimeoPlayer extends Component {
  state = {
    autoplay: false,
    video: {
      width: undefined,
      height: undefined,
      duration: undefined,
    },
    thumbnailUrl: undefined,
    videoUrl: undefined,
    buffered: false,
  };

  componentDidMount() {
    global.fetch(`https://player.vimeo.com/video/${this.props.videoID}/config`)
      .then(res => res.json())
      .then(res => this.setState({
        thumbnailUrl: res.video.thumbs['640'],
        videoUrl: res.request.files.hls.cdns[res.request.files.hls.default_cdn].url,
        video: res.video,
        autoplay: true
      }));
  }

  render() {

    if (!this.state.autoplay) {
      return null;
    }

    return (
      <View style={{
        flex: 1, width: '100%', height: this.props.height ? this.props.height : 180, marginBottom: this.props.marginBottom ? this.props.marginBottom : 0,
      }}>
        <VideoPlayer
          autoplay
          endWithThumbnail
          thumbnail={{ uri: this.state.thumbnailUrl }}
          video={{ uri: this.state.videoUrl }}
          videoWidth={this.state.video.width}
          videoHeight={this.props.ratio ? this.props.ratio : this.state.video.height}
          duration={this.state.video.duration}
          ref={r => this.player = r}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: colors.whiteColor,
  },
  video: {
    flex: 1,
    width: '100%',
  },
};

export default DxVimeoPlayer;
