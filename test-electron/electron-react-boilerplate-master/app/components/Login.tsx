import React, { useState } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import routes from '../constants/routes.json';
import { Input, Button } from 'antd';
import styles from './Login.css';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

type Props = {
  login: (username, password) => void;
};

export default function Login(props: Props) {

  const {
    login
  } = props;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('--登录：--', username, password);
    login(username, password, () => {
      debugger;
      history.push('/');
    });
  };

  const changeInputValue = (value, flag) => {

    if (flag === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }
  };
  return (
    <div className={styles.container}>
      <h2>采集标注平台助手</h2>
      <div>
        <UserOutlined/>
        <Input allowClear placeholder={'用户名'} style={{ width: 250, margin: '20px 0 0 10px' }}
               onChange={(e) => changeInputValue(e.target.value, 'username')}/>
        <br/>
        <LockOutlined/>
        <Input type={'password'} allowClear
               placeholder={'密码'} style={{ width: 250, margin: '20px 0 0 10px' }}
               onChange={(e) => changeInputValue(e.target.value, 'password')}/>
        <br/>
        <Button onClick={handleLogin} type={'primary'} className={styles.loginBtn}>登 录</Button>
      </div>
    </div>
  );
}
