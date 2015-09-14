/**
 * @fileOverview:
 * @author: xuejian.xu
 * @date: 15/9/15.
 */

var XSync = {
    sync : function(){
        console.log('sync!');
    },
    version : function(){
        return '1.0.0'
    },
    help : function(){
        console.log('help');
    }
};

module.exports = XSync;