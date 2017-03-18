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
var Cookie = "user_trace_token=20170315214040-5a26f06f8db24054a17c38f49265d2a0; LGUID=20170315214041-fb2a31d3-0984-11e7-b827-525400f775ce; index_location_city=%E6%B7%B1%E5%9C%B3; JSESSIONID=992CB08C67531377A9E900194C24062E; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489585241,1489585763,1489593874,1489671493; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489671493; _ga=GA1.2.809627160.1489585241; _gat=1; LGSID=20170316213813-cd40816c-0a4d-11e7-94c7-5254005c3644; PRE_UTM=; PRE_HOST=www.baidu.com; PRE_SITE=https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3DCuKZZAOIooFdwnX2L42p7PPpBs8Veti3X2QpdlNMuF3%26wd%3D%26eqid%3Dafa53ace0000aa690000000358ca9540; PRE_LAND=https%3A%2F%2Fwww.lagou.com%2F; LGRID=20170316213813-cd4083c0-0a4d-11e7-94c7-5254005c3644; TG-TRACK-CODE=index_navigation; SEARCH_ID=64f8c39add19401c950cf29bc7c26634";

function requestUrl(url, page, city) {
    return new Promise(function (resolve, reject) {
        request
            .post(url)
            .set('Cookie', Cookie)
            .set('Accept', "application/json")
            .charset('utf8')
            .query({px: 'new'})
            .query({city: city})
            .query({needAddtionalResult: false})
            .type('form')
            .send({first: false})
            .send({kd: "web前端"})
            .send({pn: page})
            .end(function (err, res) {
                if (err) {
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

function getPage(params) {
    return requestUrl(url, params.page, params.city).then(function (data) {
        var results = data.detail["content"] ? data.detail["content"]['positionResult']['result'] : [];
        if (results.length == 0) {
            return
        }
        var _thisPageResult = [];
        for (var i = 0; i < results.length; i++) {
            var resultI = results[i];
            var salary = resultI.salary.replace(/k/g, "");
            var workyear = resultI.workYear.replace(/年/g, "");
            var size = resultI.companySize.replace(/人/g, "");
            var position_id = resultI.positionId || "";
            var detail_url = position_id ? "https://www.lagou.com/jobs/" + position_id + ".html" : "";
            var unit = {
                wok_min: parseInt(workyear.split("-")[0]) || -1,    // 工作最低年限
                wok_max: parseInt(workyear.split("-")[1]) || -1,    // 工作最高年限
                sal_min: parseInt(salary.split("-")[0]) || -1,      // 薪水最低水平
                sal_max: parseInt(salary.split("-")[1]) || -1,      // 薪水最高水准
                com_min: parseInt(size.split("-")[0]) || -1,        // 公司人员规模下限值
                com_max: parseInt(size.split("-")[1]) || -1,        // 公司人员规模上限值
                com_logo: resultI.companyLogo || "",                // 公司的logo
                com_name: resultI.companyShortName || "",           // 公司名称
                pos_name: resultI.positionName || "",               // 职位名称
                pos_advantage: resultI.positionAdvantage || "",     // 职位福利
                det_url: detail_url,                                // 岗位详情
                skill:"",                                           // 技能
                pub_time: resultI.createTime || "",                 // 发布时间
                fin_stage: resultI.financeStage || "",              // 财务状况
                city: resultI.city || "",                           // 城市
                district: resultI.district || ""                    // 地区
            };
            _thisPageResult.push(unit);
        }

        // 存储
        function createItem(index) {
            var item = _thisPageResult[index];
            var length = _thisPageResult.length;
            return Web.create(item).then(function () {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        if (index == length - 1) {
                            resolve()
                        } else {
                            resolve(index + 1);
                        }
                    }, 0)
                })
            })

        }

        var itemIndexs = [];
        var length = _thisPageResult.length;
        for (var k = 0; k < length; k++) {
            itemIndexs.push(k);
        }
        var result = Promise.resolve(0);// 从0开始
        itemIndexs.forEach(function () {
            result = result.then(createItem)
        });
    });
}


var pageArray = [];
var max = 20;
var citys = ["深圳", "杭州", "北京", "上海"];
for (var j = 0; j < citys.length; j++) {
    for (var i = 1; i <= max; i++) {
        var data = {
            city: citys[j],
            page: i
        };
        pageArray.push(data)
    }
}

function getOnePage(index) {
    var data = pageArray[index];
    return getPage(data).then(function () {
        var time = 10000 + Math.ceil(Math.random() * 10000);
        return new Promise(function (resolve) {
            setTimeout(function () {
                if (index == pageArray.length - 1) {
                    resolve();
                } else {
                    resolve(index + 1);
                }
            }, time)
        })
    })
}

var result1 = Promise.resolve(0);// 从0开始
pageArray.forEach(function () {
    result1 = result1.then(getOnePage)
});
