import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

// Components
import DxCard from '../../../../components/DxCard';

// Libraries
import Moment from 'react-moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
import * as colors from '../../../../styles/variables';
import fonts from '../../../../styles/fonts';

const styles = {
  itemContainerStyle: {
    width: '100%',
    padding: 12,
    shadowColor: colors.btnBlue,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    display: 'flex',
    flexDirection: 'row',
  },
  rightContainerStyle: {
    marginLeft: 12,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  expTitleStyle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    flexShrink: 1,
  },
  channelNameStyle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    flexShrink: 1,
    paddingTop: 4,
  },
  channelContainerStyle: {
    display: "flex",
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  dateTimeContainerStyle: {
    marginBottom: 'auto',
  },
  iconLableStyle: {
    textAlign: 'left',
    fontSize: 10,
    paddingRight: 3,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
  tagsContainerStyle: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    flex: 1,
  },
  tagsWrapperStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    flexWrap: 'wrap',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  tagItemStyle: {
    borderWidth: 1,
    paddingTop: 4,
    // paddingBottom: 2,
    paddingRight: 10,
    paddingLeft: 10,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  tagTextStyle: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    lineHeight: 16,
  }
};

class ContentCard extends Component {
  static propTypes = {
  };

  renderTags = () => {
    const { experience: { Experience: { Tags } }, theme } = this.props;
    const {
      tagItemStyle,
      tagTextStyle,
    } = styles;

    return (
      Tags.slice(0, 3).map((tag, i) => (
        <View key={`${tag}__${i}`} style={Object.assign({}, tagItemStyle, { borderColor: theme.textColor2, maxWidth: 110, paddingTop: Platform.OS == 'android' ? 0 : 4 }, Dimensions.get('window').width < 325 ? { paddingTop: Platform.OS == 'android' ? 0 : 2 } : null)}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={Object.assign({}, tagTextStyle, { color: theme.textColor, flexShrink: 1 }, Dimensions.get('window').width < 325 ? { fontSize: 8 } : null)}>{tag}</Text>
        </View>
      ))
    )
  }

  render() {
    const {
      itemContainerStyle,
      rightContainerStyle,
      expTitleStyle,
      channelContainerStyle,
      channelNameStyle,
      dateTimeContainerStyle,
      tagsContainerStyle,
      iconLableStyle,
      tagTextStyle,
      tagsWrapperStyle,
    } = styles;

    const {
      currentTab,
      experience,
      isNightMode,
      theme,
      isConnected,
      userGUID,
      internetAccesssLabel,
      videoNotAvailableLabel,
      type,
      showChannelName,
    } = this.props;

    console.log('this.props.localData: ', this.props.localData);

    return (
      <View style={Object.assign({}, itemContainerStyle, { backgroundColor: (type === "FEEDSPAGE_CARD" || currentTab === 'Tag') ? theme.bgColor2 : theme.bgColor }, isNightMode ? { elevation: 0, shadowOpacity: 0 } : null)}>
        <DxCard
          type={type}
          currentTab={currentTab}
          disabled={!experience.isDownloaded && !isConnected}
          experience={experience}
          localData={experience.isDownloaded}
          folderName={experience.ExperienceStreamGUID}
          isContentUpdated={experience.isContentUpdated}
          channelGUID={experience.ExperienceChannelGUID}
          channelColor={experience.ChannelColor}
          channelName={experience.ChannelName}
          description={experience.Experience.ExperienceCard.Content}
          createdAt={experience.CreatedAt}
          bookmarkedAt={experience.bookmarkedAt}
          handlePressCard={() => this.props.handlePressCard(experience)}
          handleChannelNameClick={channel => this.props.handleChannelNameClick(channel)}

          internetAccesssLabel={internetAccesssLabel}
          isConnected={isConnected}
          videoNotAvailableLabel={videoNotAvailableLabel}
          userGUID={userGUID}
          cardTitleColor={theme.textColor}
          isNightMode={isNightMode}
        />

        <TouchableOpacity style={rightContainerStyle} onPress={() => this.props.handlePressCard(experience)}>
          <Text
            style={Object.assign({}, expTitleStyle, { color: theme.textColor }, Dimensions.get('window').width < 325 ? {
              fontSize: 12, letterSpacing: 1
            } : null)}
            numberOfLines={2}
            ellipsizeMode={'tail'}
          >
            {experience.Experience.ExperienceTitle}
          </Text>

          {
            (showChannelName && currentTab !== 'Featured') && <View style={
              channelContainerStyle
            } >
              <View style={Object.assign({}, { width: 10, height: 10, backgroundColor: experience.ChannelColor, borderRadius: 5, marginRight: 8 }, Dimensions.get('window').width < 325 ? { width: 8, height: 8, borderRadius: 4 } : null, Platform.OS == 'android' ? { marginTop: 4 } : null)} />
              <TouchableOpacity onPress={() => this.props.handleChannelNameClick(experience)}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={Object.assign({}, channelNameStyle, { color: theme.textColor2 }, Dimensions.get('window').width < 325 ? { fontSize: 10, letterSpacing: 1, paddingTop: Platform.OS == 'ios' ? 2 : 0 } : null)}
                >
                  {experience.ChannelName}
                </Text>
              </TouchableOpacity>
            </View>
          }
          <View styles={dateTimeContainerStyle}>
            <Moment
              element={Text}
              format="YYYY-MM-DD h:mm a"
              style={[iconLableStyle, { color: theme.textColor2 }, , Dimensions.get('window').width < 325 ? { fontSize: 8 } : null]}
            >
              {experience.CreatedAt}
            </Moment>
          </View>
          {
            (experience.Experience.Tags && experience.Experience.Tags.length > 0) ? <View style={tagsContainerStyle}>
              <View style={tagsWrapperStyle}>
                {this.renderTags()}
                {
                  experience.Experience.Tags.length > 2 &&
                  <Text style={Object.assign({}, tagTextStyle, { color: theme.textColor, marginRight: 6, paddingTop: Platform.OS == 'android' ? 2 : 6 }, Dimensions.get('window').width < 325 ? { fontSize: 8 } : null)}>{`+ ${experience.Experience.Tags.length - 3} tags`}</Text>
                }
              </View>
            </View> : null
          }
          {
            this.props.localData && <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
              <Icon
                style={{color: 'green'}}
                name="check-circle"
                size={24}
              />
            </View>
          }
        </TouchableOpacity>
      </View>
    );
  }
}

export default ContentCard;
