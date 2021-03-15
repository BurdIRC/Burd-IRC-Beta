const WebSocket = require('ws');
const net = require('net');
const tls = require('tls');
const controls = [];

let doClose = false;

function getControl(ws,id){
	for(let i in controls){
		if(controls[i].ws == ws && controls[i].id == id) return controls[i];
	}
	return false;
}

const wsServer = {
	wss: new WebSocket.Server({noServer: true}),
	handle: (request, socket, head) => {
		wsServer.wss.handleUpgrade(request, socket, head, function connection(ws) {
			console.log("New websocket connection");
            doClose = false;
			ws.on('message', function incoming(message) {
                try{
                    const j = JSON.parse(message);
                    for(let i in j){
                        if(j[i].substr(0,1) == ":"){
                            let data = j[i].substr(1);
                            const bits = data.split(" ");
                            const ubits = data.toUpperCase().split(" ");
                            console.log("Data: " + data);
                            if(data.match(/^([1-9])$/ig) != null){
                                ws.send('a[":' + data + '"]');
                                controls.push({ws: ws, id: parseInt(bits[0]), client: false, cache: [], data: ""});
                            }else{
                                if(bits[0].match(/^([1-9])$/ig) != null){
                                    const control = getControl(ws,bits[0]);
                                    if(control){
                                        if(control.client){
                                            console.log(">>" + data.substr(2));
                                            control.client.write(data.substr(2) + "\r\n");
                                        }else{
                                            switch(bits[1]){
                                                case "HOST":
                                                    if(control.client) return; /* do not accept HOST for a control already connected */
                                                    const host = bits[2].split(":");
                                                    let client = new net.Socket();
                                                    if(host[1].substr(0,1) == "+"){
                                                        /* port starts with + so it's ssl */
                                                        client = tls.connect({port:host[1].substr(1), host: host[0], rejectUnauthorized: false}, function() {
                                                            ws.send('a[":' + control.id + ' control connected"]');
                                                            control.client = client;
                                                            for(let z in control.cache){
                                                                control.client.write(control.cache[z] + "\r\n");
                                                            }
                                                            control.cache = [];
                                                        });
                                                        console.log("SSL Connection");
                                                    }else{
                                                        client.connect(host[1], host[0], function() {
                                                            ws.send('a[":' + control.id + ' control connected"]');
                                                            control.client = client;
                                                            for(let z in control.cache){
                                                                control.client.write(control.cache[z] + "\r\n");
                                                            }
                                                            control.cache = [];
                                                        });
                                                    }
                                                    client.on('data', function(data) {
                                                        data = data.toString().replace(/\r/g, "");
                                                        control.data = control.data + data;
                                                        if(control.data.slice(-1) == "\n"){
                                                            const parts = control.data.split("\n");
                                                            for(let i in parts){
                                                               if(parts[i].length > 0) ws.send("a" + JSON.stringify([":" + control.id + " " + parts[i]]));
                                                            }
                                                            control.data = "";
                                                        }
                                                    });
                                                    client.on('close', function() {
                                                        console.log('Connection closed');
                                                        control.client = false;
                                                        ws.send("a" + JSON.stringify([":" + control.id + " control closed"]));
                                                    });
                                                    client.on('error', function(err) {
                                                        ws.send("a" + JSON.stringify([":" + control.id + " control closed " + err.code]));
                                                    });
                                                    break;
                                                case "ENCODING":
                                                    break;
                                                default:
                                                    control.cache.push(data.substr(2));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }catch(err){
                    console.log(err);
                    //ws.close();
                }
			});
			
			ws.on('close', function incoming(message) {
				console.log('Websocket closed');
				for(let i in controls){
					if(controls[i].ws == ws){
						if(controls[i].client) controls[i].client.write("QUIT :Burd IRC www.burdirc.com\r\n");
						if(controls[i].client) controls[i].client.destroy();
					}
				}
                
                doClose = true;
                
                
                setTimeout(function(){
                    if(doClose){
                        console.log("No active connections. Closing backend...");
                        process.exit();
                    }
                },2000);
                
                
			});
			
			/*
			const client = new net.Socket();
			
			client.connect(8080, "192.168.1.100", function() {
				ws.send('a[":1"]');
			});
			
			controls.push({ws: ws, id: 1, client: client});
			*/
            ws.send('v' + require('./package.json').version);
			ws.send('o');
            
			//ws.send('a[":1"]');


		});
	}
}


function ip2hex(ip){
	let ip4 = ip.split(".");
	let p,i;
	let hexStr = "";
	for(i=0; i<ip4.length; i++){
		p = new Number(ip4[i]);
		hexStr += p<16?("0"+p.toString(16)):p.toString(16);
	}
	return(hexStr);
}




module.exports = wsServer;