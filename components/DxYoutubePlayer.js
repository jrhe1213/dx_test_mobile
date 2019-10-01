import React, { Component } from 'react';

// Libraries
import YouTube from 'react-native-youtube';

// Constants
import colors from '../constants/colors';

// Config
import config from '../config';

class DxYoutubePlayer extends Component {
  state = {
    height: 215,
  };

  handleReady = () => {
    setTimeout(() => this.setState({
      height: 250,
    }), 500);
  }

  render() {
    return (
      <YouTube
        apiKey={config.youtubeApiKey}
        ref={item => this.player = item}
        videoId={this.props.videoID}
        play={true}
        controls={1}
        onReady={this.handleReady}
        style={{ alignSelf: 'stretch', height: this.state.height }}
      />
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.whiteColor,
  },
};

export default DxYoutubePlayer;
