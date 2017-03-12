/**
 * Created by xinye on 2017/3/12.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');
charset(request);
var host = "http://newhouse.cs.fang.com";
// var url = "http://newhouse.cs.fang.com/house/s/b810-c3110%2C144-c9y/";
var Cookie = "global_cookie=rllvehz9y2q14m1ryta50owtk1oj06dg2kg; searchLabelN=3_1489304518_7921%5B%3A%7C%40%7C%3A%5Da2174d3aff45f973894f38c179c10916; searchConN=3_1489304518_8494%5B%3A%7C%40%7C%3A%5D0ccd291a349d353ce7b923f9f0d64dce; new_search_uid=17ff89ad7f21138ce6a4cf326794b5f3; newhouse_chat_guid=E961597A-4220-E796-D656-C901F55EF7FE; jiatxShopWindow=1; Captcha=58384A542F685176473068676663774C4C6B6C6748314F784279636C4F36715161596C747930735370464D4D4B4C6A345179794A7A666C4A4D4D344D6F343431367265692F706844412F6B3D; vh_newhouse=3_1489304706_13282%5B%3A%7C%40%7C%3A%5D47891578c8babbd19391aec38709590c; newhouse_user_guid=109E4B2A-AEEB-1EC1-B055-99572AE77737; __utmt_t0=1; __utmt_t1=1; __utmt_t2=1; sf_source=; s=; city=cs; indexAdvLunbo=; __utmt_t3=1; __utmt_t4=1; __utma=147393320.179223313.1489304500.1489304500.1489309684.2; __utmb=147393320.31.10.1489309684; __utmc=147393320; __utmz=147393320.1489309684.2.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; unique_cookie=U_rllvehz9y2q14m1ryta50owtk1oj06dg2kg*25";


function requestUrl(url, id) {
    return new Promise(function (resolve, reject) {
        request
            .get(url)
            .set('Cookie', Cookie)
            .charset('gbk')
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    reject();
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
                if (err) {
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
                        detail: detailTarget,
                        name: title,
                        house_type: space,
                        keyword: keyWords,
                        price: price,
                        image: image
                    };
                });


                resolve(Data);
            });
    })
}

// 获取其他详情
function getAsyncSingleDetail(url, id) {
    return requestUrl(url, id)
        .then(function (data) {
            return new Promise(function (res, rej) {
                var id = data.id;
                var $ = cheerio.load(data.content, {decodeEntities: false});
                var items = $(".right_box_zzlxnrl.hidden .f14");
                var addressHtml = $(items[items.length - 1]);
                var districtHtml = addressHtml.find("span.fl").text();
                var district = districtHtml.replace(/&nbsp;/g, " ").replace(/\[|\]/g, "").split("：")[1];
                var address = addressHtml.find(">a").text();
                var newUrl = data.url.split("fang.com/")[0] + "fang.com/dianping/";
                allObject[id]["address"] = district + address;
                allObject[id]["district"] = district;
                var resData = {
                    id: id,
                    url: newUrl
                };

                res(resData)
            })
        })
        .then(function (data) {
            return requestUrl(data.url, data.id)
        })
        .then(function (data) {
            return new Promise(function (res, rej) {
                var id = data.id;
                var $ = cheerio.load(data.content, {decodeEntities: false});
                var count = $("#dpCount").text().replace(/\(|\)/g, "");
                var comment_font = $(".Comprehensive_score .fbold22.fl.mgl13.mgt_2").text().trim();
                var comment_last = $(".Comprehensive_score .fbold14.fl").text().replace(/[^0-9]/ig, "");

                allObject[id]["count"] = count;
                allObject[id]["score"] = Number(comment_font + "." + comment_last);
                // console.log(allObject[id]);
                res(allObject[id])
            })
        });
}

function getAllDetail(data) {
    allObject = data;
    for (var name in data) {
        AsyncArray.push(getAsyncSingleDetail(data[name].detail, name))
    }
    return Promise.all(AsyncArray); // resolve(一个数组)
}

var allObject = {};
var AsyncArray = [];
var page = [
    "/house/s/b810-b91-c3110%2C144-c9y/",
    "/house/s/b810-b92-c3110%2C144-c9y/",
    "/house/s/b810-b93-c3110%2C144-c9y/",
    "/house/s/b810-b94-c3110%2C144-c9y/",
    "/house/s/b810-b95-c3110%2C144-c9y/",
    "/house/s/b810-b96-c3110%2C144-c9y/",
    "/house/s/b810-b97-c3110%2C144-c9y/",
];
var PageArray = [];

function getPage(url) {
    return getSummary(url)
}

function mergeArray2Object(array) {
    var data = {};
    for (var i = 0; i < array.length; i++) {
        data = Object.assign(data, array[i]);
    }
    return data;
}
for (var k = 0; k < page.length; k++) {
    PageArray.push(getPage(host + page[k]))
}

Promise.all(PageArray).then(function (result) {
    return new Promise(function (res, rej) {
        var data = mergeArray2Object(result);
        res(data);
    })
}).then(getAllDetail).then(
    function (data) {
        data.sort(function (a, b) {
            return a.score < b.score
        });
        var json = JSON.stringify(data);
        savedContent("sortByScore", json);
    }
).catch(function (error) {
    console.log("出错了：",error)
});


//该函数的作用：在本地存储所爬取的json
function savedContent(news_title, content) {
    var time = new Date().getTime();
    fs.appendFile('./data/' + news_title + time + '.JSON', content, 'utf-8', function (err) {
        if (err) {
            console.log(err);
        }
    });
}