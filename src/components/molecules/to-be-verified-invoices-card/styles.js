import {colors} from 'config/colors';
import {mvs} from 'config/metrices';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.halfwhiteone,
    width: '100%',
    padding: mvs(10),
    marginTop: mvs(20),
    borderRadius: mvs(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  statusContainer: {
    gap: mvs(10),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: colors.white,
    marginTop: mvs(20),
  },
      infoContainer: {
    // width: '90%',
    paddingHorizontal: mvs(20),
    backgroundColor: colors.silver,
    marginHorizontal: mvs(20),
    marginTop: mvs(20),
    borderRadius: mvs(10),
    paddingVertical: mvs(30),
  },
  documentContainer:{
    alignItems:'center',
    justifyContent:'center',
  }
  
  
});
export default styles;
