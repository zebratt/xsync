/**
 * @fileOverview: 发送请求
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var net = require('net');
var XSocket = require('./XSocket');
var logger = require('../Logger');

var Linker = {
    post : function(opt){
        var socket = new net.Socket();

        return new Promise(function(resolve,reject){
            socket.connect(opt.port,opt.host,function(){
                var packet = createPacket(opt.data);
                var xsocket = new XSocket(socket);
                xsocket.post(packet).then(function(resp){
                    resolve(resp);
                }).catch(function(){
                    reject();
                });
            });
        });
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

module.exports = Linker;