import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import {
  Content,
  Card,
  CardItem,
  Text,
  Textarea,
  Form,
} from 'native-base';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

class FeedbackTextCard extends Component {
  static propTypes = {
    handleText: PropTypes.func,
    question: PropTypes.string,
  }

  handleOnChange = (text) => {
    this.props.handleText(text);
  }

  handlePress = () => { }

  render() {
    const {
      cardItemStyle,
      topContainerStyle,
      subContainerStyle,
      textAreaContainerStyle,
      labelTextStyle,
      subLabelTextStyle,
      cardStyle,
    } = styles;

    const { typeSomethingLabel, theme } = this.props;

    return (
      <Card style={[cardStyle, { backgroundColor: theme.bgColor2 }]}>
        <CardItem
          style={[cardItemStyle, { backgroundColor: theme.bgColor2 }]}>
          <Text
            style={[subLabelTextStyle, { color: theme.textColor2 }]}>Question</Text>
        </CardItem>
        <CardItem
          style={[cardItemStyle, subContainerStyle, { backgroundColor: theme.bgColor2 }]}>
          <Text
            style={[labelTextStyle, { color: theme.textColor }]}
          >{this.props.question}</Text>
        </CardItem>
        <CardItem
          style={[cardItemStyle, textAreaContainerStyle, { backgroundColor: theme.bgColor2 }]}>
            <Form style={{ flex: 1 }}>
              <Textarea style={{ padding: 6, fontSize: 16, backgroundColor: '#fff' }} rowSpan={3} onChangeText={text => this.handleOnChange(text)} bordered placeholder={typeSomethingLabel} />
            </Form>
        </CardItem>
      </Card>
    );
  }
}

const styles = {
  cardStyle: {
    borderColor: 'transparent',
    shadowColor: colors.btnBlue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 9,
    paddingBottom: 4,
  },
  cardItemStyle: {
    paddingLeft: 9,
    paddingRight: 9,
  },
  topContainerStyle: {
    flexDirection: 'row',
  },
  subContainerStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 10,
  },
  textAreaContainerStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 10,
  },
  labelTextStyle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  subLabelTextStyle: {
    fontSize: 12,
    color: colors.gray,
  },
};

export default FeedbackTextCard;
