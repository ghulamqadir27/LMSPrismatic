import {Loader} from 'components/atoms/loader';
import {colors} from 'config/colors';
import {mvs} from 'config/metrices';
import moment from 'moment';
import React, {useRef, useState} from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Bold from 'typography/bold-text';
import Regular from 'typography/regular-text';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Row} from 'components/atoms/row';

const MyCarousel = ({data, gettingNews,onPress}) => {
  const {width} = Dimensions.get('window');
  const ITEM_WIDTH = (width - mvs(40)) * 0.82; // Account for 20+20 margin
  const SIDE_SPACING = ((width - mvs(40)) - ITEM_WIDTH) / 1.8; // Adjust for margin
  const [forceUpdate, setForceUpdate] = useState(false);

  const carouselRef = useRef(null);
  const _renderItem = ({item}) => {
    return (
      //  If gettingNews is true, we can show a loading indicator or placeholder
      gettingNews ? (
        <Loader />
      ) : (
        <TouchableOpacity onPress={()=>onPress(item)}>
        <View style={[styles.slide,{
    borderColor: colors.primary,

        }]}>
          <Row
            style={{
              justifyContent: 'flex-start',
              gap: mvs(5),
              alignItems: 'center',
            }}>
            <View style={{width: '15%'}}>
              <Fontisto
                name="date"
                size={mvs(20)}
                color={colors.red}
                style={styles.dateIcon}
              />
            </View>
            <View style={{width: '80%'}}>
              <Regular
                numberOfLines={20}
                label={moment(item?.created_at).format('YYYY-MM-DD')}
                style={styles.aanouncedate}
                fontSize={mvs(14)}
              />
            </View>
          </Row>
          <Row
            style={{
              justifyContent: 'flex-start',
              gap: mvs(5),
              alignItems: 'center',
              marginVertical: mvs(5),
              width: '100%',
            }}>
            <View style={{width: '15%'}}>
              <FontAwesome
                name="bullhorn"
                size={mvs(25)}
                color={colors.primary}
                style={styles.dateIcon}
              />
            </View>
            <View style={{width: '80%'}}>
              <Bold
                fontSize={mvs(15)}
                color={colors.black}
                numberOfLines={1}
                label={item?.title}
                style={styles.title}
              />
            </View>
          </Row>
          <View
            style={{
              flex: 1,
              width: '83%',
              alignSelf: 'flex-end',
              marginTop: mvs(3),
            }}>
            <Regular
              fontSize={mvs(12)}
              numberOfLines={2}
              label={item?.description}
              style={styles.slidertitle}
            />
          </View>
        </View>
        </TouchableOpacity>
      )
    );
  };
  return (
    <Carousel
      key={forceUpdate}
      ref={carouselRef}
      data={data}
      renderItem={_renderItem}
      sliderWidth={width - mvs(40)} // Reduce slider width by the margin
      itemWidth={ITEM_WIDTH}
      inactiveSlideScale={0.9}
      inactiveSlideOpacity={0.7}
      loop={true}
      autoplay={true}
      enableSnap={true}
      loopClonesPerSide={2} //  Prevents clipping of edges
      snapToAlignment="center"
      pagingEnabled={false} //  Allows proper free scrolling
      decelerationRate="fast"
      contentContainerCustomStyle={{
        paddingHorizontal: SIDE_SPACING, //  Ensures edges are visible
      }}
      slideStyle={{alignSelf: 'center'}}
    />
  );
};
export default MyCarousel;
const styles = StyleSheet.create({
  slide: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red',
            backgroundColor:colors.lightsilver,
    borderRadius: mvs(5),
    // borderWidth: mvs(1),
    paddingVertical: mvs(8),
    paddingHorizontal: mvs(10),
    // width: '90%',
  },
  title: {
    // marginBottom: mvs(10),
  },
  aanouncedate: {
    // alignSelf: 'flex-end',
    color: colors.red,
  },
});
