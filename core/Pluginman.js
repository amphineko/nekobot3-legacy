var log = new (require('Log'))('debug');

var pluginList;


function dispatchEvent(handlerId, event) {
	for (var key in pluginList)
		try {
			if (pluginList[key].doEvent[handlerId])
				if (pluginList[key].doEvent[handlerId]() === 3)
					break; // Exit when return 3 (Message handled)
		} catch (error) {
			log.info('<Pluginman> 插件處理事件時產生了未處理的異常 (p=' + pluginList[key]._id + '): ' + error);
		}
}

function loadPlugin(filepath) {
	log.info('<Pluginman> 從檔案裝入插件 ' + filepath);
	
	try {
		var plugin = require(filepath);
		plugin._path = filepath;
		if (plugin.onLoad)
			plugin.onLoad();
		pluginList.push(plugin);
		
		log.info('<Pluginman> 成功裝入插件 ' + plugin._id + ': ' + plugin._name + ' @ "' + filepath + '"');
	} catch (error) {
		log.alert('<Pluginman> 裝入插件時遇到錯誤 (filepath="' + filepath + '"): ' + error);
	}
}
module.exports.loadPlugin = loadPlugin;


function loadPluginList(list) {
	log.info('<Pluginman> 開始從列表裝入插件');
	
	if (pluginList)
		delete pluginList;
	pluginList = new Array();
	
	for (var key in list) {
		var pluginPath = './../plugins/' + list[key];
		loadPlugin(pluginPath);
	}
	
	log.info('<Pluginman> 完成裝載所有插件');
}
module.exports.loadPluginList = loadPluginList;

