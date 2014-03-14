var Infocache = require('./Infocache');
var log = new (require('Log'))('debug');

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
			if (message)
				log.info('[' + ({ 'friend': '好友消息', 'group': '群消息' })[message.type] + '] ' + message.user.nick + ': ' + message.content);
	}
}
module.exports.process = processEvent;


