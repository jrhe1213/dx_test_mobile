import React, { Component } from 'react';
import {
  Platform,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview';

// helpers
import { formatHtmlContent } from '../helpers';

const styles = {
  container: {
    padding: 3,
  },
};

class DxHtmlReader2 extends Component {
  render() {
    const {
      source,
      contentWidth,
      contentHeight,
    } = this.props;

    // Handle full digital link
    // if (source) {
    //   const matched = source.match(/(<(.|\n)*?>)+[0-9]+(<\/(.|\n)*?>)+/g);
    //   if (matched) {
    //     source = '<p>text</p>';
    //   }
    // }

    // if (Platform.OS === 'android') {
    if (!source) {
      return null;
    }

    let htmlSource = source;
    if (Platform.OS === 'ios') {
      htmlSource = formatHtmlContent(htmlSource);
    }

    return (
      <View style={styles.container}>
        <HTML
          containerStyle={{
          }}
          html={htmlSource}
          tagsStyles={{
            img: {
              maxWidth: Dimensions.get('window').width - 48,
            }
          }}
          classesStyles={classesStyles}
        />
      </View>
    );
  }
}

DxHtmlReader2.propTypes = {
  source: PropTypes.string,
};

const tagsStyles = {
  // p: { fontFamily: 'OpenSans-Regular' },
  // span: { fontFamily: 'OpenSans-Regular' },
  // strong: { fontWeight: 'bold' },
  // em: { fontStyle: 'italic' },
};
const classesStyles = {
  'ql-heightFixWrapper': {
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  'ql-align-justify': {
    textAlign: 'justify',
  },
  'ql-align-center': {
    textAlign: 'center',
  },
  'ql-align-right': {
    textAlign: 'right',
  },
  'ql-font-Lato': {
    fontFamily: 'Lato-Regular',
  },
  'ql-font-Monoton': {
    fontFamily: 'Monoton-Regular',
  },
  'ql-font-Open_Sans': {
    fontFamily: 'OpenSans-Regular',
  },
  'ql-font-Raleway': {
    fontFamily: 'Raleway-Regular',
  },
  'ql-font-Roboto': {
    fontFamily: 'Roboto-Regular',
  },
  'ql-font-Ubuntu': {
    fontFamily: 'Ubuntu-Regular',
  },
};

export default DxHtmlReader2;
