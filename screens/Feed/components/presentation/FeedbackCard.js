import React, { Component } from 'react';
import {
  View, TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

// Components
import {
  Card,
  CardItem,
  Text,
} from 'native-base';
import { FeedbackBtn } from '../../../../styles/grid';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

class FeedbackCard extends Component {
  static propTypes = {
    handleBtnClick: PropTypes.func,
  }

  render() {
    const {
      cardItemStyle,
      topContainerStyle,
      subContainerStyle,
      buttonContainerStyle,
      btnTextStyle,
      labelTextStyle,
      subLabelTextStyle,
      cardStyle,
    } = styles;

    const {yesLabel, noLabel, theme} = this.props;

    return (
      <Card style={[cardStyle, { backgroundColor: theme.bgColor2 }]}>
        <CardItem
          style={Object.assign({}, cardItemStyle, topContainerStyle, { backgroundColor: theme.bgColor2 })}>
          <Text
            style={[subLabelTextStyle, { color: theme.textColor2 }]}>Question</Text>
        </CardItem>
        <CardItem
          style={Object.assign({}, cardItemStyle, subContainerStyle, { backgroundColor: theme.bgColor2 })}>
          <Text
            style={[labelTextStyle, { color: theme.textColor }]}>{this.props.question}</Text>
        </CardItem>
        <CardItem
          style={Object.assign({}, cardItemStyle, buttonContainerStyle, { backgroundColor: theme.bgColor2 })}>
          <View style={{ marginRight: 24 }}>
            <TouchableOpacity
              onPress={() => this.props.handleBtnClick(false)}
              style={[styles.feedButtonStyle, { backgroundColor: !this.props.isTrue ? theme.primaryColor : theme.textColor2}]}>
              <Text
                style={btnTextStyle}>{noLabel}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => this.props.handleBtnClick(true)}
              style={[styles.feedButtonStyle, { backgroundColor: this.props.isTrue ? theme.primaryColor : theme.textColor2}]}>
              <Text
                style={btnTextStyle}>{yesLabel}</Text>
            </TouchableOpacity>
          </View>
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
  buttonContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnTextStyle: {
    lineHeight: 27,
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  labelTextStyle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  subLabelTextStyle: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  feedButtonStyle: {
    height: 27,
    width: 100,
    paddingLeft: 10, 
    paddingRight: 10,
  }
};

export default FeedbackCard;
