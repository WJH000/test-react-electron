import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home() {
  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link>
      <br></br>
      <Link to={routes.UPLOAD}>测试上传功能</Link>
      <br></br>
      <Link to={routes.CROP}>测试裁剪功能</Link>
    </div>
  );
}
