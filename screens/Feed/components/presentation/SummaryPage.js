import React, { Component } from 'react';
import {
  View, Text
} from 'react-native';
import PropTypes from 'prop-types';

// Components

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

const styles = {
  containerStyle: {
    padding: 22,
  },
  titleStyle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
  rowStyle: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSideRowStyle: {},
  rightSideRowStyle: {},
  mainTitleStyle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
  subTitleStyle: {
    fontSize: 14,
    fontFamily: fonts.light,
    letterSpacing: 2,
  },
  dataStyle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
};

class SummaryPage extends Component {
  static propTypes = {
    theme: PropTypes.object,
    timeSpent: PropTypes.number,
    numberOfImpressions: PropTypes.number,
  }

  render() {
    const {
      containerStyle,
      titleStyle,
      rowStyle,
      rightSideRowStyle,
      leftSideRowStyle,
      mainTitleStyle,
      subTitleStyle,
      dataStyle,
    } = styles;

    const {
      theme,
      timeSpent,
      numberOfImpressions,
      metricsLabel,
      engagementLabel,
      interactionsLabel,
      timeSpentLabel,
      minutesLabel,
    } = this.props;
    
    let formattedTime = Math.trunc(timeSpent / 60);
    if (formattedTime === 0) {
      formattedTime = 1;
    }

    return (
      <View style={containerStyle}>
        <Text style={[titleStyle, { color: theme.primaryColor }]}>{metricsLabel}</Text>
        <View style={rowStyle}>
          <View style={leftSideRowStyle}>
            <Text style={[mainTitleStyle, { color: theme.textColor }]}>
              {engagementLabel}
            </Text>
            <Text style={[subTitleStyle, { color: theme.textColor2 }]}>
              {interactionsLabel}
            </Text>
          </View>
          <View style={rightSideRowStyle}>
            <Text style={[dataStyle, { color: theme.textColor }]}>
              { numberOfImpressions }
            </Text>
          </View>
        </View>
        <View style={rowStyle}>
          <View style={leftSideRowStyle}>
            <Text style={[mainTitleStyle, { color: theme.textColor }]}>
              {timeSpentLabel}
            </Text>
            <Text style={[subTitleStyle, { color: theme.textColor2 }]}>
              {minutesLabel}
            </Text>
          </View>
          <View style={rightSideRowStyle}>
            <Text style={[dataStyle, { color: theme.textColor }]}>
              { formattedTime }
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default SummaryPage;
