function getGroup(gcode, callback) {
	return getGroup2('code', null, gcode, callback);
}
module.exports.getGroup = getGroup;

function getGroup2(style, key, value, callback) {
	var group = readGroup(style, key, value);

	if (group) {
		if (callback)
			callback(group);
		return group;
	} else {
		refreshGroup(session.auth, function (stat, message) {
			if (callback)
				return (readGroup(style, key, value) || false);
		});
		return false;
	}
}
module.exports.getGroup2 = getGroup2;

function refreshGroup(auth, callback) {
	listGroup = {};
	var callback2 = function (stat, message) {
		if (stat)
			log.info('<Infocache> 讀取群組列表完成');
		else
			log.error('<Infocache> 讀取群組列表失敗: ' + message);
		if (callback)
			callback(stat, message);
	}
	
	api.get_group_name_list_mask2(session.auth, function (ret, error) {
		if (!error)
			if (ret)
				if (ret.retcode === 0) {
					ret.result.gnamelist.filter(function (element) {
						listGroup[element.code] = element;
					})
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
module.exports.refreshGroup = refreshGroup;