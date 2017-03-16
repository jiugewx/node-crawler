var Sequelize = require('sequelize');
var moment = require('moment');
var co = require('co');
var sequelize = new Sequelize('job', 'root', '');

// 建表模型
var Web = sequelize.define(
    'job_modal',
    {
        'company_id': {
            'type': Sequelize.STRING,     // 字段类型
            'allowNull': false,         // 是否允许为NULL
        },
        'position_name': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'position_advantage': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'second_type': {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "company_full_name": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "company_short_name": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "company_logo": {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "work_year": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "salary_min": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "salary_max": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "publish_time":{
            'type': Sequelize.STRING,
            'allowNull': true
        }
    }, {
        "tableName": 'Web_job'
    }
);


exports.create = function (data) {
    return Web.sync()  //同步模型到数据库
        .then(function () {
            return Web.create(data)
        })
        .catch(function (err) {
            console.log("捕获到错误",err)
        })
};

exports.clearTable = function () {
    return Web.sync({force: true}) //同步模型到数据库
};

exports.findAll = function () {
    return Web.findAll();
};

// exports.findAll();
exports.clearTable();