import React, { Component } from 'react';
import {
  View
} from 'react-native';

class DxCardPlaceholder extends Component {
  render() {

    const contentHeight = 142;
    const contentWidth = 142;

    return (
      <View style={{ width: contentWidth }}>
        <View style={Object.assign({}, styles.mainContainerStyle, { height: contentHeight })} />
        <View style={Object.assign({}, styles.textContainerStyle, { marginTop: 10 })} />
        <View style={Object.assign({}, styles.textContainerStyle, { marginTop: 5 })} />
      </View>
    );
  }
}

const styles = {
  mainContainerStyle: {
    width: '100%', 
    backgroundColor: '#e9e9e9', 
    borderRadius: 5,
  },
  textContainerStyle: {
    width: '80%', 
    height: 11, 
    backgroundColor: '#e9e9e9',
  }
};

export default DxCardPlaceholder;
