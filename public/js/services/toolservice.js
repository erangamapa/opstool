angular.module('opsToolsService', [])

	// super simple service
	// each function returns a promise object 
	.factory('ToolService', ['$http' ,function($http) {
		return {
			genCincoCommands : function (params) {
				var commands = [];
				if(!params.tunnelAvailable){
					commands.push('ssh -L ' + params.port + ':*:'+ params.tunnel +' ' + params.username + '@support.leapset.com');
				}
				commands.push('sshpass -p "1ring2rule" ssh -L 8080:*:8080 root@localhost -p ' + params.port);
				commands.push('google-chrome https://cinco.leapset.com/cts/Y https://cinco.leapset.com/' + params.version + '/pos/' + params.merchant_id + '/' + params.version + '/Y --allow-running-insecure-content');
				return commands;
			},
			genCouchCommands : function (params) {
				var commands = [];
				if(!params.tunnelAvailable){
					commands.push('ssh -L ' + params.port + ':*:'+ params.tunnel +' ' + params.username + '@support.leapset.com');
				}
				commands.push('sshpass -p "1ring2rule" ssh -L ' + params.couchPort + ':*:5984 root@localhost -p ' + params.port);
				commands.push('google-chrome http://localhost:'+ params.couchPort +'/_utils/');
				return commands;
			},
			genTerminalCommands : function (params) {
				var commands = [];
				commands.push('gnome-terminal');
				return commands;
			}
		}
	}]);

