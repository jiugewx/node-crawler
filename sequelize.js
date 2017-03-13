var Sequelize = require('sequelize');
var moment = require('moment');
var co = require('co');
var sequelize = new Sequelize('job', 'root', '');

// 建表模型
var House = sequelize.define(
    'house_modal',
    {
        '_id': {
            'type': Sequelize.CHAR,     // 字段类型
            'allowNull': false,         // 是否允许为NULL
            'unique': true              // 字段是否UNIQUE
        },
        'name': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'detail_url': {
            'type': Sequelize.STRING,
            'allowNull': false
        },
        'image_url': {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "house_type": {
            'type': Sequelize.CHAR,
            'allowNull': false
        },
        "price": {
            'type': Sequelize.FLOAT,
            'allowNull': false
        },
        "keywords": {
            'type': Sequelize.STRING,
            'allowNull': true
        },
        "comment": {
            'type': Sequelize.INTEGER,
            'allowNull': true
        },
        "score": {
            'type': Sequelize.FLOAT,
            'allowNull': true
        }
    }, {
        "tableName": 'house'
    }
);

exports.create = function (data) {
    return House.sync()
        .then(function () {
            return House.create(data)
        })
};

exports.clearTable = function () {
    return House.sync({force:true})
};