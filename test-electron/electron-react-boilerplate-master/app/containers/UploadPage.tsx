import { Fragment } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Upload from '../components/Upload';
import { increment, testUpload, testGetFileToUpload } from '../actions/upload';
import { counterStateType } from '../reducers/types';

function mapStateToProps(state: counterStateType) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    { increment, testUpload, testGetFileToUpload },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
