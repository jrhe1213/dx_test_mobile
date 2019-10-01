import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
} from 'react-native';

// Libraries
import Modal from 'react-native-modal';

class DxModal extends Component {
  render() {
    const {
      modalOpen,
      transparent,
      children,
      center,
    } = this.props;

    // console.log('modal');

    if (!children) {
      return null;
    }

    return (
      <Modal
        animationIn='slideInUp'
        animationInTiming={300}
        animationOut='slideOutDown'
        animationOutTiming={300}
        isVisible={modalOpen}
        backdropColor={transparent ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,1)'}
        backdropOpacity={1}
        style={{ padding: 0, margin: 0 }}
      >
        <View style={Object.assign({}, styles.mainContainerStyle, center ? { justifyContent: 'center', alignItems: 'center' } : null)}>
          {children}
        </View>
      </Modal>
    );
  }
}

const styles = {
  mainContainerStyle: {
    flex: 1,
  },
};

DxModal.propTypes = {
  transparent: PropTypes.bool,
};

export default DxModal;
