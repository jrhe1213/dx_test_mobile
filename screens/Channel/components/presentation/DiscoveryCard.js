import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

// Library
import {
  Icon,
  Left,
  Right,
} from 'native-base';
import Moment from 'react-moment';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

const styles = {
  containerStyle: {
    marginBottom: 12,
    // width: '46.5%',
    marginRight: 6,
    marginLeft: 6,
    flex: 1,
    height: 155,
    // alignSelf: 'stretch',
  },
  boxContainerStyle: {
    flex: 1,
  },
  topContainerStyle: {
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 5,
    flex: 1,
  },
  channelNameStyle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    // marginBottom: 8,
  },
  channelDescriptionStyle: {
    fontFamily: fonts.light,
    lineHeight: 16,
  },
  bottomContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  iconLableStyle: {
    fontFamily: fonts.light,
    letterSpacing: 1,
    textAlign: 'left',
    paddingRight: 12,
    marginTop: 2,
    color: '#85909A',
  },
  titleIconStyle: {
    fontSize: 20,
    color: colors.gray,
    marginBottom: -6,
  },
  totalCountStyle: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  createdDateStyle: {
    fontFamily: fonts.light,
    fontSize: 12,
    marginTop: 3,
  },
};

class DiscoveryCard extends Component {
  static propTypes = {
    channelLastView: PropTypes.string,
    channelName: PropTypes.string,
    channelDescription: PropTypes.string,
    channelType: PropTypes.string,
    openModal: PropTypes.func,
    channelColor: PropTypes.string,
    navigation: PropTypes.func,
    closeModal: PropTypes.func,
    handleSubscribe: PropTypes.func,
    readMoreLabel: PropTypes.string,
    showLessLabel: PropTypes.string,
    noDescLabel: PropTypes.string,
    feedLabel: PropTypes.string,
    totalFeedCount: PropTypes.number,
  }

  handleChannelPress = () => {
    const {
      IsHardInterest, navigation,
    } = this.props;

    if (IsHardInterest === 0) {
      this.props.handleSubscribe();
    }
    navigation();
  }

  handleInfoModalOpen = (channelName, channelDescription, channelColor) => {
    const data = {
      channelName,
      channelDescription,
      channelColor,
    };
    this.props.handleInfoModalOpen(data);
  }

  render() {
    const {
      channelName,
      channelDescription,
      channelType,
      channelColor,
      noDescLabel,
      feedLabel,
      totalFeedCount,
      channelLastView,
      theme,
      numberOfStream,
      isNightMode,
      fullSizeCard,
      cardType,
    } = this.props;

    const {
      bottomContainerStyle,
      topContainerStyle,
      channelDescriptionStyle,
      containerStyle,
      channelNameStyle,
      iconLableStyle,
      boxContainerStyle,
      titleIconStyle,
      totalCountStyle,
      createdDateStyle,
    } = styles;

    // Invited Privtae channel check
    const isPrivate = (channelType === '2');

    return (
      <View style={[containerStyle, Platform.OS == 'android' ? {
        marginTop: 12,
        marginBottom: 12,
      } : null]}>
        <View
          style={[topContainerStyle,
            {
              backgroundColor: cardType === "searchCard" ? theme.bgColor : theme.bgColor2,
              shadowColor: colors.btnBlue,
            }, isNightMode ? {
              elevation: 0,
              shadowOpacity: 0,
            } : null,
          ]}
        >
          <TouchableOpacity
            style={boxContainerStyle}
            onPress={() => this.handleChannelPress()}
          >
            <Text style={[channelNameStyle, { color: channelColor === '#000000' ? theme.textColor : channelColor }]}>{channelName}</Text>
            <View>
              <Text
                numberOfLines={3}
                ellipsizeMode={'tail'}
                style={[channelDescriptionStyle, { color: theme.textColor, flexShrink: 1 }]}
              >
                {
                  channelDescription || noDescLabel
                }
              </Text>
            </View>
          </TouchableOpacity>

          <View style={bottomContainerStyle}>
            <Left style={{
              margin: 0, padding: 0, justifyContent: 'flex-end', height: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                {isPrivate
                  ? <Icon
                      style={[titleIconStyle, { color: theme.textColor, marginRight: 6 }]}
                      name="ios-lock"
                    />
                  : null
                }

                <Text style={[totalCountStyle, { color: theme.textColor, marginBottom: -4 }]}>{numberOfStream} {feedLabel}</Text>

                {/* <Text style={[createdDateStyle, { color: theme.textColor2 }]}>
                  <Moment
                    element={Text}
                    format="YYYY-MM-DD"
                    style={iconLableStyle}
                  >{channelLastView}</Moment>
                </Text> */}
              </View>
            </Left>
            {
              ((fullSizeCard && channelDescription.length > 250) || (!fullSizeCard && channelDescription.length > 70))
                ? <Right style={{
                  margin: 0, padding: 0, justifyContent: 'flex-end', height: 20,
                }}>
                <TouchableOpacity
                  style={{ paddingLeft: 6 }}
                  onPress={() => this.handleInfoModalOpen(channelName, channelDescription, channelColor)}
                >
                <Icon
                  style={[titleIconStyle, { color: theme.textColor }]}
                  name="information-circle"
                />
                </TouchableOpacity>
              </Right> : null
          }
          </View>
        </View>
      </View>
    );
  }
}

export default DiscoveryCard;
