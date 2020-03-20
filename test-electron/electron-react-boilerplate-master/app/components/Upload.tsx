import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Upload.css';
import routes from '../constants/routes.json';
import { Upload as MyUpload, Button, Tree, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import xlsx from 'node-xlsx';

const fs = require('fs');
let path = require('path');
// const TreeRef = useRef(null)
// mock初始数据
const mockData = [
  {
    'title': '0-0',
    'key': '0-0',
    'children': [
      {
        'title': '0-0-0',
        'key': '0-0-0',
        'children': [{ 'title': '0-0-0-0', 'key': '0-0-0-0' }, {
          'title': '0-0-0-1',
          'key': '0-0-0-1'
        }, { 'title': '0-0-0-2', 'key': '0-0-0-2' }]
      }, {
        'title': '0-0-1',
        'key': '0-0-1',
        'children': [{ 'title': '0-0-1-0', 'key': '0-0-1-0' }, {
          'title': '0-0-1-1',
          'key': '0-0-1-1'
        }, { 'title': '0-0-1-2', 'key': '0-0-1-2' }]
      }, { 'title': '0-0-2', 'key': '0-0-2' }]
  }
  /*, {
    'title': '0-1',
    'key': '0-1',
    'children': [{
      'title': '0-1-0',
      'key': '0-1-0',
      'children': [{ 'title': '0-1-0-0', 'key': '0-1-0-0' }, {
        'title': '0-1-0-1',
        'key': '0-1-0-1'
      }, { 'title': '0-1-0-2', 'key': '0-1-0-2' }]
    }, {
      'title': '0-1-1',
      'key': '0-1-1',
      'children': [{ 'title': '0-1-1-0', 'key': '0-1-1-0' }, {
        'title': '0-1-1-1',
        'key': '0-1-1-1'
      }, { 'title': '0-1-1-2', 'key': '0-1-1-2' }]
    }, { 'title': '0-1-2', 'key': '0-1-2' }]
  }, { 'title': '0-2', 'key': '0-2' }*/
];

type Props = {
  increment: () => void;
  testUpload: () => void;
  testGetFileToUpload: () => void;
};

// 封装Tree：添加key
function myReadDir(myUrl, myDir) {
  const rootkey = '0-0';
  myReadfile(myUrl, myDir, rootkey);
  // formatTreeData([myDir], rootkey);
  console.log('--myDir--', myDir);
  return myDir;
}

function formatTreeData(mlist, parentKey) {
  mlist.forEach((file, index) => {
    const sonKey = `${parentKey}-${index}`;
    const { children, name } = file;
    file.key = sonKey;
    file.title = name;
    if (children && children.length) {
      formatTreeData(children, sonKey);
    }
  });
}


// 使用fs递归组装某文件夹下的结构
function myReadfile(MyUrl, tmpDir, parentKey) {
  fs.readdir(MyUrl, (err, files) => {
    tmpDir.title = tmpDir.name;
    tmpDir.key = parentKey;
    if (tmpDir) {
      tmpDir['children'] = [];
    }
    if (err) throw err;
    files.forEach((file, index) => {
      //拼接获取绝对路径，fs.stat(绝对路径,回调函数)
      let fPath = path.join(MyUrl, file);
      fs.stat(fPath, (err, stat) => {
        if (stat.isFile()) {
          //stat 状态中有两个函数一个是stat中有isFile ,isisDirectory等函数进行判断是文件还是文件夹
          // console.log(file);
          tmpDir['children'].push({
            title: file,
            name: file,
            key: `${parentKey}-${index}`,
            path: fPath,
            isDirectory: false
          });
        } else {
          tmpDir['children'].push({
            title: file,
            name: file,
            key: `${parentKey}-${index}`,
            path: fPath,
            isDirectory: true
          });
          myReadfile(fPath, tmpDir['children'][index], `${parentKey}-${index}`);
        }
      });
    });

  });
}

export default function Upload(props: Props) {
  const [gData, setGData] = useState(mockData);
  const [excelData, setExcelData] = useState([]);
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
      console.log('--excelList--', excelList);
      setExcelData(excelList);
      return false;
    }
  };
  const TreeRef = useRef();
  const {
    testGetFileToUpload
  } = props;
  // 初始化
  useEffect(() => {
    const dragWrapper = document.getElementById('drag_test');
    // 拖拽文件进入Tree组件：drop
    dragWrapper.addEventListener('drop', (e) => {
      e.preventDefault(); //阻止e的默认行为
      const files = e.dataTransfer.files;
      // console.log('--files--', files);
      if (files && files.length >= 1) {
        const path = files[0].path;
        const dirList = myReadDir(path, files[0]);
        setTimeout(() => {
          console.log('--path--', path);
          setGData([dirList]);
        }, 1000);

        /*fs.readdir(path, function(err, files) {
          if (err) {
            console.log(err);
          }
          // console.log(files);
        });*/
        /* testAddFile(files[0]);
         // TODO 模拟Tree组件的onDrop事件
         TreeRef.current.props.onDrop();
         // TODO 调接口上传拖拽进来的文件夹*/
        // const content = fs.readFileSync(path) || undefined;

        // content && console.log('--content:--', content.toString());
      }
    });
    // 拖拽文件进入Tree组件：dragover
    //这个事件也需要屏蔽
    dragWrapper.addEventListener('dragover', (e) => {
      // console.log('--dragover--', e.dataTransfer);
      // e.preventDefault();
    });
  }, []);

  // 手动添加文件到尾部
  const testAddFile = (file) => {
    const sss = gData;
    sss.push({ 'title': file.name, 'key': `0-${sss.length}` });
    setGData(sss);
  };
  // console.log('--excelData--', excelData[0].data);
  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x"/>
        </Link>
      </div>
      <div className={styles.uploadBox}>
        <h3>测试上传文件夹</h3>
        <div>
          <Button type={'primary'} onClick={testGetFileToUpload} style={{ marginRight: 5 }}>测试按钮</Button>
          <MyUpload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" directory>
            <Button type="primary">
              <UploadOutlined/><span>上传文件夹</span>
            </Button>
          </MyUpload>
          <MyUpload {...excelProps}>
            <Button type="primary">上传xlsx</Button>
          </MyUpload>

        </div>
        <div className={styles.fileTree} id="drag_test">
          {/*可拖拽的文件树*/}
          {DragableTree(TreeRef, gData)}
        </div>
        <h2>测试显示表格内容</h2>
        <div className={styles.dragDropArea}>
          {excelData && excelData.length && excelData.map((sheet, sIndex) => {
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
                            console.log('--tdSpan--', typeof tdSpan);
                            return (
                              <td key={`excel_td_${tIndex}`}
                                  style={{
                                    borderLeft: '1px solid #e9e9e9',
                                    borderRight: '1px solid #e9e9e9',
                                    borderBottom: eIndex === 0 ? 'none' : '1px solid #e9e9e9',
                                    borderTop: eIndex === 1 ? 'none' : '1px solid #e9e9e9'
                                  }}>{tdSpan}</td>
                            );
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
      </div>
    </div>
  );
}

const DragableTree = (TreeRef, gData) => {
  // gData是初始化数据 gDatas是拖拽修改后的数据
  const [gDatas, setGDatas] = useState(gData);
  const [activeNode, setActiveNode] = useState({});
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-0-0', '0-0-0-0']);

  useEffect(() => {
    // console.log('--gData变化--', gData);
    setGDatas(gData);
  }, [gData]);

  const onDragOver = (info) => {

    const { node } = info;
    if (node) {
      const { key } = node;
      setActiveNode(node);
      setSelectedKeys([key]);
    }
  };

  const onDragEnter = info => {
    console.log('--onDragEnter--', info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  const onDrop = info => {
    clearActiveNode();
    if (info && info.node && info.dragNode) {
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;
      const dropPos = info.node.props.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

      const loop = (data, key, callback) => {
        data.forEach((item, index, arr) => {
          if (item.key === key) {
            return callback(item, index, arr);
          }
          if (item.children) {
            return loop(item.children, key, callback);
          }
        });
      };
      const data = [...gData];

      // Find dragObject
      let dragObj;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, item => {
          item.children = item.children || [];
          // where to insert 示例添加到尾部，可以是随意位置
          item.children.push(dragObj);
        });
      } else if (
        (info.node.props.children || []).length > 0 && // Has children
        info.node.props.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, item => {
          item.children = item.children || [];
          // where to insert 示例添加到头部，可以是随意位置
          item.children.unshift(dragObj);
        });
      } else {
        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }
      setGDatas(data);
    }
  };

  const onExpand = (expandedKeys, { expanded: bool, node }) => {
    const { pos } = node;
    if (expandedKeys.includes(pos)) {
      if (!bool)
        expandedKeys.splice(expandedKeys.indexOf(pos), 1);
    } else {
      if (bool)
        expandedKeys.push(pos);
    }
    setExpandedKeys(expandedKeys);
  };

  const clearActiveNode = () => {
    setActiveNode({});
    setSelectedKeys([]);
  };

  // console.log('--gDatas--', gDatas);
  return (
    <Tree
      className="draggable-tree"
      expandedKeys={expandedKeys}
      draggable
      blockNode
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onExpand={onExpand}
      treeData={gDatas}
      selectedKeys={selectedKeys}
      ref={TreeRef}
    />
  );
};
