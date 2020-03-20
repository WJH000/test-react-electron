import { GetState, Dispatch } from '../reducers/types';
import { message } from 'antd';
import axios from 'axios';
import { encryptByAES } from '../utils/utils';
import { saveCurrentUser, clearCurrentUser } from '../utils/user';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';

export const LOGIN = 'LOGIN';

export function login(username, password, callback) {
  clearCurrentUser();
  password = encryptByAES(password);
  axios.post('http://192.168.55.7/api/login', {
    username,
    password,
    'type': 'account'
  })
    .then(function(response) {
      // console.log(response);
      // 缓存用户信息至本地
      saveCurrentUser(JSON.stringify(response.data));
      message.success('登录成功');
      callback && callback();
    })
    .catch(function(error) {
      const { status } = error.response;
      if (['400', 400].includes(status)) {
        message.info('用户名或密码不正确');
      }
      console.log(error);
    });
  /*return {
    type: LOGIN
  };*/
}
