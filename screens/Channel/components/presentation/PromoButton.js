import React, { Component } from 'react';
import {
  View,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Button, Text } from 'native-base';

// Constants
import fonts from '../../../../styles/fonts';
import colors from '../../../../constants/colors';

let fontSize1;
if (Dimensions.get('window').width <= 375) {
  fontSize1 = 12;
} if (Dimensions.get('window').width <= 325) {
  fontSize1 = 11;
} else if (Dimensions.get('window').width <= 320) {
  fontSize1 = 3;
} else {
  fontSize1 = 12;
}
const styles = {
  mainContainerStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 48,
  },
  btnStyle: {
    height: 48,
  },
  textStyle: {
    fontFamily: fonts.bold,
    fontSize: fontSize1,
    color: colors.whiteColor,
    height: 48,
    lineHeight: 48,
  },
};

class PromoButton extends Component {
  static propTypes = {
    handleClickHandle: PropTypes.func,
    passcodeBarLabel: PropTypes.string,
  }

  handleClickHandle = () => {
    this.props.handleClickHandle();
  };

  render() {
    const { passcodeBarLabel } = this.props;
    return (
      <View style={styles.mainContainerStyle}>
        <Button
          full
          style={styles.btnStyle}
          onPress={this.handleClickHandle}>
          <Text
            uppercase={false}
            style={styles.textStyle}>
            {passcodeBarLabel}
          </Text>
        </Button>
      </View>
    );
  }
}

export default PromoButton;
