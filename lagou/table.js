var Sequelize = require('sequelize');
var moment = require('moment');
var co = require('co');
var sequelize = new Sequelize('job', 'root', '');

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
        },
        'pos_advantage': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "com_logo": {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        "fin_stage": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        'sec_type': {
            'type': Sequelize.STRING,
            'allowNull': true
        },
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
            console.log("捕获到错误", err)
        })
};

exports.clearTable = function () {
    return Web.sync({force: true});//同步模型到数据库
};

exports.findAll = function () {
    return Web.findAll();
};

// exports.findAll();
// exports.clearTable();