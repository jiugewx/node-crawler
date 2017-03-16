var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
var moment = require('moment');
var utils = require("../utils/base.js");
var Web = require("./table.js");
var host = "http://newhouse.cs.fang.com";

var url = "https://www.lagou.com/jobs/positionAjax.json";
var Cookie = "JSESSIONID=992CB08C67531377A9E900194C24062E; user_trace_token=20170315214040-5a26f06f8db24054a17c38f49265d2a0; PRE_UTM=; PRE_HOST=www.baidu.com; PRE_SITE=https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3DHknvHa3cZVFoHCYsSElszM7B7FBvYYX3dsMuoZwPbge%26wd%3D%26eqid%3De14ff2a50002c4410000000358c9444f; PRE_LAND=https%3A%2F%2Fwww.lagou.com%2F; LGUID=20170315214041-fb2a31d3-0984-11e7-b827-525400f775ce; index_location_city=%E6%B7%B1%E5%9C%B3; TG-TRACK-CODE=index_navigation; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489585241,1489585763; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489585823; _ga=GA1.2.809627160.1489585241; LGSID=20170315214041-fb2a2f7e-0984-11e7-b827-525400f775ce; LGRID=20170315215023-55efeb63-0986-11e7-9472-5254005c3644; SEARCH_ID=14406d5c4c304ba5bdf07edc5b69747b";

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
                resolve({
                    detail: JSON.parse(json),
                    url: url
                })
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
                position_name: resultI.positionName || "",
                position_advantage: resultI.positionAdvantage || "",
                second_type: resultI.secondType || "",
                district: resultI.district || "",
                publish_time: resultI.createTime || "",
            };
            // console.log(unit);
            allResults.push(unit);
        }
    });
}

// 创建一个item
function createItem(index) {
    return new Promise(function (resolve) {
        var item = allResults[index];
        setTimeout(function () {
            Web.create(item);
            console.log(item);
            resolve(index + 1);
        }, 100)
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
    console.log(allResults.length);
    var result = Promise.resolve(0);// 从0开始
    itemIndexs.forEach(function () {
        result = result.then(createItem)
    });
});