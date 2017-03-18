/**
 * Created by xinye on 2017/3/18.
 */

var redis = require("redis");
module.exports = redis.createClient(6379, "localhost");