var api = require('./qqapi2');
var Infocache = require('./Infocache');
var log = new (require('Log'))('debug');
var Pluginman = require('./Pluginman');

function createMessage(session, event) {
	var value = event.value;
	var msg = {
		type: ({ 'message': 'friend', 'group_message': 'group' })[event.poll_type],

		id: value.msg_id,
		content: value.content.slice(-1).pop().trim(),
	};
	switch (msg.type) {
		case 'group':
			msg.gid = value.from_uin;
			msg.gcode = value.group_code;
			msg.uin = value.send_uin;

			msg.group = Infocache.getGroupInfo(msg.gcode);
			msg.user = Infocache.getGroupMember(msg.gcode, msg.uin);

			return (msg.group && msg.user) ? msg : false;
	}
}

function processEvent(session, event) {
	switch (event.poll_type) {
		case 'message': case 'group_message':
			var message = createMessage(session, event);
			if (message) {
				log.info('[' + ({ 'friend': '好友消息', 'group': '群消息' })[message.type] + '] ' + message.group.info.name + ' | ' + message.user.nick + ': ' + message.content);
				switch (message.type) {
					case 'friend':
						var reply = function () {};
						break;
					case 'group':
						var reply = function (content) {
							api.send_qun_msg2(message.group.info.gid, content, session.auth, function (ret, error) {
								if (!error)
									if (ret)
										if (ret.retcode === 0)
											log.info('向群組傳遞訊息成功 ' + message.group.info.name + ' <- ' + content);
										else
											log.error('向群組傳遞訊息失敗: retcode != 0 (' + ret.retcode + ')');
									else
										log.error('向群組傳遞訊息失敗: Unexpected null response!');
								else
									log.error('向群組傳遞訊息失敗: ' + error);
							});
						};
						break;
				}
				Pluginman.dispatchEvent('message', session, message, reply);
			}
			break;
	}
}
module.exports.process = processEvent;


