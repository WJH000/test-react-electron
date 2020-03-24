import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styles from './Upload.css';
import routes from '../constants/routes.json';
import { Upload as MyUpload, Button, Tree, message } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import xlsx from 'node-xlsx';

const fs = require('fs');
let path = require('path');

type Props = {
  testGetFileToUpload: () => void;
};

export default function Upload(props: Props) {
  const [excelData, setExcelData] = useState([]);
  const [excelName, setExcelName] = useState('');
  const [activeCell, setActiveCell] = useState([-1, -1, -1]);
  const [activeContent, setActiveContent] = useState('');
  useEffect(() => {
  }, [activeCell]);
  const excelProps = {
    onRemove: file => {
    },
    beforeUpload: file => {
      debugger;
      var excelList = xlsx.parse(file.path);
      const maxCols = excelList[0]['data'][0].length || 45;
      // 封装表格数据
      excelList.map(({ data }) => {
        data.map(iitem => {
          for (let i = 0; i < maxCols; i++) {
            iitem[i] = !iitem[i] ? ' ' : iitem[i];
          }
        });
      });
      // console.log('--excelList--', excelList);
      setExcelData(excelList);
      setExcelName(file.name);
      return false;
    }
  };

  function changeTdValue(sheetIndex, excelIndex, tdIndex) {
    const content = excelData[sheetIndex]['data'][excelIndex][tdIndex];
    setActiveCell([sheetIndex, excelIndex, tdIndex]);
    setActiveContent(content);
    console.log('content:  ', content);
  }

  function changeCellContent(e) {
    setActiveContent(e.target.value);
  }

  function saveContent(content) {
    const [sheetIndex, excelIndex, tdIndex] = activeCell;
    excelData[sheetIndex]['data'][excelIndex][tdIndex] = content;
    setActiveCell([-1, -1, -1]);
    setActiveContent('');
  }

  function cancelContent(content) {
  }

  function writeExcel(datas) {
    let buffer = xlsx.build(datas);
    fs.writeFileSync(`${__dirname}/excels/${excelName}`, buffer, { 'flag': 'w' });//生成excel the_content是excel的名字，大家可以随意命名
  }

  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x"/>
        </Link>
      </div>
      <div className={styles.uploadBox}>
        <h3>测试上传Excel</h3>
        <div>
          <Button type="primary" style={{ marginRight: 5 }}>解析dicom文件</Button>
          <MyUpload {...excelProps}>
            <Button type="primary">上传xlsx</Button>
          </MyUpload>
          <Button onClick={writeExcel.bind(this, excelData)}>生成Excel</Button>
        </div>
        <div className={styles.dragDropArea}>
          {excelData && excelData.length > 0 && excelData.map((sheet, sIndex) => {
            return (
              <table key={`excel_sheet_${sIndex}`}>
                <tbody>
                {
                  sheet && sheet.data && sheet.data.length && sheet.data.map((excel, eIndex) => {
                    return (
                      <tr key={`excel_tr_${eIndex}`}>
                        {
                          excel && excel.length && excel.map((td, tIndex) => {
                            const tdSpan = td ? `${td}` : ' ';
                            return (<td
                              key={`excel_td_${tIndex}`}
                              onClick={eIndex > 1 ? changeTdValue.bind(this, sIndex, eIndex, tIndex) : null}
                              style={{
                                cursor: eIndex > 1 ? 'pointer' : 'default',
                                borderLeft: '1px solid #e9e9e9',
                                borderRight: '1px solid #e9e9e9',
                                borderBottom: eIndex === 0 ? 'none' : '1px solid #e9e9e9',
                                borderTop: eIndex === 1 ? 'none' : '1px solid #e9e9e9'
                              }}> {sIndex === activeCell[0] && eIndex === activeCell[1] && tIndex === activeCell[2] ?
                              <Fragment>
                                <input type="text" value={activeContent} onChange={changeCellContent}/>
                                <CheckCircleOutlined className={styles.opeIcon}
                                                     onClick={saveContent.bind(this, activeContent)}
                                                     style={{ color: '#1890FF', fontSize: 18 }}/>
                                <CloseCircleOutlined className={styles.opeIcon}
                                                     onClick={cancelContent.bind(this, activeContent)}
                                                     style={{ color: '#595959', fontSize: 18, marginLeft: 5 }}/>
                              </Fragment> :
                              <span>{tdSpan}</span>}
                            </td>);
                          })
                        }
                      </tr>
                    );
                  })
                }
                </tbody>
              </table>
            );
          })}
        </div>
        <h3>待编辑内容： {activeContent}</h3>
      </div>
    </div>
  );
}
