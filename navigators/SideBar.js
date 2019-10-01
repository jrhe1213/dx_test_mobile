import React, { Component } from 'react';
import {
  Image,
  View,
  AsyncStorage,
} from 'react-native';

// Libraries
import {
  Content,
  Header,
  Icon,
  Container,
  ListItem,
  Left,
  Text,
} from 'native-base';
import UserAvatar from 'react-native-user-avatar';
import PropTypes from 'prop-types';

// Navigation
import { withNavigation } from 'react-navigation';

// Redux
import { connect } from 'react-redux';
import actions from '../screens/Login/actions';
import downloadActions from '../screens/Download/actions';
import deviceActions from '../actions/DeviceInfo';
import settingActions from '../screens/Setting/actions';
import registerActions from '../screens/Register/actions';

// fonts
import fonts from '../styles/fonts';

// Images
import defaultAvatar from '../assets/images/avatar.jpg';

const styles = {
  drawerHeader: {
    height: 150,
    borderBottomWidth: 0,
    elevation: 0,
  },
  drawerHeaderImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerHeaderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 0,
  },
  drawerItemName: {
    marginLeft: 30,
    fontSize: 16,
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  drawerLeftContent: {
    alignItems: 'center',
  },
  drawerItemIcon: {
    fontSize: 26,
    width: 28,
  },
  userName: {
    marginTop: 14,
    flexDirection: 'row',
  },
  userNameText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    letterSpacing: 1,
    marginRight: 5,
  },
};

const logoImg = require('../assets/images/logo_placeholder.png');

class SideBar extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    dispatch: PropTypes.func,
    deviceInfo: PropTypes.object,
    settingsPageOpen: PropTypes.func,
    logoutRequest: PropTypes.func,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    currentTab: PropTypes.string,
    openRegisterPage: PropTypes.func,
    openDownloadPage: PropTypes.func,
  }

  handleDownloadPress = () => {
    this.props.navigation.closeDrawer();
    setTimeout(() => {
      this.props.openDownloadPage();
    }, 1000);
  }

  handleLogoutPress = () => {
    const {
      isRequesting
    } = this.props;
    this.props.navigation.closeDrawer();

    setTimeout(() => {
      if (!isRequesting) {
        this.props.logoutRequest();
      }
    }, 1000);
  }

  handleOpenSettingsPage = () => {
    this.props.navigation.closeDrawer();
    setTimeout(() => {
      this.props.settingsPageOpen();
    }, 1000);
  }

  fetchAllItems = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);

      // console.log('AsyncStorage: ', items);
    } catch (error) {
      // console.log(error, 'problemo');
    }
  }

  handleOpenRegister = () => {
    this.props.navigation.closeDrawer();
    setTimeout(() => {
      this.props.openRegisterPage();
    }, 1000);
  }


  render() {
    const {
      isSkipLoginSuccess,
      isLoginRequired,
      isSelfRegister,
      isAnonymous,

      deviceInfo,
      firstName,
      lastName,
      imgSrc,
    } = this.props;

    const {
      bgColor, bgColor2, textColor, primaryColor,
    } = this.props.theme;

    const sideLabels = deviceInfo.language ? deviceInfo.language : {};

    const sidebarLabels = sideLabels.SideBar ? sideLabels.SideBar : [];

    // Destructing Labels for the page
    let downloadLabel;
    let logoutLabel;
    let registerLabel;
    let settingsLabel;
    let anonymousLabel;

    sidebarLabels.map((label) => {
      if (label.Type === 'DOWNLOAD') {
        downloadLabel = label.Content;
      }
      if (label.Type === 'REGISTER') {
        registerLabel = label.Content;
      }
      if (label.Type === 'SETTINGS') {
        settingsLabel = label.Content;
      }
      if (label.Type === 'LOGOUT') {
        logoutLabel = label.Content;
      }
      if (label.Type === 'ANONYMOUS') {
        anonymousLabel = label.Content;;
      }
    });

    let allowMigrate = false;
    let hideLogout = false;
    if (isSkipLoginSuccess
      && !isLoginRequired
      && isAnonymous) {
      hideLogout = true;
    }
    if (isSkipLoginSuccess
      && isLoginRequired
      && isAnonymous
      && isSelfRegister) {
      allowMigrate = true;
    }

    const formattedFirstName = firstName || (anonymousLabel || 'Anonymous');
    const formattedLastName = lastName || '';

    return (
      <Container>
        <Header style={[styles.drawerHeader, { backgroundColor: bgColor }]}>
          <View style={[styles.drawerHeaderImageContainer, { backgroundColor: bgColor }]}>
            <UserAvatar 
              size="90" 
              name={formattedFirstName.charAt(0).toUpperCase() || 'A'} 
            />
            <View style={[styles.userName, { width: 200, justifyContent: 'center' }]}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={[styles.userNameText, { color: textColor }, { flexShrink: 1 }]}>
                {`${formattedFirstName}${formattedLastName ? ' ' : ''}${formattedLastName}`}
              </Text>
            </View>
          </View>
        </Header>
        <Content contentContainerStyle={{ paddingTop: 12, flex: 1, backgroundColor: bgColor2 }}>
          {
            allowMigrate
            && <ListItem
              Icon
              button
              noBorder
              onPress={this.handleOpenRegister}
            >
              <Left style={styles.drawerLeftContent}>
                <Icon style={[styles.drawerItemIcon, { color: textColor }]} name="person-add" />
                <Text style={[styles.drawerItemName, { color: textColor }]}>{registerLabel}</Text>
              </Left>
            </ListItem>
          }

          <ListItem
            Icon
            button
            noBorder
            onPress={this.handleDownloadPress}
          >
            <Left style={styles.drawerLeftContent}>
              <Icon style={[styles.drawerItemIcon, { color: textColor }]} name="cloud-download" />
              <Text style={[styles.drawerItemName, { color: textColor }]}>{downloadLabel}</Text>
            </Left>
          </ListItem>
          <ListItem
            Icon
            button
            noBorder
            onPress={this.handleOpenSettingsPage}
          >
            <Left style={styles.drawerLeftContent}>
              <Icon style={[styles.drawerItemIcon, { color: textColor }]} name="settings" />
              <Text style={[styles.drawerItemName, { color: textColor }]}>{settingsLabel}</Text>
            </Left>
          </ListItem>
          {
            !hideLogout && <ListItem
              Icon
              button
              noBorder
              onPress={this.handleLogoutPress}
            >
              <Left style={styles.drawerLeftContent}>
                <Icon style={[styles.drawerItemIcon, { color: textColor }]} name="log-out" />
                <Text style={[styles.drawerItemName, { color: textColor }]}>{logoutLabel}</Text>
              </Left>
            </ListItem>
          }
          {/* <ListItem
            Icon
            button
            noBorder
            onPress={this.fetchAllItems}
          >
            <Left style={styles.drawerLeftContent}>
              <Icon style={[styles.drawerItemIcon, { color: textColor }]} name="log-out" />
              <Text style={[styles.drawerItemName, { color: textColor }]}>Show Storage</Text>
            </Left>
          </ListItem> */}
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  deviceInfo: state.deviceInfo,
  currentTab: state.nav.currentTab,
  firstName: state.user.firstName,
  lastName: state.user.lastName,
  imgSrc: state.user.imgUrl,
  theme: state.setting.theme,

  isSkipLoginSuccess: state.deviceInfo.isSkipLoginSuccess,
  isLoginRequired: state.deviceInfo.isLoginRequired,
  isSelfRegister: state.deviceInfo.isSelfRegister,
  isAnonymous: state.deviceInfo.isAnonymous,

  isRequesting: state.deviceInfo.isRequesting
});

const mapDispatchToProps = dispatch => ({
  logoutRequest: () => dispatch(actions.logoutRequest()),
  openDownloadPage: () => dispatch(downloadActions.openDownloadPage()),
  languagePageOpen: () => dispatch(deviceActions.languagePageOpen()),
  settingsPageOpen: () => dispatch(settingActions.settingsPageOpen()),
  openRegisterPage: () => dispatch(registerActions.openRegisterPage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(SideBar));
