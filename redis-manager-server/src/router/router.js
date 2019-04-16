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
                                [`set`, `c:dm:${newIdDom}:psDom`, params.psDom],
                                [`set`, `c:dm:${newIdDom}:lgDom`, params.lgDom],
                                [`set`, `c:dm:${newIdDom}:idDom`, newIdDom],
                                [`hset`, `c:dm:search:psDom:idDom`, params.psDom, newIdDom]
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
                            [`set`, `c:dm:${idDom}:lgDom`, params.lgDom]
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
                            commandSet.push([`mget`, `c:dm:${index}:psDom`, `c:dm:${index}:lgDom`]);
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
                                    [`del`, `c:dm:${idDom}:psDom`],
                                    [`del`, `c:dm:${idDom}:lgDom`],
                                    [`del`, `c:dm:${idDom}:idDom`],
                                    [`hdel`, `c:dm:search:psDom:idDom`, params.psDom]
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
                                        commandSet.push([`sadd`, `c:dm:${idDom}:used`, newIdKey]);
                                    });
                                    commandSet = [...commandSet, 
                                        [`set`, `c:km:${newIdKey}:psKey`, params.psKey],
                                        [`set`, `c:km:${newIdKey}:lgKey`, params.lgKey],
                                        [`set`, `c:km:${newIdKey}:tyKey`, params.tyKey],
                                        [`set`, `c:km:${newIdKey}:idKey`, newIdKey],
                                        [`hset`, `c:km:search:psKey:idKey`, params.psKey, newIdKey]
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
                            ['set', `c:km:${idKey}:lgKey`, params.lgKey],
                            ['set', `c:km:${idKey}:ptKey`, params.ptKey],
                            ['set', `c:km:${idKey}:tyKey`, params.tyKey],
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
    }
});