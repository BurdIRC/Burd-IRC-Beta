var burd = {
	socketCount: 0,
	lastServer: "24533d5aa0",
	lastChannel: {type: "console", name: "console"},
	lastSocket: "0",
	servers: [/*
		{
			id: "24533d5aa7",
			name: "Freenode",
			nick: "duckgoose",
			socket: "2",
			cache: [],
			prefixes: ["@","+"],
			iSupport: ["CHANTYPES=#", "CHANLIMIT=#:120", "PREFIX=(ov)@+"],
			channels: [
				{
					channel: "#freenode",
					type: "channel",
					topic: "Hello world",
					users: [
						["Apples", "@+"],
						["Bananas", ""],
						["Oranges", ""]
					],
					content: [
						{type: "message", time: 1577762879226, from: "Bananas!mtt@matttt.com", message: "hello world this is a test", highlight: false},
						{type: "left",  time: 1577762889226, message: "test123 (test123!123!@1233.com) has left"},
						{type: "joined",  time: 1577762880226, message: "test123 (test123!123!@1233.com) has joined"},
						{type: "info",  time: 1577762809226, message: "You have been banned from this channel"}
					]
				},
				{
					channel: "console",
					type: "console",
					content: [
						
					]
				},
,
				{
					channel: "test123",
					type: "pm",
					mask: "test123!test@google.com",
					content: [
						{type: "message", time: 1577762879226, from: "Bananas!mtt@matttt.com", message: "hello world this is a test"}
					]
				}
			],
			users: [
				{nick: "Apples", color: "rgb(142,211,102)", away: "not here", notes: "this guy likes apples"},
				{nick: "Bananas", color: "rgb(189,151,226)", away: false, notes: ""},
				{nick: "Oranges", color: "rgb(167,238,214)", away: false, notes: ""}
			]
		}
	*/],
	controlServer: false,
	connectToControl: function(){
		this.controlServer = new WebSocket("ws://" + window.location.host + "/ws");
		this.controlServer.onmessage = function(e){
			parseData(e.data);
		};
		this.controlServer.onopen = function(e){
			burd.controlServer.send('[":0 CONTROL START"]');
		};
		this.controlServer.onclose = function(e){
			$("div#app").hide();
		};
		
	},
    sendLast: function(e){
        this.controlServer.send(JSON.stringify(
            [":" + burd.getServer(burd.lastServer).socket + " " + e]
        ));
    },
	sortUsers: function(channel, svr){
		if(typeof(channel) == "string") channel = burd.getChannel(svr.id, channel, "channel");
		var rusers = [];
		for(var i in channel.users){
			rusers.push(channel.users[i][1] + channel.users[i][0]);
		}
		rusers.sort(function (a,b) {
			var modes = '~&@%+';
			var rex = new RegExp('^['+modes+']');
			var nicks = [a.replace(rex,'').toLowerCase(), b.replace(rex,'').toLowerCase()];
			var prefix = [];
			if (rex.test(a)) prefix.push(modes.indexOf(a[0])); 
				else prefix.push(modes.length+1);
			if (rex.test(b)) prefix.push(modes.indexOf(b[0])); 
				else prefix.push(modes.length+1);
			if (prefix[0] < prefix[1]) return -1;
			if (prefix[0] > prefix[1]) return 1;
			if (nicks[0] > nicks[1]) return 1;
			if (nicks[0] < nicks[1]) return -1;
			return 0;
		});
		channel.users = [];
		for(var i in rusers){
			var n = getUserPrefixes(rusers[i], svr);
			channel.users.push([n.nick, n.prefixes.join("")]);
		}

	},
	addServerUser: function(id,nick){
		var svr = this.getServer(id);
		for(var i in svr.prefixes){
			nick = nick.replace(svr.prefixes[i], "");
		}
		
		for(var i in svr.users){
			if(svr.users[nick.toLowerCase()] != undefined) return;
		}

		svr.users[nick.toLowerCase()] = {away: false, color: strToColor(nick.toLowerCase()), notes: "", mask: ""};
		
		function getRandomColor() {
			var letters = 'ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.floor(Math.random() * letters.length)];
			}
			return color;
		}
	},
	iSupport: function(svr, key, def){
		for(var i in svr.iSupport){
			if(svr.iSupport[i].split("=")[0] == key.toUpperCase()){
				return svr.iSupport[i].split("=")[1] || true;
			}
		}
		return (def == undefined ? false : def);
	},
	connectServer: function(id){
		//burd.connectServer("24533d5aa0");
		this.socketCount += 1;
		var s = this.getServerInfo(id);
		$("div#nav-pane div.nav-items").append('<div class="server" sid="' + s.id + '"><div class="console" channel="console" type="console"><span>' + s.name +'</span><div class="counter" num="0">0</div><div class="closer">&nbsp;</div></div><div class="items"></div></div>');
		
		this.servers.push({
			id: id,
			name: s.name,
			nick: s.nick,
			socket: this.socketCount,
			cache: [],
			lastWho: 0,
			prefixes: ["&", "@", "%", "+", "~"],
			iSupport: ["CHANTYPES=#", "CHANLIMIT=#:120", "PREFIX=(ov)@+"],
			channels: [
				{
					channel: "console",
					type: "console",
					content: []
				}
			],
            whoPollList: [],
			users: {
				"duckgoose": {away: false, color: "#ffe173", notes: ""}
			}
		});
		
		this.controlServer.send('[":' + this.socketCount + '"]');
		
	},
	getServerBySocket: function(id){
		for(var i in burd.servers){
			if(burd.servers[i].socket == id) return burd.servers[i];
		}
		return false;
	},
	getServerInfo: function(id){
		for(var i in settings.networks){
			if(settings.networks[i].id == id) return settings.networks[i];
		}
		return false;
	},
	getServer: function(id){
		for(var i in this.servers){
			if(this.servers[i].id == id) return this.servers[i];
		}
		return false;
	},
	removeChannel: function(svr, chan, type){
		var channel = this.getChannel(svr.id,chan,type);
		if(channel){
			$("div.server[sid='" + svr.id + "'] div.nav-item[channel='" + formatAttr(chan.toLowerCase()) + "']").remove();
			svr.channels.splice(svr.channels.indexOf(channel),1);
		}
	},
	getChannel: function(id,chan,type){
		for(var i in this.servers){
			if(this.servers[i].id == id){
				for(var j in this.servers[i].channels){
					if(this.servers[i].channels[j].channel.toLowerCase() == chan.toLowerCase() && this.servers[i].channels[j].type == type) return this.servers[i].channels[j];
				}
			}
		}
		return false;
	},
	getUser: function(id,user){
		for(var i in this.servers){
			if(this.servers[i].id == id){
				return this.servers[i].users[user.toLowerCase()] || {color:"white", away: false, notes: ""};
			}
		}
		return false;
	},
	removeUser: function(id,nick){
		var svr = this.getServer(id);

		if(svr.users[nick.toLowerCase()] != undefined){
			delete svr.users[nick.toLowerCase()];
		}
		

	},
	
	countUsers: function(svr){
		var svr = this.getServer(id);
		return Object.keys(svr.users).length;
	},
	
	checkForRemoval: function(svr, nick){
		nick = nick.toLowerCase();
		for(var i in svr.channels){
			for(var a in svr.channels[i].users){
				if(svr.channels[i].users[a][0].toLowerCase() == nick){
					return;
				}
			}
		}
		this.removeUser(svr.id, nick);
	},
	addGlobalMessage: function(id,data){
        var svr = this.getServer(id);
        for(var i in svr.channels){
            var cc = svr.channels[i];
            this.addChannelMessage(id, cc.channel, cc.type,data,true);
        }
    },
	addChannelMessage: function(id,chan,type,data,add,gethtml){
		// burd.addChannelMessage("24533d5aa0", "#test", "channel", {type: "message", time: 1577762879226, from: "Bananas!mtt@matttt.com", message: "hello world this is a test"},false);
		var svr = this.getServerInfo(id);
		var channel = this.getChannel(id,chan,type);
		var isActive = false;
		var highlight = false;
		if(data.highlight) highlight = true;
		if(this.lastServer == id && this.lastChannel.type == type && this.lastChannel.name.toLowerCase() == chan.toLowerCase()) isActive = true;
		if(gethtml == undefined) gethtml = false;
		if(type == "channel" || type == "console" || type == "pm"){
			var uhtml = "";
			if(channel){
				if(!data.from) data.from = "";
				var ui = this.getUser(id, data.from.split("!")[0]);
                
				switch(data.type){
					case "message":
						uhtml = '<div class="user-message ' + (highlight ? "highlight" : "blank") + ' truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="username"> &lt;<span class="name" style="color:' + (settings.nickColors ? ui.color : "var(--main-nick-color)") + '">'+ data.from.split("!")[0] +'</span>&gt;</div><div class="message">&nbsp;' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						updateCount();
						break;
					case "action":
						uhtml = '<div class="user-message action ' + (highlight ? "highlight" : "blank") + ' truncate"><div class="message-date">[16:11:35]</div><div class="username"> * <span class="name">'+ data.from.split("!")[0] +'</span> </div><div class="message">&nbsp;' + data.message + ' *</div><div class="clear">&nbsp;</div></div>';
						updateCount();
						break;
					case "left":
						uhtml = '<div class="channel-info user-left truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon text-out">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "joined":
						uhtml = '<div class="channel-info user-joined truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon text-in">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "in":
						uhtml = '<div class="channel-info truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon text-in">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "out":
						uhtml = '<div class="channel-info truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon text-out">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "info":
						uhtml = '<div class="channel-info truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon info-default">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "success":
						uhtml = '<div class="channel-info truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon success">&nbsp;</div><div class="message">' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					case "error":
						uhtml = '<div class="channel-info truncate"><div class="message-date">[' + date('H:i:s', (data.time/1000)) +']</div><div class="icon error-info">&nbsp;</div><div class="message">&nbsp;' + data.message + '</div><div class="clear">&nbsp;</div></div>';
						break;
					
				}
				
			}
			if(!gethtml){
				if(isActive){
					$("div.channel-content").append(uhtml);
				}
			}
			
			
			function updateCount(){
				if(isActive){
					if(type=="console"){
						$("div.server[sid='" + id + "'] div.console div.counter").attr("num", 0).text(0);
						
					}else{
						$("div.server[sid='" + id + "'] div.nav-item[channel='" + chan.toLowerCase() + "'] div.counter").attr("num", 0).text(0);
					}
				}else{
					if(type=="console"){
						var num = parseInt($("div.server[sid='" + id + "'] div.console div.counter").attr("num"));
						$("div.server[sid='" + id + "'] div.console div.counter").attr("num", num + 1).text(num + 1);
					}else{
						var num = parseInt($("div.server[sid='" + id + "'] div.nav-item[channel='" + chan.toLowerCase() + "'] div.counter").attr("num"));
						$("div.server[sid='" + id + "'] div.nav-item[channel='" + chan.toLowerCase() + "'] div.counter").attr("num", num + 1).text(num + 1);
					}
				}
			}
			
		}
		
		
		
		if(add && channel) channel.content.push(data);
		
		if(channel && channel.content.length > 100) channel.content.splice(0,1);
		
		if(add && isActive) $('div.channel-content').scrollTop($('div.channel-content')[0].scrollHeight);
		
		if(gethtml) return uhtml;
	},
	
	showInlineMedia: function(id, channel, type, message){
		var isActive = false;
		if(this.lastServer == id && this.lastChannel.type == type && this.lastChannel.name.toLowerCase() == channel.toLowerCase()) isActive = true;
		if(isActive){
			var urls = message.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\.(png|jpg|gif)/ig);
			if(urls != null){
				console.log(urls[0]);
				$("div.channel-content").append('<div class="user-message truncate"><div class="message-date">[' + date('H:i:s', (Date.now()/1000)) + ']</div><div class="message"> <img class="chatimage" src="'+  urls[0]+'"><div><b>File</b>: ' + removeHtml(urls[0].substr(urls[0].lastIndexOf("/") + 1)) + ' [<a href="remove:image">remove</a>]</div></div><div class="clear">&nbsp;</div></div>');
			}
		}
	},
	
	setUserNick: function(svr, oldNick, newNick){
		lnewNick = newNick.toLowerCase();
		loldNick = oldNick.toLowerCase();
		if(svr.users[loldNick] != undefined){
			svr.users[lnewNick] = svr.users[loldNick];
			delete svr.users[loldNick];
		}
		var chans = [];
		for(var i in svr.channels){
			for(var a in svr.channels[i].users){
				if(svr.channels[i].users[a][0].toLowerCase() == loldNick){
					svr.channels[i].users[a][0] = newNick;
					this.addChannelMessage(svr.id, svr.channels[i].channel, "channel", {type: "in",  time: Date.now(), message: "<b>" + removeHtml(oldNick) + "</b> has changed nicks to " + removeHtml(newNick) + ""},true);
					break;
				}
			}
		}
	},
	
	addChannelUser: function(svr, channel, nick){
        
		var channel = this.getChannel(svr.id,channel,"channel");
		channel.users.push([nick, ""]);
		burd.sortUsers(channel, svr);
		burd.updateChannelUsers(svr, channel.channel);
        
	},
	quitUser: function(svr,usr,reason){
		var fchans = [];
		this.removeUser(svr.id, usr.nick);
		for(var i in svr.channels){
			for(var a in svr.channels[i].users){
				if(svr.channels[i].users[a][0].toLowerCase() == usr.nick.toLowerCase()){
					svr.channels[i].users.splice(a,1);
					this.addChannelMessage(svr.id, svr.channels[i].channel, "channel", {type: "out",  time: Date.now(), message: "<b>" + removeHtml(usr.nick) + "</b> (" + removeHtml(usr.mask) + ") has quit (" + removeHtml(reason) + ")"},true);
					fchans.push(svr.channels[i].channel.toLowerCase());
					burd.updateChannelUsers(svr, svr.channels[i]);
					break;
				}
			}
		}
	},
	removeChannelUser: function(svr, channel, nick){
		var channel = this.getChannel(svr.id,channel,"channel");
		
		for(var i in channel.users){
			if(nick.toLowerCase() == channel.users[i][0].toLowerCase()){
				channel.users.splice(i,1);
				break;
			}
		}
		burd.updateChannelUsers(svr, channel);
	},
	
	updateChannelUsers: function(svr, channel){
		if(this.lastServer == svr.id){
			if(this.lastChannel.type == channel.type && this.lastChannel.name == channel.channel){
				this.showChannel(svr.id, channel.channel, channel.type);
			}
		}
	},
	
	updateGuiNames: function(svr, chan){
		var channel = this.getChannel(svr.id,chan,"channel");
		var isActive = false;
		if(this.lastServer == svr.id && this.lastChannel.type == "channel" && this.lastChannel.name.toLowerCase() == chan.toLowerCase()) isActive = true;
		if(isActive){
			var uhtml = "";
			for(var i in channel.users){
				var ui = this.getUser(svr.id, channel.users[i][0]);
				uhtml += '<div class="user ' + (ui.away ? "user-idle" : "" ) + '" nick="' + formatAttr(channel.users[i][0].toLowerCase()) + '"><span class="usertext" style="color:' + (settings.nickColors ? ui.color : "var(--main-nick-color)") + '">' + channel.users[i][0] + '</span><span class="usermodes">' + channel.users[i][1] + '</span></div>';
			}
			document.getElementById("userslist").innerHTML = uhtml;
			$("div.channel-window span.unum").text(channel.users.length);
		}
	},
	
	showChannel: function(id,chan,type){
		var svr = this.getServerInfo(id);
		this.lastChannel = {type: type, name: chan};
		this.lastServer = id;
		var channel = this.getChannel(id,chan,type);
		var uhtml = "";
        var nitm = $("div.server[sid='" + id + "'] div.nav-item[channel='" + chan.toLowerCase() + "']");
        
        if(type == "channel"){
            if(!nitm.hasClass("item-selected")){
                nitm.click();
                return;
            }
        }else if(type == "console"){
            nitm = $("div.server[sid='" + id + "'] div.console");
            if(!nitm.hasClass("item-selected")){
                nitm.click();
                return;
            }
        }
        
		document.title = title + " - [" + channel.channel + "]";
		$("div.channel-content,div.channel-window div.users,div.channel-window div.channel-name,div.channel-window div.channel-topic").html("");
		$("div.channel-window span.unum").text("0");
		
		
		if(type == "console"){
			$("div.channel-window").removeClass("pm").addClass("console");
			$("div.channel-window div.channel-name").text(svr.name);
			$("div.channel-window div.channel-topic").text("Console");
		}else if(type == "channel"){
			if(channel){
				$("div.channel-window").removeClass("console").removeClass("pm");
				$("div.channel-window div.channel-name").text(channel.channel);
				$("div.channel-window div.channel-topic").text(channel.topic);
				$("div.channel-window span.unum").text(channel.users.length);
				
				
				for(var i in channel.users){
					var ui = this.getUser(id, channel.users[i][0]);
					uhtml += '<div class="user ' + (ui.away ? "user-idle" : "" ) + '" nick="' + formatAttr(channel.users[i][0].toLowerCase()) + '"><span class="usertext" style="color:' + (settings.nickColors ? ui.color : "var(--main-nick-color)") + '">' + channel.users[i][0] + '</span><span class="usermodes">' + channel.users[i][1] + '</span></div>';
				}
				//$("div.users-list div.users").append(uhtml);
				
				document.getElementById("userslist").innerHTML = uhtml;
				
				
				
				//--------------------
				
			}
			
		}else if(type == "pm"){
			$("div.channel-window").addClass("pm");
			$("div.channel-window div.channel-name").text(channel.channel);
			$("div.channel-window div.channel-topic").text(channel.topic);
			
		}
		uhtml = "";
		for(var i in channel.content){
			uhtml += this.addChannelMessage(id, chan, type,channel.content[i],false,true);
		}
		
		$('div.channel-content').html(uhtml).scrollTop($('div.channel-content')[0].scrollHeight);
		setTimeout(function(){
			$('div.channel-content').scrollTop($('div.channel-content')[0].scrollHeight);
		},10);
	}
	
}