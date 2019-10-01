import React, { Component } from 'react';
import {
  View, Dimensions, Platform, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import {
  Text,
} from 'native-base';
import { TextSize } from '../styles/types';

// Components
import {
  DxTextContent,
  DxImage,
  DxHtmlModal,
  DxLink,
  DxPdf,
  DxH5P,
  DxAccordion,
  DxAudio,
} from '.';
import DxVideoThumbnail from './DxVideoThumbnail';

import fonts from '../styles/fonts';
import * as colors from '../styles/variables';

import {
  getRootPath,
} from '../utils/fileSystem';

// Config
import * as config from '../config';

// Images
import imagesIcon from '../assets/images/Icons/sharp-image.png';
import videoIcon from '../assets/images/Icons/sharp-video_library.png';
import pdfIcon from '../assets/images/Icons/sharp-picture_as_pdf.png';
import textIcon from '../assets/images/Icons/sharp-text_fields.png';
import linkIcon from '../assets/images/Icons/sharp-link.png';
import otherIcon from '../assets/images/Icons/sharp-blur_circular.png';
import audioIcon from '../assets/images/Icons/audio.png';

// Libraries
import FastImage from 'react-native-fast-image';


class DxSectionCard extends Component {
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
  handleSectionType = (section) => {
    const { userGUID, storageDownloads } = this.props;

    if (!section) {
      return null;
    }

    const {
      ExperienceStreamGUID,
      ExperienceGUID,
    } = section;

    // Check is downloaded
    const isDownloaded = storageDownloads.filter(
      stream => stream.ExperienceStreamGUID === ExperienceStreamGUID,
    );
   
    let sourceLink;
    let blurSourceLink;
    if (isDownloaded.length) {
      sourceLink = getRootPath('downloadFeeds', userGUID, ExperienceStreamGUID);
      blurSourceLink = getRootPath('downloadFeeds', userGUID, ExperienceStreamGUID);
    } else if (section.Type == 'EMBED_PDF' || section.Type == 'EDITOR') {
      sourceLink = `${config.default.viewBaseLink + ExperienceGUID}/`;
    } else if (section.Type == 'IMAGE') {
      sourceLink = `${config.formatImageLink(section.Img)}`;
      blurSourceLink = `${config.formatImageLink(section.Img)}&Type=BLUR`;
    }

    switch (section.Type) {
      case 'EMBED_PDF':
        return (
          <View style={{ flex: 1 }}>
            <DxPdf
              key={section.SectionGUID}
              source={`${sourceLink}${section.Pdf}.pdf`}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              pdfLabel={section.PdfLabel}
              pdfBgColor={section.PdfBgColor}
              currentTab="Bookmark"
            />
          </View>
        );

      case 'EDITOR':
        return (
            <DxHtmlModal
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              source={`${sourceLink}${section.Html}.html`}
              handlePressContent={() => { }}
              currentTab="Bookmark"
            />
        );

      case 'VIDEO':
        return (
          <DxVideoThumbnail
            videoLink={section.VideoUrl}
            handleVideoPress={() => this.props.redirectVideoScreen(section.VideoUrl, '0')}
            isConnected={this.props.isConnected}
            videoNotAvailableLabel={this.props.videoNotAvailableLabel}
            currentTab="Bookmark"
          />
        );

      case 'TEXT':
        return (
          <DxTextContent
            key={section.SectionGUID}
            content={section.Content}
            currentTab="Bookmark"
          />
        );

      case 'IMAGE':
        return (
          <DxImage
            key={section.SectionGUID}
            section={section}
            targetSectionGUID={section.SectionGUID}
            source={`${sourceLink}${isDownloaded.length ? `${section.Img}.jpg` : ''}`}
            blurSource={`${blurSourceLink}${isDownloaded.length ? `${section.Img}_blur.jpg` : ''}`}
            currentTab="Bookmark"
          />
        );

      case 'LINK':
        return (
          <View style={{ flex: 1 }}>
            <DxLink
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              link={section.Link}
              linkLabel={section.LinkLabel}
              linkColor={section.LinkColor}
              linkBgColor={section.LinkBgColor}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
              currentTab="Bookmark"
            />
          </View>
        );

      case 'H5P':
        return (
          <View style={{ flex: 1 }}>
            <DxH5P
              key={section.SectionGUID}
              targetSectionGUID={section.ExperienceStreamGUID + section.SectionGUID}
              h5p={section.H5p}
              h5pLabel={section.H5pLabel}
              h5pBgColor={section.H5pBgColor}
              h5pFilename={section.H5pFileName}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
              currentTab="Bookmark"
            />
          </View>
        );

      case 'ACCORDION':
        return (
          <DxAccordion
            key={section.SectionGUID}
            accordionData={section.AccordionArr}
            targetSectionGUID={section.SectionGUID}
            contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
            handlePressContent={() => { }}
            currentTab="Bookmark"
          />
        );

      case 'AUDIO':
        return (
            <DxAudio
              key={section.SectionGUID}
              section={section}
              isImageCover={section.IsImgCover}
              targetSectionGUID={section.SectionGUID}
              source={`${sourceLink}${section.Audio}.mp3`}
              audioLabel={section.AudioLabel}
              audioBgColor={section.AudioBgColor}
              audioFilename={section.AudioFileName}
              contentWidth={`width: calc(${Dimensions.get('window').width}px - 38px);`}
              imgSource={`${sourceLink}${isDownloaded.length ? `${section.AudioImg}.jpg` : ''}`}
              blurImageSource={`${blurSourceLink}${isDownloaded.length ? `${section.AudioImg}_blur.jpg` : ''}`}
              currentTab="Bookmark"
              sectionCardHeight="100%"
            />
        )

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
      section,
      isNightMode,
    } = this.props;

    const contentHeight = 140;
    const contentWidth = 140;

    let imageSrc;
    if (section.Type === 'EMBED_PDF') {
      imageSrc = pdfIcon;
    } else if (section.Type === 'EDITOR' || section.Type === 'ACCORDION') {
      imageSrc = textIcon;
    } else if (section.Type === 'VIDEO') {
      imageSrc = videoIcon;
    } else if (section.Type === 'TEXT') {
      imageSrc = textIcon;
    } else if (section.Type === 'IMAGE') {
      imageSrc = imagesIcon;
    } else if (section.Type === 'LINK') {
      imageSrc = linkIcon;
    } else if (section.Type === 'H5P') {
      imageSrc = otherIcon;
    } else if (section.Type === 'AUDIO') {
      imageSrc = audioIcon;
    }

    return (
      <View style={[mainContainerStyle, {
        position: 'relative',
      }]}>
        <View style={[cardContainerStyle, {
          width: contentWidth,
          height: contentHeight,
          borderRadius: 5,
          overflow: 'hidden',
          backgroundColor: '#fff',
        }, isNightMode ? { elevation: 0, shadowOpacity: 0 } : null]}>
          {
            this.handleSectionType(section)
          }

          <View style={styles.iconOverlayStyle}>
            <FastImage
              style={styles.imageStyle}
              source={imageSrc}
            />
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
            {/* <TextSize
              small
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={[{ flexShrink: 1 }, channelNameStyle, { color: '#000' }, { color: isNightMode ? '#fff' : null }]}>
              Title
            </TextSize> */}


            <View style={dateWrapperStyle}>
              <Moment element={Text} format="YYYY-MM-DD h:mm a" style={iconLableStyle}>
                {section.bookmarkedAt}
              </Moment>
            </View>

        </View>
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
  iconOverlayStyle: {
    width: 22,
    height: 22,
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.6,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
};

export default DxSectionCard;
