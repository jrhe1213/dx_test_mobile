import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import modalActions from '../../../../actions/Modal';

// Components
import LanguageModal from '../../../../modals/LanguageModal';

class LanguageModalConatiner extends Component {
  static propTypes = {
    currentTab: PropTypes.string,
    languages: PropTypes.array,
    selectedLanguage: PropTypes.object,
    selectLanguageLabel: PropTypes.string,
    closeModal: PropTypes.func,
  };

  componentDidMount() {
    if (this.props.currentTab === 'Language') {
      this.props.closeModal();
    }
  }

  render() {
    const {
      languages,
      selectedLanguage,
      currentTab,
      selectLanguageLabel,
    } = this.props;

    if (currentTab === 'Language') {
      return null;
    }

    return (
      <LanguageModal selectedLanguage={selectedLanguage} languages={languages} selectLanguageLabel={selectLanguageLabel} />
    );
  }
}


const mapStateToProps = state => ({
  currentTab: state.nav.currentTab,
});

const dispatchToProps = dispatch => ({
  closeModal: () => dispatch(modalActions.closeModal()),
});
export default connect(mapStateToProps, dispatchToProps)(LanguageModalConatiner);
