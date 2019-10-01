import React, { Component } from 'react';
import {
  View,
  Dimensions,
  Platform,
} from 'react-native';

// Components
import DxCard from '../../../../components/DxCard';
import DxSectionCard from '../../../../components/DxSectionCard';

// Constants
import { headerForIphoneX } from '../../../../helpers';

const styles = {
  slideStyle: {
    width: 145,
  },
};

class SlideItem extends Component {
  static propTypes = {

  };

  render() {
    const {
      currentTab,
      deviceInfo: {
        internetInfo: {
          isConnected,
        },
        language,
      },
      slide: {
        item,
      },
      userGUID,
      cardTitleColor,
      theme,
      isNightMode,
      storageDownloads,
    } = this.props;

    const dxCardLabels = language ? language.DxCard : [];
    const errorMessage = language ? language.Message : [];

    let postByLabel;
    let internetAccesssLabel;
    let videoNotAvailableLabel;

    dxCardLabels.map((label) => {
      if (label.Type === 'POST') { postByLabel = label.Content; }
    });

    errorMessage.map((label) => {
      if (label.Type === 'REQUIRE_INTERNET_ACCESS') {
        internetAccesssLabel = label.Content;
      }
      if (label.Type === 'VIDEO_NOT_AVAILABLE') {
        videoNotAvailableLabel = label.Content;
      }
    });

    let tempLeft = 24;
    if(currentTab == 'Bookmark'){
      tempLeft = 15;
    }

    return (
      <View style={[styles.slideStyle, { marginLeft: tempLeft }]}>
      {
        item.SectionGUID
          ? <DxSectionCard
            section={item}
            cardTitleColor={cardTitleColor}
            isNightMode={isNightMode}
            internetAccesssLabel={internetAccesssLabel}
            isConnected={isConnected}
            videoNotAvailableLabel={videoNotAvailableLabel}
            userGUID={userGUID}
            storageDownloads={storageDownloads}
            redirectVideoScreen = {
              (data, experienceType) => this.props.redirectVideoScreen(data, experienceType)
            }
          />
          : <DxCard
          type="HOMEPAGE_CARD"
          currentTab={currentTab}
          disabled={!item.isDownloaded && !isConnected}
          experience={item}
          localData={item.isDownloaded}
          folderName={item.ExperienceStreamGUID}
          isContentUpdated={item.isContentUpdated}
          channelGUID={item.ExperienceChannelGUID}
          channelColor={item.ChannelColor}
          channelName={item.ChannelName}
          description={item.Experience.ExperienceCard.Content}
          createdAt = {item.CreatedAt}
          bookmarkedAt={item.bookmarkedAt}
          handlePressCard={() => this.props.handlePressCard(item)}
          handleChannelNameClick={channel => this.props.handleChannelNameClick(channel)}
          postByLabel={postByLabel}
          internetAccesssLabel={internetAccesssLabel}
          isConnected={isConnected}
          videoNotAvailableLabel={videoNotAvailableLabel}
          userGUID={userGUID}
          cardTitleColor={cardTitleColor}
          isNightMode={isNightMode}
        />
      }
      </View>
    );
  }
}

export default SlideItem;
