import React, { Component } from 'react';
import PropTypes from 'prop-types';

// redux
import actions from './actions';

// components
import { DxContainer } from '../../styles/grid';
import SettingPage from './components/layout/SettingPage';

class SettingScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  }

  render() {
    return (
            <DxContainer>
                <SettingPage
                    navigation={this.props.navigation}
                />
            </DxContainer>
    );
  }
}

export default SettingScreen;
