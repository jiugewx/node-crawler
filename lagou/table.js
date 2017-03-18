var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = new Sequelize('job', 'root', '');
var clientRedis = require("../redis/redis.js");

// 建表模型
var Web = sequelize.define(
    'job_modal',
    {
        'city': {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "district": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "sal_min": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "sal_max": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "wok_min": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "wok_max": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "com_min": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "com_max": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "fin_stage": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        'pos_name': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "com_name": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "pub_time": {
            'type': Sequelize.STRING,
            'allowNull': true,
            "unique": true               // 以发布时间为唯一识别
        },
        'pos_advantage': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "det_url": {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "skill": {
            'type': Sequelize.STRING,
            'allowNull': false
        }
    }, {
        "tableName": 'Web_job'
    }
);

exports.clearTable = function () {
    return Web.sync({force: true});//同步模型到数据库
};

exports.create = function (data) {
    return Web.sync()  //同步模型到数据库
        .then(function () {
            return Web.create(data)
        })
        .catch(function (err) {
            console.log("create错误", err)
        })
};

exports.update = function (data) {
    return Web.sync()  //同步模型到数据库
        .then(function () {
            return Web.update(data)
        })
        .catch(function (err) {
            console.log("update错误", err)
        })
};

exports.findOne = function () {
    return Web.findOne();
};

exports.findAll = function (options) {
    if (!options) {
        return Web.findAll();
    }

    return getResultFromRedis(options)
        .then(transition)
        .then(outPutResult);
};


function getResultFromRedis(options) {
    var conditions = JSON.stringify(options);
    var resolveData = {};
    resolveData.options = options;
    return new Promise(function (resolve, reject) {
        clientRedis.get(conditions, function (err, result) {
            if (err) {
                console.log(err);
                resolveData.result = [];
                resolve(resolveData)
            }
            try {
                var results = JSON.parse(result);
            } catch (error) {
                resolveData.result = [];
                resolve(resolveData)
            }
            resolveData.result = results == null ? [] : results;
            resolve(resolveData);
        })
    })
}

// 中转逻辑
function transition(data) {
    if (!data.result.length) {
        console.log("transition => getResultFromSql");
        return getResultFromSql(data.options)
            .then(setResultToRedis);
    } else {
        console.log("transition => 从redis获取");
        console.log("从redis获取！");
        return data
    }
}

function getResultFromSql(options) {
    return Web.findAll(options)
        .then(function (results) {
            return new Promise(function (resolve, rej) {
                var Array = [];
                for (var i = 0; i < results.length; i++) {
                    Array.push(results[i].dataValues);
                }

                resolve({options: options, result: Array})
            })
        });
}

// 更新一下redis
function setResultToRedis(data) {
    var options = data.options;
    var value = data.result;
    var conditions = JSON.stringify(options);
    var ArrayString = JSON.stringify(value);
    clientRedis.set(conditions, ArrayString);
    console.log("已经setResultToRedis！");
    return data
}

// 输出
function outPutResult(data) {
    var result = data.result;
    return new Promise(function (resovle, reject) {
        resovle(result)
    })
}


function findCity(cityName) {
    if (!cityName) {
        console.log("没有找到" + cityName);
        return []
    }
    return exports.findAll({
        'attributes': [
            "city",
            "district",
            'sal_min',
            'sal_max',
            'com_min',
            "com_max",
            "pub_time",
            "com_name"
        ],
        "where": {
            "sal_max": {$gt: 16},
            "com_min": {$gt: 40},
            "wok_max": {$lt: 4},
            "pub_time": {$gt: "2017-03-16"},
            "city": {$eq: cityName}
        }
    }).then(function (result) {
        return new Promise(function (resolve) {
            console.log(result.length);
            resolve(result);
        });
    });
}

findCity("深圳");
// exports.findAll();
// exports.clearTable();