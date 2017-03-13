var Sequelize = require('sequelize');
var moment = require('moment');
var co = require('co');
var sequelize = new Sequelize('job', 'root', '');


// 定义单张表
var User = sequelize.define(
    'test',
    {
        'emp_id': {
            'type': Sequelize.CHAR(10), // 字段类型
            'allowNull': false,         // 是否允许为NULL
            'unique': true              // 字段是否UNIQUE
        },
        'nick': {
            'type': Sequelize.CHAR(10),
            'allowNull': false
        },
        'department': {
            'type': Sequelize.STRING(64),
            'allowNull': true
        }
    }
);

// // 插入数据
User.create({
    emp_id: '232',
    nick: "mik33e",
    department: "1q2223w"
})
    .then(function (jane) {
        console.log(jane.get());
    })
    .then(function () {
        return User.findAll()
    })
    .then(function (result) {
        for (var i = 0, usr; usr = result[i ++];) {
            console.log('name=' + usr.nick + ', id=' + usr.emp_id + ', part=' + usr.department);
        }
    });