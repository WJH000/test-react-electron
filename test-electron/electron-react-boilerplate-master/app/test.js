'use strict';

// 在应用中加载node模块
const fs = require('fs');
const osenv = require('osenv');
const shell = require('electron').shell
const { exec } = require('child_process')
// console.log(require('./directory.json'))
// 引入 aysnc模块
// const async = require('async');
// 引入path模块
const path = require('path');
const archiver = require('archiver');
const iconv = require('iconv-lite');

window.onload = function () {
  const analyzeDicomBtn = document.getElementById('analyze-dicom-btn');
  analyzeDicomBtn.addEventListener('click', function (event) {
    console.log(process.cwd());
    exec('cd cli && dicom-tool-cli.exe ext --i=../cli-shell/batch.json',
    // exec(path.join(__dirname + '/cli-shell/run-batch.bat'),
      { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) {
        console.log(iconv.decode(err, 'cp936'))
        return;
      }
      // console.log(111, stdout);
      // console.log(222, stderr);
    });
  });

  // 打开资源
  handleOpenBtnEventBind();

  // 创建文件
  handleCreateFileBtnEventBind();

  // 上传文件
  handleUploadBtnEventBind();

  // 拖拽文件
  handleTextAreaDragEventBind();

  // 压缩生成文件
  handleZipBtnEventBind();
}

// 打开资源
function handleOpenBtnEventBind() {
  const openLocalBtn = document.getElementById('open-local-btn');
  openLocalBtn.addEventListener('click', function (event) {
    // shell.openExternal('http://58.215.9.78:50759/')
    console.log(shell);
    shell.showItemInFolder(osenv.home())
  });

  const openBrowserBtn = document.getElementById('open-browser-btn');
  openBrowserBtn.addEventListener('click', function (event) {
    shell.openExternal('http://58.215.9.78:50759/')
  })
}

// 创建文件
function handleCreateFileBtnEventBind() {
  const createFileBtn = document.getElementById('create-file-btn')
  createFileBtn.addEventListener('click', function (event) {
    var fliename = path.join(__dirname, './temp/1');
    fs.mkdir(fliename, { recursive: true }, (err) => {
      if (err) {
        throw err;
      } else {
        console.log('ok!');
      }
    });
  });
}

const cache = [];
const textArea = document.getElementById("text-area");
// 上传事件
function handleUploadBtnEventBind() {
  const uploadFileBtn = document.getElementById('upload-file-btn')
  uploadFileBtn.addEventListener('change', function (e) {
    e.preventDefault();
    console.log(e.target.value);
    const files = e.target.files;
    handleFilesProcess(files);
    // console.log(e.target.files[0]);
    // let filePath = e.target.files[0].path;
    // fs.readFile(filePath, "utf-8", function (err, data) {
    //   textArea.innerHTML = data;
    // })
    // var file = this.files[0];
    // if (window.FileReader) {
    //    var reader = new FileReader();
    //    reader.readAsDataURL(file);
    //    //监听文件读取结束后事件
    //  reader.onloadend = function (e) {
    //    $(".weui_uploader_file").css("background-image","url("+e.target.result+")");
    //    //e.target.result就是最后的路径地址
    //    };
    // }
  })
}

function myReadDir(myUrl, myDir) {
  const rootkey = '0-0';
  debugger;
  readDirectory(myUrl, myDir, rootkey);
  return myDir;
}

// 拖拽事件
function handleTextAreaDragEventBind() {

  textArea.ondragenter = textArea.ondragover = textArea.ondragleave = function (e) {
    e.preventDefault();
  }

  textArea.ondrop = function (e) {
    // console.log(e);
    e.preventDefault();
    const files = e.dataTransfer.files;
    console.log('--files--',files)
    if (files && files.length >= 1) {
            const path = files[0].path;
            const dirList = myReadDir(path, files[0]);
           console.log('--dirList--',dirList)
          }
    handleFilesProcess(files);
  }
}

// 处理文件
function handleFilesProcess(files) {
  Array.prototype.forEach.call(files, file => {
    const { name, path } = file;
    getFileType(path, function (type) {
      cache.push({
        name,
        path,
        type,
      });
      console.log(cache);
    })
    textArea.innerHTML += `<span>${name}</span><br/>`;
  })
}

// 是否是文件夹
function getFileType(path, cb) {
  fs.stat(path, (err, stat) => {
    let type;
    if (err) {
      console.log(err);
    } else {
      if (stat.isFile()) { // 判断是否是文件
        type = 'file';
      }
      if (stat.isDirectory()) { // 判断是否是目录
        type = 'directory';
      }
      cb(type);
    }
  });
}

// 压缩文件夹
function handleZipBtnEventBind() {
  const zipFileBtn = document.getElementById('zip-file-btn')
  zipFileBtn.addEventListener('click', function (e) {
    e.preventDefault()
    if (cache.length > 0) {
      var output = fs.createWriteStream(__dirname + '/test.zip');
      var archive = archiver('zip', {
        store: true,
        zlib: { level: 9 }
      });

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      archive.on('error', function (err) {
        throw err;
      });

      archive.pipe(output);
      cache.forEach(item => {
        const { name, path, type } = item;
        if (type === 'file') {
          archive.append(fs.createReadStream(path), { name })
        } else {
          archive.directory(path, name)
        }
      })
      archive.finalize();
    }
  })
}

// 使用fs递归组装某文件夹下的结构
function readDirectory(MyUrl, tmpDir, parentKey) {
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
          readDirectory(fPath, tmpDir['children'][index], `${parentKey}-${index}`);
        }
      });
    });

  });
}
