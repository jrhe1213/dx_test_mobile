import React, { PureComponent } from 'react';
import {
  View,
} from 'react-native';

// Redux
import { connect } from 'react-redux';

// Components
import SpinnerLoader from '../../../../components/DxSpinner';

// Constants
import * as colors from '../../../../styles/variables';

const styles = {
  mainContainerStyle: {
    height: '100%',
    justifyContent: 'center',
    backgroundColor: colors.bgColor,
  },
};

class Spinner extends PureComponent {
  render() {
    const {
      isFirstLoading, theme
    } = this.props;

    const {
      mainContainerStyle,
    } = styles;

    return (
      <View>
        {
          isFirstLoading
            ? <View style={[mainContainerStyle, { backgroundColor: theme.bgColor }]}>
              <SpinnerLoader />
            </View>
            : null
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isFirstLoading: state.download.isFirstLoading,
  theme: state.setting.theme,
});

const dispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, dispatchToProps)(Spinner);
