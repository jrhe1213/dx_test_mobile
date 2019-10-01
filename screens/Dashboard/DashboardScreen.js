import React, { Component } from 'react';
import {
    View,
    Text,
} from 'react-native';

// redux
import { connect } from 'react-redux';
import actions from './actions';


class DashboardScreen extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);

        this.state = {

        };
    }    

    render() {
        return (
            <View>
               <Text>123</Text> 
            </View>
        )
    }
}

const styles = {
    
};

const stateToProps = (state) => {
    return {
        
    }
}

const dispatchToProps = (dispatch) => {
    return {
        
    }
}

export default connect(stateToProps, dispatchToProps)(DashboardScreen);