import React, { Component } from 'react';
import { Text, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  List, ListItem, Left, Right, Icon,
} from 'native-base';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

const styles = {
  labelStyle: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
};

class TagsListItem extends Component {
  static propTypes = {
  };

  render() {
    const { labelStyle } = styles;

    const { tag, theme } = this.props;

    return (
      <ListItem
        button
        onPress={() => this.props.handleTagClick(tag)}
      >
        <Left>
          <Text 
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={[labelStyle, { color: theme.textColor, flexShrink: 1 }]}>
            {tag.TagName}
          </Text>
        </Left>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>
    );
  }
}

export default TagsListItem;
