/**
 * @fileOverview: 用于文件匹配
 * @author: xuejian.xu
 * @date: 15/10/23.
 */

var FILE_ADDED = 'ADDED',
    FILE_CHANGED = 'CHANGED',
    FILE_ORIGIN = 'ORIGIN',
    DIR_MATCHED = 'DIRMATCHED';

var TYPE_STRING = 0,
    TYPE_OBJECT = 1;

var Scanner = {
    getMatchedFile : function(client,server){
        return this.scanClient(client,server);
    },

    scanClient : function(client,server){
        var key;

        for(key in client){
            if(!client.hasOwnProperty(key)) continue;

            var fileType = typeof client[key] == 'object' ? TYPE_OBJECT : TYPE_STRING;
            if(fileType == TYPE_OBJECT){
                var status = this.getStatus(TYPE_OBJECT,key,client[key],server);
                if(status == DIR_MATCHED){
                    client[key] = this.scanClient(client[key],server[key]);
                }else{
                    client[key] = this.setStatus(client[key],FILE_ADDED);
                }
            }else{
                client[key] = this.getStatus(TYPE_STRING,key,client[key],server);
            }
        }

        return client;
    },

    getStatus : function(fileType,fileName,fileValue,serverPath){
        var key;

        for(key in serverPath){
            if(!serverPath.hasOwnProperty(key)) continue;

            if(fileName == key){
                var serverFileType = typeof serverPath[key] == 'object' ? TYPE_OBJECT : TYPE_STRING;
                if(serverFileType == TYPE_STRING){
                    if(fileType == TYPE_STRING){
                        if(fileValue == serverPath[key]){
                            return FILE_ORIGIN;
                        }else{
                            return FILE_CHANGED;
                        }
                    }
                }else{
                    if(fileType == TYPE_OBJECT){
                        matched = true;

                        return DIR_MATCHED;
                    }
                }
            }
        }

        return FILE_ADDED;
    },

    setStatus : function(obj,status){
        for(var o in obj){
            if(!obj.hasOwnProperty(o)) continue;

            if(typeof obj[o] == 'object'){
                this.setStatus(obj[o],status);
            }else{
                obj[o] = status;
            }
        }

        return obj;
    }
};

module.exports = Scanner;