/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.authcache
	@author   Amphineko (Naoki Rinmous)
	
	@modification-increment  #1 (03/09/2014)
*/

var fs = require('fs');
var log = new (require('Log'))('debug');

var cache = {};
var path = 'tmp/cache.json';

module.exports.data = function (key, value) {
	if (key)
		if (value)
			cache[key] = value;
		else
			return cache[key];
	else
		return cache;
}

module.exports.save = function() {
	fs.writeFileSync(path, JSON.stringify(cache));
};

module.exports.load = function () {
	try {
		cache = JSON.parse(fs.readFileSync(path));
	} catch (error) {
		log.error('<BotSessionCache> 讀入快取資料時遇到錯誤: ' + error);
	}
};
