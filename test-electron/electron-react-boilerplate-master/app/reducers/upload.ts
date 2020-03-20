import { Action } from 'redux';
import { TEST_UPLOAD } from '../actions/upload';

export default function upload(state = { file: {} }, action: Action<string>) {
  switch (action.type) {
    case TEST_UPLOAD:
      state = action.payload;
      return state;
    default:
      return state;
  }
}
