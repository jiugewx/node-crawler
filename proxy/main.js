var request = require("request");
var iconv = require('iconv-lite');
var Promise = require("bluebird");
const charset = require('superagent-charset');
const superagent = require('superagent');
const proxy = require('superagent-proxy');
proxy(superagent);

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
        superagent
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
        superagent
            .get(url)
            .proxy(proxy)
            .timeout(4000)
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


var validArray = [];
getProxyList()
    .then(function (proxyList) {

        //这里修改一下，变成你要访问的目标网站
        var PromiseArray = [];
        proxyList.forEach(function (proxyurl) {
            PromiseArray.push(valideOne(proxyurl));
        });
        return Promise.all(PromiseArray)
    })
    .then(function () {
        return new Promise(function (res, rej) {
            console.log("有效地址：" + validArray);
        })
    });
