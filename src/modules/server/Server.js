/**
 * @fileOverview: 服务端
 * @author: xuejian.xu
 * @date: 15/9/19.
 */

var PACKET_HEAD_LEN = 12;    //数据包头部长度

var logger = require('../Logger');
var net = require('net');
var scanner = require('./Scanner');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var Server = {
    init : function(config){
        var dataStr = '';
        var dataLen = 0;
        var ending = false;

        logger.info('Server has started on port : ' + config.port);

        net.createServer(function(socket){
            socket.setEncoding('utf8');

            logger.info('Connection established! Client Address:' + socket.remoteAddress);

            socket.on('data',function(chunk){
                if(!dataLen){
                    dataLen = chunk.slice(0,PACKET_HEAD_LEN).replace(/-/g,'');
                }
                dataStr += chunk;

                if(dataStr.length === parseInt(dataLen) + PACKET_HEAD_LEN){
                    socket.emit('dataend',dataStr.slice(PACKET_HEAD_LEN));
                    dataStr = '';
                    dataLen = 0;
                }
            });

            socket.on('dataend',function(dataStr){
                var data = parse(dataStr);
                var dataForReturn = {
                    ret : false,
                    msg : '',
                    data : {}
                };

                switch(data.type){
                    case 'PING' :
                        dataForReturn.ret = true;
                        break;
                    case 'MD5' :
                        dataForReturn.ret = true;
                        dataForReturn.data = fetchMatchedFiles(data.data);
                        break;
                    case 'CONTENT' :
                        dataForReturn.ret = true;
                        createFiles(data.data);

                        logger.info('服务器端文件更新完毕!');

                        ending = true;    //结束程序
                }

                var packet = createPacket(dataForReturn);
                socket.write(packet);

                if(ending){
                    process.exit(-1);
                }
            });

        }).listen(config.port,config.host);
    }
};

/**
 * 创建一个用于发送的数据包，格式[dataLen][data]
 * @param data 要发送的数据
 * @returns {string} 数据包
 */
function createPacket(data){
    var lenStr = JSON.stringify(data).length.toString();
    var lenStrArr = Array.prototype.slice.call(lenStr,0);

    var resLenStrArr = lenStrArr.reduce(function(pre,el,idx){
        pre[idx] = el;
        return pre;
    },Array.prototype.slice.call('------------',0));

    return resLenStrArr.join('') + JSON.stringify(data);
}

/**
 * 将数据字符串解析为JS对象
 * @param dataStr
 * @returns {{Object}}
 */
function parse(dataStr){
    var result = {};

    try{
        result = JSON.parse(dataStr);
    }catch(err){
        logger.jsonErr('数据解析失败，请检查数据格式！');
    }

    return result;
}

/**
 * 根据客户端发来的文件MD5列表，返回需要更新的文件列表，这里的判断逻辑大概是这样的：
 * 1、首先比较文件名，服务端不存在的文件名，标记
 * 2、服务端存在该文件名，但MD5的值不同，标记
 * 3、服务端存在某一文件不存在于客户端列表，删除该文件
 * @param client 客户端md5列表
 */
function fetchMatchedFiles(client){
    var server = createMD5Data('.');
    var fileToDelete = scanner.getMatchedFile(server,client);

    function recuDelete(deleteFile){
        for(var file in deleteFile){
            if(!deleteFile.hasOwnProperty(file)) continue;

            if(typeof deleteFile[file] == 'object'){
                recuDelete(deleteFile[file]);
            }else{
                if(deleteFile[file] == 'ADDED'){
                    logger.info('文件被删除：' + file);
                    fs.unlinkSync(file);
                }
            }
        }
    }
    recuDelete(fileToDelete);

    return scanner.getMatchedFile(client,server);
}

/**
 * 扫描当前目录，生成 路径-MD5 映射
 * @param currentPath 当前目录路径
 * @returns {Object} 映射文件
 */
function createMD5Data(currentPath){
    function recursive(rootPath){    //递归函数
        var rMapping = {};
        var pathArr = fs.readdirSync(rootPath);

        pathArr.forEach(function(fileName){
            if(/\.DS_Store/.test(fileName)) return;    //过滤无用文件.DS_Store

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

module.exports = Server;

/**
 * 创建新的文件
 * @param files 新的文件
 */
function createFiles(files){
    var filePath;

    for(filePath in files){
        if(!files.hasOwnProperty(filePath)) continue;

        if(typeof files[filePath] == 'object'){
            createFiles(files[filePath]);
        }else{
            mkdirAndWriteFile(filePath,files[filePath]);
        }

        logger.info(path.basename(filePath) + '....更新成功！');
    }
}

/**
 * 根据传入的路径递归创建文件夹，并创建文件
 * @param filePath 路径
 * @param content 文件内容
 */
function mkdirAndWriteFile(filePath,content){
    var dirPath = path.dirname(filePath);
    var dirStack = [];

    while(!fs.existsSync(dirPath) && dirPath != '.'){
        dirStack.push(path.basename(dirPath));
        dirPath = path.dirname(dirPath);
    }

    while(dirStack.length > 0){
        dirPath = path.join(dirPath,dirStack.pop());
        fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath,content);
}




