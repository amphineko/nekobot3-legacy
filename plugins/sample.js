module.exports._id = 'pw.futa.nekobot.plugin.sample';
module.exports._name = 'Nekobot/样例插件';
module.exports.doEvent = {};

module.exports.doEvent['message'] = function (session, msg, reply) {
	var content = msg.content; // Get the message content.

	if (content == 'test!') {
		reply('response!'); // Reply a message to where it comes.
		return 3; // Tell the plugin manager that I have handled this message.
	}
}