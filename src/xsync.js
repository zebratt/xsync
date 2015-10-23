/**
 * @fileOverview: 一个简单地文件同步工具
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var client = require('./modules/Client');
var server = require('./modules/server/Server');
var logger = require('./modules/Logger');

var XSync = {
    sync : function(){
        var configFilePath = path.join(process.cwd(),'.xsync');

        fs.readFile(configFilePath,function(err,configFile){
            if(err) logger.fileErr('配置文件不存在！');

            client.init(configFile).then(function(){    //获得远程主机地址并尝试连接
                logger.info('远程主机连接成功，开始上传文件...');

                var MD5Data = createMD5Data('.');     //遍历当前目录，生成MD5目录映射
                logger.info('MD5:' + JSON.stringify(MD5Data,null,4));

                return client.send(MD5Data,'MD5');    //发送MD5映射列表到服务器
            }).catch(function(){
                logger.serverErr('无法连接服务器，请检查服务器配置！');
            }).then(function(resp){
                logger.info('改动文件响应：' + JSON.stringify(resp,null,4));
                //var fileData = getFileData(resp.data);    //服务器返回改动文件列表，据此读取文件并创建对象


                //return client.send(fileData,'file');  //发送这些有改动的文件
            }).catch(function(){
                logger.serverErr('请求MD5改动列表失败！');
            }).then(function(){
                logger.info('文件同步成功！');
                process.exit(-1);
            }).catch(function(){
                logger.serverErr('同步文件失败！');
            });
        });
    },
    server : function(args){
        var config = {
            host : '127.0.0.1'
        };

        config.port = args.p === true ? 9999 : args.p || 9999;    //默认端口9999

        server.init(config);    //启动服务器
    },
    version : function(){
        logger.info('1.0.x');
    },
    help : function(){
        logger.info('XSync 简易文件同步工具 1.0');
    }
};

/**
 * 扫描当前目录，生成 路径-MD5 映射
 * @param currentPath 当前目录路径
 * @returns {Object} 映射文件
 */
function createMD5Data(currentPath){
    function recursive(rootPath){    //递归函数
        var rMapping = {};
        var ignoreList = [
            '.DS_Store',
            '.xsync',
            'xsync'
        ];
        var pathArr = fs.readdirSync(rootPath);

        pathArr.forEach(function(fileName){
            for(var i in ignoreList){    //过滤指定文件
                var regex = new RegExp(ignoreList[i]);
                if(regex.test(fileName)){
                    return;
                }
            }

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
 * @param modifiedDataObj 改动文件列表
 * @returns {Object} 文件数据
 */
function getFileData(modifiedDataObj){
    function recursive(obj){
        var result = {};

        for(var o in obj){
            if(typeof obj[o] === 'object'){
                result[o] = recursive(obj[o]);
            }else{
                result[o] = fs.readFileSync(o,'utf-8');
            }
        }

        return result;
    }

    return recursive(modifiedDataObj);
}

/**
 * 将JSON字符串转换为JSON对象
 * @param jsonStr
 * @returns {{Object}} JSON对象
 */
function parse(jsonStr){
    var jsonObj = {};
    logger.info(jsonStr);

    try{
        jsonObj = JSON.parse(jsonStr);
    }catch(e){
        logger.jsonErr('JSON文本解析错误，请检查文本格式!');
    }

    return jsonObj;
}

module.exports = XSync;