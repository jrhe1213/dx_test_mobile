import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';

// Libraries
import {
  Icon,
} from 'native-base';

// Components
import { TextSize } from '../styles/types';

// fonts
import fonts from '../styles/fonts';

class Footer extends Component {
    handleBtnPress = () => {
      this.props.handleBtnPress();
    }

    render() {
      const {
        footerContainerStyle,
        containerStyle,
        contentContainerStyle,

        labelContainerStyle,
        titleStyle,
        subtitleStyle,
        iconContainerStyle,
        iconStyle,
      } = styles;

      const {
        title,
        subtitle,
        continueToFeedbackLabel,
        thankYouLabel,
        theme,
      } = this.props;
      const formattedSubtitle = subtitle === 'CONTINUE TO FEEDBACK' ? continueToFeedbackLabel : subtitle === 'THANK YOU'
        ? thankYouLabel : subtitle;
      return (
            <View style={[footerContainerStyle, { backgroundColor: theme.bgColor2 }]}>
                <TouchableOpacity
                    onPress={() => this.handleBtnPress()}
                    style={Object.assign({}, containerStyle)}>
                    <View style={iconContainerStyle}></View>
                    <View style={contentContainerStyle}>
                        <View style={labelContainerStyle}>
                            <TextSize small style={[titleStyle, { color: theme.textColor }]}>{title}</TextSize>
                            <TextSize small numberOfLines={1} ellipsizeMode={'tail'} style={Object.assign({}, subtitleStyle, { flexShrink: 1, color: theme.textColor2 })}>{formattedSubtitle}</TextSize>
                        </View>
                    </View>
                    <View style={iconContainerStyle}>
                        {
                            this.props.hasArrow
                              ? (
                                    <Icon
                                        style={[iconStyle, { color: theme.textColor }]}
                                        name="ios-arrow-forward" />
                              )
                              : null
                        }
                    </View>
                </TouchableOpacity>
            </View>
      );
    }
}

const styles = {

  footerContainerStyle: {
    width: '100%',
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  containerStyle: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  contentContainerStyle: {
    flex: 8,
    display: 'flex',
    flexDirection: 'row',
    height: 70,
    justifyContent: 'center',
  },
  labelContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleStyle: {
    color: '#000000',
    fontFamily: fonts.regular,
  },
  subtitleStyle: {
    color: '#C3C9CE',
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  iconContainerStyle: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 12,
  },
  iconStyle: {
    fontSize: 30,
  },
};

export default Footer;
