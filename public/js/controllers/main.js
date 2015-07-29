angular.module('opsToolsController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','ToolService', function($scope, $http, ToolService) {
		var webSocket = new WebSocket("ws://localhost:8009");
		var ws = new WebSocket("ws://support.leapset.com:3100/client");
		var currentCommands = [];
		var collection = [];
		var mapping = {};
		var tunnelPort = 6000;
		var index = 0;
		var tunnelCreated = false;
		var cincoLoaded = false;
		var couchPort = 8000;
		$scope.formData = {};
		$scope.loading = false;

		webSocket.onopen = function(){  
	        console.log("Agent opened");  
	    };

	    ws.onopen = function(){  
	        console.log("tunnel creator opened");  
	    };

	    webSocket.onmessage = function(message){
	    	var data = JSON.parse(message.data);
	    	console.log(data);
	    	if(data["password"] != undefined){
	    		if(data["password"] == null){
	    			$scope.pwdtext = "Connection error";
	    		}else{
	    			$scope.pwdtext = data["password"];
	    		}
	    		$scope.loading = false;
	    	}
	    	else if(!data.error){
	    		if(currentCommands.length  > index){
	    			webSocket.send(currentCommands[index]);
	    			index++;
	    		}else{
	    			$scope.loading = false;
	    		}
	    	}
	    	$scope.$apply();
	    };

	    ws.onmessage = function(message) {
	    	var dataItem = JSON.parse(message.data);
	    	if(dataItem.name == "agents"){
	    		angular.forEach(dataItem.data, function(value, key) {
	    		  try{
	    		  	 var fullName = value.leapset.name + '-' + value.leapset.station_id;
				     collection.push(fullName);
				     mapping[fullName] = {"key" : key, "tunnel" : value.tunnel.port, "version" : value.leapset.merchant_client_version.replace(/\./g, "-"), "merchant_id" : value.leapset.merchant_id};
	    		  }catch(error){
	    		  	console.log('undefined err');
	    		  }
				});
	    	}else if(dataItem.name == "agent:update"){
	    		try{
	    		    var fullName = dataItem.data.leapset.name + '-' + dataItem.data.leapset.station_id;
	    		    mapping[fullName] = {"key" : dataItem.data.id, "tunnel" : dataItem.data.tunnel.port, "version" : dataItem.data.leapset.merchant_client_version.replace(/\./g, "-"), "merchant_id" : dataItem.data.leapset.merchant_id};
	    		}catch(error){
	    			console.log('undefined err');
	    		}
	    	}
	    };
		

		$scope.availableTags = [
	    ];

	    $scope.complete=function(){
		    $( "#tags" ).autocomplete({
		      source: collection
		    });
	    }

	    $scope.btnClick = function(event) {
	    	$scope.loading = true;
	    	var merchant = $( "#tags" ).val();
	    	var duration = 0;
	    	if(mapping[merchant] === undefined){
	    		$scope.pwdtext = "Please select a merchant register";
	    		$scope.$apply();
	    		$scope.loading = false;
	    		return;
	    	}
	    	if(mapping[merchant].tunnel == ""){
	    		$scope.pwdtext = "Opening a tunnel";
	    		ws.send(JSON.stringify({name: "agent:tunnel", data: {id: mapping[merchant].key }}));
	    		duration = 10000;
	    	}
	    	console.log(event.target.id);
	    	var type = event.target.id;
	    	var params = {};
	    	if(!tunnelCreated){
				params.tunnelAvailable = false;
				tunnelCreated = true;
			}else{
				params.tunnelAvailable = true;
			}
			params.version = mapping[merchant].version;
			params.merchant_id =  mapping[merchant].merchant_id;
			params.port = tunnelPort;
			params.username = $( "#uname" ).val();
			params.couchPort = couchPort;
			index = 0;
	    	setTimeout(function(){
	    		if(params.username == ""){
	    			$scope.pwdtext = "Username is not provided";
	    		    $scope.loading = false;
	    		}else if(mapping[merchant].tunnel == ""){
	    			$scope.pwdtext = "Error getting a tunnel";
	    		}else{
	    			$scope.pwdtext = "Tunnel opened";
	    			params.tunnel = mapping[merchant].tunnel;
	    			params.uname = uname;
		    		if(type == "cinco"){
			    		currentCommands = ToolService.genCincoCommands(params);
			    	}else if(type == "couch"){
			    		currentCommands = ToolService.genCouchCommands(params);
			    	}else if(type == "terminal"){
			    		currentCommands = ToolService.genTerminalCommands(params);
			    	}else if(type == "pwd"){
			    		$scope.pwdtext = "password waiting....";
			    		currentCommands = ["password"];
			    	}
					webSocket.send(currentCommands[index]);
					index++;
	    		}
	    		$scope.$apply();
	    	}, duration);
		};
	}]);