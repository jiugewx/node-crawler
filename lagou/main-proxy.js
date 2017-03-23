var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
const proxy = require('superagent-proxy');
proxy(request);
charset(request);
var moment = require('moment');
var utils = require("../utils/base.js");
var Web = require("./table.js");
var url = "https://www.lagou.com/jobs/positionAjax.json";
var Cookie = "user_trace_token=20170315214040-5a26f06f8db24054a17c38f49265d2a0; LGUID=20170315214041-fb2a31d3-0984-11e7-b827-525400f775ce; showExpriedIndex=1; showExpriedCompanyHome=1; showExpriedMyPublish=1; hasDeliver=131; index_location_city=%E4%B8%8A%E6%B5%B7; JSESSIONID=889455F41D65752757A59B68DD017643; _gat=1; PRE_UTM=; PRE_HOST=www.baidu.com; PRE_SITE=https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3DFAHTHFvmAgxX-C-fQPArf6nQ-NfK0lgFkXTo07NRyXm%26wd%3D%26eqid%3D95fff752000bf3150000000358ccdd42; PRE_LAND=https%3A%2F%2Fwww.lagou.com%2F; TG-TRACK-CODE=index_navigation; SEARCH_ID=fa0bcd47b6404c0789e7aab1d80f6fc1; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489759985,1489763898,1489805728,1489821000; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1489821015; LGSID=20170318151000-e6c6ff31-0ba9-11e7-8723-525400f775ce; LGRID=20170318151014-ef326c81-0ba9-11e7-94fb-5254005c3644; _ga=GA1.2.809627160.1489585241"


function getProxyList() {
    var apiURL = 'http://www.66ip.cn/mo.php?sxb=&tqsl=100&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea=http%3A%2F%2Fwww.66ip.cn%2F%3Fsxb%3D%26tqsl%3D100%26ports%255B%255D2%3D%26ktip%3D%26sxa%3D%26radio%3Dradio%26submit%3D%25CC%25E1%2B%2B%25C8%25A1';
    var headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
        'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
        'referer': 'http://www.66ip.cn/'
    };
    return new Promise(function (resolve, reject) {
        request
            .get(apiURL)
            .set(headers)
            .end(function (error, response) {
                if ( error ) {
                    console.log(error);
                    resolve([]);
                }
                var body = response.text;
                var ret = body.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,4}/g);
                resolve(ret);
            });
    })
}

function valideOne(proxyurl) {
    return new Promise(function (resolve, reject) {
        var url = 'http://ip.chinaz.com/getip.aspx';
        var proxy = 'http://' + proxyurl;
        request
            .get(url)
            .proxy(proxy)
            .timeout(3000)
            .end(function (err, res) {
                if ( err ) {
                    // console.log(err);
                    resolve("");
                    return
                }
                var json = res.text;
                console.log("验证通过=>:" + proxyurl);
                // console.log(json);
                validArray.push(proxyurl);
                resolve(proxyurl);
            });
    })
}

// 请求一个地址
function requestUrl(url, page, city, proxyurl) {
    console.log("url:" + url);
    console.log("page:" + page);
    console.log("city:" + city);
    console.log("proxyurl:" + proxyurl);

    var proxy = 'http://' + proxyurl;
    return new Promise(function (resolve, reject) {
        request
            .post(url)
            .proxy(proxy)
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

// 请求一个页面的数据
function getPage(params) {
    return requestUrl(url, params.page, params.city, params.proxyUrl)
}

// 建立并发请求
function getPagesLimit(TaskParams, maxClients, fn) {
    if ( TaskParams.length != 0 ) {
        var stackArray = TaskParams.splice(0, maxClients);
        var PromiseStack = [];
        stackArray.forEach(function (item) {
            PromiseStack.push(fn(item))
        });

        var leftTaskParams = TaskParams;
        return Promise.all(PromiseStack).then(function () {
            return getPagesLimit(leftTaskParams, fn, maxClients)
        })
    }
    return Promise.reject("GAME_OVER!");
}

// 解析内容
function parseResponse(data) {
    var results = data.detail["content"] ? data.detail["content"]['positionResult']['result'] : [];
    if ( results.length == 0 ) {
        return []
    }

    var _thisPageResult = [];
    for (var i = 0; i < results.length; i ++) {
        var resultI = results[i];
        var salary = resultI.salary ? resultI.salary.replace(/k/g, "") : "-";
        var workyear = resultI.workYear ? resultI.workYear.replace(/年/g, "") : "-";
        var size = resultI.companySize ? resultI.companySize.replace(/人/g, "") : "-";
        var position_id = resultI.positionId || "";
        var detail_url = position_id ? "https://www.lagou.com/jobs/" + position_id + ".html" : "";
        var unit = {
            wok_min: parseInt(workyear.split("-")[0]) || - 1,    // 工作最低年限
            wok_max: parseInt(workyear.split("-")[1]) || - 1,    // 工作最高年限
            sal_min: parseInt(salary.split("-")[0]) || - 1,      // 薪水最低水平
            sal_max: parseInt(salary.split("-")[1]) || - 1,      // 薪水最高水准
            com_min: parseInt(size.split("-")[0]) || - 1,        // 公司人员规模下限值
            com_max: parseInt(size.split("-")[1]) || - 1,        // 公司人员规模上限值
            com_logo: resultI.companyLogo || "",                // 公司的logo
            com_name: resultI.companyShortName || "",           // 公司名称
            pos_name: resultI.positionName || "",               // 职位名称
            pos_advantage: resultI.positionAdvantage || "",     // 职位福利
            det_url: detail_url,                                // 岗位详情
            skill: "",                                           // 技能
            pub_time: resultI.createTime || "",                 // 发布时间
            fin_stage: resultI.financeStage || "",              // 财务状况
            city: resultI.city || "",                           // 城市
            district: resultI.district || ""                    // 地区
        };
        console.log(unit);
        _thisPageResult.push(unit);
    }

    return _thisPageResult
}

// 存储到mysql
function saveToMysql(objectArray) {
    // 存储
    function createItem(index) {
        var item = objectArray[index];
        var length = objectArray.length;
        return Web.create(item).then(function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    if ( index == length - 1 ) {
                        resolve()
                    } else {
                        resolve(index + 1);
                    }
                }, 0)
            })
        })

    }

    var itemIndexs = [];
    var length = objectArray.length;
    for (var k = 0; k < length; k ++) {
        itemIndexs.push(k);
    }

    var result = Promise.resolve(0);// 从0开始
    itemIndexs.forEach(function () {
        result = result.then(createItem)
    });
}

// 建立队列
function buildStack(proxies) {
    var pageArray = [];
    var max = 1;
    var citys = ["深圳", "杭州", "北京", "上海"];
    proxies = proxies || [];
    var proxyLength = proxies.length;
    if ( proxyLength >= 5 ) {
        for (var j = 0; j < citys.length; j ++) {
            for (var i = 1; i <= max; i ++) {
                var data = {
                    city: citys[j],
                    page: i,
                    proxyUrl: proxies[Math.floor(proxyLength * Math.random())]
                };
                pageArray.push(data)
            }
        }
    }
    console.log(pageArray);
    return pageArray
}

var validArray = [];
getProxyList()
    .then(function (proxyList) {
        var PromiseArray = [];
        proxyList.forEach(function (proxyurl) {
            PromiseArray.push(valideOne(proxyurl));
        });

        return Promise.all(PromiseArray)
    })
    .then(function () {
        return new Promise(function (resolve, reject) {
            console.log(validArray);
            var taskParams = buildStack(validArray);
            resolve(taskParams);
        })
    })
    .then(function (data) {
        return getPagesLimit(data, 5, getPage);
    })
    .then(function () {

    });