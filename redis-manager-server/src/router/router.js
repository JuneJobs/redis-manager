'use strict';

//Import request manager module
const LlRequest = require("../lib/ISRequest");

const Redis = require("ioredis");
let redis = new Redis();
let resCode = {
    SUCCESS: '0',
    ERROR: '1',
    DUPLICATION: '2',
    USING: '3',
    NOT_EXIST: '4'
}
let response = {
    resCode = '',
    payload = []
}

//Index maker
let _getIndexForKey = (key, cb) => {
    redis.hget('c:ui', key, (err, keyIndex) => {
        if (keyIndex !== null) {
            redis.hset('c:ui', key, (parseInt(keyIndex) + 1).toString(), () => {
                cb((parseInt(keyIndex) + 1).toString());
            });
        } else {
            redis.hset('c:ui', key, 1, () => {
                cb(1);
            });
        }
    });
}
let _notExists = (key) => {
    if(key===null) {
        return true;
    } else {
        return false;
    }
}
let _Exists = (key) => {
    if(key===null) {
        return false
    } else {
        return true
    }
} 

redis.monitor((err, monitor) => {
    monitor.on('monitor', (time, args, source, database) => {
        console.log('Redis monitor>', time, args, source, database);
    });
});

router.post("/domain", (req, res) => {
    let params = req.body;
    switch (params.queryType) { 
        case 'POST':
            /*  URI     /domain
                param   queryType: POST
                        psDom: Physical Domain
                        lgDom: Logical Domain
            */
            redis.hget(`c:dm:search:psDom:idDom`, params.psDom, (err, idDom) => {
                if(err) { return console.log(err); } else { 
                    if (_notExists(idDom)) {
                        //create idDom
                        _getIndexForKey('dm', (newIdDom) => {
                            redis.multi([
                                [`SET`, `c:dm:${newIdDom}:psDom`, params.psDom],
                                [`SET`, `c:dm:${newIdDom}:lgDom`, params.lgDom],
                                [`SET`, `c:dm:${newIdDom}:idDom`, newIdDom],
                                [`HSET`, `c:dm:search:psDom:idDom`, params.psDom, newIdDom]
                            ]).exec((err, result)=> {
                                if(err) { return console.log(err); } else { 
                                    response.resCode = resCode.SUCCESS;
                                    response.payload = [];
                                    res.send(response);
                                }
                            })
                        });
                    } else {
                        response.resCode = resCode.DUPLICATION;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
            break;
        case 'PUT':
            /*  URI     /domain
                param   queryType: PUT
                        psDom: Physical Domain
                        lgDom: Logical Domain
            */
            redis.hget(`c:dm:search:psDom:idDom`, params.psDom, (err, idDom) => {
                if (err) { return console.log(err); } else {
                    if (_Exists(idDom)) {
                        redis.multi([
                            [`SET`, `c:dm:${idDom}:lgDom`, params.lgDom]
                        ]).exec((err, result) => {
                            if (err) { return console.log(err); } else {
                                response.resCode = resCode.SUCCESS;
                                response.payload = [];
                                res.send(response);
                            }
                        })
                        
                    } else {
                        response.resCode = resCode.NOT_EXIST;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
        case 'GET':
            /*  URI     /domain
                param   queryType: GET
            */
            redis.scan(0, "match", "c:dm:*:idDom", "count", "1000", (err, idDoms) => {
                if (err) { return console.log(err); } else { 
                    if(idDoms[1].length !== 0) {
                        //cmdSet
                        let commandSet = [];
                        idDoms[1].map((array, index) => {
                            commandSet.push([`MGET`, `c:dm:${index}:psDom`, `c:dm:${index}:lgDom`]);
                        });
                        //execute domain list searching
                        redis.multi(commandSet).exec((err, replies) => {
                            let resJson = [];
                            replies.map((array, index) => {
                                resJson.push({
                                    'psDom': array[0],
                                    'lgDom': array[1]
                                });
                            });
                            response.resCode = resCode.SUCCESS;
                            response.payload = resJson;
                            res.send(response);
                        });
                    } else {
                        response.resCode = resCode.SUCCESS;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
        case `DELETE`:
            /*  URI     /domain
                param   queryType: DELETE
                        psKey: Physical Domain
            */
            redis.hget(`c:dm:search:psDom:idDom`, params.psDom, (err, idDom) => {
                if (err) {
                    return console.log(err);
                } else {
                    if (_Exists(idDom)) {
                        //check if it is used to key
                        redis.smembers(`c:dm:${idDom}:used`, (err, idKeys) => {
                            if(_notExists(idKeys)) {
                                redis.multi([
                                    [`DEL`, `c:dm:${idDom}:psDom`],
                                    [`DEL`, `c:dm:${idDom}:lgDom`],
                                    [`DEL`, `c:dm:${idDom}:idDom`],
                                    [`HDEL`, `c:dm:search:psDom:idDom`, params.psDom]
                                ]).exec((err, result) => {
                                    if (err) {
                                        return console.log(err);
                                    } else {
                                        response.resCode = resCode.SUCCESS;
                                        response.payload = [];
                                        res.send(response);
                                    }
                                })
                            } else {
                                response.resCode = resCode.USING;
                                response.payload = [];
                                res.send(response);
                            }
                        });

                    } else {
                        response.resCode = resCode.NOT_EXIST;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
    }
});

router.post("/keys", (req, res) => {
    let params = req.body;
    
    switch (params.queryType) {
        case 'POST':
            /*  URI     /key
                Param   queryType: POST
                        psKey: physical Key
                        lgKey: logical Key
                        ptKey: pattern Key for *
                Description  키를 처음 등록할 때 서버에 키가 이미 저장 되어 있는지 확인
                                없을 경우 추가
                                key example
                                    c:km:1:psKey
                                    c:km:1:lgKey
                                    c:km:1:ptKey
                                있을 경우 중복
            */
            redis.hget(`c:km:search:psKey:idKey`, params.psKey, (err, idKey) => {
                if (err) {
                    return console.log(err);
                } else {
                    if(_notExists(idKey)) {
                        _getIndexForKey('km', (newIdKey) => {
                            let domains = params.psKey.split(':'),
                                command = [`c:dm:search:psDom:idDom`, domains];
                            redis.hmget(command, (err, idDoms) => {
                                if (err) {
                                    return console.log(err);
                                } else {
                                    let commandSet = [];
                                    idDoms[0].map((idDom) => {
                                        commandSet.push([`SADD`, `c:dm:${idDom}:used`, newIdKey]);
                                    });
                                    commandSet = [...commandSet, 
                                        [`SET`, `c:km:${newIdKey}:psKey`, params.psKey],
                                        [`SET`, `c:km:${newIdKey}:lgKey`, params.lgKey],
                                        [`SET`, `c:km:${newIdKey}:tyKey`, params.tyKey],
                                        [`SET`, `c:km:${newIdKey}:idKey`, newIdKey],
                                        [`HSET`, `c:km:search:psKey:idKey`, params.psKey, newIdKey]
                                    ]
                                    redis.multi(commandSet).exec((err, result) => {
                                        if (err) {
                                            return console.log(err);
                                        } else {
                                            response.resCode = resCode.SUCCESS;
                                            response.payload = [];
                                            res.send(response);
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        response.resCode = resCode.DUPLICATION;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });

        case 'PUT':
            /* URI     /key
               param   queryType: PUT
                       lgKey: Logical key
                       ptKey: Key pattern
                       tyKey: Key type
            */
            redis.hget(`c:km:search:psKey:idKey`, params.psKey, (err, idKey) => {
                if (err) {
                    return console.log(err);
                } else {
                    if (_Exists(idKey)) {
                        redis.pipeline([
                            ['SET', `c:km:${idKey}:lgKey`, params.lgKey],
                            ['SET', `c:km:${idKey}:ptKey`, params.ptKey],
                            ['SET', `c:km:${idKey}:tyKey`, params.tyKey],
                        ]).exec((err, result) => {
                            if (err) {
                                return console.log(err);
                            } else { 
                                res.send(responseCode.SUCCESS);
                            }
                            
                        });
                    } else {
                        response.resCode = resCode.NOT_EXIST;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
        

        case 'GET':
            /*  URI     /key
                param   queryType: GET
            */
            redis.scan(0, "match", "c:km:*:idKey", "count", "1000", (err, idDoms) => {
                if (err) { return console.log(err); } else {
                    if (idDoms[1].length !== 0) {
                        //cmdSet
                        let commandSet = [];
                        idDoms[1].map((array, index) => {
                            commandSet.push([
                                `MGET`, 
                                `c:dm:${index}:psKey`, 
                                `c:dm:${index}:lgKey`,
                                `c:dm:${index}:ptKey`,
                                `c:dm:${index}:tyKey`
                            ]);
                        });
                        //execute domain list searching
                        redis.multi(commandSet).exec((err, replies) => {
                            let resJson = [];
                            replies.map((array, index) => {
                                resJson.push({
                                    'psKey': array[0],
                                    'lgKey': array[1],
                                    'ptKey': array[2],
                                    'tyKey': array[3]
                                });
                            });
                            response.resCode = resCode.SUCCESS;
                            response.payload = resJson;
                            res.send(response);
                        });
                    } else {
                        response.resCode = resCode.SUCCESS;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
        case 'DELETE':
            /*  URI     /key
                param   queryType: DELETE
                        psKey: Physical key name
            */
            redis.hget(`c:km:search:psKey:idKey`, params.psKey, (err, idKey) => {
                if (err) {
                    return console.log(err);
                } else {
                    if (_Exists(idKey)) {
                    //모니터 셋에 사용되는 키가 존재하는지 확인
                        redis.multi(['BITPOS', `c:km:used:mon`, 0]).exec(err, result => {
                            if(result === -1) {
                                redis.pipeline([
                                    ['DEL', `c:km:${idKey}:psKey`],
                                    ['DEL', `c:km:${idKey}:lgKey`],
                                    ['DEL', `c:km:${idKey}:ptKey`],
                                    ['DEL', `c:km:${idKey}:tyKey`],
                                    ['DEL', `c:km:${idKey}:idKey`],
                                    [`HDEL`, `c:dm:search:psKey:idKey`, params.psKey],
                                    ['DEL', `c:km:used:mon`],

                                ]).exec((err, result) => {
                                    res.send(responseCode.SUCCESS);
                                    response.payload = [];
                                    res.send(response);
                                });
                            } else {
                                response.resCode = resCode.USING;
                                response.payload = [];
                                res.send(response);
                            }
                        });
                    } else {
                        response.resCode = resCode.NOT_EXIST;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
    }
});

router.post("/MonitorList", (req, res) => {
    let params = req.body;
    
    switch (params.queryType) {
        case 'POST':
            /*
            URI     /MonitorList
            param   queryType: POST
                    psDom: Physical Domain
            {
                id: 1,
                title: 'user key monitor',
                sec: 5,
                auto: true,
                type: 'single',
                searchString: 'user:seq',
                dataType: 'string',
                rowData: []
            }
            */
            redis.hget(`c:km:search:psKey:idKey`, params.psKey, (err, idKey) => {
                if (err) {
                    return console.log(err);
                } else {
                    if (_Exists(idKey)) {
                       redis.multi([
                           [`SISMEMBER`, `c:ml:search:idKey`, idKey]
                       ]).exec((err, result) => {
                           if (err) {
                               return console.log(err)
                           } else {
                               if (0 === result[0]) {
                                   redis.pipeline([
                                       [`SADD`, `c:ml:search:idKey`, idKey],
                                       [`RPUSH`, `c:ml:list`, params],
                                       [`SETBIT`, `c:km:used:mon`, idKey, 1]
                                   ]).exec((err, result) => {
                                       if (err) {
                                           return console.log(err)
                                       } else {
                                           response.resCode = resCode.SUCCESS;
                                           response.payload = [];
                                           res.send(response);
                                       }
                                   });
                               } else {
                                   response.resCode = resCode.DUPLICATION;
                                   response.payload = [];
                                   res.send(response);
                               }
                           }
                       });
                    } else {
                        response.resCode = resCode.NOT_EXIST;
                        response.payload = [];
                        res.send(response);
                    }
                }
            });
            break;

        case 'PUT':
            /*  URI     /MonitorList
                param   queryType: PUT
                        curIdx: Current Index
                        updateIdx: Update Index
            */
            //앞일경우 0 L, 뒤일경우 -1 R, 중간일 경우 LINSERT
        
        case 'GET':
            /*  URI     /MonitorList
                param   queryType: GET
            */
            break;

        case 'DELETE':
            /*  URI     /MonitorList
                param   queryType: PUT
                        curIdx: Current Index
            */
            break;
    }
});