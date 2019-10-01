import React, { Component } from 'react';
import {
    View,
    Dimensions,
    TouchableHighlight,
    Image,
    Text,
} from 'react-native';

// Libraries
// import Camera from 'react-native-camera';

// redux
import { connect } from 'react-redux';
import actions from './actions';
import FastImage from 'react-native-fast-image';

class DemoScreen extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);

        this.state = {
            path: null,
        };
    }

    handleBtnPress = () => {
        this.props.test("my new message");
    }

    takePicture() {
        this.camera.capture()
            .then((data) => {
                // console.log(data);
                this.setState({ path: data.path })
            })
            .catch(err => console.error(err));
    }

    renderCamera() {
        return (
            <Camera
                ref={(cam) => {
                    this.camera = cam;
                }}
                style={styles.preview}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.disk}
            >
                <TouchableHighlight
                    style={styles.capture}
                    onPress={this.takePicture.bind(this)}
                    underlayColor="rgba(255, 255, 255, 0.5)"
                >
                    <View />
                </TouchableHighlight>
            </Camera>
        );
    }

    renderImage() {
        return (
            <View>
                <FastImage
                    source={{ uri: this.state.path }}
                    style={styles.preview}
                />
                <Text
                    style={styles.cancel}
                    onPress={() => this.setState({ path: null })}
                >Cancel
            </Text>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.path ? this.renderImage() : this.renderCamera()}
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    capture: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 5,
        borderColor: '#FFF',
        marginBottom: 15,
    },
    cancel: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: 'transparent',
        color: '#FFF',
        fontWeight: '600',
        fontSize: 17,
    }
};

const stateToProps = (state) => {
    return {
        message: state.demo.message
    }
}

const dispatchToProps = (dispatch) => {
    return {
        test: (message) => dispatch(actions.test(message)),
    }
}

export default connect(stateToProps, dispatchToProps)(DemoScreen);