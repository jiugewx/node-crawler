var client = require("./redis.js");

client.on("error", function (err) {
    console.log("Error " + err);
});

client.sadd("sets","1");
client.sadd("sets","2");
client.sadd("sets","3");

client.srem("sets","5");

client.spop("sets");

client.sadd("sets","444");

