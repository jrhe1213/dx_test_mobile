import React from 'react';
import { View } from 'react-native';
import {
  Content,
  Card,
  CardItem,
  Text,
  Body,
  Button,
  Icon,
} from 'native-base';
import PropTypes from 'prop-types';

import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

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
    lineHeight: 18,
  },
  channelNameStyle: {
    fontWeight: 'bold',
    color: colors.btnBlue,
    marginTop: 2,
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

const InvitationModal = ({ closeModal }) => (
  <Content contentContainerStyle={styles.containerContentStyle}>
    <Card transparent >

      <CardItem style={styles.headerCardItemStyle}>
        <Button transparent onPress={() => closeModal()} style={styles.closeButtonStyle}>
            <Text style={styles.closeButtonTextStyle}><Icon name="ios-close" /></Text>
          </Button>
        <View style={styles.headerContentStyle}>
          <Text style={styles.mainHeadingStyle}>INVITATION</Text>
          <Text style={styles.dateStyle}>Jan 25, 2018</Text>
        </View>
      </CardItem>

      <CardItem>
        <Body style={styles.invitationBodyStyle}>
          <Text style={styles.bodyContentStyle}>
            <Text style = {styles.senderNameStyle}>Joe McGill</Text> has sent you an exclusive invite to view content in this channel <Text style={styles.channelNameStyle}>
                #Secret Channel
              </Text>
          </Text>
          <Text style={styles.consentQuestionStyle}>Do you consent to accept this invitation?</Text>
        </Body>
      </CardItem>

      <CardItem style={styles.invitationFooterStyle}>
        <View style={styles.FooterContentStyle}>
          <Button style={styles.footerButton} >
            <Text style={styles.declineButton}>Decline!</Text>
          </Button>
          <Button style={styles.footerButton}>
            <Text style={styles.acceptButton}>Accept</Text>
          </Button>
        </View>
      </CardItem>

    </Card>
  </Content>
);

InvitationModal.propTypes = {
  closeModal: PropTypes.func,
};

export default InvitationModal;
