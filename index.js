const WebSocket = require('ws');
const fs = require('fs');
const http = require('http');
const httpServer = require("./httpserver.js");
const wsServer = require("./websocketserver.js");


const server = http.createServer(function (req, res) {
	if(req.url == "/ws"){
		res.writeHead(426, {"Content-Type": 'text/plain'});
		res.write('426 Upgrade Required'); //write a response to the client
		res.end(); //end the response
	}else{
		httpServer.serve(req, res);
	}
}).listen(2083);


server.on('upgrade', function upgrade(request, socket, head) {
	wsServer.handle(request, socket, head);
});

