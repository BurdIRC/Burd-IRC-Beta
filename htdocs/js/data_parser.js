/*
This code is released under the Mozilla Public License 2.0
*/

var logData = false;

var rateLimit = 0;

function parseData(e){
	updateServers = true;
	if(e.substr(0,1) == "o"){
		console.log("connected to websocket");
    }else if(e.substr(0,1) == "v"){
        version = e.substr(1);
	}else if(e.substr(0,1) == "a"){
		//json data
		var jsonData = JSON.parse(e.substr(1));
        
		for(var i in jsonData){
            
			if(logData && jsonData[i].indexOf(" 352 ") == -1) console.log(e);
            
			var socketID = jsonData[i].split(" ")[0].substr(1);
			var data = jsonData[i].substr(3);
			var bits = data.split(" ");
			var ubits = data.toUpperCase().split(" ");
			var svr = burd.getServerBySocket(socketID);
			var info = burd.getServerInfo(svr.id);
			var cData = bits[bits.length - 1]; /* data after " :" */
			if(data.indexOf(" :") > 0) cData = data.substr(data.indexOf(" :") + 2);
			
			if(!svr) return;
			
			if(jsonData[i].length == 2){
				
				if(data == ""){
						send("HOST " + info.server + ":" + (info.ssl ? "+"+info.port : info.port));
						send("ENCODING utf8");
						send("CAP LS 302");
						send("NICK " + svr.nick);
						send("USER " + svr.nick + " 0 * https://burdirc.haxed.net/");
				}
				return;
			}
			
			switch(ubits[0]){
				case "PING":
					send("PONG :" + cData);
					break;
				case "AUTHENTICATE":
                    if(bits[1] == "+"){
                        send("AUTHENTICATE " + btoa(svr.nick + String.fromCharCode(0) + svr.nick + String.fromCharCode(0) + info.auth.password));
                    }
                    break;
			}
			
			switch(ubits[1]){
				case E.RPL_WELCOME:
					burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + removeHtml(cData)},true);
					svr.nick = bits[2];
                    if(info.auth.type == "NickServ"){
                        send("NICKSERV IDENTIFY " + info.auth.username + " " + info.auth.password);
                    }

                    if(channelSettings[svr.id] != undefined){
                        for(var i in channelSettings[svr.id]){
                            if(channelSettings[svr.id][i].joinOnConnect) send("JOIN " + i);
                        }
                    }

					break;
                    
                case E.ERR_ERRONEUSNICKNAME:
                    send("NICK " + info.altnick);
                    break;
					
				case E.RPL_ISUPPORT:
					svr.iSupport = svr.iSupport.concat(data.substr(bits[0].length + bits[1].length + bits[2].length + 3).split(" :")[0].split(" "));
					break;
					
				case E.RPL_YOURHOST:
				case E.RPL_CREATED:
				case E.RPL_LUSERCLIENT:
				case E.RPL_LUSERME:
				case E.RPL_STATSCONN:
                    burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + removeHtml(cData)},true);
                    var nt = burd.iSupport(svr, "network");
                    if(nt) $("div.server[sid='" + svr.id + "'] div.console span").text(nt);
                    
					break;

				case E.RPL_YOURHOST:
				case E.RPL_CREATED:
				case E.RPL_LUSERCLIENT:
				case E.RPL_LUSERME:
				case E.RPL_STATSCONN:
					burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + ubits[1] + " " + removeHtml(cData)},true);
					break;
					
				case E.RPL_LUSEROP:
				case E.RPL_LUSERUNKNOWN:
				case E.RPL_LUSERCHANNELS:
				case E.RPL_HOSTHIDDEN:
					burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + ubits[3] + " " + removeHtml(cData)},true);
					break;
					
				
				case E.RPL_TOPIC:
					burd.getChannel(svr.id, bits[3], "channel").topic = cData;
					break;
					
				case E.RPL_NAMREPLY:
					svr.cache += " " + cData.replace(/\s\s/g, " ");
					break;
					
				case E.RPL_ENDOFNAMES:
					var names = svr.cache.substr(1).replace(/\s\s/g, " ").replace(/\s$/g, "").split(" ");
					var c = burd.getChannel(svr.id, bits[3], "channel");
					for(var i in names){
						var nickInfo = getUserPrefixes(names[i], svr);
						burd.addServerUser(svr.id, nickInfo.nick);
						c.users.push([nickInfo.nick, nickInfo.prefixes.join("")]);
					}
					burd.sortUsers(c, svr);
					svr.cache = [];
                    $("div.items div.item-selected").click();
					break;
					
					
				case E.RPL_WHOISUSER:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> (" + bits[4] + "@" + bits[5] + "): <span class=whois2>" + removeHtml(cData) + "</span>"},true);
					break;
					
				case E.RPL_WHOISCHANNELS:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> " + removeHtml(cData)},true);
					break;
					
				case E.RPL_WHOISSERVER:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> <span class=whois3>" + removeHtml(bits[4]) + " :" + removeHtml(cData) + "</span>"},true);
					break;		
					
				case E.RPL_WHOISSECURE:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> " + removeHtml(cData)},true);
					break;		
					
				case E.RPL_WHOISACCOUNT:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> is logged in as " + removeHtml(bits[4])},true);
					break;
				
				case E.RPL_WHOISIDLE:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> seconds idle: " + bits[4] + ", Signed on: " + timeConverter(parseInt(bits[5]) * 1000)},true);
					break;
					
				case E.RPL_ENDOFWHOIS:
					burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "in",  time: Date.now(), message: "<b class=whois>[" + removeHtml(bits[3]) + "]</b> End of WHOIS"},true);
					break;
                case E.RPL_ENDOFWHO:
                    svr.lastWho = Date.now();
                    break;
                 
                case E.ERR_SASL_AUTH:
                case E.RPL_SASL_AUTH:
                    burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + removeHtml(cData)},true);
                    send("CAP END");
                    break;    
                    
                case E.RPL_MOTDSTART:
                case E.RPL_ENDOFMOTD:
                case E.RPL_MOTD:
                    burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b>: " + removeHtml(cData)},true);
                    break;
                    
                case E.RPL_WHOREPLY:
                    
                    var iState = bits[8];
                    var nick = bits[7];
                    if(iState.substr(0,1) == "G"){
                        //they are away
                        if(svr.users[nick.toLowerCase()] != undefined){
                            svr.users[nick.toLowerCase()].away = true;
                            if(svr.id == burd.lastServer){
                                $("div.user[nick='" + nick.toLowerCase() + "']").addClass("user-idle");
                            }
                        }
                    }else{
                        if(svr.users[nick.toLowerCase()] != undefined){
                            svr.users[nick.toLowerCase()].away = false;
                            if(svr.id == burd.lastServer){
                                $("div.user[nick='" + nick.toLowerCase() + "']").removeClass("user-idle");
                            }
                        }
                    }
                    if(svr.users[nick.toLowerCase()] != undefined) svr.users[nick.toLowerCase()].mask = nick + "!" + bits[4] + "@" + bits[5];
                    break;
                
                case E.RPL_BANLIST:
                    if(banWindow != false){
                        banWindow.postMessage({command: "ban-list", data: data}, "*");
                    }
                    break;
                
                case E.RPL_ENDOFBANLIST:
                    banWindow.postMessage({command: "end-ban-list"}, "*");
                    banWindow = false;
                    break;
                    
                case E.ERR_CHANOPRIVSNEEDED:
                case E.ERR_USERONCHANNEL:
                case E.ERR_NEEDMOREPARAMS:
                    burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "error",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b> " + removeHtml(bits[3]) + ": " + removeHtml(cData)},true);
                    break;
                   
                case E.ERR_CHANNELISFULL:   
                case E.ERR_NOTONCHANNEL:
                case E.ERR_BANNEDFROMCHAN:
                case E.ERR_CANNOTSENDTOCHAN:
                case E.ERR_NOSUCHNICK:
                    burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "error",  time: Date.now(), message: "<b>" + getEnum(ubits[1]) + "</b> " + removeHtml(bits[3]) + ": " + removeHtml(cData)},true);
                    
                    //overlay.show({type: "dialog", title:"CHANNEL FULL", text: removeHtml(bits[3]) + " is full and can not accept any more users. Try again later.", inputs:[], buttons:["Okay"], callback: function(e){}});
                    
                    break;
					
				/* -------------------------------------------- */	
				
				case "CAP":
					switch(ubits[3]){
						case "LS":
							var mycaps = ["multi-prefix"];
							var capsfound = [];
							var scaps = cData.split(" ");
                            
                            if(info.auth.type == "SASL Plain") mycaps.push("sasl");
                            
							for(var i in scaps){
								if(mycaps.includes(scaps[i])) capsfound.push(scaps[i]);
							}
							if(capsfound.length == 0){
								send("CAP END");
							}else{
								send("CAP REQ :" + capsfound.join(" "));
							}
							break;
						case "ACK":
                            if(info.auth.type == "SASL Plain"){
                                send("AUTHENTICATE PLAIN");
                            }else{
                                send("CAP END");
                            }
							break;
					}
					
					break;
				case "CONNECTED":
					burd.addChannelMessage(svr.id, "console", "console", {type: "success",  time: Date.now(), message: "Connected to server"},true);
					if(info.auth.type == "Server password"){
						send("PASS :" + info.auth.password);
					}
					break;
                    
                case "CLOSED":
                    console.log("closed");
                    burd.addGlobalMessage(svr.id, {type: "error",  time: Date.now(), message: "You're no longer connected to this network!"});
                    break;
					
				case "NOTICE":
					if(ubits[2] == "*"){
						burd.addChannelMessage(svr.id, "console", "console", {type: "in",  time: Date.now(), message: removeHtml(cData)},true);
					}else{
						var usr = parseUser(bits[0]);
                        if(getChannelSettings(svr.id,bits[2].toLowerCase()).notices == false && bits[2].substr(0,1) == "#") return;
						if(burd.lastServer == svr.id){
							if(bits[2].toLowerCase() == svr.nick.toLowerCase()) bits[2] = "you";
							burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> sent a notice to <b>" + removeHtml(bits[2]) + "</b>: " + colors.parse(linkify(removeHtml(cData)))},true);
						}else{
							burd.addChannelMessage(svr.id, "console", "console", {type: "info",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> sent a notice to <b>" + removeHtml(bits[2]) + "</b>: " + colors.parse(linkify(removeHtml(cData)))},true);
						}
                        sounds.play("notice");
					}
					break;
				
				case "KICK":
					var usr = parseUser(bits[0]);
					var kicked = bits[3];
                    iplugin.contentWindow.postMessage({command: "event", event: "onKick", network: svr.name, sID: svr.id, channel: bits[2], user: usr, kicked: kicked, message: cData},"*");
					burd.addChannelMessage(svr.id, bits[2], "channel", {type: "info",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> has kicked <b>" + removeHtml(kicked) + "</b> (" + removeHtml(cData) + ")"},true);
					burd.removeChannelUser(svr, bits[2], kicked);
					burd.checkForRemoval(svr, kicked);
					break;
					
					
				case "MODE":
					var usr = parseUser(bits[0]);
					var modeStr = data.substr(bits[0].length + bits[1].length + bits[2].length + 3);
					if(isChannel(bits[2])){					
						burd.addChannelMessage(svr.id, bits[2], "channel", {type: "info",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> has set mode <b>" + removeHtml(modeStr) + "</b>"},true);
						processChannelModes();
					}
					break;
				
				case "PART":
					var usr = parseUser(bits[0]);
                    iplugin.contentWindow.postMessage({command: "event", event: "onPart", network: svr.name, sID: svr.id, channel: bits[2], user: usr, message: cData},"*");
					var nickInfo = getUserPrefixes(usr.nick, svr);
					if(nickInfo.nick.toLowerCase() == svr.nick.toLowerCase()){
						//we left the channel
						burd.addChannelMessage(svr.id, bits[2], "channel", {type: "out",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> (" + removeHtml(usr.mask) + ") has left"},true);
						burd.addChannelMessage(svr.id, bits[2], "channel", {type: "error",  time: Date.now(), message: "You're no longer in this channel"},true);
					}else{
						//someone other than us left the channel
						if(getChannelSettings(svr.id, cData.toLowerCase()).partMessages) burd.addChannelMessage(svr.id, bits[2], "channel", {type: "out",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> (" + removeHtml(usr.mask) + ") has left (" + removeHtml(cData) + ")"},true);
						burd.removeChannelUser(svr, bits[2], usr.nick);
						burd.checkForRemoval(svr, usr.nick);
					}
					break;
				
				case "PING":
					send("PONG " + cData);
					break;
				
				case "PRIVMSG":
					if(ignore.test(data)) return console.log("ignored");
					var usr = parseUser(bits[0]);
                    
                    iplugin.contentWindow.postMessage({command: "event", event: "onPrivMsg", network: svr.name, sID: svr.id, channel: bits[2], user: usr, message: cData},"*");
                    
                    if(svr.users[usr.nick.toLowerCase()] != undefined) svr.users[usr.nick.toLowerCase()].mask = usr.mask;
					if(isChannel(bits[2])){
						if(cData.substr(0,1) == String.fromCharCode(1)){
							// it's a CTCP message
							parseCTCP();
						}else{
                            sounds.play("privmsg");
							burd.addChannelMessage(svr.id, bits[2], "channel", {type: "message", time: Date.now(), from: usr.mask, message: colors.parse(linkify(removeHtml(cData))), highlight: checkHighlight()},true);
						}
						burd.showInlineMedia(svr.id, bits[2], "channel", cData);
					}else{
						//pm
                        if(cData.substr(0,1) == String.fromCharCode(1)){
                            //CTCP
                            parseCTCP();
                        }else{
                            var chan = burd.getChannel(svr.id, usr.nick, "pm");
                            if(!chan){
                                $("div.server[sid='" + svr.id + "'] div.items").append('<div class="nav-item" channel="'+ removeHtml(usr.nick.toLowerCase()) +'" type="pm"><div class="item-name">' + removeHtml(usr.nick) + '</div><div class="counter" num="0">0</div><div class="closer">&nbsp;</div></div>');
                                svr.channels.push(
                                    {
                                        channel: usr.nick,
                                        type: "pm",
                                        topic: usr.mask,
                                        topicSetter: "",
                                        users: [
                                        ],
                                        content: []
                                    }
                                );
                            }
                            burd.addChannelMessage(svr.id, usr.nick, "pm", {type: "message", time: Date.now(), from: usr.mask, message: colors.parse(linkify(removeHtml(cData)))},true);
                            burd.showInlineMedia(svr.id, usr.nick, "pm", cData);
                        }
						
					}
					break;
					
				case "QUIT":
					var usr = parseUser(bits[0]);
                    iplugin.contentWindow.postMessage({command: "event", event: "onQuit", network: svr.name, sID: svr.id, user: usr, message: cData},"*");
					burd.quitUser(svr, usr, cData);
					break;
                    
				case "NICK":
					var usr = parseUser(bits[0]);
					if(usr.nick.toLowerCase() == svr.nick.toLowerCase()) svr.nick = cData;
					burd.setUserNick(svr, usr.nick, cData);
					burd.updateGuiNames(svr, burd.lastChannel.name);
					break;

                case "TOPIC":
                    //a[":1 :duckgoose!~duckgoose@burdirc/developer/duckgoose TOPIC #uifh89h9 :e98rhnm"]
                    var usr = parseUser(bits[0]);
                    var chan = burd.getChannel(svr.id, bits[2], "channel");
                    burd.addChannelMessage(svr.id, bits[2], "channel", {type: "in",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> has set the topic to: <b>" + removeHtml(cData) + "</b>"},true);
                    chan.topic = cData;
                    if(burd.lastChannel.name == $("div.item-selected .item-name").text()) $("div.item-selected").click();
                    break;
                    
                case "INVITE":
                    //a[":1 :Matt_6!~Matt@137.118.221.173 INVITE duckgoose :#freenudes"]
                    var usr = parseUser(bits[0]);
                    snackbar.show({text: removeHtml(usr.nick) + " has invited you to join " + removeHtml(cData), buttons: ["DECLINE", "ACCEPT"], callback: function(e){
                        if(e == "ACCEPT"){
                            send("JOIN " + cData);
                        }
                    }})
                    break;
                    
				case "JOIN":
					var usr = parseUser(bits[0]);
                    iplugin.contentWindow.postMessage({command: "event", event: "onJoin", network: svr.name, sID: svr.id, channel: cData, user: usr},"*");
                    if(svr.users[usr.nick.toLowerCase()] != undefined) svr.users[usr.nick.toLowerCase()].mask = usr.mask;
					if($("div.server[sid='" + svr.id + "'] div.items div.nav-item[channel='" + formatSel(cData.toLowerCase()) + "']").length > 0){
                    
						if(getChannelSettings(svr.id, cData.toLowerCase()).joinMessages) burd.addChannelMessage(svr.id, cData, "channel", {type: "in",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> (" + removeHtml(usr.mask) + ") has joined"},true);
                        
                        if(usr.nick.toLowerCase() == svr.nick.toLowerCase()){
                            burd.getChannel(svr.id, cData, "channel").users = [];
                            console.log("clear users");
                        }else{
                            burd.addChannelUser(svr, cData, usr.nick);
                            burd.addServerUser(svr.id, usr.nick);
                        }
						burd.updateGuiNames(svr, cData);
					}else{
						var nickInfo = getUserPrefixes(usr.nick, svr);
						
                        
                        
						if(nickInfo.nick.toLowerCase() == svr.nick.toLowerCase()){
                            if(channelSettings[svr.id] == undefined) channelSettings[svr.id] = {};
                            if(channelSettings[svr.id][cData.toLowerCase()] == undefined){
                                channelSettings[svr.id][cData.toLowerCase()] = {
                                    joinOnConnect: false,
                                    requestOps: false,
                                    requestVoice: false,
                                    inlineMedia: false,
                                    richText: true,
                                    notices: true,
                                    joinMessages: true,
                                    partMessages: true,
                                    quitMessages: true,
                                    highlights: true
                                }
                            }
                            
                            if(getChannelSettings(svr.id, cData.toLowerCase()).requestOps) send("CHANSERV OP " + cData);
                            if(getChannelSettings(svr.id, cData.toLowerCase()).requestVoice) send("CHANSERV VOICE " + cData);
                            
							$("div.server[sid='" + svr.id + "'] div.items").append('<div class="nav-item" channel="'+ formatAttr(cData.toLowerCase()) +'" type="channel"><div class="item-name">' + removeHtml(cData) + '</div><div class="counter" num="0">0</div><div class="closer">&nbsp;</div></div>');
							svr.channels.push(
								{
									channel: cData,
									type: "channel",
									topic: "",
									topicSetter: "",
									users: [
									],
									content: []
								}
							)
                            if(svr.whoPollList.includes(cData.toLowerCase())) svr.whoPollList.splice(svr.whoPollList.indexOf(cData.toLowerCase()), 1);
                            svr.whoPollList.unshift(cData.toLowerCase());
                            if(settings.focusonjoin){
                                clearTimeout(joinTimer);
                                joinTimer = setTimeout(function(){
                                    burd.showChannel(svr.id, cData, "channel");
                                }, 500);
                            }
						}
					}
					
					break;
					
			}
			
			
			/*  below are some functions to help with processing IRC packets */
			
			function processChannelModes(){
				var usr = parseUser(bits[0]); //user that set the mode
				var chan = bits[2]; //channel mode was set for
				var channel = burd.getChannel(svr.id, bits[2], "channel");
				var modeBits = data.substr(bits[0].length + bits[1].length + bits[2].length + 3).split(" ");
				var params = data.substr(bits[0].length + bits[1].length + bits[2].length + bits[3].length + 4).split(" ");
				var flags = modeBits[0].split("");
				var state = true;
				
				
				
				/*
					if a flag is + then we set state to true, otherwise we set it to false. if state is true then we know
					to add the mode, otherwse we remove it.
				*/
				
				for(var i in flags){
					switch(flags[i]){
						
						case "+":
							state = true;
							break;
							
						case "-":
							state = false;
							break;
							
						case "o":
						case "v":
							for(var a in channel.users){
								if(channel.users[a][0].toLowerCase() == params[0].toLowerCase()){
									/*
										flag [o|v] for param[0] which matches channel.users[a][1].
										so if state=true we add an op flag, otherwise we remove it.
									*/
									if(state == true){
										if(channel.users[a][1].indexOf(flagToSyn(flags[i]))==-1) channel.users[a][1] += flagToSyn(flags[i]);
									}else{
										if(channel.users[a][1].indexOf(flagToSyn(flags[i]))>-1) channel.users[a][1] = channel.users[a][1].replace(flagToSyn(flags[i]), "");
									}
								}
							}
							/* we now need to remove the param */
							params.splice(0, 1);
							break;
					}
				}
                
                function flagToSyn(flag){
                    switch(flag){
                        case "o":
                            return "@";
                        case "v":
                            return "+";
                        case "q":
                            return "~";
                        case "a":
                            return "&";
                        case "h":
                            return "%";
                    }
                }
				burd.sortUsers(channel, svr);
                $("div.server[sid='" + svr.id + "'] div.item-selected[channel='" + formatSel(channel.channel.toLowerCase()) + "']").click();
			}
			
			
			function parseCTCP(){
				cData = cData.substr(1).replace(String.fromCharCode(1), "");
				var parts = cData.split(" ");
				var usr = parseUser(bits[0]);
				if(ubits[1] == "PRIVMSG"){
					switch(parts[0].toUpperCase()){
						case "ACTION":
							burd.addChannelMessage(svr.id, bits[2], "channel", {type: "action", time: Date.now(), from: usr.mask, message: colors.parse(linkify(removeHtml(cData.substr(7))))},true);
                            checkHighlight();
                            return;
							break;
                        case "VERSION":
                            if(rateLimit > 2) return;
                            rateLimit++;
                            send("NOTICE " + usr.nick + " :" + String.fromCharCode(1) + "VERSION BurdIRC " + version + String.fromCharCode(1) );
                            break;
						
					}
                    
                    burd.addChannelMessage(svr.id, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> sent you a <b>CTCP " + removeHtml(parts[0].toUpperCase()) + "</b>"},true);
                
				}
			}
			
			function checkHighlight(){
				var usr = parseUser(bits[0]);
				var rRes = false;
				for(var i in settings.highlights){
					if(cData.toLowerCase().indexOf(settings.highlights[i]) > -1) rRes = true;
					if(settings.highlights[i] == "%n" && cData.toLowerCase().indexOf(svr.nick.toLowerCase()) > -1) rRes = true;
				}
				if(rRes){
					var itm = $("div.server[sid='" + svr.id + "'] div.nav-item[channel='" + formatSel(bits[2].toLowerCase()) + "']");
					if(itm){
						sounds.play("alert");
						if(!itm.hasClass("item-selected")) $("div.server[sid='" + svr.id + "'] div.nav-item[channel='" + formatSel(bits[2].toLowerCase()) + "']").addClass("item-bell");
					}
				}
                if(rRes) sounds.play("highlight");
				return rRes;
			}
			
			function send(e){
				burd.controlServer.send(JSON.stringify(
					[":" + svr.socket + " " + e]
				));
			}
			
			function isChannel(e){
				var types = burd.iSupport(svr, "CHANTYPES").split("");
				for(var i in types){
					if(e.substr(0,1) == types[i]){
						return true;
					}
				}
				return false;
			}
			
		} // end of loop
	}
}

function getUserPrefixes(nick, svr){
	//returns nick with prefixes removed and the prefixes in an object ().nick ().prefixes

	var prefixes = [];
	for(var i in svr.prefixes){
		if(nick.indexOf(svr.prefixes[i]) > -1){
			nick = nick.replace(svr.prefixes[i], "");
			prefixes.push(svr.prefixes[i]);
		}
	}
	return {nick:nick, prefixes: prefixes};
}

function parseUser(e){
	if(e.substr(0,1)==":") e = e.substr(1);
	var mask = e;
	e = e.replace("@","!").split("!");
	return {nick: e[0], ident: e[1], host: e[2], mask: mask};
}

function getEnum(e){
	for(var i in E){
		if(E[i] == e) return i;
	}
	return "UNKNOWN";
}

var rateLimitTimer = setInterval(function(){
    rateLimit = 0;
},10000);

var E = {
	"RPL_WELCOME":"001","RPL_YOURHOST":"002","RPL_CREATED":"003","RPL_MYINFO":"004","RPL_ISUPPORT":"005","RPL_SNOMASK":"008","RPL_STATMEMTOT":"009","RPL_BOUNCE":"010","RPL_YOURCOOKIE":"014","RPL_YOURID":"042","RPL_SAVENICK":"043","RPL_ATTEMPTINGJUNC":"050","RPL_ATTEMPTINGREROUTE":"051","RPL_TRACELINK":"200","RPL_TRACECONNECTING":"201","RPL_TRACEHANDSHAKE":"202","RPL_TRACEUNKNOWN":"203","RPL_TRACEOPERATOR":"204","RPL_TRACEUSER":"205","RPL_TRACESERVER":"206","RPL_TRACESERVICE":"207","RPL_TRACENEWTYPE":"208","RPL_TRACECLASS":"209","RPL_STATS":"210","RPL_STATSLINKINFO":"211","RPL_STATSCOMMANDS":"212","RPL_STATSCLINE":"213","RPL_STATSILINE":"215","RPL_STATSKLINE":"216","RPL_STATSYLINE":"218","RPL_ENDOFSTATS":"219","RPL_UMODEIS":"221","RPL_SERVLIST":"234","RPL_SERVLISTEND":"235","RPL_STATSVERBOSE":"236","RPL_STATSENGINE":"237","RPL_STATSIAUTH":"239","RPL_STATSLLINE":"241","RPL_STATSUPTIME":"242","RPL_STATSOLINE":"243","RPL_STATSHLINE":"244","RPL_STATSSLINE":"245","RPL_STATSTLINE":"246","RPL_STATSBLINE":"247","RPL_STATSPLINE":"249","RPL_STATSCONN":"250","RPL_LUSERCLIENT":"251","RPL_LUSEROP":"252","RPL_LUSERUNKNOWN":"253","RPL_LUSERCHANNELS":"254","RPL_LUSERME":"255","RPL_ADMINME":"256","RPL_ADMINLOC1":"257","RPL_ADMINLOC2":"258","RPL_ADMINEMAIL":"259","RPL_TRACELOG":"261","RPL_TRYAGAIN":"263","RPL_LOCALUSERS":"265","RPL_GLOBALUSERS":"266","RPL_START_NETSTAT":"267","RPL_NETSTAT":"268","RPL_END_NETSTAT":"269","RPL_PRIVS":"270","RPL_SILELIST":"271","RPL_ENDOFSILELIST":"272","RPL_NOTIFY":"273","RPL_VCHANEXIST":"276","RPL_VCHANLIST":"277","RPL_VCHANHELP":"278","RPL_GLIST":"280","RPL_CHANINFO_KICKS":"296","RPL_END_CHANINFO":"299","RPL_NONE":"300","RPL_AWAY":"301","RPL_USERHOST":"302","RPL_ISON":"303","RPL_UNAWAY":"305","RPL_NOWAWAY":"306","RPL_WHOISUSER":"311","RPL_WHOISSERVER":"312","RPL_WHOISOPERATOR":"313","RPL_WHOWASUSER":"314","RPL_ENDOFWHO":"315","RPL_WHOISIDLE":"317","RPL_ENDOFWHOIS":"318","RPL_WHOISCHANNELS":"319","RPL_WHOISVIRT":"320","RPL_WHOIS_HIDDEN":"320","RPL_WHOISSPECIAL":"320","RPL_LIST":"322","RPL_LISTEND":"323","RPL_CHANNELMODEIS":"324","RPL_NOCHANPASS":"326","RPL_CHPASSUNKNOWN":"327","RPL_CHANNEL_URL":"328","RPL_CREATIONTIME":"329","RPL_WHOISACCOUNT":"330","RPL_NOTOPIC":"331","RPL_TOPIC":"332","RPL_TOPICWHOTIME":"333","RPL_BADCHANPASS":"339","RPL_USERIP":"340","RPL_INVITING":"341","RPL_INVITED":"345","RPL_INVITELIST":"346","RPL_ENDOFINVITELIST":"347","RPL_EXCEPTLIST":"348","RPL_ENDOFEXCEPTLIST":"349","RPL_VERSION":"351","RPL_WHOREPLY":"352","RPL_NAMREPLY":"353","RPL_WHOSPCRPL":"354","RPL_NAMREPLY_":"355","RPL_LINKS":"364","RPL_ENDOFLINKS":"365","RPL_ENDOFNAMES":"366","RPL_BANLIST":"367","RPL_ENDOFBANLIST":"368","RPL_ENDOFWHOWAS":"369","RPL_INFO":"371","RPL_MOTD":"372","RPL_ENDOFINFO":"374","RPL_MOTDSTART":"375","RPL_ENDOFMOTD":"376","RPL_WHOISHOST":"378","RPL_YOUREOPER":"381","RPL_REHASHING":"382","RPL_YOURESERVICE":"383","RPL_NOTOPERANYMORE":"385","RPL_ALIST":"388","RPL_ENDOFALIST":"389","RPL_TIME":"391","RPL_USERSSTART":"392","RPL_USERS":"393","RPL_ENDOFUSERS":"394","RPL_NOUSERS":"395","RPL_HOSTHIDDEN":"396","ERR_UNKNOWNERROR":"400","ERR_NOSUCHNICK":"401","ERR_NOSUCHSERVER":"402","ERR_NOSUCHCHANNEL":"403","ERR_CANNOTSENDTOCHAN":"404","ERR_TOOMANYCHANNELS":"405","ERR_WASNOSUCHNICK":"406","ERR_TOOMANYTARGETS":"407","ERR_NOSUCHSERVICE":"408","ERR_NOORIGIN":"409","ERR_NORECIPIENT":"411","ERR_NOTEXTTOSEND":"412","ERR_NOTOPLEVEL":"413","ERR_WILDTOPLEVEL":"414","ERR_BADMASK":"415","ERR_TOOMANYMATCHES":"416","ERR_QUERYTOOLONG":"416","ERR_LENGTHTRUNCATED":"419","ERR_UNKNOWNCOMMAND":"421","ERR_NOMOTD":"422","ERR_NOADMININFO":"423","ERR_FILEERROR":"424","ERR_NOOPERMOTD":"425","ERR_TOOMANYAWAY":"429","ERR_EVENTNICKCHANGE":"430","ERR_NONICKNAMEGIVEN":"431","ERR_ERRONEUSNICKNAME":"432","ERR_NICKNAMEINUSE":"433","ERR_NICKCOLLISION":"436","ERR_TARGETTOOFAST":"439","ERR_SERVICESDOWN":"440","ERR_USERNOTINCHANNEL":"441","ERR_NOTONCHANNEL":"442","ERR_USERONCHANNEL":"443","ERR_NOLOGIN":"444","ERR_SUMMONDISABLED":"445","ERR_USERSDISABLED":"446","ERR_NONICKCHANGE":"447","ERR_NOTIMPLEMENTED":"449","ERR_NOTREGISTERED":"451","ERR_IDCOLLISION":"452","ERR_NICKLOST":"453","ERR_HOSTILENAME":"455","ERR_ACCEPTFULL":"456","ERR_ACCEPTEXIST":"457","ERR_ACCEPTNOT":"458","ERR_NOHIDING":"459","ERR_NOTFORHALFOPS":"460","ERR_NEEDMOREPARAMS":"461","ERR_ALREADYREGISTERED":"462","ERR_NOPERMFORHOST":"463","ERR_PASSWDMISMATCH":"464","ERR_YOUREBANNEDCREEP":"465","ERR_KEYSET":"467","ERR_LINKSET":"469","ERR_CHANNELISFULL":"471","ERR_UNKNOWNMODE":"472","ERR_INVITEONLYCHAN":"473","ERR_BANNEDFROMCHAN":"474","ERR_BADCHANNELKEY":"475","ERR_BADCHANMASK":"476","ERR_BANLISTFULL":"478","ERR_BADCHANNAME":"479","ERR_LINKFAIL":"479","ERR_NOPRIVILEGES":"481","ERR_CHANOPRIVSNEEDED":"482","ERR_CANTKILLSERVER":"483","ERR_UNIQOPRIVSNEEDED":"485","ERR_TSLESSCHAN":"488","ERR_NOOPERHOST":"491","ERR_NOFEATURE":"493","ERR_BADFEATURE":"494","ERR_BADLOGTYPE":"495","ERR_BADLOGSYS":"496","ERR_BADLOGVALUE":"497","ERR_ISOPERLCHAN":"498","ERR_CHANOWNPRIVNEEDED":"499","ERR_UMODEUNKNOWNFLAG":"501","ERR_USERSDONTMATCH":"502","ERR_GHOSTEDCLIENT":"503","ERR_USERNOTONSERV":"504","ERR_SILELISTFULL":"511","ERR_TOOMANYWATCH":"512","ERR_BADPING":"513","ERR_BADEXPIRE":"515","ERR_DONTCHEAT":"516","ERR_DISABLED":"517","ERR_WHOSYNTAX":"522","ERR_WHOLIMEXCEED":"523","ERR_REMOTEPFX":"525","ERR_PFXUNROUTABLE":"526","ERR_BADHOSTMASK":"550","ERR_HOSTUNAVAIL":"551","ERR_USINGSLINE":"552","RPL_LOGON":"600","RPL_LOGOFF":"601","RPL_WATCHOFF":"602","RPL_WATCHSTAT":"603","RPL_NOWON":"604","RPL_NOWOFF":"605","RPL_WATCHLIST":"606","RPL_ENDOFWATCHLIST":"607","RPL_WATCHCLEAR":"608","RPL_ISLOCOP":"611","RPL_ISNOTOPER":"612","RPL_ENDOFISOPER":"613","RPL_DCCLIST":"618","RPL_OMOTDSTART":"720","RPL_OMOTD":"721","RPL_ENDOFO":"626","RPL_SETTINGS":"630","RPL_ENDOFSETTINGS":"631","RPL_TRACEROUTE_HOP":"660","RPL_TRACEROUTE_START":"661","RPL_MODECHANGEWARN":"662","RPL_CHANREDIR":"663","RPL_SERVMODEIS":"664","RPL_OTHERUMODEIS":"665","RPL_ENDOF_GENERIC":"666","RPL_WHOWASDETAILS":"670","RPL_WHOISSECURE":"671","RPL_UNKNOWNMODES":"672","RPL_CANNOTSETMODES":"673","RPL_LUSERSTAFF":"678","RPL_TIMEONSERVERIS":"679","RPL_NETWORKS":"682","RPL_YOURLANGUAGEIS":"687","RPL_LANGUAGE":"688","RPL_WHOISSTAFF":"689","RPL_WHOISLANGUAGE":"690","RPL_MODLIST":"702","RPL_ENDOFMODLIST":"703","RPL_HELPSTART":"704","RPL_HELPTXT":"705","RPL_ENDOFHELP":"706","RPL_ETRACEFULL":"708","RPL_ETRACE":"709","RPL_KNOCK":"710","RPL_KNOCKDLVR":"711","ERR_TOOMANYKNOCK":"712","ERR_CHANOPEN":"713","ERR_KNOCKONCHAN":"714","ERR_KNOCKDISABLED":"715","RPL_TARGUMODEG":"716","RPL_TARGNOTIFY":"717","RPL_UMODEGMSG":"718","RPL_ENDOFOMOTD":"722","ERR_NOPRIVS":"723","RPL_TESTMARK":"724","RPL_TESTLINE":"725","RPL_NOTESTLINE":"726","RPL_QLIST":"728","RPL_XINFO":"771","RPL_XINFOSTART":"773","RPL_XINFOEND":"774","RPL_SASL_AUTH":"903","ERR_SASL_AUTH":"904","ERR_CANNOTDOCOMMAND":"972","ERR_CANNOTCHANGEUMODE":"973","ERR_CANNOTCHANGECHANMODE":"974","ERR_CANNOTCHANGESERVERMODE":"975","ERR_CANNOTSENDTONICK":"976","ERR_UNKNOWNSERVERMODE":"977","ERR_SERVERMODELOCK":"979","ERR_BADCHARENCODING":"980","ERR_TOOMANYLANGUAGES":"981","ERR_NOLANGUAGE":"982","ERR_TEXTTOOSHORT":"983"
	};