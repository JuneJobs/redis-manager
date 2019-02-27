'use strict';

//Import request manager module
const LlRequest = require("../lib/ISRequest");

const Redis = require("ioredis");
let redis = new Redis();

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
                res.send("OK");
            break;

         /* URI     /domain
            
            param   queryType: PUT
                    py: physical
                    lg: logical
        */
        case 'PUT':
            redis.set(`c:dm:${param.py}`, param.lg);
                res.send("OK");
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
            res.send("OK");
            break;

        default:
            break;
    }
});

router.post("/keys", (req, res) =>{

});