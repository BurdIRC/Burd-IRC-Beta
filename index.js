const WebSocket = require('ws');
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpServer = require("./httpserver.js");
const wsServer = require("./websocketserver.js");
const pjson = require('./package.json');
const cp = require('child_process');
const tar = require('tar-fs');

const settings = {
    serverPort: 2083,
    gui: true
}

process.argv.forEach(function (val, index, array) {
    const sarg = val.split("=");
    
    if(sarg.length > 1){
        if(sarg[1] == "true" || sarg[1] == "false") sarg[1] = (sarg[1] == "true");
        settings[sarg[0]] = sarg[1];
    }else{
        settings[sarg[0]] = true;
    }
});

const port = settings.serverPort;

function createHttpServer(){
	const server = http.createServer(function (req, res) {
		if(req.url == "/ws"){
			res.writeHead(426, {"Content-Type": 'text/plain'});
			res.write('426 Upgrade Required'); //write a response to the client
			res.end(); //end the response
		}else{
			httpServer.serve(req, res);
		}
	}).listen(port);
	
	server.on('upgrade', function upgrade(request, socket, head) {
		wsServer.handle(request, socket, head);
	});
	
	console.log("BurdIRC server is running on port " + port);
}



console.log("Checking for updates...");

function getUpdate(url){
	
}

const upd = https.get('https://www.burdirc.com/update/check.php', (resp) => {
	let data = '';

	resp.on('data', (chunk) => {
		data += chunk;
	});

	resp.on('error', (err) => {
		console.log("Error");
	});

	resp.on('end', () => {
        try{
            let json = JSON.parse(data);
            if(json.version > pjson.version){
                //update
                console.log("Downloading update " + json.version + "...");
                getUpdate();
            }else{
                console.log("no updates found");
                createHttpServer();
                startGUI();
            }
        }catch(err){
            console.log("Couldn't check for updates");
            createHttpServer();
            startGUI();
        }
	});

});

upd.on('error', (err) => {
    console.log("Couldn't check for updates");
    createHttpServer();
    startGUI();
});

function startGUI(){
    if(settings.gui == true){
        setTimeout(function(){
            if(process.platform == "win32"){
                //cp.exec("start chrome --app=http://localhost:" + port + "/index.html");
            }
        },1000);
    }
}