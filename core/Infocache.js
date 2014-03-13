var api = require('./qqapi2');
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

function getFriend(uin, callback) {
	if (listFriend[uin]) {
		if (callback)
			callback(listFriend[uin]);
		return listFriend[uin];
	} else {
		refreshFriend(session.auth, function (stat, message) {
			if (callback)
				callback(listFriend[uin] || false);
		});
		return false;
	}
}
module.exports.getFriend = getFriend;

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
					delete ret;
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



function print() {
	console.log(listFriend);
}
module.exports.print = print;
