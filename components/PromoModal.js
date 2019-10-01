import React, { Component } from 'react';
import {
  View,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  CardItem,
  Text,
  Body,
  Button,
  Icon,
  Input,
  Item,
  Form,
} from 'native-base';

// Components
import { TextSize } from '../styles/types';

// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const styles = {
  containerContentStyle: {
    width: '100%',
    opacity: 1,
  },
  headerCardItemStyle: {
    flexDirection: 'column',
    marginBottom: 2,
    paddingTop: 25,
  },
  headerContentStyle: {

  },
  closeButtonStyle: {
    flex: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
  },
  closeButtonTextStyle: {
  },
  mainHeadingStyle: {
    fontFamily: fonts.bold,
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
    letterSpacing: 1,
    lineHeight: 23,
    textAlign: 'center',
  },
  inputItemStyle: {
    marginTop: 20,
    borderColor: 'transparent',
    width: '100%',
    height: 50,
  },
  inputStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    fontSize: Dimensions.get('window').width < 375 ? 16 : 18,
  },
  invitationFooterStyle: {
  },
  FooterContentStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: Dimensions.get('window').width < 375 ? 0 : 16,
    paddingBottom: Dimensions.get('window').width < 375 ? 0 : 16,
  },
  footerButton: {
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 6,
    paddingBottom: 0,
  },
  submitButton: {
    color: 'green',
    fontFamily: fonts.bold,
    letterSpacing: 2,
  },
};

class PromoModal extends Component {
  state = {
    promo: '',
  }

  handleOnChange = (text) => {
    this.setState({
      promo: text,
    });
  }

  handleSubmitPress = () => {
    const { promo } = this.state;
    this.props.handleSubmitPress(promo);
  }

  render() {
    const {
      passcodeTitleLabel, passcodeDescLabel, passcodeLabel, passcodeSubmitLabel, theme,
    } = this.props;

    return (
      <View style={[styles.containerContentStyle, { backgroundColor: theme.bgColor }]}>
        <CardItem style={[styles.headerCardItemStyle, { backgroundColor: theme.bgColor }]}>
          <Button transparent onPress={this.props.handleCloseModal} style={styles.closeButtonStyle}>
            <Text style={[styles.closeButtonTextStyle, { color: theme.textColor }]}><Icon style={{ color: theme.textColor }} name="ios-close" /></Text>
          </Button>
          <View style={[styles.headerContentStyle]}>
            <TextSize small={Dimensions.get('window').width < 375} base={Dimensions.get('window').width >= 375} style={[styles.mainHeadingStyle, { color: theme.textColor }]}>{passcodeTitleLabel}</TextSize>
          </View>
        </CardItem>
        <CardItem style={{ backgroundColor: theme.bgColor2 }}>
          <Body style={[styles.invitationBodyStyle, { backgroundColor: theme.bgColor2 }]}>
            <TextSize small={Dimensions.get('window').width < 375} base={Dimensions.get('window').width >= 375}style={[styles.consentQuestionStyle, { color: theme.textColor }]}>{passcodeDescLabel}</TextSize>
            <Form>
              <Item regular style={[styles.inputItemStyle, { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.textColor2 }, Dimensions.get('window').width <= 320 ? { height: 35 } : null]}>
                <Input
                  placeholder={passcodeLabel} placeholderTextColor={theme.textColor2} onChangeText={text => this.handleOnChange(text)} style={styles.inputStyle} />
              </Item>
            </Form>
          </Body>
        </CardItem>
        <CardItem style={[styles.invitationFooterStyle, { backgroundColor: theme.bgColor }]}>
          <View style={[styles.FooterContentStyle, { backgroundColor: theme.bgColor }]}>
            <Button style={[styles.footerButton]} onPress={() => this.handleSubmitPress()}>
              <TextSize base style={styles.submitButton}>{passcodeSubmitLabel}</TextSize>
            </Button>
          </View>
        </CardItem>
      </View>
    );
  }
}

PromoModal.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmitPress: PropTypes.func,
  passcodeTitleLabel: PropTypes.string,
  passcodeDescLabel: PropTypes.string,
  passcodeLabel: PropTypes.string,
  passcodeSubmitLabel: PropTypes.string,
};

export default PromoModal;
