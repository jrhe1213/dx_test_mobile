import React, { Component } from 'react';
import {
  View, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import {
  Content, Card, CardItem, Text,
} from 'native-base';
import { TextSize } from '../styles/types';

// Libraries
import {
  BackgroundImageText,
  BackgroundText,
  ImageCard,
  LeftImage,
  RightImage,
  VideoThumbnail,
} from './CardTypes2';

import fonts from '../styles/fonts';
import * as colors from '../styles/variables';

class DxCard2 extends Component {
  static propTypes = {
    experience: PropTypes.object,
    handlePressCard: PropTypes.func,
    channelColor: PropTypes.string,
    channelName: PropTypes.string,
    createdAt: PropTypes.string,
    description: PropTypes.string,
    channelGUID: PropTypes.string,
    handleChannelNameClick: PropTypes.func,
    type: PropTypes.string,
  };

  handlePressCard = () => {
    const { handlePressCard, experience } = this.props;
    handlePressCard(
      experience.ExperienceStreamGUID,
      experience.Experience.ExperienceGUID,
      experience,
    );
  };

  // Handling the channel name click

  handleChannelNameClick = () => {
    const {
      handleChannelNameClick,
      experience: { ChannelName, ChannelColor, ExperienceChannelGUID },
    } = this.props;
    const channel = {
      ChannelName,
      ChannelColor,
      ExperienceChannelGUID,
    };
    handleChannelNameClick(channel);
  };

  // Handling the types of cards
  handleCardType = (ExperienceCard, theme) => {
    const {
      localData,
      folderName,
      height,
      type,
      currentTab,
      userGUID,
      isContentUpdated,
    } = this.props;

    // Calculate the width based on the type
    const { Type } = ExperienceCard;

    let contentWidth;
    if (
      type === 'FEEDSPAGE_CARD'
      || type === 'DOWNLOADSPAGE_CARD'
      || type === 'BOOKMARKSPAGE_CARD'
    ) {
      if (Dimensions.get('window').width <= 320) {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 252px;'
          : 'width: 168px;';
      } else if (Platform.OS === 'ios' && Dimensions.get('window').width <= 375) {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 309px;'
          : 'width: 204px;';
      } else if (Platform.OS === 'android' && Dimensions.get('window').width <= 365) {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 293px;'
          : 'width: 195px;';
      } else if (Platform.OS === 'ios' && Dimensions.get('window').width <= 415) {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 347px;'
          : 'width: 232px;';
      } else if (Platform.OS === 'android' && Dimensions.get('window').width <= 445) {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 344px;'
          : 'width: 228px;';
      } else {
        contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
          ? 'width: 347px;'
          : 'width: 232px;';
      }
    } else {
      contentWidth = Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT'
        ? 'width: 100%;'
        : 'width: 100%;';
    }

    switch (ExperienceCard.Type) {
      case 'BACKGROUND_TEXT':
        return (
          <BackgroundText
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            contentWidth={contentWidth}
            theme={theme}
          />
        );
      case 'BACKGROUND_IMAGE_TEXT':
        return (
          <BackgroundImageText
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            contentWidth={contentWidth}
            currentTab={currentTab}
            userGUID={userGUID}
            theme={theme}
            isContentUpdated={isContentUpdated}
          />
        );
      case 'LEFT_IMAGE_TEXT':
        return (
          <LeftImage
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            contentWidth={contentWidth}
            currentTab={currentTab}
            userGUID={userGUID}
            theme={theme}
            isContentUpdated={isContentUpdated}
          />
        );
      case 'RIGHT_IMAGE_TEXT':
        return (
          <RightImage
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            contentWidth={contentWidth}
            currentTab={currentTab}
            userGUID={userGUID}
            theme={theme}
            isContentUpdated={isContentUpdated}
          />
        );
      case 'VIDEO':
        return (
          <VideoThumbnail
            videoLink={ExperienceCard.Content}
            handlePressCard={() => this.handlePressCard()}
            isConnected={this.props.isConnected}
            videoNotAvailableLabel={this.props.videoNotAvailableLabel}
            theme={theme}
          />
        );
      case 'IMAGE':
        return (
          <ImageCard
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            currentTab={currentTab}
            userGUID={userGUID}
            theme={theme}
            isContentUpdated={isContentUpdated}
          />
        );
      default:
        return null;
    }
  };

  render() {
    const {
      mainContainerStyle,
      hoverContainerStyle,
      hoverTextStyle,
      cardContainerStyle,
      cardItemStyle,
      topContainerStyle,
      dateWrapperStyle,
      iconLableStyle,
      postedByStyle,
      channelNameStyle,
      headerCardStyle,
    } = styles;

    const {
      disabled,
      handleChannelNameClick,
      experience: {
        ChannelName = '',
        ChannelColor = '',
        CreatedAt = '',
        Experience: { ExperienceCard, ExperienceType, ExperienceTitle },
      },
      fullWidth,
      currentTab,
      postByLabel,
      internetAccesssLabel,
      theme,
      isNightMode,
    } = this.props;

    return (
      <Content style={mainContainerStyle}>
        {disabled ? (
          <View style={hoverContainerStyle}>
            <TextSize small style={hoverTextStyle}>
              {internetAccesssLabel}
            </TextSize>
          </View>
        ) : null}
        <Card
          style={Object.assign(
            {},
            cardContainerStyle,
            { shadowColor: colors.btnBlue, backgroundColor: theme.bgColor2 },
            { width: fullWidth ? Dimensions.get('window').width - 24 : null },
            isNightMode ? { elevation: 0, shadowOpacity: 0 } : null,
          )}
        >
          <CardItem
            style={Object.assign({}, cardItemStyle, topContainerStyle, {
              backgroundColor: theme.bgColor2,
            })}
          >
              
                <TextSize
                  small
                  numberOfLines={2}
                  ellipsizeMode={'tail'}
                  style={[
                    channelNameStyle,
                    {
                      flexShrink: 1,
                      color: theme.textColor,
                      marginLeft: 0,
                      marginBottom: 3,
                      fontSize: 14,
                    },
                  ]}
                >
                  {ExperienceTitle}
                </TextSize>
              
            <View style={headerCardStyle}>
              {currentTab !== 'Feed' && (
                <React.Fragment>
                  <TextSize
                    small
                    style={Object.assign({}, postedByStyle, { color: theme.textColor })}
                  >
                    {postByLabel}
                  </TextSize>

                  <TouchableOpacity
                    style={{ flex: 1, width: '100%' }}
                    onPress={
                      handleChannelNameClick
                        ? () => this.handleChannelNameClick()
                        : () => this.handlePressCard()
                    }
                  >
                    <TextSize
                      small
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={[
                        { flexShrink: 1 },
                        channelNameStyle,
                        {
                          color:
                            isNightMode && ChannelColor === '#000000'
                              ? theme.textColor
                              : ChannelColor,
                        },
                      ]}
                    >
                      {ChannelName}
                    </TextSize>
                  </TouchableOpacity>
                </React.Fragment>
              )}
            </View>
            <View style={dateWrapperStyle}>
              <Moment
                element={Text}
                format="YYYY-MM-DD h:mm a"
                style={[iconLableStyle, { color: theme.textColor2 }]}
              >
                {CreatedAt}
              </Moment>
            </View>
          </CardItem>

          {this.handleCardType(ExperienceCard, theme)}
        </Card>
      </Content>
    );
  }
}

const styles = {
  mainContainerStyle: {
    position: 'relative',
    margin: 0,
    padding: 0,
  },
  hoverContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 3,
  },
  hoverTextStyle: {
    fontFamily: fonts.regular,
    color: colors.white,
    lineHeight: 24,
    textAlign: 'center',
  },
  cardContainerStyle: {
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  cardItemStyle: {},
  topContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerCardStyle: {
    flexDirection: 'row',
  },
  postedByStyle: {
    fontFamily: fonts.light,
    fontSize: 12,
    letterSpacing: 2,
  },
  dotContainerStyle: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 0,
  },
  channelNameStyle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginLeft: 3,
  },
  subContainerStyle: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  dateWrapperStyle: {
    flexDirection: 'row',
  },
  iconLableStyle: {
    textAlign: 'left',
    fontSize: 10,
    paddingRight: 3,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  titleStyle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
};

export default DxCard2;
