import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import CropImage from '../components/CropImage';
import {
  increment,
  decrement,
  incrementIfOdd,
  incrementAsync
} from '../actions/counter';
import { counterStateType } from '../reducers/types';

function mapStateToProps(state: counterStateType) {
  return {
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      increment,
      decrement,
      incrementIfOdd,
      incrementAsync
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CropImage);
