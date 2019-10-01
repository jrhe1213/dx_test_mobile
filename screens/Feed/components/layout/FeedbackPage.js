import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import actions from '../../actions';

// Components
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';
import FooterNavigator from '../container/FooterNavigator';
import FeedbackContainer from '../container/FeedbackContainer';
import SummaryPage from '../presentation/SummaryPage';

// Constants
import * as colors from '../../../../styles/variables';

class FeedbackPage extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  static navigationOptions = {
    header: null,
  }

  handleCloseFeedbackPage = () => {
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
      currentTab,
      current_level_section,
      language,
      theme,
      timeSpent,
      numberOfImpressions,
    } = this.props;

    const {
      wrapperStyle,
      contentWrapperStyle,
      footerContainerStyle,
      headerContainerStyle,
      feedbackContainerStyle,
    } = styles;

    if (currentTab !== 'Feedback') {
      return null;
    }

    const languageCheck = language || {};
    const feedBackLabels = languageCheck.FeedbackScreen ? languageCheck.FeedbackScreen : [];

    let thankYouLabel;
    let backToHomeLabel;
    let feedbackLabel;
    let metricsLabel;
    let engagementLabel;
    let interactionsLabel;
    let timeSpentLabel;
    let minutesLabel;
    let questionFourLabel;
    let typeSomethingLabel;

    feedBackLabels.map((label) => {
      if (label.Type === 'FEEDBACK') { feedbackLabel = label.Content; }
      if (label.Type === 'YES') { metricsLabel = label.Content; }
      if (label.Type === 'NO') { engagementLabel = label.Content; }
      if (label.Type === 'BACK_TO_HOME') { backToHomeLabel = label.Content; }
      if (label.Type === 'THANK_YOU') { thankYouLabel = label.Content; }
      if (label.Type === 'QUESTION_ONE') { interactionsLabel = label.Content; }
      if (label.Type === 'QUESTION_TWO') { timeSpentLabel = label.Content; }
      if (label.Type === 'QUESTION_THREE') { minutesLabel = label.Content; }
      if (label.Type === 'QUESTION_FOUR') { questionFourLabel = label.Content; }
      if (label.Type === 'INPUT_LABEL') { typeSomethingLabel = label.Content; }
    });

    console.log('Feedback page');

    return (
      <DxContainer>
        <View style={[contentWrapperStyle, { backgroundColor: theme.bgColor }]}>
          <View style={headerContainerStyle} >
            <HeaderNavigator
              title={current_level_section && current_level_section.Title}
              isFeedList={false}
              feedbackLabel={feedbackLabel}
              isClose={true}
              handleCloseFeedbackPage={this.handleCloseFeedbackPage}
            />
          </View>
          {/* <KeyboardAvoidingView style={[wrapperStyle, { backgroundColor: theme.bgColor }]} behavior={(Platform.OS === 'ios') ? 'position' : null} enabled>
            <View style={[feedbackContainerStyle, { backgroundColor: theme.bgColor }]}>
              <FeedbackContainer
                yesLabel={yesLabel}
                noLabel={noLabel}
                questionOneLabel={questionOneLabel}
                questionTwoLabel={questionTwoLabel}
                questionThreeLabel={questionThreeLabel}
                questionFourLabel={questionFourLabel}
                typeSomethingLabel={typeSomethingLabel}
              />
            </View>
            <View style={footerContainerStyle}>
              <FooterNavigator
                navigation={this.props.navigation}
                backToHomeLabel={backToHomeLabel}
                thankYouLabel={thankYouLabel}
              />
            </View>
          </KeyboardAvoidingView> */}
          <View style={[wrapperStyle, { backgroundColor: theme.bgColor }]}>
            <View style={[feedbackContainerStyle, { backgroundColor: theme.bgColor }]}>
              <SummaryPage
                numberOfImpressions={numberOfImpressions}
                timeSpent={timeSpent}
                theme={theme}
                metricsLabel={metricsLabel}
                engagementLabel={engagementLabel}
                interactionsLabel={interactionsLabel}
                timeSpentLabel={timeSpentLabel}
                minutesLabel={minutesLabel}
              />
            </View>
            <View style={footerContainerStyle}>
              <FooterNavigator
                navigation={this.props.navigation}
                backToHomeLabel={backToHomeLabel}
                thankYouLabel={thankYouLabel}
              />
            </View>
          </View>
        </View>
      </DxContainer>
    );
  }
}

const styles = {
  contentWrapperStyle: {
    //  position: 'relative',
    height: '100%',
  },
  wrapperStyle: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: Dimensions.get('window').height > 735 ? 84 : 64,
    position: 'relative',
  },
  feedbackContainerStyle: {
    marginBottom: 'auto',
    // paddingBottom: Dimensions.get('window').width <= 414 ? 64 : 0,
  },
  headerContainerStyle: {
    height: 64,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  footerContainerStyle: {
    // position: 'absolute',
    //   left: 0,
    //   bottom: Dimensions.get('window').height >= 812 ? -64 : 0,
    //   zIndex: 100,
    width: Dimensions.get('window').width,
    marginTop: 'auto',
  },
};

const stateToProps = state => ({
  currentTab: state.nav.currentTab,
  current_level_section: state.feed.current_level_section,
  language: state.deviceInfo.language,
  numberOfImpressions: state.feed.experienceStreamWithChannelInfo.numberOfImpressions,
  timeSpent: state.feed.experienceStreamWithChannelInfo.timeSpent,

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

export default connect(stateToProps, dispatchToProps)(FeedbackPage);
