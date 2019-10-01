import React, { Component } from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  ListItem, Left, Right, Radio,
} from 'native-base';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

const styles = {
  languageLabelStyle: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
};

class LanguageListItem extends Component {
  static propTypes = {
    updateLanguage: PropTypes.func,
    language: PropTypes.object,
    isActive: PropTypes.bool,
  };


  updateLanguage = (languageGUID) => {
    this.props.updateLanguage(languageGUID);
  }

  render() {
    const { languageLabelStyle } = styles;

    const { language, isActive, theme } = this.props;

    return (
      <ListItem
        onPress = {() => this.updateLanguage(language.LanguageGUID)}
      >
        <Left>
          <Text style={[languageLabelStyle, { color: isActive ? theme.primaryColor : theme.textColor }]}>
            {language.Language} ({language.LanguageCode})
          </Text>
        </Left>
        <Right>
          <Radio
            selectedColor={theme.primaryColor}
            selected={isActive}
            onPress = {() => this.updateLanguage(language.LanguageGUID)}
          />
        </Right>
      </ListItem>
    );
  }
}

export default LanguageListItem;
