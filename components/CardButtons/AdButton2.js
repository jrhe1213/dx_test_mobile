import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import { Icon } from 'native-base';

// Components
import DxHtmlReader4 from '../DxHtmlReader4';

const styles = {
  container: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    minHeight: 60,
    justifyContent: 'center',
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

class DxAddButton2 extends Component {
  static propTypes = {
    btnContent: PropTypes.string,
    adBtnBgColor: PropTypes.string,
    adBtnColor: PropTypes.string,
    section: PropTypes.object,
    handleNavigate: PropTypes.func,
    isCompleted: PropTypes.bool,
    isRecommended: PropTypes.bool,
  };

  handleNavigate = (section) => {
    this.props.handleNavigate(section);
  }

  render() {
    const {
      adBtnBgColor,
      adBtnColor,
      btnContent,
      section,
      isCompleted,
      isRecommended,
      contentWidth,
      userGUID,
      isNightMode,
      theme,
    } = this.props;

    const {
      container,
      buttonIconStyle,
      buttonStyle,
      tagStyle,
    } = styles;

    // Colos change for recommended and is complete
    let leftElement = <View />;
    if (isCompleted) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: theme.primaryColor })} />;
    } else if (isRecommended) {
      leftElement = <View style={Object.assign({}, tagStyle, { backgroundColor: "#000" })} />;
    }

    return (
      <TouchableOpacity style={{ flex: 1, backgroundColor: adBtnBgColor || '#fff' }} onPress={() => this.handleNavigate(section)}>
        <View style={container}>
          {leftElement}
          <View style={buttonStyle}>
            <View style={{ width: '95%' }}>
              <DxHtmlReader4
                source={btnContent}
                contentWidth={contentWidth}
                userGUID={userGUID}
              />
            </View>
            <Icon style={[buttonIconStyle, { color: adBtnColor || '#fff' }]} name="ios-arrow-forward" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default DxAddButton2;
