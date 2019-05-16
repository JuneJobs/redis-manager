'use strict';

//Import request manager module
const LlRequest = require("../lib/ISRequest");

const Redis = require("ioredis");
let redis = new Redis();
let resCode = {
    SUCCESS: 0,
    ERROR: 1,
    DUPLICATION: 2,
    USING: 3,
    NOT_EXIST: 4
}
let response = {
    resCode : '',
    payload : []
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
    if (key === null || key.length === 0) {
        return true;
    } else {
        return false;
    }
}
let _Exists = (key) => {
    if (key === null || key.length === 0) {
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
            break;
        case 'GET':
            /*  URI     /domain
                param   queryType: GET
            */
            redis.scan(0, "match", "c:dm:*:idDom", "count", "1000", (err, idDoms) => {
                if (err) {
                    return console.log(err);
                } else {
                    idDoms[1].splice(idDoms[1].indexOf("c:dm:search:psDom:idDom"), 1)
                    if(idDoms[1].length !== 0) {
                        //cmdSet
                        let commandSet = [];
                        idDoms[1].map((array, index) => {
                            let idDom = parseInt(array.split(":")[2]);
                            commandSet.push([`mget`, `c:dm:${idDom}:psDom`, `c:dm:${idDom}:lgDom`]);
                        });
                        //execute domain list searching
                        redis.multi(commandSet).exec((err, replies) => {
                            let resJson = [];
                            replies.map((array, index) => {
                                resJson.push({
                                    'psDom': array[1][0],
                                    'lgDom': array[1][1]
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
            break;
        case `DELETE`:
            /*  URI     /domain
                param   queryType: DELETE
                        psDom: Physical Domain
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
        break;
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
                                command = [`c:dm:search:psDom:idDom`];
                            command = command.concat(domains)
                            redis.hmget(command, (err, idDoms) => {
                                if (err) {
                                    return console.log(err);
                                } else {
                                    let commandSet = [];
                                    idDoms.map((idDom) => {
                                        commandSet.push([`sadd`, `c:dm:${idDom}:used`, newIdKey]);
                                    });
                                    commandSet = [...commandSet, 
                                        [`set`, `c:km:${newIdKey}:psKey`, params.psKey],
                                        [`set`, `c:km:${newIdKey}:lgKey`, params.lgKey],
                                        [`set`, `c:km:${newIdKey}:tyKey`, params.tyKey],
                                        [`set`, `c:km:${newIdKey}:ptKey`, params.ptKey],
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
            break;

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
                                response.resCode = resCode.SUCCESS;
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
            break;

        case 'GET':
            /*  URI     /key
                param   queryType: GET
            */
            redis.scan(0, "match", "c:km:*:idKey", "count", "1000", (err, idDoms) => {
                if (err) { return console.log(err); } else {
                    if (idDoms[1].length !== 0) {
                        idDoms[1].splice(idDoms[1].indexOf("c:km:search:psKey:idKey"), 1)
                        let commandSet = [];
                        idDoms[1].map((array, index) => {
                            let idDom = parseInt(array.split(":")[2]);
                            commandSet.push([
                                `mget`, 
                                `c:km:${idDom}:psKey`,
                                `c:km:${idDom}:lgKey`,
                                `c:km:${idDom}:ptKey`,
                                `c:km:${idDom}:tyKey`
                            ]);
                        });
                        //execute domain list searching
                        redis.multi(commandSet).exec((err, replies) => {
                            let resJson = []
                            replies.map((array, index) => {
                                resJson.push({
                                    'psKey': array[1][0],
                                    'lgKey': array[1][1],
                                    'ptKey': array[1][2],
                                    'tyKey': array[1][3]
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
            break;
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
                        redis.pipeline([
                            ['bitpos', `c:km:used:mon`, 1]
                        ]).exec((err, result) => {
                            if (err) {
                                return console.log(err)
                            } else { 
                                if (result[0][1] === -1) {
                                    redis.pipeline([
                                        ['del', `c:km:${idKey}:psKey`],
                                        ['del', `c:km:${idKey}:lgKey`],
                                        ['del', `c:km:${idKey}:ptKey`],
                                        ['del', `c:km:${idKey}:tyKey`],
                                        ['del', `c:km:${idKey}:idKey`],
                                        [`hdel`, `c:km:search:psKey:idKey`, params.psKey],
                                        ['del', `c:km:used:mon`]
                                    ]).exec((err, result) => {
                                        response.resCode = resCode.SUCCESS;
                                        response.payload = [];
                                        res.send(response);
                                    });
                                } else {
                                    response.resCode = resCode.USING;
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
                monType: 'single',
                psKey: 'user:seq',
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
                           [`sismember`, `c:ml:search:idKey`, idKey]
                       ]).exec((err, result) => {
                           if (err) {
                               return console.log(err)
                           } else {
                               if (0 === result[0][1]) {
                                   delete params.queryType;
                                   let listData = JSON.stringify(params);
                                   redis.pipeline([
                                       [`sadd`, `c:ml:search:idKey`, idKey],
                                       [`rpush`, `c:ml:list`, listData],
                                       [`setbit`, `c:km:used:mon`, idKey, 1]
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
                        curIdx: Current Index (front 0 L, back -1 R, mid n)
                        updateIdx: Update Index
            */
            if (params.updateIdx === 0) {
                redis.multi([
                    ['lrange', 'c:ml:list', curIdx, 0]
                ]).exec((err, value) => {
                    if (err) { return console.log(err); } else {
                        redis.multi([
                            ['LTRIM', 'c:ml:list', curIdx, -1],
                            ['RPUSH', 'c:ml:list', value]
                        ]).exec((err, result) => {
                            if (err) { return console.log(err); } else { 
                                response.resCode = resCode.SUCCESS;
                                response.payload = [];
                                res.send(response);
                            }
                        });
                    }
                }); 
            } else if(params.updateIdx === -1) {
                redis.multi([
                    ['lrange', 'c:ml:list', curIdx, 0]
                ]).exec((err, value) => {
                    if (err) { return console.log(err); } else {
                        redis.multi([
                            ['ltrim', 'c:ml:list', curIdx, -1],
                            ['lpush', 'c:ml:list', value]
                        ]).exec((err, result) => {
                            if (err) { return console.log(err); } else {
                                response.resCode = resCode.SUCCESS;
                                response.payload = [];
                                res.send(response);
                            }
                        });
                    }
                }); 
            } else {
                redis.multi([
                    ['lrange', 'c:ml:list', curIdx, 0]
                    ['lrange', 'c:ml:list', updateIdx, 0]
                ]).exec((err, values) => {
                    if (err) { return console.log(err); } else {
                        redis.multi([
                            ['ltrim', 'c:ml:list', curIdx, -1],
                            ['linsert', 'c:ml:list', 'BEFORE', value[0][1], value[0][0]]
                        ]).exec((err, result) => {
                            if (err) { return console.log(err); } else {
                                response.resCode = resCode.SUCCESS;
                                response.payload = [];
                                res.send(response);
                            }
                        });
                    }
                }); 
            }
            break;

        case 'PUT2': 
             /*  URI     /MonitorList
                param   queryType: PUT
                        curIdx: Current Index
                        auto: auto searching


            */
            redis.multi([
                ['lrange', 'c:ml:list', params.curIdx, params.curIdx]
            ]).exec((err, item) => {
                if (err) {
                    return console.log(err);
                } else {

                    //make a updateItem
                    let curItem = JSON.parse(item[0][1]);
                    curItem.auto = params.auto;
                    let updateItem = JSON.stringify(curItem);

                    redis.multi([
                        ['lset', 'c:ml:list', params.curIdx, updateItem]
                    ]).exec((err, result) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            response.resCode = resCode.SUCCESS;
                            response.payload = [];
                            res.send(response);
                        }
                    })
                }
            })
            break;

        case 'GET':
            /*  URI     /MonitorList
                param   queryType: GET
            */
            redis.multi([
                ['lrange', 'c:ml:list', 0, -1]
            ]).exec((err, list) => {
                response.resCode = resCode.SUCCESS;
                response.payload = list[0][1];
                res.send(response);
            });
            break;

        case 'DELETE':
            /*  URI     /MonitorList
                param   queryType: PUT
                        curIdx: Current Index
                        psKey: psKey
            */
            redis.hget(`c:km:search:psKey:idKey`, params.psKey, (err, idKey) => {
                if (err) {
                    return console.log(err);
                } else {
                    if (_Exists(idKey)) {
                        redis.multi([
                            ['ltrim', 'c:ml:list', params.curIdx + 1, -1],
                            [`setbit`, `c:km:used:mon`, idKey, 0],
                            [`srem`, `c:ml:search:idKey`, idKey]
                        ]).exec((err, result) => {
                            if (err) { return console.log(err); } else {
                                response.resCode = resCode.SUCCESS;
                                response.payload = [];
                                res.send(response);
                            }
                        });
                    }
                }
            });            
            break;
    }
});

router.post("/searchKey", (req, res) => {
    /*  URI     /searchKey
        Param queryType: GET
                psKey: Physical Key
                tyKey: Type of Key
    */
    let params = req.body;

    if (params.queryType !== 'GET') return; 
    
    switch (params.tyKey) {
        case 'Strings':
            
            break;

        case 'Lists':

            break;
        
        case 'Sets':

            break;

        case 'SortedSets':

            break;
         
        case 'GeoSets':

            break;   

        case 'Hashes':

            break;   
    }
});