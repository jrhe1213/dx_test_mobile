import React, { Component } from 'react';
import {
  View, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import {
  Text,
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
} from './CardTypes';

import fonts from '../styles/fonts';
import * as colors from '../styles/variables';

class DxCard extends Component {
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
  handleCardType = (ExperienceCard, contentWidth, contentHeight) => {
    const {
      localData, folderName, type, currentTab, userGUID, isContentUpdated,
    } = this.props;

    // Calculate the width based on the type
    const { Type } = ExperienceCard;

    if (Type === 'BACKGROUND_TEXT' || Type === 'BACKGROUND_IMAGE_TEXT' || Type === 'IMAGE' || Type === 'VIDEO') {
      contentHeight = 140;
    } else {
      contentHeight = 70;
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
            contentHeight={contentHeight}
          />
        );
      case 'BACKGROUND_IMAGE_TEXT':
        return (
          <BackgroundImageText
            experienceCard={ExperienceCard}
            handlePressCard={() => this.handlePressCard()}
            localData={localData}
            folderName={folderName}
            currentTab={currentTab}
            userGUID={userGUID}
            contentWidth={contentWidth}
            contentHeight={contentHeight}
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
            currentTab={currentTab}
            userGUID={userGUID}
            contentWidth={70}
            contentHeight={contentHeight}
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
            currentTab={currentTab}
            userGUID={userGUID}
            contentWidth={70}
            contentHeight={contentHeight}
            isContentUpdated={isContentUpdated}
          />
        );
      case 'VIDEO':
        return (
          <VideoThumbnail
            videoLink={ExperienceCard.Content}
            contentWidth={contentWidth}
            contentHeight={contentHeight}
            handlePressCard={() => this.handlePressCard()}
            isConnected={this.props.isConnected}
            videoNotAvailableLabel={this.props.videoNotAvailableLabel}
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
            contentWidth={contentWidth}
            contentHeight={contentHeight}
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
      dateWrapperStyle,
      iconLableStyle,
      channelNameStyle,
      titleStyle,
      cardContainerStyle,
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
      cardTitleColor,
      isNightMode,
      bookmarkedAt,
      type,
    } = this.props;

    const contentHeight = 140;
    const contentWidth = 140;

    return (
      <View style={[mainContainerStyle, { width: contentWidth }]}>
        {disabled ? (
          <View style={hoverContainerStyle}>
            <TextSize small style={hoverTextStyle}>{internetAccesssLabel}</TextSize>
          </View>
        ) : null}
        <View style = {
          [cardContainerStyle, (type === 'SEARCH_CARD' && type === 'FEEDSPAGE_CARD') ? {
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          } : null, {
            height: contentHeight
          }, isNightMode ? {
            elevation: 0,
            shadowOpacity: 0
          } : null]
        }>
          {
            this.handleCardType(ExperienceCard, contentWidth, contentHeight)
          }
        </View>

        {
          (type !== 'SEARCH_CARD' && type !== 'FEEDSPAGE_CARD') && <View>
            <TextSize small numberOfLines={2} ellipsizeMode={'tail'} style={[titleStyle, { flexShrink: 1, color: cardTitleColor, fontSize: 12 }]}>
                {ExperienceTitle}
            </TextSize>

            <TouchableOpacity
              style={{ flex: 1, width: '100%' }}
              onPress={
                handleChannelNameClick
                  ? () => this.handleChannelNameClick()
                  : () => this.handlePressCard()
              }
            >
              <TextSize small numberOfLines={1} ellipsizeMode={'tail'} style={[channelNameStyle, { flexShrink: 1, fontSize: 12 }, { color: isNightMode && ChannelColor === '#000000' ? cardTitleColor : ChannelColor }]}>
                {ChannelName}
              </TextSize>
            </TouchableOpacity>

            {/* <View>
              <View style={dateWrapperStyle}>
                <Moment element={Text} format="YYYY-MM-DD h:mm a" style={iconLableStyle}>
                  {
                    currentTab === 'Bookmark' ? bookmarkedAt : CreatedAt
                  }
                </Moment>
              </View>
            </View> */}
          </View>
        }
      </View>
    );
  }
}

const styles = {
  mainContainerStyle: {
    position: 'relative',
  },
  channelNameStyle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 3,
  },
  titleStyle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 10,
  },
  dateWrapperStyle: {
    flexDirection: 'row',
  },
  iconStyle: {
    fontSize: 14,
    width: 12,
    marginRight: 4,
    color: '#85909A',
  },
  iconLableStyle: {
    fontSize: 10,
    color: '#85909A',
    fontFamily: fonts.light,
    marginTop: 1,
    letterSpacing: 1,
  },
  cardContainerStyle: {
    backgroundColor: 'transparent',
    shadowColor: colors.btnBlue,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
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
    borderRadius: 5,
  },
  hoverTextStyle: {
    color: colors.white,
    lineHeight: 24,
    textAlign: 'center',
  },
};

export default DxCard;
