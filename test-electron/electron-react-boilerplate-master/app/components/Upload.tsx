import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styles from './Upload.css';
import routes from '../constants/routes.json';
import { Upload as MyUpload, Button, Input, message } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import xlsx from 'node-xlsx';
import { getFileType } from '../utils/fileUtils';

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const archiver = require('archiver');
//ffmpeg 操作类
const ffmpeg = require('ffmpeg');

type Props = {
  testGetFileToUpload: () => void;
};

export default function Upload(props: Props) {
  const [excelData, setExcelData] = useState([]);
  const [excelName, setExcelName] = useState('');
  const [activeCell, setActiveCell] = useState([-1, -1, -1]);
  const [activeContent, setActiveContent] = useState('');
  const [fileCache, setFileCache] = useState([]);
  useEffect(() => {
  }, [activeCell]);

  useEffect(() => {
    const videoPath = path.join(__dirname, '/video2.mp4');
   /* console.log('--测试解析视频--', videoPath);
    getVideoTotalDuration(videoPath);*/
  }, []);

  const excelProps = {
    onRemove: file => {
    },
    beforeUpload: file => {
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

  function parseDICOMFromJson() {
    exec('cd cli && dicom-tool-cli.exe ext --i=../cli-shell/batch.json',
      // exec(path.join(__dirname + '/cli-shell/run-batch.bat'),
      { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) {
          console.log(iconv.decode(err, 'cp936'));
          return;
        }
        if (!stderr && !stderr) console.log('dicom解析成功');
      });
  }

  function createFolder() {
    let dirName = `folder_${new Date().getFullYear()}`;
    var fileName = path.join(__dirname, `./temp/${dirName}`);
    fs.mkdir(fileName, { recursive: true }, (err) => {
      if (err) {
        throw err;
      } else {
        console.log('create folder ok!');
      }
    });
  }

  function createFile() {
    let dirName = `file_${new Date().getFullYear()}`;
    var fileName = path.join(__dirname, `./temp/${dirName}.json`);
    const jsonData = JSON.stringify([
      {
        'inputFile': '../cli-shell/image-000010.dcm',
        'outputPath': './image-000010.bmp',
        'type': 'bmp',
        'frame': '1'
      },
      {
        'inputFile': '../cli-shell/NM-MONO2-16-13x-heart.dcm',
        'outputPath': './NM-MONO2-16-13x-heart.bmp',
        'type': 'bmp',
        'frame': '1'
      }
    ], '', '\t');

    fs.writeFile(fileName, jsonData, 'utf8', function(error) {
      if (error) {
        console.log(error);
        return false;
      }
      console.log('file写入成功');
    });
  }

  function uploadFileChange(e) {
    e.preventDefault();
    const files = e.target.files;
    const cache = handleFilesProcess(files);
    debugger;
    if (cache && cache.length) {
      console.log(cache);
      setFileCache(cache);
    }
  }


  // 处理文件
  function handleFilesProcess(files) {
    const cache = [];
    Array.prototype.forEach.call(files, file => {
      const { name, path } = file;
      getFileType(path, function(type) {
        cache.push({
          name,
          path,
          type
        });
      });
    });
    return cache;
  }

  // 打包文件
  function zipFile(e) {
    e.preventDefault();
    debugger;
    if (fileCache.length > 0) {
      var output = fs.createWriteStream(__dirname + '/testZip.zip');
      var archive = archiver('zip', {
        store: true,
        zlib: { level: 9 }
      });

      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      archive.on('error', function(err) {
        throw err;
      });

      archive.pipe(output);
      fileCache.forEach(item => {
        debugger;
        const { name, path, type } = item;
        if (type === 'file') {
          archive.append(fs.createReadStream(path), { name });
        } else {
          archive.directory(path, name);
        }
      });
      archive.finalize();
    }
  }

  //获取视频时长(暂不生效)
  function getVideoTotalDuration(videoPath) {
    const process = new ffmpeg(videoPath);
    return process.then(function(video) {
      debugger;
      console.log('getVideoTotalDuration,seconds:' + video.metadata.duration.seconds);
      return video.metadata.duration.seconds || 0;
    }, function(err) {
      console.log('getVideoTotalDuration,err:' + err.message);
      return -1;
    });
  }

  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x"/>
        </Link>
      </div>
      <div className={styles.uploadBox}>
        <h3>测试文件操作</h3>
        <div>
          <Button type="primary" onClick={parseDICOMFromJson} className={styles.commonBtn}>解析dicom文件</Button>
          <Button type="primary" onClick={createFolder} className={styles.commonBtn}>创建文件夹</Button>
          <Button type="primary" onClick={createFile} className={styles.commonBtn}>创建JSON文件</Button>
          <MyUpload {...excelProps}>
            <Button type="primary">上传xlsx</Button>
          </MyUpload>
          <Button disabled={!excelName} onClick={writeExcel.bind(this, excelData)}>生成Excel</Button>
          {/*拖拽上传*/}
          <Input type="file" id="upload-file-btn" multiple onChange={uploadFileChange}/>
          {/*打包文件*/}
          <Button onClick={zipFile} type="primary">打包文件</Button>
          <br/><br/>
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
