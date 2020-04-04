const fs = require('fs');
const path = require("path");
const url = require('url');

const mimeTypes = {
	"atom": "application/atom+xml",
	"bin": "application/octet-stream",
	"css": "text/css",
	"gif": "image/gif",
	"gz": "application/x-gzip",
	"htm": "text/html",
	"html": "text/html;charset=UTF-8",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "application/javascript",
	"json": "application/json;charset=UTF-8",
	"mp3": "audio/mpeg",
	"mp4": "video/mp4",
	"ogg": "audio/ogg",
	"ogv": "video/ogg",
	"pdf": "application/pdf",
	"png": "image/png",
	"rss": "application/rss+xml",
	"svg": "image/svg+xml",
	"txt": "text/plain;charset=UTF-8",
	"webm": "video/webm",
	"woff": "font/woff",
	"woff2": "font/woff2",
	"xml": "application/xml', 'text/xml",
	"zip": "application/zip"
}

const server = {
	serve: (req,res) => {
		let uri = url.parse(req.url).pathname;
		if(uri == "/") uri = "/index.html";
		const filename = path.join(process.cwd() + "/htdocs", uri);
		
		if(req.url.indexOf("..") > -1){
			res.writeHead(403, {"Content-Type": "text/html"});
			res.write("Request denied for security reasons");
			res.end();
			return;
		}
		/*
		if(req.socket.remoteAddress != "::ffff:127.0.0.1" && req.socket.remoteAddress != "::1"){
			res.writeHead(403, {"Content-Type": "text/html"});
			res.write("You must connect to this server from a local address");
			res.end();
			return;
		}
		*/
		console.log("HTTP GET: " + req.url);
		fs.exists(filename, function(exists) {
			if(exists){
				if(fs.lstatSync(filename).isDirectory()){
					if(req.url.slice(-1) != "/"){
						res.writeHead(301, {"Content-Type": "text/html", "Location": req.url + "/"});
						res.write("I moved\n");
						res.end();
					}else{
						console.log("dir " + filename);
						let dhtml = "<h2>Index of " + req.url + "</h2><hr>";
						fs.readdir(filename, function (err, files) {
							files.forEach(function (file) {
								dhtml += "<a href=\"" + file + "\">" + file + "</a><br>";
							});
							dhtml += "<hr>Burd IRC";
							res.writeHead(200, {"Content-Type": "text/html"});
							res.write(dhtml + "\n");
							res.end();
						});
					}
				}else{
					const mime = (mimeTypes[filename.substr(filename.lastIndexOf(".") + 1)] || "text/plain");
					if(mime == "image/svg+xml"){
						fs.readFile(filename, "binary", function(err, file) {
							if(err){
								res.writeHead(404, {"Content-Type": 'text/html'});
								res.write('<h1>404 not found</h1>'); //write a response to the client
								res.end(); //end the response
							}else{
								res.writeHead(200, {"Content-Type": mime});
								const color = req.url.split("?color=")[1] || "ffffff";
								if(file.indexOf("fill") > -1){
									res.write(file.replace("fill", "fill=\"#" + color + "\" oldfill"));
								}else{
									res.write(file.replace("path", "path fill=\"#" + color + "\" "));
								}
								res.end();
							}
						});
					}else{
						fs.readFile(filename, "binary", function(err, file) {
							if(err){
								res.writeHead(500, {"Content-Type": "text/plain"});
								res.write(err + "\n");
								res.end();
							}else{
								res.writeHead(200, {"Content-Type": mime});
								res.write(file, "binary");
								res.end();
							}
						});
					}
				}
			}else{
				res.writeHead(404, {"Content-Type": 'text/html'});
				res.write('<h1>404 not found</h1>'); //write a response to the client
				res.end(); //end the response
				
			}
		});
	}
}

module.exports = server;