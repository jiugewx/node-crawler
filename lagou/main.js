var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
var moment = require('moment');
var utils = require("../utils/base.js");
var Web = require("./table.js");
var url = "https://www.lagou.com/jobs/positionAjax.json";
var Cookie = ""
function requestUrl(url, page) {
    return new Promise(function (resolve, reject) {
        request
            .post(url)
            .set('Cookie', Cookie)
            .set('Accept', "application/json")
            .charset('utf8')
            .query({px: 'new'})
            .query({city: '深圳'})
            .query({needAddtionalResult: false})
            .type('form')
            .send({first: false})
            .send({kd: "web前端"})
            .send({pn: page})
            .end(function (err, res) {
                if ( err ) {
                    console.log(err);
                    resolve({
                        content: "",
                        url: url
                    });
                }
                var json = res.text;
                var time = 2000 + Math.ceil(Math.random() * 3000);
                console.log(json);
                setTimeout(function () {
                    resolve({
                        detail: JSON.parse(json),
                        url: url
                    })
                }, time)
            })
    })
}

var allResults = [];

function getPage(page) {
    return requestUrl(url, page).then(function (data) {
        var results = data.detail["content"] ? data.detail["content"]['positionResult']['result'] : [];
        if ( results.length == 0 ) {
            return
        }
        for (var i = 0; i < results.length; i ++) {
            var resultI = results[i];
            var salary = resultI.salary.replace(/k/g, "");
            var unit = {
                work_year: resultI.workYear || "",
                salary_min: parseInt(salary.split("-")[0]) || - 1,
                salary_max: parseInt(salary.split("-")[1]) || - 1,
                company_id: resultI.companyId,
                company_full_name: resultI.companyFullName | "",
                company_logo: resultI.companyLogo || "",
                company_short_name: resultI.companyShortName || "",
                company_size: resultI.companySize || "",
                position_id: resultI.positionId || "",
                position_name: resultI.positionName || "",
                position_advantage: resultI.positionAdvantage || "",
                second_type: resultI.secondType || "",
                publish_time: resultI.createTime || "",
                finance_stage: resultI.financeStage || "",
                city: resultI.city || "",
                district: resultI.district || "",
            };
            // console.log(unit);
            allResults.push(unit);
        }
    });
}

// 创建一个item
function createItem(index) {
    var item = allResults[index];
    return Web.create(item).then(function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(index + 1);
            }, 0)
        })
    })

}

var pageArray = [];
for (var j = 1; j <= 30; j ++) {
    pageArray.push(getPage(j))
}


Promise.all(pageArray).then(function () {
    var itemIndexs = [];
    for (var i = 0; i < allResults.length; i ++) {
        itemIndexs.push(i);
    }
    var result = Promise.resolve(0);// 从0开始
    itemIndexs.forEach(function () {
        result = result.then(createItem)
    });
});
