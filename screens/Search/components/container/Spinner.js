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
  },
};

class Spinner extends PureComponent {
  render() {
    const {
      isLoading, theme,
    } = this.props;

    const {
      mainContainerStyle,
    } = styles;

    return (
      <View>
        {
          isLoading
            ? <View style={[mainContainerStyle, { backgroundColor: theme.bgColor2 }]}>
              <SpinnerLoader />
            </View>
            : null
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
});

const dispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, dispatchToProps)(Spinner);
