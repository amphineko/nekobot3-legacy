/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.session
	@author   Amphineko (Naoki Rinmous)
	
	@modification-increment  #6 (03/13/2014)
*/


var Adapter = require('./EventAdapter');
var api = require('./qqapi2');
var Bootloader = require('./../Bootloader');
var log = new (require('Log'))('debug');
var Pluginman  = require('./Pluginman');

var BotSession = function (_auth, _cookies, _config) {
	this.auth = _auth;
	this.config = _config;
	this.cookies = _cookies;
	
	this.friend = {};
	this.group = {};
	this.groupInfo = {};
	
	api.setCookies(this.cookies);
}

BotSession.prototype.start = function () {
	var that = this;
	
	log.info('<BotSession> 開始讀入好友列表');
	Pluginman.loadPluginList(that.config.plugins);
	api.poll2(that.auth, function (ret, error) {
		poll_handle(that, ret, error);
	});
}

function poll_handle(session, ret, error) {
	if (error) {
		log.error("<BotSession> 執行Poll操作時遇到異常: " + error);
		return;
	}
	
	var retcode = ret ? ret.retcode : -1;
	switch (retcode) {
		case -1:
			log.error("<BotSession> Null Response (retcode == -1)");
			break;
		case 0:
			var res = ret.result;
			for (var key in res)
				Adapter.process(session, res[key]);
			break;
		case 102:
			log.debug('<BotSession> nothing happened');
			break;
		case 103: case 121:
			log.critical('<BotSession> 登入狀態異常: ' + retcode);
			Bootloader.exit(72, '登入狀態異常: ' + retcode);
		case 116:
			session.auth['ptwebqq'] = ret.p;
			break;
		default:
			log.debug(resp);
			break;
	}
}

module.exports = BotSession;