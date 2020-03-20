import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CropBox.css';
import routes from '../constants/routes.json';
import { Annotation, EditableAnnotation, SubjectRect } from 'react-annotation';
import { Button } from 'antd';
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons';

const fs = require('fs');
const path = require('path');

let loadTimer;
let imgObject = new Image();

export default function CropBox(props) {
  const { files = [] } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cropFlag, setCropFlag] = useState(false);
  const [cropProps, setCropProps] = useState({ x: 10, y: 10, width: 100, height: 100 });
  const [imgScale, setImgScale] = useState(1);
  useEffect(() => {
    imgObject.src = files[currentIndex].path;
    imgObject.onLoad = onImgLoaded();
  }, [currentIndex]);

  // 图片加载回调
  function onImgLoaded() {
    if (loadTimer != null) clearTimeout(loadTimer);
    if (!imgObject.complete) {
      loadTimer = setTimeout(function() {
        onImgLoaded();
      }, 3);
    } else {
      onPreloadComplete();
    }
  }

  // 截取完成加载回调
  function onPreloadComplete() {
    //call the methods that will create a 64-bit version of thumbnail here.
    const { x = 0, y = 0, width = 400, height = 300 } = cropProps;
    const { height: imageHeight, width: imageWidth } = imgObject;
    const tmpScale = Math.min(600 / imageHeight, 800 / imageWidth);
    setImgScale(tmpScale);
    var newImg = getImagePortion(imgObject, width / tmpScale, height / tmpScale, x / tmpScale, y / tmpScale, 1);
    //place image in appropriate div
    document.getElementById('images').innerHTML = `<img alt=''  src='${newImg}' style='zoom:${tmpScale}'/>`;
  }

  // 截取图片
  function getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio) {
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth;
    tnCanvas.height = newHeight;

    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(imgObj, startX, startY, newWidth * ratio, newHeight * ratio, 0, 0, newWidth, newHeight);
    let filename, extension;
    if (imgObj.currentSrc.indexOf('/') > 0)//如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
    {
      filename = imgObj.currentSrc.substring(imgObj.currentSrc.lastIndexOf('/') + 1, imgObj.currentSrc.length);

    } else {
      filename = imgObj.currentSrc;
    }
    extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
    const fname = filename.substring(0, filename.indexOf('.'));
    // console.log('-70-extension--', extension, '--tnCanvas.toDataURL()--', tnCanvas.toDataURL());
    // 缓存图片至本地
    const base64 = tnCanvas.toDataURL().replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = new Buffer(base64, 'base64');
    fs.writeFileSync(path.resolve(`app/images/test/${fname}.png`), dataBuffer, err => {
      console.log(err);
    });
    return tnCanvas.toDataURL();
  }

  function submitCrop() {
    setCropFlag(true);
    onImgLoaded();
  }

  function revert() {
    setCropFlag(false);
  }

  // 翻页切换图片
  function changeImg(flag) {
    const newIndex = flag === -1 ? (currentIndex - 1 < 0 ? 0 : currentIndex - 1) : (currentIndex + 1 > files.length - 1 ? files.length - 1 : currentIndex + 1);
    console.log('-93-newIndex--', newIndex);
    setCurrentIndex(newIndex);
    setCropFlag(false);
  }

  return (
    <div>
      {/*文件名称*/}
      <span>{files[currentIndex].breadCrumbs}</span>
      <LeftCircleOutlined className={`${styles.turningBtn} ${styles.prevBtn}`} onClick={changeImg.bind(this, -1)}/>
      <RightCircleOutlined className={`${styles.turningBtn} ${styles.nextBtn}`} onClick={changeImg.bind(this, 1)}/>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 35 }}>
        {/*脱敏操作Box*/}
        <div style={{ position: 'relative', display: !cropFlag ? 'inherit' : 'none', height: 600 }}>
          <img src={files[currentIndex].path} alt="" style={{ zoom: imgScale }}/>
          <svg width={800} height={600} style={{ position: 'absolute', top: 0, left: 0 }}>
            <EditableAnnotation x={cropProps.x} y={cropProps.y} color={'yellow'}
                                events={{
                                  onMouseMove: (props, state, event) => {
                                    setCropProps(props);
                                  }
                                }}
            >
              <SubjectRect/>
            </EditableAnnotation>
          </svg>
        </div>
        {/*脱敏之后的图片结果*/}
        <div style={{ position: 'relative', display: cropFlag ? 'inherit' : 'none', height: 600 }}>
          <div id='images' className={styles.imageCropBox}
               style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
          </div>
        </div>
      </div>
      <p>截图信息：{`x：${cropProps.x}   y：${cropProps.y}   width：${cropProps.width}  height：${cropProps.height}`}</p>
      <Button onClick={revert}>撤销</Button>
      <Button onClick={submitCrop} type='primary'>确定</Button>
    </div>
  );
}
