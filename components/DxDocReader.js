import React, { Component } from 'react';
import {
  View,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import Pdf from 'react-native-pdf';

// Constants
import colors from '../constants/colors';

class DxDocReader extends Component {

  render() {

    const {
      container,
      pdf,
    } = styles;
    return (
      <View
        style={container}
      >
        <Pdf
          source={{ uri: this.props.source, cache: true }}
          onLoadComplete={(numberOfPages, filePath) => {

          }}
          onPageChanged={(page, numberOfPages) => {

          }}
          onError={(error) => {
            // console.log('pdf loader error: ', error);
          }}
          style={Object.assign({}, pdf)}
        />
      </View>
    )
  }
};

DxDocReader.propTypes = {
  source: PropTypes.string,
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.whiteColor,
    margin: 0,
    padding: 0,
    width: Dimensions.get('window').width,
  },
  pdf: {
    flex: 1,
    margin: 0,
    padding: 0,
    width: Dimensions.get('window').width,
  },
};

export default DxDocReader;
