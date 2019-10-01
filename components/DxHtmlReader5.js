import React, { Component } from 'react';
import {
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview';

// helpers
import { formatHtmlContent } from '../helpers';

class DxHtmlReader5 extends Component {
  render() {
    let {
      source,
      contentWidth,
    } = this.props;

    // Handle full digital link
    // if (source) {
    //   const matched = source.match(/(<(.|\n)*?>)+[0-9]+(<\/(.|\n)*?>)+/g);
    //   if (matched) {
    //     source = '<p>text</p>';
    //   }
    // }

    const formatSource = source ? `<div class="ql-heightFix"><p>${source}</p></div>` : null;

    // if (Platform.OS === 'android') {
    if (!source) {
      return null;
    }

    const formattedContentWidthArr = contentWidth.match(/\d+/);
    let formattedContentWidth = formattedContentWidthArr[0];
    if (contentWidth.includes('calc')) {
      let tempContentWidth = contentWidth.match(/\(.*\)\;$/g);
      tempContentWidth = tempContentWidth[0];
      tempContentWidth = tempContentWidth.match(/\d+\.*\d*/g);
      if (tempContentWidth.length == 2) {
        formattedContentWidth = Number(tempContentWidth[0]) - Number(tempContentWidth[1]);
      } else {
        formattedContentWidth = Number(tempContentWidth[0]);
      }
    }
    formattedContentWidth = Math.round(formattedContentWidth);

    let htmlSource = source;
    if (Platform.OS === 'ios') {
      htmlSource = formatHtmlContent(htmlSource);
    }

    return (
        <HTML
          html={htmlSource}
          tagsStyles={tagsStyles}
          classesStyles={classesStyles}
        />
    );
    // }

    return (
      <AutoHeightWebView
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={
          {
            html: formatSource,
          }
        }
        scalesPageToFit={
          Platform.OS !== 'ios'
        }
        customStyle={`
          p, span {
            font-family: OpenSans-Regular;
          }
          .ql-heightFix{
            ${contentWidth}
          }
          .ql-align-justify {
            text-align: justify;
          }
          .ql-align-center {
            text-align: center;
          }
          .ql-align-right {
            text-align: right;
          }
          .ql-font-Lato {
            font-family: 'Lato-Regular';
          }
          .ql-font-Monoton {
            font-family: 'Monoton-Regular';
          }
          .ql-font-Open_Sans {
            font-family: 'OpenSans-Regular';
          }
          .ql-font-Raleway {
            font-family: 'Raleway-Regular';
          }
          .ql-font-Roboto {
            font-family: 'Roboto-Regular';
          }
          .ql-font-Ubuntu {
            font-family: 'Ubuntu-Regular';
          }
        `}
      />
    );
  }
}

DxHtmlReader5.propTypes = {
  source: PropTypes.string,
  contentWidth: PropTypes.string,
};

const tagsStyles = {
  // p: { fontFamily: 'OpenSans-Regular' },
  // span: { fontFamily: 'OpenSans-Regular' },
  // strong: { fontWeight: 'bold' },
  // em: { fontStyle: 'italic' },
};
const classesStyles = {
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


export default DxHtmlReader5;
