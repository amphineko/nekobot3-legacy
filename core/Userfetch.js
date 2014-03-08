/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.userfetch
	@author   Amphineko (Naoki Rinmous)
	
	@modification-increment  #5 (03/09/2014)
*/

var api = require('./qqapi2');
var log = new (require('Log'))('debug');

module.exports.fetchFriends = function (auth, callback) {
	api.get_user_friends2(auth, function (ret, error) {
		if (error)
			log.error('<Userfetch> 讀取好友列表時遇到異常: ' + error);
		if (callback)
			if (ret)
				if (ret.retcode == 0)
					callback(true, ret.result);
				else
					callback(false, error || 'retcode != 0 (' + ret.retcode + ')');
			else
				callback(false, error || 'null return!');
	});
}

module.exports.fetchGroups = function (auth, callback) {
	api.get_group_name_list_mask2(auth, function (ret, error) {
		if (error)
			log.error('<Userfetch> 讀取群組列表時遇到異常: ' + error); // TODO
		if (callback)
			if (ret)
				if (ret.retcode === 0)
					callback(true, ret.result);
				else
					callback(false, error || 'retcode != 0 (' + ret.retcode + ')');
			else
				callback(false, error || 'null return!');
	});
}

function fetchGroupInfo(auth, gcode, callback) {
	api.get_group_info_ext2(auth, gcode, function (ret, error) {
		if (callback)
			if (ret)
				if (ret.retcode === 0)
					callback(true, ret.result);
				else
					callback(false, error || 'retcode != 0 (' + ret.retcode + ')');
			else
				callback(false, error || 'null return!');
	});
}

module.exports.fetchGroupInfoAll = function (auth, groups, callback) {
	var glist = groups.gnamelist, i = 0, len = glist.length;
	var cont = {};
	
	var retry = function (i, current, depth, cont, callback2) {
		if (depth > 5) {
			callback2(false, '群組信息讀取失敗 (gname=' + current.name + ')');
			return;
		}
		log.info('<Userfetch> 讀取群組信息 ' + (i) + '/' + len + ': ' + current.name + ((depth > 1) ? (' (Retry ' + depth + '/5)') : ''));
		fetchGroupInfo(auth, current.code, function (ret, res) {
			if (ret) {
				cont[current.code] = res;
				callback2(true, null);
			} else {
				log.error('<Userfetch> 讀取群組信息失敗 (gname=' + current.name + '): ' + res);
				retry(i, current, depth, cont, callback2);
			}
		});
	}
    
	var callback2 = function (ret, res) {
		var current = glist.pop();
		if (ret)
			if (current)
				retry(++i, current, 1, cont, callback2);
			else
				callback(true, cont);
		else
			callback(false, res);
	};
	
	callback2(true, null);
}