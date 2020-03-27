import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import Login from '../components/Login';
import CaseUpload from '../components/CaseUpload';
import { connect } from 'react-redux';
import { counterStateType } from '../reducers/types';
import {
  login
} from '../actions/login';

function mapStateToProps(state: counterStateType) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      login
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CaseUpload);
