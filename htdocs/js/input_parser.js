var partMessage = "BurdIRC www.burdirc.com";


function parseInput(e,i){
    if(e == "") return;
    var isCommand = (e[0] == "/");
	var type = $(".item-selected").attr("type");
	var channel = $(".item-selected").attr("channel");
	var svr = burd.getServer(burd.lastServer);
	var bits = e.split(" ");
	
	$("div#ccoms").hide();
    
    if(isCommand){
        for(var i in settings.usercommands){
            if(bits[0].substr(1).toLowerCase() == settings.usercommands[i][0].toLowerCase()){
                console.log("USER COMMAND " + settings.usercommands[i][1]);
                var rcmd = settings.usercommands[i][1];
                var i;
                for (var a = 100; a > 0; a--) {
                    if(rcmd.indexOf("&" + a) > -1){
                        rcmd = rcmd.replace("&" + a, after(a-2));
                    }
                    if(rcmd.indexOf("%" + a) > -1){
                        rcmd = rcmd.replace("%" + a, bits[a-1]);
                    }
                }
                var d = new Date();
                rcmd = rcmd.replace(/\%c/g, channel);
                rcmd = rcmd.replace(/\%e/g, svr.name);
                rcmd = rcmd.replace(/\%n/g, svr.nick);
                rcmd = rcmd.replace(/\%t/g, d.toGMTString());
                rcmd = rcmd.replace(/\%v/g, version);
                e =  ("/" + rcmd);
                bits = e.split(" ");
            }
        }
    }
    
	if(type == "console"){
		if(isCommand){
			
			burd.controlServer.send(JSON.stringify(
				[":" + svr.socket + " " + e.substr(1)]
			));
		}else{
			burd.addChannelMessage(burd.lastServer, channel, type, {type: "info",  time: Date.now(), message: "This window does not accept privmsg"},true);
		}
	}else if(type == "channel" || type == "pm"){
		if(isCommand){

			switch(bits[0].substr(1).toUpperCase()){
				case "ADMIN":
				case "DIE":
				case "INFO":
				case "ISON":
				case "KILL":
				case "MOTD":
				case "NICK":
				case "OPER":
					send(bits[0].substr(1).toUpperCase() + " " + after(0));
					break;
				case "BAN":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + bits[1] + " +" + ("b").repeat((after(1)).split(" ").length) + " " + after(1));
						}else{
							send("MODE " + channel + " +" + ("b").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " +b " + after(0));
					}
					break;
				case "CTCP":
					send("PRIVMSG " + bits[1] + " :" + String.fromCharCode(1) + after(1) + String.fromCharCode(1));
					break;
                case "DOC":
                    overlay.iframe("http://burdirc.com/iframe/" + encodeURIComponent(after(0)) + ".html", {tab: ""});
                    break;
                case "CONFIG":
                    overlay.iframe("configedit.html", {tab: ""});
                    break;
                case "EVAL":
                    eval(after(0));
                    break;
				case "CYCLE":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("PART " + bits[1] + " :" + after(1));
							send("JOIN " + bits[1]);
						}else{
							send("PART " + channel + " :" + after(0));
						}
					}else{
						if(isChannel(bits[1])){
							send("PART " + bits[1] + " :" + partMessage);
						}else{
							send("PART " + channel + " :" + after(0));
						}
					}
					break;
				case "DEHALFOP":
				case "DEHOP":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + channel + " -" + ("h").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " -h " + after(0));
					}
					break;
					
				case "DEOP":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + channel + " -" + ("o").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " -o " + after(0));
					}
					break;
					
				case "DEVOICE":
				case "UNVOICE":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + channel + " -" + ("v").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " -v " + after(0));
					}
					break;
				
                case "ECHO":
                    addMessage(after(0));
                    break;
                
				case "HALFOP":
				case "HOP":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + channel + " +" + ("h").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " +h " + after(0));
					}
					break;
                
                case "PLUGINS":
                    overlay.iframe("plugins.html", {tab: "appearance"});
                    break;
                
				case "UNIGNORE":
					var af = after(0);
					af = af.replace(/\s?-regex/ig, "");
					if(ignore.remove(af)){
						addMessage("Remove ignore item: " + af);
					}else{
						addMessage("Item was not found on ignore list");
					}
					break;
					
				case "IGNORE":
					if(bits.length > 1){
						var af = after(0);
						if(af.indexOf("-regex") > -1){
							/* regex ignore */
							af = af.replace(/\s?-regex/ig, "");
							if(!ignore.addRegex(af)){
								addMessage("The item is already in ignore");
							}else{
								addMessage("Ignored regex value: " + af);
							}
						}else{
							/* string ignore */
							if(!ignore.addString(af)){
								addMessage("The item is already in ignore");
							}else{
								addMessage("Ignored string value: " + af);
							}
						}
					}else{
						var igs = [];
						for(var i in settings.ignores){
							igs.push(settings.ignores[i].ignore);
						}
						addMessage(igs.join(", "));
					}
					break;


				case "INVITE":

					if(isChannel(bits[1])){
						send("INVITE " + after(1) + " " + bits[1]);
					}else{
						send("INVITE " + after(0) + " " + channel);
					}

					break;
					
				case "JOIN":
					if(bits.length > 2){
						send("JOIN " + bits[1] + " " + bits[2]);
					}else{
						send("JOIN " + after(0));
					}
					break;
					
				case "KICK":
					if(bits.length > 2){
						send("KICK " + channel + " " + bits[1] + " :" + after(1));
					}else{
						send("KICK " + channel + " " + bits[1]);
					}
					break;
					
				case "KICKBAN":
				case "BANKICK":
				case "KB":
					if(bits.length > 2){
						send("KICK " + channel + " " + bits[1] + " :" + after(1));
						send("MODE " + channel + " +b " + bits[1]);
					}else{
						send("KICK " + channel + " " + bits[1]);
						send("MODE " + channel + " +b " + bits[1]);
					}
					break;

				case "MODE":
                    if(isChannel(bits[1])){
                        send("MODE " + bits[1] + " " + after(1));
                    }else{
                        send("MODE " + channel + " " + after(0));
                    }
					break;
                    
				case "UMODE":
                    send("MODE " + svr.nick + " " + after(0));
					break;
				
				case "MSG":
				case "PRIVMSG":
				case "PM":
				case "QUERY":
                    
					if(bits.length > 2){
						send("PRIVMSG " + bits[1] + " :" + after(1));
					}else{
                        var chan = burd.getChannel(svr.id, bits[1], "pm");
                        if(!chan){
                            $("div.server[sid='" + svr.id + "'] div.items").append('<div class="nav-item" channel="'+ removeHtml(bits[1].toLowerCase()) +'" type="pm"><div class="item-name">' + removeHtml(bits[1]) + '</div><div class="counter" num="0">0</div><div class="closer">&nbsp;</div></div>');
                            svr.channels.push(
                                {
                                    channel: bits[1],
                                    type: "pm",
                                    topic: "",
                                    topicSetter: "",
                                    users: [
                                    ],
                                    content: []
                                }
                            );
                        }
					}
					break;
					
				case "NOTICE":
					send("NOTICE " + bits[1] + " :" + after(1));
					break;

				case "OP":
					if(bits.length > 2){
						if(isChannel(bits[1])){
							send("MODE " + channel + " +" + ("o").repeat((after(0)).split(" ").length) + " " + after(0));
						}
					}else{
						send("MODE " + channel + " +o " + after(0));
					}
					break;

				case "PART":
					if(bits.length > 2){
						send("PART " + bits[1] + " :" + after(1));
					}else{
						send("PART " + after(0) + " :BurdIRC www.burdirc.com");
					}
					break;
				case "QUIET":
						send("MODE " + channel + " +q " + after(0));
					break;

				case "QUOTE":
				case "RAW":
						send(after(0));
					break;

				case "TOPIC":
					if(isChannel(bits[1])){
						send("TOPIC " + bits[1] + " :" + after(1));
					}else{
						send("TOPIC " + channel + " :" + after(0));
					}
					break;
					
				case "UNBAN":
					if(isChannel(bits[1])){
						send("MODE " + bits[1] + " -b " + after(1));
					}else{
						send("MODE " + channel + " -b " + after(0));
					}
					break;
					
				case "VERSION":
					send("PRIVMSG " + bits[1] + " :" + String.fromCharCode(1) +  "VERSION" + String.fromCharCode(1));
					break;

				case "VOICE":
					if(isChannel(bits[1])){
						send("MODE " + bits[1] + " +v " + after(1));
					}else{
						send("MODE " + channel + " +v " + after(0));
					}
					break;

				case "WHOIS":
					send("WHOIS " + " " + after(0));
					break;
					
				case "WII":
					send("WHOIS " + " " + after(0) + " " + after(0));
					break;

				case "WHOWAS":
					send("WHOWAS " + " " + after(0));
					break;


				
					
				case "SV":
                    addMessage("BurdIRC " + version + " http://burdirc.com");
					break;
				case "JOIN":
					send("JOIN " + after(0));
					break;
				case "ME":
					send("PRIVMSG " + channel + " :" + String.fromCharCode(1) + "ACTION " + after(0) + String.fromCharCode(1));
					burd.addChannelMessage(burd.lastServer, channel, type,
						{type: "action", time: Date.now(), from: svr.nick + "!*@*", message: linkify(removeHtml(after(0)))},
					true);
					break;
				default:
					send(bits[0].substr(1).toUpperCase() + " " + after(0));
					burd.addChannelMessage(burd.lastServer, channel, type,
						{type: "out", time: Date.now(), from: svr.nick + "!*@*", message: removeHtml(bits[0].substr(1).toUpperCase() + " " + after(0))},
					true);
			}
		}else{
			burd.addChannelMessage(burd.lastServer, channel, type,
				{type: "message", time: Date.now(), from: svr.nick + "!*@*", message: linkify(removeHtml(e))},
			true);
			send("PRIVMSG " + channel + " :" + e);
		}
	}
	
	function addMessage(e){
		burd.addChannelMessage(burd.lastServer, channel, type, {type: "info",  time: Date.now(), message: removeHtml(e)},true);
	}
	
	function after(n){
		n = n + 1;
		var amount = 0;
		for (var i = 0; i < n; i++) {
			amount = amount + bits[i].length + 1;
		}
		return e.substr(amount);
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
	
	function send(e){
		burd.controlServer.send(JSON.stringify(
			[":" + svr.socket + " " + e]
		));
	}
}