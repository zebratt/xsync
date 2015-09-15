/**
 * @fileOverview:
 * @author: xuejian.xu
 * @date: 15/9/16.
 */

var Logger = {
    log : function(msg){
        console.log(msg);
        process.exit(1);
    },
    fileErr : function(msg){
        this.log('[FILE ERROR] ' + msg);
    },
    promiseErr : function(msg){
        this.log('[PROMISE ERROR] ' + msg);
    },
    socketErr : function(msg){
        this.log('[SOCKET ERROR] ' + msg);
    },
    serverErr : function(msg){
        this.log('[SERVER ERROR]' + msg);
    },
    jsonErr : function(msg){
        this.log('[JSON ERROR] ' + msg);
    },
    info : function(msg){
        this.log('[INFO] ' + msg);
    }
};

module.exports = Logger;