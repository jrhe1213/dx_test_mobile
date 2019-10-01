import React, { Component } from 'react';
import {
  View,
  Platform
} from 'react-native';

class DxChannelCardPlaceholder extends Component {
  render() {

    const contentHeight = 155;

    return (
        <View style={Object.assign({}, styles.mainContainerStyle, { height: contentHeight,  }, Platform.OS == 'android' ? {
        marginTop: 12, marginBottom: 12,} : null)} />
      
    );
  }
}

const styles = {
  mainContainerStyle: {
  backgroundColor: '#e9e9e9', 
  marginBottom: 12,
  marginRight: 6,
  marginLeft: 6,
  flex: 1,
  height: 155,
  },
};

export default DxChannelCardPlaceholder;
