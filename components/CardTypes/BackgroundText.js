import React, { Component } from 'react';
import {
  View, TouchableOpacity, Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries

// Components
import DxHtmlReader2 from '../DxHtmlReader2';

const styles = {
  contentContainerStyle: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  detailWrapperStyle: {
    justifyContent: 'center',
    // paddingLeft: 3,
    // paddingRight: 3,
  },
};

class BackgroundText extends Component {
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      experienceCard,
      handlePressCard,
      disableClick,
      localData,
      folderName,
      contentWidth,
      contentHeight,
    } = this.props;

    // Filter background color
    const filterBackgroundColor = experienceCard.Settings.filter(
      data => data.Type === 'BACKGROUND_COLOR',
    );

    return (
      <TouchableOpacity onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={[styles.contentContainerStyle, Platform.OS === 'android' ? { width: 135 } : null]}>
          <View style={[styles.detailWrapperStyle, filterBackgroundColor && {
            backgroundColor: filterBackgroundColor[0].Default,
          }, { height: 145, width: 145 }]
          } >
            <View style={{ flexWrap: 'wrap' }}>
              <DxHtmlReader2
              source={experienceCard.Content}
              contentWidth={contentWidth}
              contentHeight={contentHeight}
            />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

BackgroundText.propTypes = {
  experienceCard: PropTypes.object,
  handlePressCard: PropTypes.func,
  disableClick: PropTypes.bool,
  localData: PropTypes.bool,
  folderName: PropTypes.string,
  contentWidth: PropTypes.number,
  contentHeight: PropTypes.number,
};

export default BackgroundText;
