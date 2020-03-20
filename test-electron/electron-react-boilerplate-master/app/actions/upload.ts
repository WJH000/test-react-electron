import { GetState, Dispatch } from '../reducers/types';

export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const TEST_UPLOAD = 'TEST_UPLOAD';

export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

export function testUpload(payload) {
  return {
    type: TEST_UPLOAD,
    payload
  };
}

export function testGetFileToUpload() {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log('--getState()--', getState());
    dispatch(testUpload({ file: 'fileToUpload' }));
  };
}

