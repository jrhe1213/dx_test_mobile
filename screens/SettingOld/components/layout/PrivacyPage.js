import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';

// Libraries
import {
  ListItem,
} from 'react-native-elements';

// components
import { connect } from 'react-redux';
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';

//constants
import colors from '../../../../constants/colors';

// redux
import actions from '../../actions';

class PrivacyPage extends Component {
    state = {
      document: true,
      wallet: false,
    }

    handleValChange = (val, index) => {
      if (index == 0) {
        this.setState({
          document: val,
        });
      } else {
        this.setState({
          wallet: val,
        });
      }
    }

    render() {
      const prefList = [
        {
          index: 0,
          name: 'Find nearby documents',
          val: this.state.document,
        },
        {
          index: 1,
          name: 'Automatically save feed content to wallet',
          val: this.state.wallet,
        },
      ];
      const {
        mainContainerStyle,
        contentWrapperStyle,
        contentContainerStyle,
        listItemStyle,
      } = styles;

      return (
            <DxContainer style={mainContainerStyle}>
                <HeaderNavigator
                    title="Settings & Privacy"
                    isBackIcon={true}
                    isSearchIcon={true}
                    isAddIcon={true}
                    navigation={this.props.navigation}
                />
                <View style={contentWrapperStyle}>
                    <ScrollView
                        contentContainerStyle={contentContainerStyle}>
                        {
                            prefList.map((item, index) => (
                                <ListItem
                                    containerStyle={listItemStyle}
                                    key={index}
                                    subtitle={item.name}
                                    rightElement={
                                        <Switch
                                            value={item.val}
                                            onValueChange={val => this.handleValChange(val, item.index)} />
                                    }
                                />
                            ))
                        }
                    </ScrollView>
                </View>
            </DxContainer>
      );
    }
}

const styles = {
  mainContainerStyle: {
    backgroundColor: colors.whiteColor,
  },
  contentWrapperStyle: {
    flex: 1,
  },
  contentContainerStyle: {
    height: Dimensions.get('window').height - 64,
  },
  listItemStyle: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#DCE0E4',
  },
};

const stateToProps = (state) => ({

    });

const dispatchToProps = (dispatch) => ({

    });

export default connect(stateToProps, dispatchToProps)(PrivacyPage);
