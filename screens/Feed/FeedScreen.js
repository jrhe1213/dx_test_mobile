import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import { DxContainer } from '../../styles/grid';
import FeedPage from './components/layout/FeedPage';

// Redux
import { connect } from 'react-redux';
import actions from './actions';

class FeedScreen extends Component {

  componentDidMount(){ 
    this.props.updateFeedChannel(this.props.clickedChannel);
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.currentTab !== "Section") {
      if (this.props.clickedChannel !== nextProps.clickedChannel || (this.props.clickedChannel && nextProps.clickedChannel &&  this.props.clickedChannel.ExperienceChannelGUID != nextProps.clickedChannel.ExperienceChannelGUID)) {
        this.props.updateFeedChannel(nextProps.clickedChannel);
      }
    }
  }

  render() {
    return (
      <DxContainer>
        <FeedPage />
      </DxContainer>
    )
  }
}

FeedScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  searchToggle: state.search.searchToggle,
  clickedChannel: state.channel.clickedChannel,
  currentTab: state.nav.currentTab,
  previousTab: state.nav.previousTab,
})

const dispatchToProps = dispatch => ({
  updateFeedChannel: channel => dispatch(actions.updateFeedChannel(channel)),
});

export default connect(
  mapStateToProps,
  dispatchToProps,
)(FeedScreen);
