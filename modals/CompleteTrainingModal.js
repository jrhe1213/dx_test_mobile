import React, { Component } from 'react';
import { View, Dimensions, Text } from 'react-native';
import PropTypes from 'prop-types';

import {
  CardItem,
  Icon,
  ListItem,
  Radio,
  Left,
} from 'native-base';

// Redux
import { connect } from 'react-redux';
import feedActions from '../screens/Feed/actions';
import bookmarkActions from '../screens/Bookmark/actions';

// Libraries

// Components
import { TextSize } from '../styles/types';
// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    width: Dimensions.get('window').width - 24,
  },
  headerCardItemStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingBottom: 0,
    marginBottom: 0,
  },
  headerContentStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonStyle: {
    flex: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
  },
  closeButtonTextStyle: {
    color: colors.black,
  },
  mainHeadingStyle: {
    fontFamily: fonts.bold,
    color: colors.black,
    letterSpacing: 2,
  },
  invitationBodyStyle: {
    paddingLeft: Dimensions.get('window').width < 375 ? 6 : 18,
    paddingRight: Dimensions.get('window').width < 375 ? 6 : 18,
    paddingTop: Dimensions.get('window').width < 375 ? 0 : 10,
    paddingBottom: Dimensions.get('window').width < 375 ? 0 : 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContentStyle: {
    textAlign: 'justify',
    lineHeight: 23,
    fontFamily: fonts.light,
    letterSpacing: 2,
  },
  consentQuestionStyle: {
    fontFamily: fonts.light,
    // lineHeight: 20,
    textAlign: 'center',
  },
  inputItemStyle: {
    marginTop: 20,
    borderColor: 'transparent',
    width: '100%',
    height: 50,
  },
  inputStyle: {
    fontFamily: fonts.regular,
    fontSize: Dimensions.get('window').width < 375 ? 16 : 18,
  },
  invitationFooterStyle: {
  },
  FooterContentStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    backgroundColor: 'transparent',
  },
  drawerItemIcon: {
    fontSize: 26,
    width: 28,
    marginRight: 5,
  },
  subHeadingIngfo: {
    color: 'grey',
    fontFamily: fonts.light,
    fontSize: 12,
    letterSpacing: 1,
  },
};

class CompleteTrainingModal extends Component {
  static propTypes = {

  };

  handleCancelCompleteTraining = () => {
    this.props.handleCancelCompleteTraining();
  }

  handleConfirmUserCompleteTraining = () => {
    this.props.handleConfirmUserCompleteTraining();
  }

  render() {
    const { theme, language } = this.props;

    const langCheck = language || {};
    const trainingLabels = langCheck.TrainingScreen ? langCheck.TrainingScreen : [];

    // Destructing Labels for the page
    let trainingTitleLabel;
    let trainingAcceptLabel;
    let trainingRejectLabel;

    trainingLabels.map((label) => {
      if (label.Type === 'TRAINING_PAGE_TITLE_CONTENT') {
        trainingTitleLabel = label.Content;
      }
      if (label.Type === 'TRAINING_PAGE_ACCEPT_CONTENT') {
        trainingAcceptLabel = label.Content;
      }
      if (label.Type === 'TRAINING_PAGE_REJECT_CONTENT') {
        trainingRejectLabel = label.Content;
      }
    });

    return (
      <View style={[styles.containerContentStyle, { backgroundColor: theme.bgColor }]}>
        <CardItem style={[styles.headerCardItemStyle, { backgroundColor: theme.bgColor }]}>
          <View style={styles.headerContentStyle}>
            {/* <Icon style={styles.drawerItemIcon} name="ios-update" /> */}
            <TextSize
              small={Dimensions.get('window').width < 375}
              base={Dimensions.get('window').width >= 375}
              style={[styles.mainHeadingStyle, { color: theme.textColor }]}
            >
              {trainingTitleLabel || 'Mark it as completed'}
            </TextSize>
          </View>
        </CardItem>

        <View style={{
          flexDirection: 'row'
        }}>
          <CardItem
            button
            style={[
              styles.invitationFooterStyle,
              {
                backgroundColor: 'red',
                flex: 1
              }
            ]}
            onPress={this.handleCancelCompleteTraining}
          >
            <View style={[styles.FooterContentStyle, { paddingTop: 6, paddingBottom: 6 }]}>
              <TextSize
                small={Dimensions.get('window').width < 375}
                base={Dimensions.get('window').width >= 375}
                style={[styles.consentQuestionStyle, { color: '#fff', fontFamily: fonts.bold }]}
              >
                {trainingRejectLabel || 'Cancel'}
              </TextSize>
            </View>
          </CardItem>
          <CardItem
            button
            style={[
              styles.invitationFooterStyle,
              {
                backgroundColor: 'green',
                flex: 1
              }
            ]}
            onPress={this.handleConfirmUserCompleteTraining}
          >
            <View style={[styles.FooterContentStyle, { paddingTop: 6, paddingBottom: 6 }]}>
              <TextSize
                small={Dimensions.get('window').width < 375}
                base={Dimensions.get('window').width >= 375}
                style={[styles.consentQuestionStyle, { color: '#fff', fontFamily: fonts.bold }]}
              >
                {trainingAcceptLabel || 'Confirm'}
              </TextSize>
            </View>
          </CardItem>
        </View>


      </View>
    );
  }
}

const mapStateToProps = state => ({
  userClickedstream: state.modal.userClickedstream,
  olduserClickedstream: state.modal.olduserClickedstream,
  updateBS: state.modal.updateBS,

  theme: state.setting.theme,
  language: state.deviceInfo.language,
});

const mapDispatchToProps = dispatch => ({
  updateUserContentRequest: (stream, isUpdate, updateBS) => dispatch(feedActions.updateUserContentRequest(stream, isUpdate, updateBS)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CompleteTrainingModal);
