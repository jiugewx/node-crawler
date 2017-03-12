/**
 * Created by xinye on 2017/3/12.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
const charset = require('superagent-charset');
const request = require('superagent');

var url = "https://xueqiu.com/";
var Cookie = "s=8m16iiwxo9; bid=ab4dfcf2148bea58c2458690fc04e868_iyvngw3o; remember=1; remember.sig=K4F3faYzmVuqC0iXIERCQf55g2Y; xq_a_token=b20f1b46abfaa9c157c531f1b389276e5d9e8375; xq_a_token.sig=Mm5hCmEOSX9AJiM_f03TbMKz2YE; xq_r_token=181dbee9bd3d8b691c19a77fcce52340bc1649c7; xq_r_token.sig=gIv4BEN0MUY3ml7_HF8uacJYUUU; xq_is_login=1; xq_is_login.sig=J3LxgPVPUzbBg3Kee_PquUfih7Q; u=7424745095; u.sig=2fm1kMHzAm_VWMNb42iqvPh7tt4; snbim_minify=true; aliyungf_tc=AQAAADX3hCCPcgIAvTf3PPHkP9a152yh; webp=1; __utma=1.346446213.1489303421.1489303421.1489303421.1; __utmc=1; __utmz=1.1489303421.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); Hm_lvt_1db88642e346389874251b5a1eded6e3=1489296774; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1489304380"

function startRequest(x) {
    //采用http模块向服务器发起一次get请求
    http.get(x, function (res) {
        var html = '';        //用来存储请求网页的整个html内容
        var chunks = [];
        // res.setEncoding('utf8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            // 将二进制数据解码成 gb2312 编码数据
            var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
            console.log(html);
        });

    }).on('error', function (err) {
        console.log(err);
    });

}

charset(request);

request
    .get(url)
    .set('Cookie', Cookie)
    .charset('utf8')
    .end(function (err, res) {
        if (err) {
            console.log(err);
        }
        var html = res.text;
        // console.log('--------------->', html);
        var $ = cheerio.load(html, {decodeEntities: false});
        var items = $("#status-list .status-item");
        items.each(function (index, item) {
            var $item = $(item);
            console.log("============================" + index);
            var title = $item.find(".status-title").text().trim();
            var content = $item.find(".text").text().trim();
            var topic = $item.find(".original-uri").text().trim();
            var number = topic.replace(/[^0-9]/ig, "");
            var data = {
                title: title,
                content: content,
                hot: number
            };

            console.log(data);
        });
    });

//
// request(options, function (err, sres, body) {
//     if (err) {
//         console.log(err);
//     }
//     var html = iconv.decode(body, 'GB2312');
//     var $ = cheerio.load(html, {decodeEntities: false});
//     console.log(html);
//     console.log($('body').html());
// });


// startRequest(url);


//该函数的作用：在本地存储所爬取的新闻内容资源
function savedContent($, news_title) {
    $('.article-content p').each(function (index, item) {
        var x = $(this).text();

        var y = x.substring(0, 2).trim();

        if (y == '') {
            x = x + '\n';
//将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
            fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    })
}
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title) {
    $('.article-content img').each(function (index, item) {
        var img_title = $(this).parent().next().text().trim();  //获取图片的标题
        if (img_title.length > 35 || img_title == "") {
            img_title = "Null";
        }
        var img_filename = img_title + '.jpg';

        var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src'); //获取图片的url

//采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src, function (err, res, body) {
            if (err) {
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '---' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
    })
}
