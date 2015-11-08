/**
 * @fileOverview: 客户端
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var logger = require('./Logger');
var linker = require('./net/Linker');

var Client = {
    config : {},

    init : function(configFile){
        var _this = this;

        return new Promise(function(resolve,reject){
            var config = parse(configFile);

            linker.post({    //这里发送一个空数据是为了测试服务器地址是否正确
                host : config.host,
                port : config.port,
                data : {
                    type : 'PING',
                    data : {}
                }
            }).then(function(){
                _this.config = config;    //如果成功连接，则将这个配置对象保存
                resolve();
            }).catch(function(){
                reject();
            });
        });
    },

    send : function(data,dataType){
        var _this = this;

        return new Promise(function(resolve,reject){
            linker.post({
                host : _this.config.host,
                port : _this.config.port,
                data : {
                    type : dataType,
                    data : data || {}
                }
            }).then(function(resp){
                resolve(resp);
            }).catch(function(){
                reject();
            });
        });
    }
};

/**
 * 解析配置文件并返回配置对象
 * @param configFile 配置文件
 * @returns {Object} 配置对象
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

module.exports = Client;