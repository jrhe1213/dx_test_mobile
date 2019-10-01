import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {View, Platform} from 'react-native';
//  Libraries
import { Container, Tab, Tabs, } from 'native-base';

// Redux
import { connect } from 'react-redux';
import searchActions from '../../actions';

// Components
import ContentTabContainer from './ContentTabContainer';
import TagsTabContainer from './TagsTabContainer';
import ChannelsTabContainer from './ChannelsTabContainer';

// Fonts
import fonts from '../../../../styles/fonts';

class SearchContainer extends Component {
  static propTypes = {
  };

  state = {
    currentPage: 0
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        currentPage: this.props.currentIndex
      })
    }, 100);
  }

  componentWillReceiveProps(nextProps){
    if (this.props.currentIndex != nextProps.currentIndex){
      this.setState({
        currentPage: nextProps.currentIndex
      })
    }
  }
  

  render() {
    const {
      theme,
      isNightMode,
      tagLabel,
      channelLabel,
      contentLabel,
      tagNotFoundLabel,
      channelNotFoundLabel,
      contentNotFoundLabel,
      currentIndex,
      isTagEnable,
    } = this.props;

    return (
      <Container contentContainerStyle={{ backgroundColor: theme.bgColor2, flex: 1, padding: 0 }}>
        <Tabs
          tabBarUnderlineStyle={{ backgroundColor: theme.primaryColor }}
          onChangeTab={({ i }) => this.props.handleCurrentTab(i)}
          page={this.state.currentPage}
        >
          {
             isTagEnable && <Tab
              tabStyle={{ backgroundColor: theme.bgColor }}
              textStyle={{color: theme.textColor, fontFamily: fonts.bold}}
              activeTabStyle={Object.assign({}, isNightMode ? { backgroundColor: Platform.OS == 'android' ? theme.bgColor : 'rgba(0,0,0,.8)'} : { backgroundColor: Platform.OS == 'android' ? theme.bgColor : null })}
              activeTextStyle={{ color: theme.primaryColor }}
              heading={tagLabel || 'TAG'}
            >
              <View style={{ flex: 1, backgroundColor: isNightMode ? theme.bgColor2 : theme.bgColor  }}>
              <TagsTabContainer theme={theme} tagNotFoundLabel={tagNotFoundLabel} />
              </View>
            </Tab>
          }
          <Tab 
            tabStyle={{ backgroundColor: theme.bgColor }}
            textStyle={{ color: theme.textColor, fontFamily: fonts.bold}}
            activeTextStyle={{ color: theme.primaryColor }}
            activeTabStyle={Object.assign({}, isNightMode ? { backgroundColor: Platform.OS == 'android' ? theme.bgColor : 'rgba(0,0,0,.8)'} : { backgroundColor: Platform.OS == 'android' ? theme.bgColor : null })}
            heading={channelLabel || 'CHANNEL'}>
            <View style={{ flex: 1, backgroundColor: isNightMode ? theme.bgColor2 : theme.bgColor  }}>
              <ChannelsTabContainer theme={theme} channelNotFoundLabel={channelNotFoundLabel} />
            </View>
          </Tab>
          <Tab 
            tabStyle={{ backgroundColor: theme.bgColor }}
            textStyle={{ color: theme.textColor, fontFamily: fonts.bold}}
            activeTextStyle={{ color: theme.primaryColor }}
            activeTabStyle={Object.assign({}, isNightMode ? { backgroundColor: Platform.OS == 'android' ? theme.bgColor : 'rgba(0,0,0,.8)'} : { backgroundColor: Platform.OS == 'android' ? theme.bgColor : null })}
            heading={contentLabel || 'CONTENT'}>
            <View style={{ flex: 1, backgroundColor: isNightMode ? theme.bgColor2 : theme.bgColor  }}>
              <ContentTabContainer theme={theme} contentNotFoundLabel={contentNotFoundLabel} />
            </View>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

const styles = {
 
}


const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
  theme: state.setting.theme,
  isNightMode: state.setting.isNightMode,
  currentIndex: state.search.currentIndex,
  isTagEnable: state.deviceInfo.isTagEnable,
});

const dispatchToProps = dispatch => ({
  handleCurrentTab: index => dispatch(searchActions.handleCurrentTab(index)),
});
export default connect(mapStateToProps, dispatchToProps)(SearchContainer);
