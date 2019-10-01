import React, { Component } from 'react';
import {
  View,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview';

// COnfig
import config from '../config';

// Utils
import { formatHtmlContent } from '../helpers';
import { readFile } from '../utils/fileSystem';

const styles = {
  container: {
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    flex: 1,
  },
};

class DxHtmlReader extends Component {
  state = {
    fileContent: null,
    test: false
  }

  componentDidMount() {
    const {
      source,
    } = this.props;
    if (source) {
      if (source.includes(config.viewBaseLink)) {
        dxHtmlApi(source)
          .then((fileContent) => {
            this.setState({
              fileContent,
            });
          })
          .catch((error) => {
            // console.log('error in DxHtmlReader');
          });
      } else {
        readFile(source)
          .then((fileContent) => {
            this.setState({
              fileContent,
            });
          })
          .catch((error) => {
            // console.log('error in DxHtmlReader');
          });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.acceptedUpdate && nextProps.acceptedUpdate) {
      const {
        source,
      } = nextProps;
      readFile(source)
        .then((fileContent) => {
          this.setState({
            fileContent,
          });
        })
        .catch((error) => {
          // console.log('error in DxHtmlReader');
        });
    }
  }

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
      searchValue
    } = this.props;

    const {
      fileContent,
    } = this.state;

    // if (Platform.OS === 'android') {
    if (!fileContent) {
      return null;
    }

    let htmlSource = fileContent;
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

    return (
      <TouchableWithoutFeedback onPress={() => this.setState({
        test: true
      }) && this.props.handlePressContent()}>
        <View style={styles.container}>
          <View style={styles.wrapper}>
            <HTML
              containerStyle={styles.html}
              html={htmlSource}
              tagsStyles={{
                img: {
                  maxWidth: this.props.isBigImg ?
                    Dimensions.get('window').width - 12
                    :
                    Dimensions.get('window').width - 48,
                }
              }}
              classesStyles={classesStyles}
              onLinkPress={(e, href) => this.props.openEmbeddedLinkModal(href)}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
    // }

    return (
      <TouchableWithoutFeedback onPress={() => this.props.handlePressContent()}>
        <View style={styles.container}>
          <AutoHeightWebView
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: source }}
            style={{ width: Dimensions.get('window').width - 15 }}
            customStyle={`
            p, span {
              font-family: OpenSans-Regular;
            }
            p:last-child, span:last-child{
              padding-bottom: 12px !important;
            }
            .ql-align-justify {
              text-align: justify;
            }
            .ql-align-center {
              text-align: center
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
            ol, ul{
              padding-left: 2rem!important;
            }
          `}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

DxHtmlReader.propTypes = {
  source: PropTypes.string,
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

const dxHtmlApi = url => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      resolve(xhr.responseText);
      return;
    }
    resolve('');
  };
  xhr.open('GET', url, true);
  xhr.send();
});

const jsUcfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default DxHtmlReader;
