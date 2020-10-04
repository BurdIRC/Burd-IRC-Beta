/*
This code is released under the Mozilla Public License 2.0
*/

const fs = require('fs');
const http = require('http');
const https = require('https');
const httpServer = require("./httpserver.js");
const wsServer = require("./websocketserver.js");
const pjson = require('./package.json');
const cp = require('child_process');
const unzipper = require('unzipper');

const settings = {
    serverPort: 2083,
    appWindow: false,
    browser: "chrome"
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

if(settings.browser == "edge") settings.browser = "msedge";

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

function getUpdate(url, restart){
    const file = fs.createWriteStream("update.zip");
    const request = https.get('https://burdirc.haxed.net/update/' + url, function(response) {
        response.pipe(file);
    });
    console.log("Extracting update file...");
    setTimeout(function(){
        fs.createReadStream('update.zip').pipe(unzipper.Extract({ path: './' }));
        fs.unlinkSync("update.zip");
        if(restart){
            console.log("BurdIRC has been updated to the latest version but requires a restart. Please restart the app.");
            setTimeout(function(){
                process.exit(1);
            }, 5000);
        }else{
            setTimeout(function(){
                console.log("update complete");
                createHttpServer();
                startGUI();
            },5000);
        }
    },2000);
}

const upd = https.get('https://burdirc.haxed.net/update/check.php', (resp) => {
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
                getUpdate(json.file, json.restart);
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
    const start = (process.platform == 'darwin' ? 'open': process.platform == 'win32' ? 'start': 'xdg-open');
    if(settings.appWindow == true){
        setTimeout(function(){
            if(process.platform == "win32"){
                cp.exec(start + " " + settings.browser + " --app=http://localhost:" + port + "/index.html");
            }else if(process.platform == "linux"){
                cp.exec(settings.browser + " --app=http://localhost:" + port + "/index.html &");
            }
        },1000);
    }else{
        /* if settings.appWindow is not true then we open a now browser page */
        cp.exec(start + " " + "http://localhost:" + port + "/open.html");
    }
}