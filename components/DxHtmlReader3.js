import React, { Component } from 'react';
import { Platform, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview';

// helpers
import { formatHtmlContent } from '../helpers';

class DxHtmlReader3 extends Component {

  highlightContent = (searchValue, htmlSource, output) => {
    const startRegex = /^(<([^>/]+)>)/ig;
    const endRegex = /(<\/([^>]+)>)/ig;
    let match = htmlSource.match(startRegex);
    if (!match) {
      let endMatch = htmlSource.match(endRegex);
      if (endMatch) {
        // 1. find the string
        let index = htmlSource.indexOf(endMatch[0]);
        let pureString = htmlSource.substr(0, index);
        // 2. remove string from the rest
        htmlSource = htmlSource.replace(pureString, "");
        // 3. high-light
        pureString = pureString.replace(searchValue, `<span style="background-color: yellow">${searchValue}</span>`);
        output = output + pureString + endMatch[0];
        // 4. remove end tag from the rest
        htmlSource = htmlSource.replace(endMatch[0], "");
        return this.highlightContent(searchValue, htmlSource, output);
      }
      output = output + htmlSource;
      return output;
    }
    htmlSource = htmlSource.replace(match[0], "");
    output = output + match[0];
    return this.highlightContent(searchValue, htmlSource, output);
  }

  render() {

    let {
      source,
      contentWidth,
      searchValue
    } = this.props;

    // Handle full digital link
    if (source) {
      const matched = source.match(/(<(.|\n)*?>)+[0-9]+(<\/(.|\n)*?>)+/g);
      if (matched) {
        source = '<p>text</p>';
      }
    }

    const formatSource = source ? `<div class="ql-heightFix"><p>${source}</p></div>` : null;

    if (!source) {
      return null;
    }

    if (contentWidth) {
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
    }


    let htmlSource = source;
    if (Platform.OS === 'ios') {
      htmlSource = formatHtmlContent(htmlSource);
    }

    let isInclude = false;
    if (searchValue) {
      searchValue = searchValue.replace(/[^a-z0-9\s]/gi, '');
      searchValue = searchValue.trim();
      if (searchValue) {
        const htmlRegex = /(<([^>]+)>)/ig;
        const pureString = htmlSource.replace(htmlRegex, "");
        isInclude = pureString.toLowerCase().includes(searchValue.toLowerCase());
      }
    }

    if (isInclude) {
      let output = '';

      const startRegex = /^(<([^>/]+)>)/ig;
      let match = htmlSource.match(startRegex);
      if (!match) {
        htmlSource = htmlSource.replace(searchValue, `<span style="background-color: yellow">${searchValue}</span>`);
      } else {
        htmlSource = this.highlightContent(searchValue, htmlSource, output);
      }
    }

    return <HTML
      html={htmlSource}
      tagsStyles={{
        img: {
          maxWidth: 
          this.props.isBigImg ?
          Dimensions.get('window').width - 24
          :
          Dimensions.get('window').width - 60,
        }
      }}
      classesStyles={classesStyles}
      onLinkPress={(e, href) => this.props.openEmbeddedLinkModal(href)}
    />;

    return (
      <AutoHeightWebView
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={{
          html: formatSource,
        }}
        scalesPageToFit={Platform.OS !== 'ios'}
        customStyle={`
          p, span {
            font-family: OpenSans-Regular;
            word-break: break-all;
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

DxHtmlReader3.propTypes = {
  source: PropTypes.string,
  contentWidth: PropTypes.string,
};

const tagsStyles = {
  // p: { fontFamily: 'OpenSans-Regular', fontWeight: 'bold' },
  // span: { fontFamily: 'OpenSans-Regular' },
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

export default DxHtmlReader3;
