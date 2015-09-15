/**
 * @fileOverview: 与服务器交互
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var logger = require('./modules/logger');

var Handshake = {
    init : function(configFile){
        var config = parse(configFile);
    },

    send : function(){

    }
};

/**
 * 解析配置文件并返回配置对象
 * @param configFile 配置文件
 * @returns 配置对象
 */
function parse(configFile){
    var config = {};

    try{
        config = JSON.parse(configFile);
    }catch(e){
        logger.jsonErr('配置文件解析错误，请检查配置文件格式！');
    }

    return config;
}

module.exports = Handshake;