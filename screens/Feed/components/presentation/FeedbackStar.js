import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Libraries
import StarRating from 'react-native-star-rating';
import {
  Card,
  CardItem,
  Text,
} from 'native-base';

// Constants
import * as colors from '../../../../styles/variables';

// fonts
import fonts from '../../../../styles/fonts';

class FeedbackStar extends Component {
    static propTypes = {
      onStarRatingPress: PropTypes.func,
    }

    onStarRatingPress = (rating) => {
      this.props.onStarRatingPress(rating);
    }

    render() {
      const {
        cardItemStyle,
        topContainerStyle,
        subContainerStyle,
        ratingsContainerStyle,
        labelTextStyle,
        subLabelTextStyle,
        cardStyle,
      } = styles;

      const { theme } = this.props;

      return (
            <Card style={[cardStyle, { backgroundColor: theme.bgColor2 }]}>
                <CardItem
                    style={Object.assign({}, cardItemStyle, topContainerStyle, { backgroundColor: theme.bgColor2 })}>
                    <Text
                        style={[subLabelTextStyle, { color: theme.textColor2 }]}>Rating</Text>
                </CardItem>
                <CardItem
                    style={Object.assign({}, cardItemStyle, subContainerStyle, { backgroundColor: theme.bgColor2 })}>
                    <Text
                        style={[labelTextStyle, { color: theme.textColor }]}>{this.props.question}</Text>
                </CardItem>
                <CardItem
                    style={Object.assign({}, cardItemStyle, subContainerStyle, ratingsContainerStyle, { backgroundColor: theme.bgColor2 })}>
                    <StarRating
                        disabled={false}
                        fullStarColor={theme.primaryColor}
                        maxStars={5}
                        rating={this.props.starCount}
                        emptyStar={'ios-star-outline'}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        halfStarEnabled={true}
                        iconSet={'Ionicons'}
                        selectedStar={rating => this.onStarRatingPress(rating)}
                    />
                </CardItem>
            </Card>
      );
    }
}

const styles = {
  cardStyle: {
    borderColor: 'transparent',
    shadowColor: colors.btnBlue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 9,
    paddingBottom: 4,
  },
  cardItemStyle: {
    paddingLeft: 9,
    paddingRight: 9,
  },
  topContainerStyle: {
    flexDirection: 'row',
  },
  subContainerStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 10,
  },
  ratingsContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  labelTextStyle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    letterSpacing: 1,
  },
  subLabelTextStyle: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fonts.light,
    letterSpacing: 1,
  },
};

export default FeedbackStar;
