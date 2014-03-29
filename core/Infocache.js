/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.userinfo
	@author   Amphineko (Naoki Rinmous)
*/

var api = require('./qqapi2');
var fs = require('fs'); // For JSON output test
var log = new (require('Log'))('debug');

var listFriend, listGroup, listGroupInfo, session;

listFriend = listFriend || [];
listGroup = listGroup || [];
listGroupInfo = listGroupInfo || [];


function setSession(_) {
	if (_)
		session = _;
	return session;
}
module.exports.setSession = setSession;

function filter2(array, key, value) {
	return array.filter(function (element) {
		return element[key] === value;
	})
}


/* Friend List Operations */

function readFriend(style, key, value) {
	switch (style) {
		case 'uin':
			return listFriend[value];
		case 'filter':
			return filter2(listFriend, key, value).pop();
		default:
			throw 'Unsupported reading style: ' + style;
	}
}

function getFriend(uin, callback) {
	return getFriend2('uin', null, uin, callback);
}
module.exports.getFriend = getFriend;

function getFriend2(style, key, value, callback) {
	var friend = readFriend(style, key, value);

	if (friend) {
		if (callback)
			callback(friend);
		return friend;
	} else {
		refreshFriend(session.auth, function (stat, message) {
			if (callback)
				callback(readFriend(style, key, value) || false);
		});
		return false;
	}
}
module.exports.getFriend2 = getFriend2;

function refreshFriend(auth, callback) {
	listFriend = {};
	var callback2 = function (stat, message) {
		if (stat)
			log.info('<Infocache> 讀取好友列表完成');
		else
			log.error('<Infocache> 讀取好友列表失敗: ' + message);
		if (callback)
			callback(stat, message);
	}
	
	api.get_user_friends2(auth, function (ret, error) {
		if (!error)
			if (ret)
				if (ret.retcode === 0) {
					ret.result.info.filter(function (element) {
						listFriend[element.uin] = element;
					});

					callback2(true, null);
				} else
					callback2(false, 'retcode != 0 [' + ret.retcode + ']');
			else
				callback2(false, 'Unexpected null return!');
		else
			callback2(false, error);
	});
}
module.exports.refreshFriend = refreshFriend;


/* Gruop List Operations */

function getGroupInfo(gcode, callback) {
	var info = listGroupInfo[gcode];

	if (info) {
		if (callback)
			callback(info);
		return info;
	} else {
		refreshGroupInfo(gcode, function (stat, message) {
			if (callback)
				callback(listGroupInfo[gcode] || false);
		});
		return false;
	}
}
module.exports.getGroupInfo = getGroupInfo;

function getGroupMember(gcode, uin, callback) {
	var info = getGroupInfo(gcode, function (res) {
		if (callback)
			if (listGroupInfo[gcode])
				callback(listGroupInfo[gcode].member[uin] || false);
			else
				callback(false);
	});
	if (info.members) {
		if (info.members[uin]) {
			if (callback)
				callback(info.members[uin]);
			return info.members[uin];
		}
	}
}
module.exports.getGroupMember = getGroupMember;

function refreshGroupInfo(gcode, callback) {
	listGroupInfo[gcode] = {};
	log.info('<Infocache> 讀取群組資料: ' + gcode);

	var callback2 = function (stat, message) {
		if (!stat)
			log.error('<Infocache> 讀取群組成員列表失敗: ' + message);
		if (callback)
			callback(stat, message);
	}

	api.get_group_info_ext2(session.auth, gcode, function (ret, error) {
		if (!error)
			if (ret)
				if (ret.retcode === 0) {
					try {
						var res = ret.result;
						var members = {};

						res.minfo.filter(function (element) {
							members[element.uin] = element;
							members[element.uin].nick = members[element.uin].rawnick = members[element.uin].nick;
						});
						if (res.cards)
							res.cards.filter(function (element) {
								members[element.muin].nick = element.card;
							});

						listGroupInfo[gcode].info = res.ginfo;
						listGroupInfo[gcode].members = members;

						log.info('<Infocache> 讀取群組資料完成: ' + res.ginfo.name + ' (' + gcode + ')');
						callback2(true, null);
					} catch (error) {
						log.info('<Infocache> 處理群組資料時遇到錯誤: ' + error);
						callback2(false, 'process group info error: ' + error);
					}
				} else
					callback2(false, 'retcode != 0 [' + ret.retcode + ']');
			else
				callback2(false, 'Unexpected null return!');
		else
			callback2(false, error);
	});
}

