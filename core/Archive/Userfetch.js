function fetchFriends(session, _callback) {
	var callback = _callback || function (_) {};
	
	log.info('<Userfetch> 讀取好友列表開始');
	api.get_user_friends2(session.auth, function (ret, error) {
		session.fetchFriendLock = false;
		if (error)
			log.error('<Userfetch> 讀取好友列表時遇到異常: ' + error);
		if (ret)
			if (ret.retcode == 0) {
				session.friends = ret.result;
				log.info('<Userfetch> 讀取好友列表成功');
			} else
				log.error('<Userfetch> 讀取好友列表時遇到異常: ' + (error || 'retcode != 0 (' + ret.retcode + ')'));
		else
			log.error('<Userfetch> 讀入好友列表時遇到異常: ' + (error || 'null return!'));
		callback(false);
	});
}
module.exports.fetchFriends = fetchFriends;


function fetchGroups(session, callback) {
	if (session.fetchGroupLock)
		return;
	session.fetchGroupLock = true;
	
	log.info('<Userfetch> 讀入群組列表開始');
	api.get_group_name_list_mask2(session.auth, function (ret, error) {
		session.fetchGroupLock = false;
		var cbret = false;
		
		if (error)
			log.error('<Userfetch> 讀取群組列表時遇到異常: ' + error); // TODO
		if (ret)
			if (ret.retcode === 0) {
				session.groups = ret.result;
				log.info('<Userfetch> 讀取群組列表成功');
				cbret = true;
			} else
				log.error('<Userfetch> 讀取群組列表時遇到異常: ' + (error || 'retcode != 0 (' + ret.retcode + ')'));
		else
			log.error('<Userfetch> 讀取群組列表時遇到異常: ' + (error || 'null return!'));
		
		callback(cbret);
	});
}
module.exports.fetchGroups = fetchGroups;


function fetchGroupInfo2(session, group, callback) {
	session.fetchGroupInfoLock = true;
	
	api.get_group_info_ext2(session.auth, group.code, function (ret, error) {
		session.fetchGroupInfoLock = false;
		var cbret = false;
		
		if (ret)
			if (ret.retcode === 0) {
				session.groups = ret.result;
				log.info('<Userfetch> 讀取群組資料成功');
				cbret = true;
			} else
				log.error('<Userfetch> 讀取群組資料時遇到異常: ' + (error || 'retcode != 0 (' + ret.retcode + ')'));
		else
			log.error('<Userfetch> 讀取群組資料時遇到異常: ' + (error || 'null return!'));
		
		callback(cbret);
	});
}

function fetchGroupInfo(session, gcode, callback) {
	var group = getGroup({ code: gcode });
	if (group)
		fetchGroupInfo2(session, group, callback);
	else
		fetchGroups(session, null);
}
module.exports.fetchGroupInfo = fetchGroupInfo;
