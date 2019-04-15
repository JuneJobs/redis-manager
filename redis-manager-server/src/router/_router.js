'use strict';

//Import request manager module
const LlRequest = require("../lib/ISRequest");

const Redis = require("ioredis");
let redis = new Redis();
let responseCode = {
    SUCCESS: '0',
    ERROR: '1',
    DUPLICATION: '2',
    USING: '3'
}

router.post("/domain", (req, res) => {
    let param = req.body;
    switch (param.queryType) {
        /*  URI     /domain
            param   queryType: POST
                    py: physical
                    lg: logical
        */
        case 'POST':
            redis.set(`c:dm:${param.py}`, param.lg);
                res.send(responseCode.SUCCESS);
            break;

         /* URI     /domain
            
            param   queryType: PUT
                    py: physical
                    lg: logical
        */
        case 'PUT':
            redis.set(`c:dm:${param.py}`, param.lg);
                res.send(responseCode.SUCCESS);
            break;
        
        /*  URI     /domain
            param   queryType: GET
        */
        case 'GET':
            redis.keys(`c:dm:*`, (err, keys) => {
                console.log(keys);
                let pipeline = redis.pipeline();
                keys.map((key) => {pipeline.get(key)});
                pipeline.exec((err, values) => {
                    let responseJson = [];
                    values.map((array, index) => {
                        responseJson.push({
                            'key': keys[index].slice(5),
                            'value': array[1]
                        });
                    });
                    res.send(responseJson);
                });

            });
            break;
        
        /*  URI     /domain
            param   queryType: DELETE
                    key: domain key name
        */
        case 'DELETE':
            redis.del(`c:dm:${param.key}`);
            res.send(responseCode.SUCCESS);
            break;

        default:
            break;
    }
});


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

router.post("/keys", (req, res) =>{
    let params = req.body;
    switch (params.queryType) {
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
        case 'POST':
            redis.sismember('c:km:rg', params.psKey, (err, keyExistance) => {
                //If key exist
                if (keyExistance === 0) {
                    _getIndexForKey('km', (keyIndex)=> {
                        //키를 추가
                        redis.pipeline([
                            ['set', `c:km:${keyIndex}:psKey`, params.psKey],
                            ['set', `c:km:${keyIndex}:lgKey`, params.lgKey],
                            ['set', `c:km:${keyIndex}:ptKey`, params.ptKey],
                            ['set', `c:km:${keyIndex}:tyKey`, params.tyKey],
                            ['set', `c:km:${keyIndex}:idx`, keyIndex],
                            ['hset', `c:km:key:idx`, params.psKey, keyIndex],
                            //수정 추가작업 필요
                            ['sadd', 'c:km:rg', keyIndex]
                        ]).exec((err, result) => {
                            res.send(responseCode.SUCCESS);
                        });

                    });
                
                //If key does not exist
                } else {
                    res.send(responseCode.DUPLICATION);
                }
            });  

            break;

         /* URI     /key
            
            param   queryType: PUT
                    py: physical
                    lg: logical
        */
        case 'PUT':
            console.log('>>',params);
            redis.pipeline([
                ['set', `c:km:${params.idx}:psKey`, params.psKey],
                ['set', `c:km:${params.idx}:lgKey`, params.lgKey],
                ['set', `c:km:${params.idx}:ptKey`, params.ptKey],
                ['set', `c:km:${params.idx}:tyKey`, params.tyKey],
            ]).exec((err, result) => {
                res.send(responseCode.SUCCESS);
            });
            break;
        
        /*  URI     /key
            param   queryType: GET
        */
        case 'GET':
            redis.smembers('c:km:rg', (err, keys) => {
                let pipeline = redis.pipeline();

                keys.map((key) => {
                    pipeline.mget(`c:km:${key}:idx`, `c:km:${key}:psKey`, `c:km:${key}:lgKey`, `c:km:${key}:ptKey`, `c:km:${key}:tyKey`);
                });
                pipeline.exec((err, values) => {
                    //values[0].shift();
                    let responseJson = [];
                    values.map((array) => {
                        responseJson.push({
                            idx: array[1][0], 
                            psKey: array[1][1],
                            lgKey: array[1][2],
                            ptKey: array[1][3],
                            tyKey: array[1][4]
                        });
                    })

                    console.log(responseJson);
                    
                    // let responseJson = [];
                    // values.map((array, index) => {
                    //     responseJson.push(array);
                    // });
                     res.send(responseJson);
                });
                //res.send(keys);
            });
            break;
        
        /*  URI     /key
            param   queryType: DELETE
                    key: domain key name
        */
        case 'DELETE':
            redis.scan(1, 'match', params.psKey, (err, keys) => {
                if (keys[1].length > 0) {
                    res.send(responseCode.USING);
                } else {
                    redis.pipeline([
                        ['del', `c:km:${params.idx}:psKey`],
                        ['del', `c:km:${params.idx}:lgKey`],
                        ['del', `c:km:${params.idx}:ptKey`],
                        ['del', `c:km:${params.idx}:tyKey`],
                        ['del', `c:km:${params.idx}:idx`],
                        ['srem', `c:km:rg`, params.idx]
                    ]).exec((err, result) => {
                        res.send(responseCode.SUCCESS);
                    });
                }
            })
            
            break;

        default:
            break;
    }
});

router.post("/MonitorList", (req, res) => {
    let params = req.body;
    // let params = {
    //     queryType: 'POST',
    //     title: 'user key monitor',
    //     sec: 5,
    //     auto: true,
    //     type: 'single',
    //     searchString: 'user:seq',
    //     dataType: 'string'
    // }
    switch (params.queryType) {
        case 'POST':
        /*
            received param: [{
                id: 1,
                title: 'user key monitor',
                sec: 5,
                auto: true,
                type: 'single',
                searchString: 'user:seq',
                dataType: 'string',
                rowData: []
            }, {
                id: 2,
                title: 'user name monitor',
                sec: 5,
                auto: false,
                type: 'single',
                searchString: 'user:name',
                dataType: 'hash',
                rowData: []
            }]

            string get c:km:{searchString}:tyKey
            없으면 0

            set sadd c:mnt:keys
                value searchString

            list lpush c:mnt:list
                 value {id: 1, title: 'user key monitor', sec: 5, auto: true, type: 'single', searchString: 'user:seq', dataType: 'string'}
            
            
        */
        /*
            redis.get(`c:km:${params.psKey}:tyKey`, (err, tyKey) => {
                if(tyKey !== null) {
                    redis.sismember('c:mnt:keys', params.psKey, (err, result) => {
                        if (result === 0) {
                            delete params['queryType'];
                            params.dataType = tyKey;
                            redis.pipeline([
                                //sadd는 추후 key management에 추가 할 것
                                [`sadd`, `c:mnt:keys`, params.psKey],
                                [`lpush`, `c:mnt:list`, JSON.stringify(params)]
                            ]).exec((err, result) => {
                                console.log(responseCode.SUCCESS);
                                res.send(responseCode.SUCCESS);
                            })
                        } else {
                            console.log(responseCode.DUPLICATION);
                            res.send(responseCode.DUPLICATION);
                        }
                    });
                    
                } else {
                    console.log(responseCode.ERROR);
                    res.send(responseCode.ERROR);
                }
            });
            break;
        */
        
        //
        redis.hget('c:km:key:idx', params.psKey, (err, psKeyIdx) => {
            if(err) { return console.log(err); } else {
                if(psKeyIdx !== null) {
                    //인덱스가 있는 경우
                    redis.pipeline([
                        [`sismember`, `c:mnt:keys:idx`, psKeyIdx],
                        [`mget`, `c:km:${psKeyIdx}:lgKey`, `c:km:${psKeyIdx}:tyKey`]
                    ]).exec((err, result) => {
                        if(err) { return console.log(err)} else {
                            if(0 === result[0]) {
                                //params 저장방식 변경
                                redis.pipeline([
                                    [`sadd`, `c:mnt:keys:idx`, psKeyIdx],
                                    [`rpush`, `c:mnt:list`, params]
                                ]).exec((err, result) => {
                                    if (err) { return console.log(err) } else {
                                        res.send(responseCode.SUCCESS);
                                        console.log(responseCode.SUCCESS);
                                    }
                                });
                            } else {
                                res.send(responseCode.DUPLICATION);
                                console.log(responseCode.DUPLICATION);
                            }
                        }
                    });
                } else {
                    //인덱스가 없는경우
                    res.send(responseCode.ERROR);
                }
            }
            
        })


        case "GET":
            //Send List Information
            redis.lrange("c:mnt:list", 0, -1, (err, list) => {
                console.log(list);
                if(list !== null) {
                    list.map((item, idx)=> {
                        item = JSON.parse(item);
                    })
                    JSON.parse(list);
                } else {
                    
                }
            });
            break;
        
        case "DELETE":
            //list의 값을 기준으로 삭제함. item
            redis.pipeline([
                [`ltrim`, `c:mnt:list`, params.index, -1],
                [`srem`, `c:mnt:keys:idx`, params.idx]
            ]).exec((err, result) => {
                if (err) {
                    return console.log(err)
                } else {
                    res.send(responseCode.SUCCESS);
                    console.log(responseCode.SUCCESS);
                }
            });
    }
});