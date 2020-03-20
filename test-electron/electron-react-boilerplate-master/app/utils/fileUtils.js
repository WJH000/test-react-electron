const fs = require('fs');
let path = require('path');

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
      // console.log('--index--', `${parentKey}-${index}`);
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
  files.forEach(function(fileName, index) {//遍历检测目录中的文件
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
  debugger;
  let files = folder.children;//读取目录中的所有文件及文件夹（同步操作）
  files.forEach(function(file, index) {//遍历检测目录中的文件
    // console.log(fileName, index);//打印当前读取的文件名
    if (file.isDirectory) {//如果是目录的话，继续查询
      getFileContentByDir(file, fileContentList);//重新检索目录文件
    } else {
      const fileContent = fs.readFileSync(file.path);
      fileContentList.push({
        breadCrumbs: file.name,   // 面包屑路径(对应Tree结构)
        path: file.path,  // 文件在磁盘中的路径
        buffer: fileContent   //文件流buffer
      });
    }
  });
  return fileContentList;
}

export { readDirectory, getFileContentByDir, getFileContentByDir2 };
