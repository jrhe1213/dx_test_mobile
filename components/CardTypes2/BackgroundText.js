import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  CardItem,
} from 'native-base';

// Components
import DxHtmlReader2Original from '../DxHtmlReader2Original';

const styles = {
  topContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    height: 110,
    marginTop: -10,
    width: '100%',
    overflow: 'hidden',
  },
  detailWrapperStyle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 5,
    paddingRight: 5,
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
      theme,
    } = this.props;

    // Filter background color
    const filterBackgroundColor = experienceCard.Settings.filter(
      data => data.Type === 'BACKGROUND_COLOR',
    );

    return (
      <CardItem button style={[styles.cardItemStyle, { backgroundColor: theme.bgColor2 }]} onPress={() => (disableClick ? {} : handlePressCard())}>
        <View style={styles.contentContainerStyle}>
          <View style={
            Object.assign({}, styles.detailWrapperStyle, filterBackgroundColor && {
              backgroundColor: filterBackgroundColor[0].Default,
            })
          } >
            <View style={{ flexWrap: 'wrap' }}>
              <DxHtmlReader2Original
              source={experienceCard.Content}
              contentWidth={contentWidth}
            />
            </View>
          </View>
        </View>
      </CardItem>
    );
  }
}

BackgroundText.propTypes = {
  experienceCard: PropTypes.object,
  handlePressCard: PropTypes.func,
  disableClick: PropTypes.bool,
  localData: PropTypes.bool,
  folderName: PropTypes.string,
  contentWidth: PropTypes.string,
};

export default BackgroundText;
