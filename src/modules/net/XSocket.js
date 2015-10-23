/**
 * @fileOverview: 封装了socket
 * @author: xuejian.xu
 * @date: 15/9/16.
 */

var PACKET_HEAD_LEN = 12;    //数据包头部长度

var logger = require('../Logger');

function XSocket(socket){
    this.socket = socket;
    this.dataStr = '';
    this.dataLen = 0;
    this.timeoutId = 0;

    this.init();    //初始化
}

XSocket.prototype.init = function(){
    this.socket.setEncoding('utf8');
};

XSocket.prototype.post = function(packet){
    var _this = this;

    return new Promise(function(resolve,reject){
        _this.socket.write(packet);

        _this.timeoutId = setTimeout(function(){    //最长响应时间为三秒
            reject();
        },3000);

        _this.socket.on('data',function(chunk){
            if(!_this.dataLen){
                _this.dataLen = chunk.slice(0,PACKET_HEAD_LEN).replace(/-/g,'');
            }

            _this.dataStr += chunk;

            if(_this.dataStr.length === parseInt(_this.dataLen) + PACKET_HEAD_LEN){    //当数据包发送完成后，返回
                clearTimeout(_this.timeoutId);

                var respStr = _this.dataStr.slice(PACKET_HEAD_LEN);
                resolve(JSON.parse(respStr));    //将返回的字符串解析为对象
                _this.dataLen = 0;
                _this.dataStr = '';
            }
        });
    });
};

module.exports = XSocket;