import React, { useState, useEffect, useRef } from 'react';
import styles from './CaseUpload.css';
import routes from '../constants/routes.json';
import { Upload, Tree, Tabs, Button, Row, Col, Steps, Modal, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import xlsx from 'node-xlsx';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { readDirectory, getFileContentByDir, getFileContentByDir2 } from '../utils/fileUtils';
import CropBox from './CropBox';

const fs = require('fs');
const path = require('path');
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { Step } = Steps;

export default function CaseUpload() {
  // 文件上传的数组
  const [fileList, setFileList] = useState([]);
  // 文件树数组
  const [gData, setGData] = useState([]);
  const [showDragger, setShowDragger] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  // 扁平化文件数据（包含文件内存路径和buffer）
  const [fileContentList, setFileContentList] = useState([]);
  const TreeRef = useRef();

  const props = {
    name: 'file',
    multiple: true,
    onChange(info) {
      const { fileList } = info;
      //  组装文件夹目录结构
    },
    beforeUpload(file, fileList) {
      if (fileList && fileList.length) {
        const path = fileList[0].path;
        const dirList = myReadDir(path, fileList[0]);
        // console.log('dirList:    ', dirList);
        setTimeout(() => {
          setGData([dirList]);
          setShowDragger(false);
        }, 2000);
      }
      return false;
    },
    fileList
  };

  function myReadDir(myUrl, myDir) {
    const rootkey = '0-0';
    readDirectory(myUrl, myDir, rootkey);
    return myDir;
  }

  function clearAll() {
    setGData([]);
    setFileList([]);
    setShowDragger(true);
  }

  // 开始脱敏:需要从磁盘中读取文件内容
  function startCrop() {
    const { gDatas } = TreeRef.current.props;
    console.log('--gDatas in startCrop--', gDatas);
    const tmpList = getFileContentByDir2(gDatas[0], []);
    // 保存数据
    setFileContentList(tmpList);
    message.success(`正在对${fileContentList.length}个文件进行脱敏`);
    setTimeout(() => {
      setModalVisible(true);
    }, 2000);
  }

  function closeModal() {
    setModalVisible(false);
    console.log('--closeModal--');
  }

  return (
    <div className={styles.uploadBox}>
      <Row md={24}>
        <Col md={16}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="病历上传" key="1">
              <div className={styles.opeBox}>
                <DeleteOutlined title={'清空'} onClick={clearAll} style={{ color: '#1890FF', fontSize: 18 }}/>
              </div>
              <div className={styles.caseTab}>
                {showDragger && <div>
                  <Dragger {...props} style={{ width: 400, height: 400, margin: '5% 20% 10% 30%' }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                      band files
                    </p>
                  </Dragger>
                </div>}
                <div>
                  {DragableTree(TreeRef, gData)}
                </div>
              </div>

            </TabPane>
            <TabPane tab="病理结果导入" key="2">
              Content of Tab Pane 2
            </TabPane>
          </Tabs>
        </Col>
        <Col md={8}>
          <div className={styles.steps}>
            <Steps current={1} direction="vertical">
              <Step title="文件夹目录构建" style={{ height: 90 }}/>
              <Step title="数据脱敏" style={{ height: 90 }}/>
              <Step title="压缩上传" style={{ height: 90 }}/>
            </Steps>
          </div>
          <div className={styles.submitBox}>
            <Button>取消</Button>
            <Button type={'primary'} style={{ marginLeft: 5 }} onClick={startCrop}>开始脱敏</Button>
          </div>
        </Col>
      </Row>
      <Modal
        width={1000}
        visible={modalVisible}
        onCancel={closeModal}
        okText={'确认脱敏'}
        cancelText={'取消'}
        footer={null}
      >
        <CropBox files={fileContentList}/>
      </Modal>
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
    // console.log('--onDragEnter--', info);
    // expandedKeys 需要受控时设置
    setExpandedKeys(info.expandedKeys);
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
      console.log('--data--', data);
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
      gDatas={gDatas}
      ref={TreeRef}
    />
  );
};

