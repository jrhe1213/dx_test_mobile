import React, { Component } from 'react';
import {
  View, Dimensions, Text, ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Content,
  Card,
  CardItem,
  Body,
} from 'native-base';

// Redux
import { connect } from 'react-redux';

// Libraries

// Components
import { TextSize } from '../styles/types';
// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    backgroundColor: colors.bgColor,
    position: 'absolute',
    bottom: 0,
    flex: 1,
    width: '100%',
  },
  headerCardItemStyle: {
    flexDirection: 'column',
    marginBottom: 2,
    paddingTop: 25,
    paddingBottom: 25,
  },
  headerContentStyle: {
    flex: 1,
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
    fontWeight: 'bold',
  },
  mainHeadingStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  dateStyle: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fonts.light,
    marginTop: 2,
  },
  invitationBodyStyle: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 10,
  },
  bodyContentStyle: {
    textAlign: 'justify',
    lineHeight: 23,
    fontFamily: fonts.light,
  },
  senderNameStyle: {
    fontWeight: 'bold',
    lineHeight: 23,
    margin: 0,
    padding: 0,
  },
  channelNameStyle: {
    fontWeight: 'bold',
    color: colors.btnBlue,
  },
  consentQuestionStyle: {
    fontWeight: 'bold',
    marginTop: 20,
    lineHeight: 23,
  },
  invitationFooterStyle: {
    backgroundColor: colors.bgColor,
  },
  FooterContentStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerButton: {
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 0,
  },
  declineButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  acceptButton: {
    color: 'green',
    fontWeight: 'bold',
  },
};

class UserSyncModal extends Component {
  static propTypes = {
  };


  render() {
    const { language } = this.props;
    const langCheck = language || {};
    const loaderLabels = langCheck.Loader ? langCheck.Loader : [];

    // Destructing Labels for the page
    let loaderSyncTitleLabel;
    let loaderSyncDescLabel;

    loaderLabels.map((label) => {
      if (label.Type === 'LOADER_SYNC_TITLE') {
        loaderSyncTitleLabel = label.Content;
      }
      if (label.Type === 'LOADER_SYNC_DESC') {
        loaderSyncDescLabel = label.Content;
      }
    });

    return (
      <Content contentContainerStyle={styles.containerContentStyle}>
        <Card transparent>

          <CardItem style={styles.headerCardItemStyle}>
            <View style={styles.headerContentStyle}>
              <Text style={styles.mainHeadingStyle}>{loaderSyncTitleLabel}</Text>
            </View>
          </CardItem>

          <CardItem style={[styles.headerCardItemStyle, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
            <ActivityIndicator
              color={this.props.theme.primaryColor}
              size="large"
            />
          </CardItem>
          <CardItem>
            <Body style={styles.invitationBodyStyle}>
              <Text style={styles.bodyContentStyle}>{loaderSyncDescLabel}</Text>
            </Body>
          </CardItem>

        </Card>
      </Content>
    );
  }
}

const mapStateToProps = state => ({
  language: state.deviceInfo.language,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(UserSyncModal);
