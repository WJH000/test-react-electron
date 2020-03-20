import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CropImage.css';
import routes from '../constants/routes.json';
import { Button } from 'antd';
import { Annotation, EditableAnnotation, SubjectRect } from 'react-annotation';

const fs = require('fs');
const path = require('path');

type Props = {};
let loadTimer;
let imgObject = new Image();
const IMAGE_URL = 'images/3_p.jpg';

export default function Counter(props: Props) {
  const {} = props;

  const [cropFlag, setCropFlag] = useState(false);
  const [cropProps, setCropProps] = useState({ x: 10, y: 10, width: 100, height: 100 });
  const [imgScale, setImgScale] = useState(1);

  useEffect(() => {
    imgObject.src = IMAGE_URL;
    imgObject.onLoad = onImgLoaded();
    console.log('--useEffect--');
  }, []);

  const cropImage = () => {
    setCropFlag(false);
  };

  const submitCrop = () => {
    setCropFlag(true);
    onImgLoaded();
  };

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
    console.log('-70-extension--', extension, '--tnCanvas.toDataURL()--', tnCanvas.toDataURL());
    // 缓存图片至本地
    const base64 = tnCanvas.toDataURL().replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = new Buffer(base64, 'base64');
    fs.writeFileSync(path.resolve(`app/images/test/${fname}.png`), dataBuffer, err => {
      console.log(err);
    });
    return tnCanvas.toDataURL();
  }

  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x"/>
        </Link>
      </div>
      <div className={styles.counter}>
        <p>测试图片裁剪</p>
        <Button onClick={cropImage}>加载图片</Button>
        <Button onClick={submitCrop} className={styles.btn}>裁剪图片</Button>

        <p>截图信息：{`x：${cropProps.x}   y：${cropProps.y}   width：${cropProps.width}  height：${cropProps.height}`}</p>
        <div id='images' className={styles.imageCropBox}
             style={{ display: cropFlag ? 'inherit' : 'none', height: 600, width: 800 }}>
        </div>
        <div className={styles.imageCropBox} style={{ display: !cropFlag ? 'inherit' : 'none' }}>
          {/*<div style={{ position: 'absolute', top: 0, left: 0, width: 800, height: 600 }}>*/}
          <img src={IMAGE_URL} alt="" style={{ zoom: imgScale }}/>
          {/*</div>*/}
          <svg width={800} height={600} style={{ position: 'absolute', top: 0, left: 0 }}>
            <EditableAnnotation x={cropProps.x} y={cropProps.y} color={'yellow'}
                                events={{
                                  onMouseMove: (props, state, event) => {
                                    setCropProps(props);
                                  }
                                }}
            >
              <SubjectRect></SubjectRect>
            </EditableAnnotation>
          </svg>
        </div>
      </div>
    </div>
  );
}
