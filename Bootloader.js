/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.core.bootloader
	@author   Amphineko (Naoki Rinmous)
	
	@modification-increment  #1 (03/09/2014)
*/

var log = new (require('log'))('debug');
var BotAuth = require('./core/BotAuth');
var BotSession = require('./core/BotSession');
var BotSessionCache = require('./core/BotSessionCache');




/*
	@function     bootloader.exit(ExitCode, ExitReason, ExitCall)
	@description  Allow Nekobot to stop
*/
module.exports.exit = exit;
function exit(code, reason, callfunc) {
	if (callfunc)
		try {
			callfunc();
		} catch (error) {
			log.critical('<Bootloader> Nekobot在結束時調用Mistake函數失敗: ' + error);
		}
	console.log('* BOTEXIT: ' + (reason || 'no reason defined.'));
	process.exit(code);
}


/*
	@function     bootloader.prepare/private
	@description  Prepare for starting up
*/
function prepare(login, config, callback) {
	if (login) {
		log.info('<Bootloader> 開始進行身份認證');
		BotAuth.login(config, function(cookies, auth) {
			log.info('<Bootloader> 身份認證成功');
			// 儲存認證資料
			BotSessionCache.data('cookies', cookies);
			BotSessionCache.data('auth', auth);
			BotSessionCache.save();
			callback(cookies, auth);
		});
	} else {
		// 讀入認證資料
		BotSessionCache.load();
		var cookies = BotSessionCache.data('cookies');
		var auth = BotSessionCache.data('auth');
		log.info("<Bootloader> 從快取讀入認證資料");
		callback(cookies, auth);
	}
};


/*
	@function     bootloader.run/public
	@description  Instruct Nekobot to startup
*/
module.exports.run = function () {
	var config = require('./config');
	var login = process.argv.pop().trim() !== 'nologin';
	
	prepare(login, config, function(cookies, auth) {
		var bot = new (require('./core/BotSession'))(auth, cookies, config);
		bot.start();
	});
};
