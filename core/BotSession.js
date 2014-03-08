/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.session
	@author   Amphineko (Naoki Rinmous)
	
	@modification-increment  #4 (03/09/2014)
*/

var api = require('./qqapi2');
var Bootloader = require('./../Bootloader');
var log = new (require('Log'))('debug');
var Userfetch = require('./Userfetch');

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
	Userfetch.fetchFriends(that.auth, function (ret, res) {
		if (ret) {
			log.info('<BotSession> 完成讀入好友列表 [' + res.info.length + ']');
			that.friend = res;
			
			log.info('<BotSession> 開始讀入群組列表');
			Userfetch.fetchGroups(that.auth, function (ret, res) {
				if (ret) {
					log.info('<BotSession> 完成讀入群組列表 [' + res.gnamelist.length + ']');
					that.group = res;
					
					log.info('<BotSession> 開始讀入群組資料 [' + res.gnamelist.length + ']');
					Userfetch.fetchGroupInfoAll(that.auth, that.group, function (ret, res) {
						if (ret) {
							log.info('<BotSession> 完成讀入群組資料 [' + Object.keys(res).length + ']');
							that.groupInfo = res;
							
							// [TODO]: 進入Poll循環
						} else
							Bootloader.exit(1034, res);
					});
				} else
					Bootloader.exit(1033, res);
			});
		} else
			Bootloader.exit(1032, res);
	});
}

module.exports = BotSession;