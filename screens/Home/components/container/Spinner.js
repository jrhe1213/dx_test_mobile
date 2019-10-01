import React, { PureComponent } from 'react';
import {
  View,
} from 'react-native';

// Redux
import { connect } from 'react-redux';

// Components
import SpinnerLoader from '../../../../components/DxSpinner';

class Spinner extends PureComponent {

  render() {

    const {
      isLoading
    } = this.props;

    return (
      // <View>
      //   {
      //     isLoading ?
      //       <SpinnerLoader />
      //       :
      //       null
      //   }
      // </View>
    )
  }
}

const mapStateToProps = state => ({
  isLoading: state.explore.isLoading
});

const dispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, dispatchToProps)(Spinner);