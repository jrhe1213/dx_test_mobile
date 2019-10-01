import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Platform, Text } from 'react-native';

//  Libraries
import { Container, Button, Icon } from 'native-base';
import FastImage from 'react-native-fast-image';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../actions';

// Components
import SectionSearchListContainer from './SectionSearchListContainer';

// ICons
import imagesIcon from '../../../../assets/images/Icons/sharp-image.png';
import videoIcon from '../../../../assets/images/Icons/sharp-video_library.png';
import pdfIcon from '../../../../assets/images/Icons/sharp-picture_as_pdf.png';
import textIcon from '../../../../assets/images/Icons/sharp-text_fields.png';
import linkIcon from '../../../../assets/images/Icons/sharp-link.png';
import otherIcon from '../../../../assets/images/Icons/sharp-blur_circular.png';


// Fonts
import fonts from '../../../../styles/fonts';

class SectionSearchContainer extends Component {
  static propTypes = {
  };

  handleUpdateSectionTab = index => {
    const { currentTabIndex } = this.props;

    if (index !== currentTabIndex) {
      this.props.updateCurrentSectionSearchTab(index);
    }
  }

  render() {
    const {
      theme,
      isNightMode,
      currentTabIndex,
      language,
    } = this.props;

    const {
      topFilterContainer,
      dataContainer,
      buttonStyle,
      buttonTextStyle,
      iconStyle
    } = styles;


    const languageCheck = language || {};
    const bookmarkLabels = languageCheck.BookmarkScreen ? languageCheck.BookmarkScreen : [];

    // Destructing Labels for the page
    let videoLabel;
    let pdfLabel;
    let textLabel;
    let linkLabel;
    let otherLabel;
    let imagesLabel;
    let allLabel;
    let audioLabel;

    bookmarkLabels.map((label) => {
      if (label.Type === 'ALL') {
        allLabel = label.Content;
      }

      if (label.Type === 'IMAGE') {
        imagesLabel = label.Content;
      }

      if (label.Type === 'VIDEO') {
        videoLabel = label.Content;
      }
      if (label.Type === 'PDF') {
        pdfLabel = label.Content;
      }
      if (label.Type === 'TEXT') {
        textLabel = label.Content;
      }
      if (label.Type === 'LINK') {
        linkLabel = label.Content;
      }
      if (label.Type === 'OTHER') {
        otherLabel = label.Content;
      }
      if (label.Type === 'AUDIO') {
        audioLabel = label.Content;
      }
    });

    return (
      <Container contentContainerStyle={{ backgroundColor: theme.bgColor2, flex: 1, padding: 0 }}>
        <View style={Object.assign({}, topFilterContainer, { backgroundColor: theme.bgColor })}>
          {/* <FastImage
            style={[styles.iconStyle, { width: item.width, height: item.height }]}
            source={item.icon}
          /> */}
          <Button 
            // iconLeft 
            transparent 
            style={buttonStyle}
            onPress={() => this.handleUpdateSectionTab(0)}
          >
            {/* <Icon name='arrow-back' /> */}
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 0 ? theme.primaryColor : theme.textColor })}>{allLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle} 
            onPress={() => this.handleUpdateSectionTab(1)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 1 ? theme.primaryColor : theme.textColor })}>{imagesLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle} 
            onPress={() => this.handleUpdateSectionTab(2)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 2 ? theme.primaryColor : theme.textColor })}>{videoLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle} 
            onPress={() => this.handleUpdateSectionTab(3)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 3 ? theme.primaryColor : theme.textColor })}>{audioLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle}
            onPress={() => this.handleUpdateSectionTab(4)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 4 ? theme.primaryColor : theme.textColor })}>{pdfLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle}
            onPress={() => this.handleUpdateSectionTab(5)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 5 ? theme.primaryColor : theme.textColor })}>{textLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle}
            onPress={() => this.handleUpdateSectionTab(6)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 6 ? theme.primaryColor : theme.textColor })}>{linkLabel}</Text>
          </Button>
          <Button 
            transparent 
            style={buttonStyle}
            onPress={() => this.handleUpdateSectionTab(7)}
          >
            <Text style={Object.assign({}, buttonTextStyle, { color: currentTabIndex === 7 ? theme.primaryColor : theme.textColor })}>{otherLabel}</Text>
          </Button>
        </View>
        <View style={Object.assign({}, dataContainer, { backgroundColor: theme.bgColor2 })}>
          <SectionSearchListContainer />
        </View>
      </Container>
    );
  }
}

const styles = {
  topFilterContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  dataContainer: {
    width: '100%',
    height: '100%'
  },
  iconStyle: {
    width: 25,
    height: 25,
    marginBottom: 12,
  },
  buttonStyle: {
    margin: 0,
    paddingLeft: 6,
    paddingRight: 6,
    marginRight: 6,
  },
  buttonTextStyle: {
    fontFamily: fonts.light,
    fontSize: 12,
  }
}


const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  currentTabIndex: state.search.currentTabIndex,
  language: state.deviceInfo.language,
});

const dispatchToProps = dispatch => ({
  updateCurrentSectionSearchTab: currentTabIndex => dispatch(searchActions.updateCurrentSectionSearchTab(currentTabIndex)),
});

export default connect(mapStateToProps, dispatchToProps)(SectionSearchContainer);
