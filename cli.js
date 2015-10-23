/**
 * @fileOverview:
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var xsync = require('./src/xsync');
var optimist = require('optimist');

exports.run = function () {
    var args = optimist.argv;

    /**
     * 支持的command:
     *     sync
     *     server
     *     version
     *     help
     */
    var cmd = args._[0];    //暂时我们只使用第一个参数

    if(cmd in xsync){
        xsync[cmd](args);
    }else{
        xsync.help();
    }
};
