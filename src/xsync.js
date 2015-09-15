/**
 * @fileOverview: 一个简单地文件同步工具
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var handshake = require('./modules/handshake');
var logger = require('./modules/logger');

var XSync = {
    sync : function(){
        var configFilePath = path.join(__dirpath,'.xsync');

        fs.readFile(configFilePath,function(err,configFile){
            if(err) logger.fileErr('配置文件不存在！');

            handshake.init(configFile).then(function(){    //获得远程主机地址并尝试连接

                var MD5Data = createMD5Data('.');     //遍历当前目录，生成MD5目录映射

                return handshake.send(MD5Data,'md5');    //发送MD5映射列表到服务器
            }).then(function(modifiedMapping){

                var fileData = getFileData(modifiedMapping);    //创建文件内容对象

                return handshake.send(fileData,'file');  //发送这些有改动的文件
            }).then(function(){
                logger.info('文件同步成功！');
            });
        });
    }
    ,
    version : function(){
        console.log('1.0.0');
    },
    help : function(){
        console.log('未完待续...');
    }
};

/**
 * 扫描当前目录，生成 路径-MD5 映射
 * @param currentPath 当前目录路径
 * @returns 映射文件
 */
function createMD5Data(currentPath){

    //递归获得当前目录下所有文件MD5
    function recursive(rootPath){
        var rMapping = {};
        var pathArr = fs.readdirSync(rootPath);

        pathArr.forEach(function(fileName){
            var filePath = path.join(rootPath,fileName);
            var stat = fs.statSync(filePath);

            if(stat.isFile()){
                var MD5 = generateFileMD5(filePath);
                rMapping[filePath] = MD5;
            }else if(stat.isDirectory()){
                rMapping[filePath] = recursive(filePath);
            }
        });

        return rMapping;
    }

    return recursive(currentPath);
}

/**
 * 获取文件MD5
 * @param filePath 文件路径
 * @returns MD5码
 */
function generateFileMD5(filePath){

    var fileContent = fs.readFileSync(filePath);
    var hasher = crypto.createHash('md5');
    hasher.update(fileContent);

    return hasher.digest('hex');
}

/**
 * 根据服务器返回的改动文件列表，返回响应文件的数据
 * @param modifiedMapping 改动文件列表
 * @returns 文件数据
 */
function getFileData(modifiedMapping){
    var fileData = {};

    return fileData;
}

module.exports = XSync;