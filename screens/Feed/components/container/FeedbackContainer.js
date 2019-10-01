import React, { Component } from 'react';
import {
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import actions from '../../actions';

// Components
import FeedbackCard from '../presentation/FeedbackCard';
import FeedbackStar from '../presentation/FeedbackStar';
import FeedbackTextCard from '../presentation/FeedbackTextCard';

// Constants
import * as colors from '../../../../styles/variables';

class FeedbackContainer extends Component {
  static propTypes = {
    postFeedback: PropTypes.func,
  }

  state = {
    starCount: 3,
    q1: true,
    q3: false,
    comments: '',
  };

  handleBtnClick = (bol, index) => {
    if (index == 1) {
      this.setState({
        q1: bol,
      });
    } else {
      this.setState({
        q3: bol,
      });
    }
  }

  handleStarRatingPress = (starCount) => {
    this.setState({
      starCount,
    });
  }

  handleText = (text) => {
    this.setState({
      comments: text,
    });
  }

  handleSubmit = () => {
    const {
      starCount, q1, q3, comments,
    } = this.state;

    const data = {
      stars: starCount,
      q1,
      q3,
      comments,
      UserGUID: this.props.userGUID,
    };
    this.props.postFeedback(data);

    // Clears the form
    this.setState({
      starCount: 3,
      q1: true,
      q3: false,
      comments: '',
    });
  }

  render() {

    const {
      yesLabel, 
      noLabel,
      questionOneLabel,
      questionTwoLabel,
      questionThreeLabel,
      questionFourLabel,
      typeSomethingLabel,
      theme
    } = this.props;

    const {
      contentContainerStyle,
    } = styles;

    // console.log('Feedback container');

    return (
      <ScrollView contentContainerStyle={[contentContainerStyle, { backgroundColor: theme.bgColor }]}>
        <FeedbackCard
          question={questionOneLabel}
          isTrue={this.state.q1}
          handleBtnClick={bol => this.handleBtnClick(bol, 1)}
          yesLabel={yesLabel} 
          noLabel={noLabel}
          theme={theme}
        />
        <FeedbackStar
          question={questionTwoLabel}
          onStarRatingPress={starCount => this.handleStarRatingPress(starCount)}
          starCount={this.state.starCount}
          theme={theme}
        />
        <FeedbackCard
          question={questionThreeLabel}
          isTrue={this.state.q3}
          handleBtnClick={bol => this.handleBtnClick(bol, 3)}
          yesLabel={yesLabel} 
          noLabel={noLabel}
          theme={theme}
        />
        <FeedbackTextCard
          question={questionFourLabel}
          typeSomethingLabel={typeSomethingLabel}
          handleText={text => this.handleText(text)}
          theme={theme}
        />
      </ScrollView>
    );
  }
}

const styles = {
  contentContainerStyle: {
    paddingTop: 9,
    paddingBottom: 9,
    flexGrow: 1,
  },
  buttonText: {
    letterSpacing: 2,
    fontSize: 18,
  },
};

const mapStateToProps = state => ({
  userGUID: state.user.userGUID,
  theme: state.setting.theme,
});

const mapDispatchToProps = dispatch => ({
  postFeedback: data => dispatch(actions.postFeedback(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackContainer);
