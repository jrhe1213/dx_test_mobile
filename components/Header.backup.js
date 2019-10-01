import React, { Component } from 'react';
import {
  View, 
  Image, 
  Dimensions, 
  Platform, 
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';

// Libraries
import {
  Header as Head, 
  Button, 
  Icon, 
  Item, 
  Input, 
  Text,
} from 'native-base';

// Images
import closeIcon from '../assets/images/Icons/closeIcon.png';
import moreIcon from '../assets/images/Icons/moreIcon.png';
import homeIcon from '../assets/images/Icons/homeIcon.png';
import leftGoBackIcon from '../assets/images/Icons/leftGoBackIcon.png';
import searchIconImg from '../assets/images/Icons/searchIcon.png';

// Components
import DxHtmlReader2 from './DxHtmlReader2';

// Utils
import { headerForIphoneX } from '../helpers';

// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

const maxWidth = 260;
const maxHeight = 175;

class Header extends Component {
  static propTypes = {
    drawerOpen: PropTypes.func,
    title: PropTypes.string,
    channelColor: PropTypes.string,
    totalCount: PropTypes.string,
    color: PropTypes.string,
    experienceCount: PropTypes.number,
    isSplash: PropTypes.bool,
    splashContent: PropTypes.string,
    splashImg: PropTypes.string,
    splashColor: PropTypes.string,
    handleBackIconPress: PropTypes.func,
    currentTab: PropTypes.string,
    closePromoButton: PropTypes.func,
    openPromoButton: PropTypes.func,
    handleHomeBackPress: PropTypes.func,
    handleSearchIconPress: PropTypes.func,
    handleClearSearch: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
    };
  }

  handleBackIconPress = () => {
    this.props.handleBackIconPress();
  };

  handleHomeBackPress = () => {
    this.props.handleHomeBackPress();
  };

  handleSearchIconPress = () => {
    this.props.handleSearchIconPress(!this.props.isSearch);
    if (this.props.isSearch && this.props.inputValue) {
      this.props.handleClearSearch();
    }
    if (this.props.currentTab === 'Explore' && !this.props.isSearch) {
      this.props.openPromoButton();
    } else if (this.props.currentTab === 'Explore' && this.props.isSearch) {
      this.props.closePromoButton();
    } else {
      return null;
    }
  };

  handleHomeBackIconPress = () => {
    this.props.handleHomeBackIconPress();
  };

  handleImageLoaded(imageSrc) {
    // Image Algorithm
    if (imageSrc) {
      Image.getSize(imageSrc, (orginalWidth, originalHeight) => {
        // Ratio
        const ratio = orginalWidth / originalHeight;
        let tmpWidth = 0;
        let tmpHeight = 0;
        if (ratio > 1) {
          // 1
          if (orginalWidth > maxWidth) {
            // 1.1
            tmpWidth = maxWidth;
            tmpHeight = tmpWidth / ratio;
            if (tmpHeight > maxHeight) {
              tmpHeight = maxHeight;
            }
          } else {
            // 1.2
            tmpWidth = orginalWidth;
            tmpHeight = tmpWidth / ratio;
            if (tmpHeight > maxHeight) {
              tmpHeight = maxHeight;
            }
          }
        } else {
          // 2
          if (originalHeight > maxHeight) {
            // 2.1
            tmpHeight = maxHeight;
            tmpWidth = tmpHeight * ratio;
            if (tmpWidth > maxWidth) {
              tmpWidth = maxWidth;
            }
          } else {
            // 2.2
            tmpHeight = originalHeight;
            tmpWidth = tmpHeight * ratio;
            if (tmpWidth > maxWidth) {
              tmpWidth = maxWidth;
            }
          }
        }
        this.setState({
          width: tmpWidth,
          height: tmpHeight,
        });
      });
    }
  }

  render() {
    const {
      title,
      channelColor,
      experienceCount,
      isSearchIcon,
      isSplash,
      splashContent,
      splashImg,
      splashColor,
      currentTab,
      closePromoButton,
      openPromoButton,
      splashOpacity,
      splashOpacityColor,
      isFeedList,
      hiddenUserIcon,
      isClose,
      displayHomeBack,
      menuToggle,
    } = this.props;

    const { width, height } = this.state;

    const {
      headerContainerStyle,
      headerImageContainerStyle,
      topContainerStyle,
      leftContainerStyle,
      titleContainerStyle,
      rightContainerStyle,
      iconContainerStyle,
      iconFontStyle,
      bottomContainerStyle,
      descStyle,
      searchBarContainerStyle,
      backIconWrapperStyle,
      backIconStyle,
      homeBackIconStyle,
      userIconStyle,
      badgeStyle,
      badgeTextStyle,
      totalCountStyle,
      titleStyle,
      inputStyle,
      imgInputStyle,
      moreMenuContainerStyle,
      homeBackBtnStyle,
      closeIconStyle,
      overlay,
      splashIcon,
      searchIcon,
      menuContainerStyle,
      withoutSplashHeaderContainerStyle,
      iconImageStyle,
    } = styles;

    const fontColor = { color: splashColor || colors.blackColor };

    // Content width
    let contentWidth;
    if (Platform.OS === 'android' && Dimensions.get('window').width <= 445) {
      contentWidth = `width: calc(${Dimensions.get('window').width}px - 10px);`;
    } else {
      contentWidth = `width: calc(${Dimensions.get('window').width}px - 20px);`;
    }

    const headerWithImage = (
      <View style={Object.assign({}, headerContainerStyle, styles.relative)}>
        <Image
          style={headerImageContainerStyle}
          source={{ uri: splashImg }}
          onLoadEnd={() => this.handleImageLoaded(splashImg)}
          blurRadius={Platform.OS === 'android' ? 20 : 20}
        />
        <View style={styles.imageContainerStyle}>
          <Image style={{ width, height }} source={{ uri: splashImg }} />
        </View>
        <View
          style={Object.assign(
            {},
            overlay,
            {
              backgroundColor: splashOpacityColor,
            },
            { opacity: splashOpacity },
          )}
        />
        <View style={topContainerStyle}>
          {this.props.isSearch ? null : (
            <View style={leftContainerStyle}>
              {this.props.isBackIcon ? (
                isFeedList ? (
                  <Button onPress={() => this.handleBackIconPress()} transparent dark>
                    <Icon
                      name="ios-arrow-back-outline"
                      style={Object.assign({}, fontColor, iconFontStyle)}
                    />
                  </Button>
                ) : (
                    <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                      {displayHomeBack ? (
                        <Button
                          onPress={() => this.handleHomeBackPress()}
                          transparent
                          dark
                          style={{ marginRight: 7 }}
                        >
                          <Image source={homeIcon} style={iconImageStyle} />
                        </Button>
                      ) : null}
                      <Button onPress={() => this.handleBackIconPress()} transparent dark>
                        <Image source={leftGoBackIcon} style={iconImageStyle} />
                      </Button>
                    </View>
                )
              ) : null}
            </View>
          )}
          {this.props.isSearch ? null : (
            <View style={Object.assign({}, titleContainerStyle, Dimensions.get('window').width <= 320 ? { flex: 1 } : { flex: 2 })}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={Object.assign({}, fontColor, { flexShrink: 1, fontWeight: 'bold' })}
              >
                {this.props.title}
              </Text>
            </View>
          )}
          {this.props.isSearch ? (
            <Item style={searchBarContainerStyle}>
              <Input
                style={imgInputStyle}
                autoCapitalize="none"
                placeholder={this.props.inputPlaceholder}
                value={this.props.inputValue}
                onChangeText={val => this.props.handleChangeInput(val)}
              />
            </Item>
          ) : null}

          <View style={rightContainerStyle}>
            <View style={iconContainerStyle}>
              {this.props.isSearchIcon ? (
                <Button transparent dark onPress={() => this.handleSearchIconPress()}>
                  {this.props.isSearch ? (
                    <Image source={closeIcon} style={iconImageStyle} />
                  ) : (
                      <Image source={searchIcon} style={iconImageStyle} />
                  )}
                </Button>
              ) : null}
              {this.props.isHamburgerIcon ? (
                this.props.isSearch ? null : (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginRight: 12,
                    }}
                  >
                    <Button
                      transparent
                      dark
                      onPress={() => this.props.handleToggleMenu()}
                      block
                      style={{ marginRight: 7 }}
                    >
                      <Image source={moreIcon} style={iconImageStyle} />
                    </Button>
                    <Button transparent dark onPress={() => this.handleHomeBackIconPress()} block>
                      <Image source={closeIcon} style={iconImageStyle} />
                    </Button>
                  </View>
                )
              ) : null}
            </View>
          </View>
        </View>
        <View style={bottomContainerStyle}>
          <View
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <DxHtmlReader2
              source={splashContent}
              contentWidth={contentWidth}
              handlePressContent={() => this.props.handlePressContent()}
            />
          </View>
        </View>
      </View>
    );

    const headerWithoutImage = (
      <View
        style={Object.assign(
          {},
          withoutSplashHeaderContainerStyle,
          headerForIphoneX ? { height: 80 } : null,
        )}
      >
        {this.props.isSearch ? null : (
          <View style={leftContainerStyle}>
            {this.props.isBackIcon ? (
              isFeedList ? (
                <Button
                  onPress={() => this.handleBackIconPress()}
                  transparent
                  dark
                  style={backIconWrapperStyle}
                >
                  <Image
                    source={leftGoBackIcon}
                    style={Object.assign({}, iconImageStyle, { marginLeft: 12 }, Platform.OS == 'android' ? { marginBottom: 9 } : null)}
                  />
                </Button>
              ) : (
                  <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                    {displayHomeBack ? (
                      <Button
                        onPress={() => this.handleHomeBackPress()}
                        transparent
                        dark
                        style={{ marginRight: 7 }}
                      >
                        <Image source={homeIcon} style={iconImageStyle} />
                      </Button>
                    ) : null}
                    <Button onPress={() => this.handleBackIconPress()} transparent dark>
                      <Image source={leftGoBackIcon} style={iconImageStyle} />
                    </Button>
                  </View>
              )
            ) : hiddenUserIcon ? null : (
              <View>
                {isClose ? (
                  <Button
                    onPress={() => this.props.handleClosePage()}
                    transparent
                    dark
                    badge
                    iconLeft
                    block
                  >
                    <Image
                      source={closeIcon}
                      style={Object.assign({}, iconImageStyle, { marginLeft: 12 }, Platform.OS == 'android' ? { marginBottom: 9 } : null)}
                    />
                  </Button>
                ) : (
                    <Button onPress={() => this.props.drawerOpen()} transparent dark badge iconLeft>
                      <Icon
                        style={Object.assign(
                          {},
                          userIconStyle,
                          { width: 34, fontSize: 30 },
                          Platform.OS === 'android' ? { fontSize: 34, color: '#000', marginBottom: 9 } : null,
                        )}
                        name="ios-contact"
                      />
                    </Button>
                )}
              </View>
            )}
          </View>
        )}
        {this.props.isSearch ? null : (
          <View style={Object.assign({}, titleContainerStyle, { paddingBottom: 8 }, Dimensions.get('window').width <= 320 ? { flex: 1 } : { flex: 2 })}>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={[
                  { flexShrink: 1 },
                  titleStyle,
                  channelColor && { color: channelColor },
                  !isFeedList && Platform.OS == 'android' ? { marginBottom: 7 } : null,
                ]}
              >
                {title}
              </Text>
            </View>
            {!!experienceCount && <Text style={totalCountStyle}>{experienceCount} posts</Text>}
          </View>
        )}
        {this.props.isSearch ? (
          <View
            style={Object.assign(
              {},
              searchBarContainerStyle,
              Platform.OS == 'ios'
                ? {
                  paddingBottom: 6,
                }
                : {
                  height: 48,
                  paddingTop: 6,
                },
            )}
          >
            <TextInput
              style={Object.assign({}, inputStyle, { height: 30, padding: 0, margin: 0 })}
              autoCapitalize="none"
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder={this.props.inputPlaceholder}
              value={this.props.inputValue}
              onChangeText={val => this.props.handleChangeInput(val)}
            />
          </View>
        ) : null}
        <View style={rightContainerStyle}>
          {this.props.isSearchIcon ? (
            <View
              style={Object.assign(
                {},
                Platform.OS == 'ios' ? { paddingTop: 15 } : { paddingTop: 9 },
                headerForIphoneX ? { paddingTop: 35 } : null,
              )}
            >
              <Button
                style={Object.assign({}, backIconWrapperStyle, {
                  height: '100%',
                })}
                transparent
                dark
                block
                iconRight
                onPress={() => this.handleSearchIconPress()}
              >
                {
                  this.props.isSearch ? (
                    <Image
                      source={closeIcon}
                      style={Object.assign({}, iconImageStyle, Platform.OS == 'android' ? { marginBottom: 9 } : null)}
                    />
                  ) : (
                      <Image
                        source={searchIconImg}
                        style={Object.assign({}, iconImageStyle, Platform.OS == 'android' ? { marginBottom: 9 } : null)}
                      />
                  )
                }
              </Button>
            </View>
          ) : null}
          {this.props.isHamburgerIcon ? (
            this.props.isSearch ? null : (
              <View
                style={{
                  flexDirection: 'row',
                  marginRight: 12,
                }}
              >
                <Button
                  transparent
                  dark
                  onPress={() => this.props.handleToggleMenu()}
                  block
                  style={{ marginRight: 7 }}
                >
                  <Image source={moreIcon} style={iconImageStyle} />
                </Button>
                <Button transparent dark onPress={() => this.handleHomeBackIconPress()} block>
                  <Image source={closeIcon} style={iconImageStyle} />
                </Button>
              </View>
            )
          ) : null}
          {this.props.isAddIcon ? (
            <Button transparent dark>
              <Icon name="ios-add-circle-outline" />
            </Button>
          ) : null}
          {this.props.isDownloadIcon ? (
            <Button transparent dark>
              <Icon name="ios-cloud-download-outline" />
            </Button>
          ) : null}
        </View>
      </View>
    );

    return isSplash ? headerWithImage : headerWithoutImage;
  }
}

const headerContainerHeight = 180;
const headerHeight = 72;

const styles = {
  headerContainerStyle: {
    height: headerContainerHeight,
    margin: 0,
    padding: 0,
  },
  headerImageContainerStyle: {
    width: Dimensions.get('window').width,
    height: headerContainerHeight,
  },
  topContainerStyle: {
    height: headerHeight,
    flexDirection: 'row',
    position: 'absolute',
    top: headerForIphoneX ? 18 : 5,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  leftContainerStyle: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainerStyle: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainerStyle: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconContainerStyle: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  iconFontStyle: {
    fontSize: 30,
  },
  bottomContainerStyle: {
    // height: headerContainerHeight - headerHeight,
    width: '100%',
    paddingLeft: 6,
    paddingRight: 6,
    position: 'absolute',
    top: Dimensions.get('window').height > 735 ? 80 : 70,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  descStyle: {
    textAlign: 'center',
  },

  searchBarContainerStyle: {
    flex: 6,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingLeft: 12,
  },
  backIconWrapperStyle: {
    width: 54,
  },
  backIconStyle: {
    marginLeft: 12,
    marginTop: -4,
    width: 30,
  },
  homeBackIconStyle: {
    marginLeft: 0,
  },
  userIconStyle: {
    color: colors.greyColor,
  },
  badgeTextStyle: {
    lineHeight: 16,
    marginLeft: -1,
    fontSize: 12,
  },
  badgeStyle: {
    right: 7,
    top: -3,
    height: 22,
    width: 22,
    padding: 0,
  },
  totalCountStyle: {
    fontSize: 10,
    fontFamily: fonts.light,
    color: colors.gray,
  },
  titleStyle: {
    fontSize: Platform.OS === 'ios' ? 16 : 20,
    fontFamily: fonts.bold,
  },
  inputStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 18,
  },
  imgInputStyle: {
    height: 40,
    fontFamily: fonts.light,
    letterSpacing: 2,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 14,
    backgroundColor: colors.white,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 18,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  moreMenuContainerStyle: {
    marginTop: 36,
  },
  homeBackBtnStyle: {
    transform: [{ rotate: '180deg' }],
  },
  closeIconStyle: {
    width: 48,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
  splashIcon: {
    marginTop: -5,
  },
  searchIcon: {
    fontSize: Platform.OS === 'ios' ? 25 : 30,
    marginRight: -6,
  },
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  imageContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  withoutSplashHeaderContainerStyle: {
    borderBottomColor: 'transparent',
    shadowColor: colors.greyColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 1,
    backgroundColor: 'white',
    height: Platform.OS === 'ios' ? 60 : 54,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row',
    zIndex: 999,
    position: 'relative',
    padding: 0,
  },
  iconImageStyle: {
    width: 30,
    height: 30,
  },
};

export default Header;