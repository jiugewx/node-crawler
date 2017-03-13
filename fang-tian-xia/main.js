var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
var moment = require('moment');
var utils = require("../utils/base.js");
var house = require("../sequelize.js");
var host = "http://newhouse.cs.fang.com";

// var url = "http://newhouse.cs.fang.com/house/s/b810-c3110%2C144-c9y/";
var Cookie = "showAdquanguo=1; global_cookie=v187c7ws8owbnammasza0lwmk15j07gso6u; indexAdvLunbo=lb_ad5%2C0; __utmt_t0=1; __utmt_t1=1; __utmt_t2=1; sf_source=; s=; showAdcs=1; city=cs; __utmt_t3=1; __utmt_t4=1; new_search_uid=53ed90827b4a0259bddf88df77abd70c; __utma=147393320.1395782459.1489370594.1489370594.1489370594.1; __utmb=147393320.44.10.1489370594; __utmc=147393320; __utmz=147393320.1489370594.1.1.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; newhouse_chat_guid=102E4B2A-2A13-CEB4-E1B6-31B4754C73DA; jiatxShopWindow=1; coderes=xJjiPHvGEyHGnUeg; Captcha=4E546151324771764C634D316432744B576A39565459704A48376A4F4655527A675557627331466E763076643642457438662F7936414D52434570385278667A32422B42663654335550383D; newhouse_user_guid=94B33913-FAB0-9695-0368-BD8260D4F5D9; unique_cookie=U_v187c7ws8owbnammasza0lwmk15j07gso6u*9";

var allObject = {};
var AsyncArray = [];
var page = [
    "/house/s/b810-b91-c390%2C144-c9y/",
    "/house/s/b810-b92-c390%2C144-c9y/",
    "/house/s/b810-b93-c390%2C144-c9y/",
    "/house/s/b810-b94-c390%2C144-c9y/",
    "/house/s/b810-b95-c390%2C144-c9y/",
    "/house/s/b810-b96-c390%2C144-c9y/",
    "/house/s/b810-b97-c390%2C144-c9y/",
    "/house/s/b810-b98-c390%2C144-c9y/",
    "/house/s/b810-b99-c390%2C144-c9y/"
];
var PageArray = [];

function requestUrl(url, id) {
    return new Promise(function (resolve, reject) {
        request
            .get(url)
            .set('Cookie', Cookie)
            .charset('gbk')
            .end(function (err, res) {
                if ( err ) {
                    console.log(err);
                    resolve({
                        content: "",
                        url: url,
                        id: id
                    });
                }
                var html = res.text;
                resolve({
                    content: html,
                    url: url,
                    id: id
                })
            })
    })
}

// 获取概况
function getSummary(url) {
    var Data = {};
    return new Promise(function (resolve, reject) {
        request
            .get(url)
            .set('Cookie', Cookie)
            .charset('gbk')
            .end(function (err, res) {
                if ( err ) {
                    console.log(err);
                }
                var html = res.text;
                var $ = cheerio.load(html, {decodeEntities: false});
                var items = $(".contentList .flist");
                items.each(function (index, item) {
                    var $item = $(item);
                    var title = $item.find(".finfo h3").text().trim();
                    var spaceText = $item.find(".finfo .hx span").attr("title");
                    var space = spaceText.replace(/&nbsp;/g, "");
                    var keywordText = $item.find(".finfo .guanjianzi").text().trim();
                    var keyWords = keywordText.replace(/\n|\t/g, "");
                    var priceText = $item.find(".fprice .price .pr1").text().trim();
                    var price = priceText.replace("万", "");
                    var image = $item.find("li.tm img").attr("src");
                    var idText = $item.find("li.tm").attr("id");
                    var id = idText.replace(/[^0-9]/ig, "");
                    // 开始创建异步任务：点击详情去匹配内容
                    var detailTarget = $item.find(".finfo h3 a").attr("href");

                    Data[id] = {
                        _id: id,
                        index: index,
                        name: title,
                        house_type: space,
                        keywords: keyWords,
                        price: price,
                        image_url: image,
                        detail_url: detailTarget
                    };
                    console.log(Data[id]);
                    house.create(Data[id]);
                });

                resolve(Data);
            });
    })
}

// 获取其他详情
function getAsyncSingleDetail(url, id) {
    var newUrl = url.split("fang.com/")[0] + "fang.com/dianping/";
    return requestUrl(newUrl, id)
        .then(function (data) {
            return new Promise(function (res, rej) {
                var id = data.id;
                var $ = cheerio.load(data.content, {decodeEntities: false});
                var count = $("#dpCount").text().replace(/\(|\)/g, "");
                var comment_font = $(".Comprehensive_score .fbold22.fl.mgl13.mgt_2").text().trim();
                var comment_last = $(".Comprehensive_score .fbold14.fl").text().replace(/[^0-9]/ig, "");

                allObject[id]["comment"] = count;
                allObject[id]["score"] = Number(comment_font + "." + comment_last);

                res(allObject[id])
            })
        });
}

function getAllDetail(data) {
    allObject = data;
    for (var id in data) {
        AsyncArray.push(getAsyncSingleDetail(data[id].detail_url, id))
    }
    return Promise.all(AsyncArray); // resolve(一个数组)
}


function getPage(url) {
    return getSummary(url)
}

function mergeArray2Object(array) {
    var data = {};
    for (var i = 0; i < array.length; i ++) {
        data = Object.assign(data, array[i]);
    }
    return data;
}

//该函数的作用：在本地存储所爬取的json
function savedContent(news_title, content) {
    var time = moment().format("YYYYMMDDhhmmss");
    fs.appendFile('./data/' + news_title + time + '.JSON', content, 'utf-8', function (err) {
        if ( err ) {
            console.log(err);
        }
    });
}


for (var k = 0; k < page.length; k ++) {
    PageArray.push(getPage(host + page[k]))
}

Promise.all(PageArray)
    .then(function (result) {
        return new Promise(function (res, rej) {
            var data = mergeArray2Object(result);
            res(data);
        })
    })
    .then(getAllDetail)
    .catch(function (error) {
        console.log("出错了：", error)
    });

// house.clearTable();