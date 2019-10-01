import React, { Component } from 'react';
import PropTypes from 'prop-types';

// components
import { connect } from 'react-redux';
import { Header } from '../../../../components';

// redux
import actions from '../../actions';

// constants
import colors from '../../../../constants/colors';

class HeaderNavigator extends Component {
    static propTypes = {
      current_level_section: PropTypes.object,
    }

    handleBackNavigate = () => {

    }

    render() {
      const {
        current_level_section,
      } = this.props;
      const {
        isBackIcon,
        isSearchIcon,
        isHamburgerIcon,
        isAddIcon,
        isDownloadIcon,
      } = this.props;

      return (
            <Header
                title={this.props.title}
                color={colors.blackColor}
                isBackIcon={isBackIcon}
                isSearchIcon={isSearchIcon}
                isHamburgerIcon={isHamburgerIcon}
                isAddIcon={isAddIcon}
                isDownloadIcon={isDownloadIcon}
                handleBackIconPress={() => this.handleBackNavigate()}
            />
      );
    }
}

const stateToProps = state => ({

});

const dispatchToProps = dispatch => ({

});

export default connect(stateToProps, dispatchToProps)(HeaderNavigator);
