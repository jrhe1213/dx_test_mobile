import React, { Component } from 'react';
import {
  Image, Platform,
} from 'react-native';
import {
  Container,
  Content,
  Button,
  Body,
  Text,
} from 'native-base';
import FastImage from 'react-native-fast-image';

// colors
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  mainContainerStyle: {
  
  },
  contentStyle: {
    flex: 1,
  },
  bodyStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  boatImage: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  button: {
    paddingLeft: Platform.OS === 'android' ? 15 : 0,
    paddingRight: Platform.OS === 'android' ? 15 : 0,
  },
  buttonText: {
    fontFamily: fonts.regular,
    letterSpacing: 2,
    paddingTop: 4,
    fontSize: 18,
  },
};
class FeedEmptyPage extends Component {
  render() {
    const {
      mainContainerStyle,
      boatImage,
      buttonText,
      button,
      contentStyle,
      bodyStyle,
    } = styles;

    const { feedEmptyLabels, bgColor, primaryColor } = this.props;

    return (
      <Container style={[mainContainerStyle, { backgroundColor: bgColor }]}>
        <Content padder contentContainerStyle={[contentStyle, { backgroundColor: bgColor }]}>
          <Body style={bodyStyle}>
            <FastImage style={boatImage} source={require('../../../../assets/images/Icons/sailboat.png')} />
            <Button block rounded style={[button, { backgroundColor: primaryColor }]} onPress={this.props.handleNavigateExplore}><Text style={buttonText}>{feedEmptyLabels}</Text></Button>
          </Body>
        </Content>
      </Container>
    );
  }
}

export default FeedEmptyPage;
