/**
 * @fileOverview:
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var xsync = require('./modules/xsync');
var optimist = require('optimist');

exports.run = function () {
    var args = optimist.argv._;

    var cmds = [
        'version',
        'sync',
        'help'
    ];

    //暂时我们只使用第一个参数
    var cmd = args[0];

    if(cmd in xsync){
        xsync[cmd]();
    }else{
        xsync.sync();
    }
};
