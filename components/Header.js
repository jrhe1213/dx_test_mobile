import React, { Component } from 'react';
import {
  View,
  Image,
  Dimensions,
  Platform,
  TextInput,
  Animated,
  TouchableOpacity,
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
import FastImage from 'react-native-fast-image';
import * as Animatable from 'react-native-animatable';

// Config
import * as config from '../config';

// Images
import closeIcon from '../assets/images/Icons/closeIcon.png';
// import moreIcon from '../assets/images/Icons/moreIcon.png';
import homeIcon from '../assets/images/Icons/homeIcon.png';
import leftGoBackIcon from '../assets/images/Icons/leftGoBackIcon.png';
import searchIconImg from '../assets/images/Icons/searchIcon.png';
import xiLogo from '../assets/images/Icons/logo_sm.png';

// Components
import DxHtmlReader2Original from './DxHtmlReader2Original';

// Utils
import { headerForIphoneX } from '../helpers';

// Constants
import * as colors from '../styles/variables';
import fonts from '../styles/fonts';

class Header extends Component {
  static propTypes = {
    drawerOpen: PropTypes.func,
    title: PropTypes.string,
    channelColor: PropTypes.string,
    totalCount: PropTypes.string,
    color: PropTypes.string,
    totalExpRecords: PropTypes.number,
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
    postLabel: PropTypes.string,
    handleUpdateLanguage: PropTypes.func,
    isLanguage: PropTypes.bool,
    isLanguageSelectActive: PropTypes.bool,
    totalDownloadRecords: PropTypes.number,
  };

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


  render() {
    const {
      title,
      channelColor,
      totalExpRecords,
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
      postLabel,
      isFeedlistLoading,
      handleUpdateLanguage,
      isLanguage,
      isLanguageSelectActive,
      totalDownloadRecords,
      theme,
      orgImageGUID,
      doneLabel,
      imgBgType,
      imgBgColor,
      isSplashImageEnabled,

    } = this.props;


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
      logoTitleStyle,
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

    // const logoImage = config.formatImageLink(orgImageGUID);

    const headerWithImage = (
      <View style={Object.assign({}, headerContainerStyle, styles.relative)}>
        {
          imgBgType === 'BACKGROUND_COLOR'
            ? <Animated.View style={[
              headerImageContainerStyle,
              {
                backgroundColor: imgBgColor,
                opacity: this.props.imageOpacity,
                transform: [{ translateY: this.props.imageTranslate }],
              },
            ]} />
            :
            (isSplashImageEnabled == null || isSplashImageEnabled) ?
              <Animated.Image
                style={[
                  headerImageContainerStyle,
                  {
                    opacity: this.props.imageOpacity,
                    transform: [{ translateY: this.props.imageTranslate }],
                  },
                ]}
                source={{ uri: splashImg }}
              />
              :
              null
        }
        <Animated.View
          style={[overlay,
            { backgroundColor: splashOpacityColor },
            { opacity: splashOpacity },
          ]}
        />
        <View style={topContainerStyle}>
          {this.props.isSearch ? null : (
            <View style={leftContainerStyle}>
              {this.props.isBackIcon ? (
                isFeedList ? (
                  <Button onPress={() => this.handleBackIconPress()} transparent>
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
                          style={{ marginRight: 7 }}
                        >
                          <FastImage source={homeIcon} style={iconImageStyle} />
                        </Button>
                      ) : null}
                      <Button onPress={() => this.handleBackIconPress()} transparent>
                        <FastImage source={leftGoBackIcon} style={iconImageStyle} />
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
            <Item style={{ flex: 8, marginTop: 8 }}>
              <Animatable.View useNativeDriver duration={300} animation={this.props.isSearch ? "fadeInRight" : "fadeOutRight"}
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
                <View style={{
                  position: 'absolute',
                  top: Platform.OS == 'android' ? 6 : 0,
                  left: 12,
                  width: 30,
                  height: 30,
                  zIndex: 999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }} >
                  <Icon
                    style={{fontSize: 22, marginLeft: 6,}}
                    name="ios-search-outline"
                  />
                </View>
                <TextInput
                  style={Object.assign({}, inputStyle, { height: 30, padding: 0, margin: 0 })}
                  autoCapitalize="none"
                  underlineColorAndroid="rgba(0,0,0,0)"
                  placeholder={this.props.inputPlaceholder}
                  value={this.props.inputValue}
                  onChangeText={val => this.props.handleChangeInput(val)}
                />
              </Animatable.View>
              </Item>
            ) : null}
          
          <View style={[rightContainerStyle]}>
            <View style={{ flexDirection: 'row', display: 'flex' }}>
              {this.props.isSearchIcon ? (
                <Button 
                  transparent 
                  onPress={() => this.handleSearchIconPress()}
                  block
                >
                  {this.props.isSearch ? (
                    <FastImage source={closeIcon} style={iconImageStyle} />
                  ) : (
                      <FastImage
                      source={searchIconImg}
                      style={Object.assign({}, iconImageStyle, Platform.OS == 'android' ? { marginBottom: 3 } : null)}
                    />
                    )}
                </Button>
              ) : null}
              {this.props.isHamburgerIcon ? (
                this.props.isSearch ? null : (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: 6,
                    }}
                  >
                    <Button transparent onPress={() => this.handleHomeBackIconPress()} block>
                      <FastImage source={closeIcon} style={iconImageStyle} />
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
            <DxHtmlReader2Original
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
          { backgroundColor: theme.bgColor2 },
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
                  style={backIconWrapperStyle}
                >
                  <FastImage
                    source={leftGoBackIcon}
                    style={Object.assign({}, iconImageStyle, { marginLeft: 12 })}
                  />
                </Button>
              ) : (
                  <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                    {displayHomeBack ? (
                      <Button
                        onPress={() => this.handleHomeBackPress()}
                        transparent
                        style={{ marginRight: 7 }}
                      >
                        <FastImage source={homeIcon} style={iconImageStyle} />
                      </Button>
                    ) : null}
                    <Button onPress={() => this.handleBackIconPress()} transparent>
                      <FastImage source={leftGoBackIcon} style={iconImageStyle} />
                    </Button>
                  </View>
                )
            ) : hiddenUserIcon ? null : (
              <View>
                {isClose ? (
                  <Button
                    onPress={() => this.props.handleClosePage()}
                    transparent
                    badge
                    iconLeft
                    block
                  >
                    <FastImage
                      source={closeIcon}
                      style={Object.assign({}, iconImageStyle, { marginLeft: 12 })}
                    />
                  </Button>
                )
                  : (
                    this.props.isLogo
                      ? <View style={{ flexDirection: 'row', alignItems: 'center', height: 44 }}>
                        <View style={{
                          marginLeft: 12, backgroundColor: '#fff', width: 30, height: 30, borderRadius: 2, overflow: 'hidden',
                        }}>
                          <FastImage
                            source={xiLogo}
                            style={{
                              width: '100%', height: '100%', marginBottom: 2,
                            }}
                          />
                          {/* {
                        !orgImageGUID
                          ? <FastImage
                            source={xiLogo}
                            style={{
                              width: 30, height: 30, marginBottom: 2
                            }}
                          />
                          : <FastImage
                          source={{ uri: logoImage }}
                          style={{
                            width: 30, height: 30,
                          }}
                        />
                      } */}
                        </View>
                        <Text style={[logoTitleStyle, { color: theme.textColor, marginLeft: 8, marginTop: 6 }, Platform.OS == 'android' ? { marginTop: 0 } : null]}>
                          {title}
                        </Text>
                      </View>
                      : null
                  )}
              </View>
            )}
          </View>
        )}
        {this.props.isSearch ? null : (
          this.props.isLogo ? null
            : (<View style={Object.assign({}, titleContainerStyle, { paddingBottom: 8 }, Dimensions.get('window').width <= 320 ? { flex: 1 } : { flex: 2 })}>
              <View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                  style={[
                    { flexShrink: 1, color: theme.textColor },
                    titleStyle,
                    channelColor && {
                      color: channelColor === '#000000' ? theme.textColor : channelColor,
                    },
                    !isFeedList && Platform.OS == 'android' ? { marginBottom: 7 } : null,
                  ]}
                >
                  {title}
                </Text>
              </View>
              {this.props.currentTab === 'Feed' && !!totalExpRecords && !isFeedlistLoading && <Text style={totalCountStyle}>{totalExpRecords} {postLabel}</Text>}
              {
                (this.props.currentTab === 'Download' || this.props.currentTab === 'BookmarkCardPage') && !!totalDownloadRecords && <Text style={[
                  totalCountStyle, { color: theme.textColor2 },
                ]}>
                  {totalDownloadRecords} {postLabel}</Text>}
            </View>)
        )}
        {this.props.isSearch ? (
          <Animatable.View useNativeDriver duration={300} animation={this.props.isSearch ? "fadeInRight" : "fadeOutRight"}
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
            <View style={{
              position: 'absolute',
              top: Platform.OS == 'android' ? 6 : 0,
              left: 12,
              width: 30,
              height: 30,
              zIndex: 999,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }} >
              <Icon
                style={{fontSize: 22}}
                name="ios-search-outline"
              />
            </View>
            <TextInput
              style={Object.assign({}, inputStyle, { height: 30, padding: 0, margin: 0 })}
              autoCapitalize="none"
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder={this.props.inputPlaceholder}
              value={this.props.inputValue}
              onChangeText={val => this.props.handleChangeInput(val)}
            />
          </Animatable.View>
        ) : null}
        <View style={[rightContainerStyle, { height: 45 }]}>
          {this.props.isSearchIcon ? (
            <Button
              transparent
              block
              onPress={() => this.handleSearchIconPress()}
            >
              {
                this.props.isSearch ? (
                  <FastImage
                    source={closeIcon}
                    style={Object.assign({}, iconImageStyle)}
                  />
                ) : (
                    <FastImage
                      source={searchIconImg}
                      style={Object.assign({}, iconImageStyle, Platform.OS == 'android' ? { marginBottom: 3 } : null)}
                    />
                  )
              }
            </Button>
          ) : null}

          {
            isClose && currentTab === 'Feedback' ? (
              <Button
                onPress={() => this.props.handleCloseFeedbackPage()}
                transparent
                badge
                iconLeft
                block
              >
                <FastImage
                  source={closeIcon}
                  style={Object.assign({}, iconImageStyle, { marginLeft: 12 })}
                />
              </Button>) : null
          }

          {
            this.props.isLogo
              ? (this.props.isSearch ? null : (
                <TouchableOpacity
                  onPress={() => this.props.drawerOpen()}
                  style={{ marginLeft: 8 }}
                >
                  <Icon
                    style={Object.assign(
                      {},
                      userIconStyle,
                      {
                        fontSize: 38, color: theme.textColor, paddingTop: 3, marginBottom: Platform.OS == 'android' ? 6 : null,
                      }
                    )}
                    name="ios-contact"
                  />
                </TouchableOpacity>
              )) : null
          }

          {this.props.isHamburgerIcon ? (
            this.props.isSearch ? null : (
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                {/* <Button
                  transparent
                  onPress={() => this.props.handleToggleMenu()}
                  block
                  style={{ marginRight: 7 }}
                >
                  <FastImage source={moreIcon} style={iconImageStyle} />
                </Button> */}
                <Button transparent onPress={() => this.handleHomeBackIconPress()} block >
                  <FastImage source={closeIcon} style={Object.assign({}, iconImageStyle, { marginLeft: 6 })} />
                </Button>
              </View>
            )
          ) : null
          }

          {
            this.props.isOnleHamburgerIcon ? (
              this.props.isSearch ? null : (
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 7,
                  }}
                >
                  {/* <Button
                    transparent
                    onPress={() => this.props.handleToggleMenu()}
                    block
                  >
                    <FastImage source={moreIcon} style={iconImageStyle} />
                  </Button> */}
                </View>
              )
            ) : null
          }

          {
            (isLanguage && isLanguageSelectActive) ? (
              <Button transparent block onPress={() => handleUpdateLanguage()}>
                <Text style={[{
                  fontFamily: fonts.bold, color: theme.primaryColor, marginTop: 12,
                }]}>{doneLabel}</Text>
              </Button>
            ) : null
          }

          {this.props.isAddIcon ? (
            <Button transparent>
              <Icon name="ios-add-circle-outline" />
            </Button>
          ) : null}

          {this.props.isDownloadIcon ? (
            <Button transparent>
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingRight: 12,
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
    flex: 8,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingLeft: 12,
  },
  backIconWrapperStyle: {
    width: 54,
    borderWidth: 1,
    borderColor: 'red'
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
    letterSpacing: 1,
  },
  titleStyle: {
    fontSize: Platform.OS === 'ios' ? 16 : 20,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  logoTitleStyle: {
    fontSize: Platform.OS === 'ios' ? 18 : 22,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  inputStyle: {
    fontFamily: fonts.light,
    letterSpacing: 2,
    paddingLeft: 30,
    paddingRight: 20,
    fontSize: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 60 : 54,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row',
    zIndex: 999,
    position: 'relative',
    padding: 0,
  },
  iconImageStyle: {
    width: 32,
    height: 32,
    marginBottom: Platform.OS === 'android' ? 6 : 0,
  },
};

export default Header;
