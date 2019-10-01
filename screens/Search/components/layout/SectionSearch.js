import React, { Component } from 'react';
import {
  Dimensions, View, Text
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import SectionSearchContainer from '../container/SectionSearchContainer';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';
import config from '../../../../config';

// utils
import { headerForIphoneX } from '../../../../helpers';

import * as Animated from 'react-native-animatable';

const headerHeight = headerForIphoneX ? 82 : 62;
const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - headerHeight,
    position: 'absolute',
    top: headerHeight,
    left: 0,
  },
  errorMessageStyle: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  height: Dimensions.get('window').height - 64 - 48,
  fontFamily: fonts.light,
  letterSpacing: 1,
  },
  errorMessageTextStyle: {
    fontSize: 18,
    color: colors.gray,
  },
};

class SectionSearch extends Component {
  static propTypes = {
  };

  render() {
    const {
      theme, searchToggleSection
    } = this.props;

    const { containerContentStyle } = styles;

    
    return (
      <Animated.View useNativeDriver duration={200} animation={searchToggleSection ? "fadeInUp" : "fadeOut"} style={Object.assign({}, containerContentStyle, { backgroundColor: theme.bgColor2,  })}>
        {
          <SectionSearchContainer />
        }
      </Animated.View>
    );
  }
}

const mapStateToProps = state => ({
  theme: state.setting.theme,
  searchToggleSection: state.search.searchToggleSection, 
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(SectionSearch);
