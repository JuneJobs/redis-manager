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
    console.log(params)
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