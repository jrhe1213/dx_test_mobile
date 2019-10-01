import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import actions from '../../actions';

// Helpers
import { headerForIphoneX } from '../../../../helpers';

// Components
import {
  Footer,
  DxProgressBar,
} from '../../../../components';

// Helpers
import { truncate } from '../../../../helpers';

class FooterNavigator extends Component {
  static propTypes = {
    feed: PropTypes.object,
    dx_feed_back: PropTypes.func,
    dx_feed_back_complete: PropTypes.func,
    dx_section_suggest_browser: PropTypes.func,
    navigation: PropTypes.object,
    bookmarks: PropTypes.object,
    scrollLabel: PropTypes.string,
    continueReadingLabel: PropTypes.string,
    completedLabel: PropTypes.string,
    continueToFeedbackLabel: PropTypes.string,
  }

  handleBtnPress = () => {
    const {
      currentTab,
      currentExperienceStreamGUID,
      experienceStreamWithChannelInfo,
      feed: { document },
      bookmarks,
      isTagEnable,
    } = this.props;

    if (document.IsCompleted) {
      // Go to feed-back page
      this.props.dx_feed_back(currentExperienceStreamGUID, experienceStreamWithChannelInfo);
    } else if (currentTab == 'Feedback') {
      // Submit feed back & go to feed
      experienceStreamWithChannelInfo.Experience.ExperiencePages.IsFeedbackCompleted = true;
      this.props.dx_feed_back_complete(currentExperienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable);
    } else {
      // Suggestion reading
      this.props.dx_section_suggest_browser(bookmarks.sections);
    }
  }

  render() {
    const {
      displayProgressBar,
      currentTab,
      feed: {
        document,
        current_level_section,
        current_suggest_section,
      },
      scrollLabel,
      continueReadingLabel,
      completedLabel,
      continueToFeedbackLabel,
      backToHomeLabel,
      thankYouLabel,
      theme,
    } = this.props;

    let title;
    let subtitle;
    if (!current_suggest_section) {
      title = 'pending title';
      subtitle = 'pending sub title';
    } else {
      if (current_suggest_section.Type == 'FEEDBACK') {
        title = completedLabel;
      } else if (currentTab == 'Feedback') {
        title = backToHomeLabel;
      } else {
        title = continueReadingLabel;
      }
      subtitle = current_suggest_section.Title ? current_suggest_section.Title : current_suggest_section.SectionGUID;
    }
    subtitle = subtitle.length > 28 ? truncate(subtitle, 28) : subtitle;

    return (
      <View>
        {/* {
          currentTab == 'Section' && displayProgressBar
            ? <DxProgressBar
              record={current_level_section ? current_level_section.Completion : 0}
              progress={current_level_section ? current_level_section.Completion : 0}
              isbottom={current_level_section.IsBottom}
              scrollLabel={scrollLabel}
              theme={theme}
            />
            : null
        } */}
        {
          document.IsCompleted && document.IsFeedbackCompleted
            ? <View style={{ height: current_suggest_section.Type == 'FEEDBACK' && headerForIphoneX ? 30 : 0 }}></View>
            : <Footer
              title={title}
              subtitle={subtitle}
              handleBtnPress={() => this.handleBtnPress()}
              hasArrow={currentTab != 'Feedback'}
              continueToFeedbackLabel={continueToFeedbackLabel}
              thankYouLabel={thankYouLabel}
              theme={theme}
            />
        }
      </View>
    );
  }
}

const stateToProps = state => ({
  currentTab: state.nav.currentTab,
  feed: state.feed,
  bookmarks: state.bookmark.bookmarks,
  currentExperienceStreamGUID: state.feed.currentExperienceStreamGUID,
  experienceStreamWithChannelInfo: state.feed.experienceStreamWithChannelInfo,

  theme: state.setting.theme,

  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  dx_feed_back: (experienceStreamGUID, experienceStreamWithChannelInfo) => dispatch(actions.dx_feed_back(experienceStreamGUID, experienceStreamWithChannelInfo)),
  dx_feed_back_complete: (experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable) => dispatch(actions.dx_feed_back_complete(experienceStreamGUID, experienceStreamWithChannelInfo, isTagEnable)),
  dx_section_suggest_browser: bookmarks => dispatch(actions.dx_section_suggest_browser(bookmarks)),
});

export default compose(connect(stateToProps, dispatchToProps), withNavigation)(FooterNavigator);
