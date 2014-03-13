var log = new (require('Log'))('debug');

function createMessage(session, event) {
	var value = event.value;
	var msg = {
		type: value.group_code ? 'group' : 'friend',
		
		content: value.content.slice(-1).pop().trim(),
		time: new Date(value.time * 1000),
		
		uin: value.from_uin,
		uid: value.msg_id
	};
	switch (msg.type) {
		case 'friend': 
			msg.user = getFriend(msg.from_uin);
			break;
		case 'group':
			//msg.group = Userfetch.getGroup(session, 'code', value.group_code);
			msg.user = Userfetch.getGroupMember(session, value.group_code, msg.uin);
			break;
	}
	return msg;
}

function processEvent() {
	
}
module.exports.process = processEvent;


