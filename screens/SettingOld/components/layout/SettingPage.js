import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';

// Libraries
import { StackActions, NavigationActions } from 'react-navigation';
import {
    ListItem
} from 'react-native-elements';

// components
import { DxContainer } from '../../../../styles/grid';
import HeaderNavigator from '../container/HeaderNavigator';

//constants
import global_constants from '../../../../constants';
import colors from '../../../../constants/colors';

// redux
import { connect } from 'react-redux';
import actions from '../../actions';

class SettingPage extends Component {

    handleLogout = () => {
        
    }

    handleNavigate = (index) => {
        if (index == 1) {
            this.props.dx_preference();
        } else if (index == 2) {
            this.props.dx_privacy();
        } else if (index == 3) {
            this.props.dx_help();
        }
    }

    render() {

        const list = [
            {
                name: 'Preferences',
                chevon: true,
                onPress: () => this.handleNavigate(1)
            },
            {
                name: 'Settings & Pivacy',
                chevon: true,
                onPress: () => this.handleNavigate(2)
            },
            {
                name: 'Help & Support',
                chevon: true,
                onPress: () => this.handleNavigate(3)
            }
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
                    title="Settings"
                    isSearchIcon={true}
                    isAddIcon={true}
                />
                <View style={contentWrapperStyle}>
                    <ScrollView contentContainerStyle={contentContainerStyle}>
                        {
                            list.map((item, index) => (
                                <ListItem
                                    containerStyle={listItemStyle}
                                    key={index}
                                    chevron={item.chevon}
                                    subtitle={item.name}
                                    onPress={() => item.onPress()}
                                />
                            ))
                        }
                    </ScrollView>
                </View>
            </DxContainer>
        )
    }
}

const styles = {
    mainContainerStyle: {
        backgroundColor: colors.whiteColor
    },
    contentWrapperStyle: {
        //flex: 1,
    },
    contentContainerStyle: {
        height: Platform.OS === 'ios' ? Dimensions.get('window').height - 64 - 48: Dimensions.get('window').height - 64 - 48,
    },
    listItemStyle: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#DCE0E4'
    }
}

const stateToProps = (state) => {
    return {

    }
}

const dispatchToProps = (dispatch) => {
    return {
        dx_preference: () => dispatch(actions.dx_preference()),
        dx_privacy: () => dispatch(actions.dx_privacy()),
        dx_help: () => dispatch(actions.dx_help()),
        logout: () => dispatch({ type: global_constants.LOGOUT }),
    }
}

export default connect(stateToProps, dispatchToProps)(SettingPage);