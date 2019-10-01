import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Icon } from 'native-base';

// Components
import DxHtmlReader2 from '../DxHtmlReader2';

const styles = {
  container: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    minHeight: 70,
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIconStyle: {
    fontSize: 24,
  },
  tagStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 5,
  },
};

class DxButton extends Component {
  static propTypes = {
    btnContent: PropTypes.string,
    handleNavigate: PropTypes.func,
    section: PropTypes.object,
    isCompleted: PropTypes.bool,
    isRecommended: PropTypes.bool,
  };

  handleNavigate = (section) => {
    this.props.handleNavigate(section);
  }

  render() {
    const {
      btnContent,
      section,
      isCompleted,
      isRecommended,
    } = this.props;

    const {
      container,
      buttonIconStyle,
      buttonStyle,
      buttonTextStyle,
      tagStyle,
    } = styles;

    // Colos change for recommended and is complete
    let leftElement = <View />;
    if (isCompleted) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: theme.primaryColor })} />;
    } else if (isRecommended) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: theme.textColor })} />;
    }

    return (
      <View style={container}>
        {leftElement}
        <TouchableOpacity style={buttonStyle} onPress={() => this.handleNavigate(section)}>
          <View style={buttonTextStyle}>
            <DxHtmlReader2
              source={btnContent}
            />
          </View>
          <Icon style={buttonIconStyle} name="ios-arrow-forward" />
        </TouchableOpacity>
      </View>
    );
  }
}

export default DxButton;
