/*
	Nekobot v2 / Core
	
	@package  pw.futa.nekobot.bootloader
	@author   Amphineko (Naoki Rinmous)
*/

var Auth = require('./core/SessionAuth');
var AuthCache = require('./core/SessionAuthCache');
var Keep = require('./core/SessionKeep');

var fs = require('fs');
var log = new (require('Log'))('debug');
var yaml = require('js-yaml');

function exit(code, reason) {
	console.log('* BOTEXIT: ' + (reason || 'no reason defined.'));
	fs.appendFileSync('./ExitLog.log', '* BOTEXIT: ' + (reason || 'no reason defined.'));
	process.exit(code);
}
module.exports.exit = exit;

function bootSession() {
	log.info('<Bootloader> 開始啟動Nekobot會話');
	
	var config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));
	var login = process.argv.pop().trim() !== 'skip-login';
	
	if (login)
		Auth.login(config, function (cookies, auth) {
			AuthCache.data('cookies', cookies);
			AuthCache.data('auth', auth);
			AuthCache.save();
			
			var keep = new Keep(auth, cookies, config);
			keep.start();
		});
	else {
		AuthCache.load();
		var cookies = AuthCache.data('cookies');
		var auth = AuthCache.data('auth');
		
		var keep = new Keep(auth, cookies, config);
		keep.start();
	}
}
module.exports.boot = bootSession;
