const fs = require('fs');
let path = require('path');
var exec = require('child_process').exec;

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
      console.log(`${parentKey}-${index}`);
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

/**
 * 获取文件夹结构内文件内容，返回扁平内容
 */
function getFileContentByDir(nowPath, fileContentList = []) {
  let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
  files && files.length && files.forEach(function(fileName, index) {//遍历检测目录中的文件
    // console.log(fileName, index);//打印当前读取的文件名
    let fillPath = path.join(nowPath, fileName);
    let file = fs.statSync(fillPath);//获取一个文件的属性
    if (file.isDirectory()) {//如果是目录的话，继续查询
      getFileContentByDir(fillPath, fileContentList);//重新检索目录文件
    } else {
      const fileContent = fs.readFileSync(fillPath);
      fileContentList.push({
        breadCrumbs: fileName,   // 面包屑路径(对应Tree结构)
        path: fillPath,  // 文件在磁盘中的路径
        buffer: fileContent   //文件流buffer
      });
    }
  });
  return fileContentList;
}

function getFileContentByDir2(folder, fileContentList = []) {
  let files = folder.children;//读取目录中的所有文件及文件夹（同步操作）
  debugger;
  files && files.length && files.forEach(function(file, index) {//遍历检测目录中的文件
    // console.log(fileName, index);//打印当前读取的文件名
    if (file.isDirectory) {//如果是目录的话，继续查询
      getFileContentByDir(file.path, fileContentList);//重新检索目录文件
    } else {
      debugger;
      const extension = file.title.substring(file.title.lastIndexOf('.') + 1, file.title.length);
      if (['bmp', 'jpg', 'png'].includes(extension)) {
        const fileContent = fs.readFileSync(file.path);
        fileContentList.push({
          breadCrumbs: file.name,   // 面包屑路径(对应Tree结构)
          path: file.path,  // 文件在磁盘中的路径
          buffer: fileContent   //文件流buffer
        });
      }
    }
  });
  return fileContentList;
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

function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  console.log(files);
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList); //递归读取文件
    } else {
      filesList.push(fullPath);
    }
  });
  return filesList;
}


/**
 * 获取目录下的文件树
 * @param {读取的路径} dir
 * @returns 返回 dir 目录下的文件树
 */
function getDirTree(dir) {
  let obj = {
    name: dir.substring(dir.lastIndexOf('\\') + 1, dir.length),
    dir: dir, // 文件夹路径
    childFiles: [], // 子文件
    childDir: {} // 子目录
  };
  let objStr = JSON.stringify(obj);
  if (isFile(dir)) return console.log(`${dir}: 不是文件夹`);

  // 读取目录
  let files = readDir(dir);
  if (!files.length) console.log(`${dir}: 文件夹为空`);

  // 遍历文件
  files.forEach(file => {
    let tempdir = `${dir}\\${file}`;
    if (isFile(tempdir)) {
      obj.childFiles.push({
        short: file, // 文件名
        full: tempdir // 完整路径
      });
    } else {
      // console.log('tempdir: ',tempdir);
      let dirname = getDirName(tempdir);
      // 在当前文件夹的对象下 childDir 属性(1)，以文件夹名作为key(2)，
      // (2)的值是该目录下 路径dir、childFiles子文件、childDir子文件夹组成的对象或null
      obj.childDir[dirname] = getDirTree(tempdir);
    }
  });
  return JSON.stringify(obj) === objStr ? null : obj;
}

// 读取路径下的文件、文件夹
function readDir(dir) {
  return fs.readdirSync(dir, (err, files) => {
    if (err) throw err;
    // console.log(`${dir}, files: `.green, files);
    // if (!files.length) console.log(`${dir}: 文件夹为空`.redBG);
    return files;
  });
}

// 判断制定路径是否是文件
function isFile(dir) {
  return fs.statSync(dir).isFile();
}

// 获取目录名
function getDirName(dir) {
  let tempdir = dir.substr(dir.lastIndexOf('\\') + 1, dir.length);
  return tempdir;
}

export { readDirectory, getDirTree, getFileContentByDir, getFileContentByDir2, getFileType, readFileList };
