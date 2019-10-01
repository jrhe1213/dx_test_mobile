import React, { Component } from 'react';
import {
  View,
  Text,
} from 'react-native';

// Constants
import colors from '../constants/colors';

class DxTextContent extends Component {
  render() {
    const {
      container,
      text,
    } = styles;

    return (
      <View style={[container, { marginBottom: this.props.marginBottom ? this.props.marginBottom : 0 }]}>
        <Text style={text}>{this.props.content}</Text>
      </View>
    );
  }
}

const styles = {
  container: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.whiteColor,
  },
  text: {
    textAlign: 'justify',
    lineHeight: 24,
  },
};

export default DxTextContent;
