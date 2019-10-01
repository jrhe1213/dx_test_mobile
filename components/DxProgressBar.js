import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// constants
import * as Progress from 'react-native-progress';
import colors from '../constants/colors';
import fonts from '../styles/fonts';

class DxProgressBar extends Component {
  static propTypes = {
    progress: PropTypes.number,
    isbottom: PropTypes.bool,
    record: PropTypes.number,
    scrollLabel: PropTypes.string,
  }

  render() {
    const {
      hintContainer,
      hintWrapper,
      hint,
      container,
      scrollbar,
    } = styles;

    const { scrollLabel, theme } = this.props;

    const scrolPosition = this.props.progress * Dimensions.get('window').width - 36 > 0 ? { left: this.props.progress * Dimensions.get('window').width - 36 } : { left: 0 };
    return (
      <View>
        {
          !this.props.isbottom
            ? (
              <View style={hintContainer}>
                <View style={hintWrapper}>
                  <Text style={hint}>{scrollLabel}</Text>
                </View>
              </View>
            )
            : null
        }
        <View style={container}>
          <View style={Object.assign({}, scrollbar, scrolPosition)} />
          <Progress.Bar
            color={theme.primaryColor}
            unfilledColor={colors.inactiveColor}
            borderColor="transparent"
            progress={this.props.record}
            width={Dimensions.get('window').width}
            height={4}
            borderRadius={3}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  hintContainer: {
    position: 'absolute',
    top: -24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 18,
    width: '100%',
  },
  hintWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    width: 200,
    height: 18,
  },
  hint: {
    color: colors.whiteColor,
    fontFamily: fonts.light,
    letterSpacing: 1,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  container: {
    position: 'relative',
  },
  scrollbar: {
    backgroundColor: colors.opacityColor,
    width: 36,
    height: 5,
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    zIndex: 999,
  },
};

export default DxProgressBar;
