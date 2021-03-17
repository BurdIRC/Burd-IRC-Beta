/*
This code is released under the Mozilla Public License 2.0
*/

var version = "0.0.0";
var title = "BurdIRC";
var guiAccess = Date.now(); /* This is set to the last time the GUI was access (Date.now()) */
var joinTimer = 0;
var fileInput = {
    content: "",
    type: "",
    get: function(){
        
    },
    callback: function(){
        var model = new FormData();
        model.append('file', $('#file-input')[0].files[0]);

        $.ajax({
            url: 'https://media.haxed.net/?burdirc=1',
            type: 'POST',
            dataType: 'json',
            data: model,
            processData: false,
            contentType: false,// not json
            complete: function (data) {
                $(".input-box").val(data.responseText).focus();
            }
        });
    }
}

var settings = {
    autocomplete: true,
    cmdautocomplete: true,
    timestamps: true,
    focusonjoin: true,
    logPackets: true,
    emojis: true,
    nickColors: true,
    textColors: true,
    scrollback: 100,
    timestring: "H:i:s",
    muted: false,
    whoPollInterval: 1000,
    banmask: "*!%i@%h",
    banreason: "Bye",
	theme: "default.css",
    highlights: ["testword123", "%n"],
    plugins: [],
    ignores: [
        {ignore: "test123", type: "string", date: 1584689622901},
        {ignore: "^duckz$", type: "regex", date: 1584689622901}
    ],
    sounds: {
        alert: ["state-change_confirm-down.ogg", true],
        newPM: ["hero_simple-celebration-03.ogg", true],
        notice: ["notification_simple-01.ogg", true],
        privmsg: ["navigation_forward-selection-minimal.ogg", false],
        highlight: ["notification_decorative-02.ogg", true],
        error: ["alert_error-03.ogg", true]
    },
    usercommands: [
        ["action", "me &2"],
        ["banlist","mode %c b"],
        ["dialog","query %2"],
        ["exit","quit"],
        ["j","join #&2"],
        ["kill","kill %2 :&3"],
        ["leave","part &2"],
        ["m","msg &2"],
        ["omsg","msg @%c &2"],
        ["onotice","notice @%c &2"],
        ["servhelp","help"],
        ["sping","ping"],
        ["squery","squery %2 :&3"],
        ["umode","mode %n &2"],
        ["uptime","stats u"],
        ["ver","ctcp %2 version"],
        ["version","ctcp %2 version"],
        ["wallops","wallops :&2"],
        ["wi","whois %2"],
        ["wii","whois %2 %2"],
        ["p","part"],
        ["leave","part"],
        ["c","clear"],
        ["ni","msg nickserv identify &2"],
        ["ns","nickserv &2"],
        ["cs","chanserv &2"]
    ],
    networks:[
    
    ],
    userCards: false,
    spamTimer: 3000
};




var channelSettings = {
    "default": {
        "default": {
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
};

if(localStorage.settings == undefined){
    localStorage.settings = JSON.stringify(settings);
	$("link#theme").attr("href", "themes/" + settings.theme);
}else{
	var ts = JSON.parse(localStorage.settings);
    for(var i in ts){
		settings[i] = ts[i];
	}
}

if(localStorage.channelSettings != undefined){
    channelSettings = JSON.parse(localStorage.channelSettings);
}

function processSettings(){
    $("link#theme").attr("href", "themes/" + settings.theme);
    $("div.items div.item-selected").click();
    if(settings.timestamps){
        $("style#nots").remove();
    }else{
        $("head").append('<style id="nots">div.channel-content div.message-date{ display:none; }</style>');
    }
}

var mouse = {x: "0", y: "0"};
var resizer = "";

var ignore = {
    addString: function(e){
        for(var i in settings.ignores){
            if(settings.ignores[i].ignore == e.toLowerCase()) return false;
        }
        settings.ignores.push({ignore: e.toLowerCase(), type: "string", date: Date.now()});
        return true;
    },
    addRegex: function(e){
        for(var i in settings.ignores){
            if(settings.ignores[i].ignore == e) return false;
        }
        settings.ignores.push({ignore: e, type: "regex", date: Date.now()});
        return true;
    },
	remove: function(e){
		if(e == "*"){
			settings.ignores = [];
			return true;
		}
        for(var i in settings.ignores){
            if(settings.ignores[i].ignore == e){
				settings.ignores.splice(i, 1);
				return true;
			}
        }
		return false;
	},
    test: function(e){
        for(var i in settings.ignores){
            if(settings.ignores[i].type == "regex"){
                var re = new RegExp(settings.ignores[i].ignore, "ig");
                if(re.test(e)) return true;
            }else{
                if(userAsRegex(settings.ignores[i].ignore).test(e)) return true;
            }
        }
        return false;
    }
}

var sounds = {
    play: function(e){
        if(settings.muted) return;
        for(var i in settings.sounds){
            if(i == e && settings.sounds[i][0] != "" && settings.sounds[i][1] == true){
                $("div#audio").html('<audio autoplay><source src="sounds/' + settings.sounds[i][0] + '" type="audio/ogg"></audio>');
                $("audio")[0].play();
            }
        }
    }
}

/* overlay.show({type: "dialog", title:"TEST", text:"hello", inputs:[], buttons:["Okay"], callback: function(e){}}) */
var overlay = {
    callback: false,
    args: {tab: "appearance"},
    show: function(e){
        $("div#overlay").fadeIn(100, function(){
            $("div#" + e.type ).fadeIn(100);
        });
        if(e.type == "dialog"){
            sounds.play("error");
            var dv = $("div#" + e.type + " div.obox-content" );
            dv.html("");
            dv.append('<div class="dtitle" style="padding: 10px 10px 0px 10px; font-size: 18px; margin-bottom: 5px;font-weight: bold;">' + e.title + '</div>');
            dv.append('<div class="dmessage" style="padding: 5px 10px 5px 10px;">' + e.text + '</div>');
            if(e.inputs){
                for(var i in e.inputs){
                    dv.append('<div class="dinput"><div class="inputtitle" style="padding: 5px 10px 5px 10px;">' + e.inputs[i] + ':</div> <input type="text" name="' + e.inputs[i] + '"></div>');
                }
            }
            for(var i in e.buttons){
                dv.append('<div class="dlinks" style="padding: 5px 10px 5px 10px;"><a href="input:callback">' + e.buttons[i] + '</a> &nbsp;</div>');
            }
        }else if(e.type == "plugins"){
            $("div#iplugin" ).show();
        }
        this.callback = e.callback;
    },
    iframe: function(a,b){
        this.show({type: "loader"});
        this.args = b;
        if(a.indexOf(":")==-1){
            $("iframe#oiframe").attr("src", "iframes/" + a);
        }else{
            $("iframe#oiframe").attr("src", a);
        }
        $("iframe#oiframe").show();
    },
    hide: function(){
        $("div#overlay,div.obox").hide();
        $("iframe#oiframe").attr("src", "about:blank").hide();
    }
}

$(function(){
    window.resizeTo(1024,600);
    $("body").on("mousemove", function(e){
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        switch(resizer){
            case "nav-pane":
                if(mouse.x > 10) $(":root").css("--nav-pane-width", (mouse.x+3) + "px");
                break;
            case "topic":
                if(mouse.y > 25) $(":root").css("--topic-bar-height", (mouse.y+3) + "px");
                break;
            case "users-list":
                if(mouse.y > 25) $(":root").css("--users-list-width", ($(window).width() - mouse.x) + "px");
                break;
        }
        if(mouse.x < 5 || mouse.y < 5) resizer = "";
    });
    $("div.sizer").on("mousedown", function(e){
        resizer = $(this).attr("for");
    }).on("mouseup", function(e){
        resizer = ""
    });
    $("body").on("mouseup", function(e){
        resizer = ""
    });
    $("window").on("mouseleave", function(e){
        resizer = ""
    });

    document.getElementById('file-input').addEventListener('change', readSingleFile, false);
    window.addEventListener("beforeunload", function(event) {
        localStorage.settings = JSON.stringify(settings);
        localStorage.channelSettings = JSON.stringify(channelSettings);
        burd.controlServer.send('["CLOSED"]');
    });
    
    processSettings();
    
    burd.connectToControl();
    
});

function sendData(network, data){
    burd.controlServer.send(JSON.stringify(
        [":" + burd.getServer(network).socket + " " + data]
    ));
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if(file.size > 5e+6){
        overlay.show({type: "dialog", title: "Upload error", text: "The file is too large to upload", inputs: [], buttons: ["OK"], callback: function(e){}});
        return;
    }
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        fileInput.content = contents;
        var extension = file.name.split('.').pop().toLowerCase();
        fileInput.type = extension;
        fileInput.callback();
    };
    reader.readAsText(file);
}

function genID(){
    return 'xxxxxxxxxx'.replace(/x/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

$.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

var colors = {
    strip: function( e ) {
        e = e.replace( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?|\u0003/ig, "" );
        e = e.replace( /\u0008|\u0002|\x1F|\x0F|\x11|\x1E/ig, "" );
        return e;
    },
    parse: function( e ) {
        if(typeof(e) == "string"){
            if(settings.textColors){
                e = this.parseColors( e );
                e = this.parseBold( e );
                e = this.parseItalic( e );
                e = this.parseUnderline( e );
                e = this.parseStrike( e );
                e = this.parseMonospace( e );
            }
            e = this.strip( e );
        }
        return e;
    },
    parseColors: function( e ) {
        /*  */
        var c = e.match( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?/ig, "" );
        var newText = e;
        var colors = [ 
            "#FFFFFF","#000000","#000080",
            "#008000","#FF0000","#A52A2A",
            "#800080","#FFA500","#FFFF00",
            "#00FF00","#008080","#00FFFF",
            "#4169E1","#FF00FF","#808080",
            "#C0C0C0","transparent"
        ];
        
        if ( c == null ) return e; /* no colors, no need to go on */
        
        var nt = 0;
        
        for ( var i in c ) {
            /* now lets loop the matches */
            var BG = 16;
            var FG = 16;
            var m = c[i].substr( 1 ).split( "," );
            if ( m.length == 2 ) BG = parseInt( m[1] );
            FG = parseInt( m[0] );
            if ( FG > 16 || BG > 16 || BG < 0 || FG < 0 ) return this.strip( e );
            BG = colors[BG];
            FG = colors[FG];
            newText = newText.replace( c[i], '<span style="color:' + FG + ';text-shadow:none;background:' + BG + '">' );
            nt += 1;
        }
        
        newText = newText.replace( /\u0003/g, "</span>" );
        var tnt = newText.match( /<\/span>/g );
        if ( tnt != null ) nt = nt - tnt.length;
        
        if ( nt < 0 ) return this.strip( e );
        
        while ( nt > 0 ) {
            nt -= 1;
            newText += "</span>";
        }
        
        if ( nt != 0 ) return this.strip( e );
        
        tnt = newText.match( /<\/?span/g );
        
        nt = 0;
        
        for ( var i in tnt ) {
            if ( tnt[i] == "<span" ) nt += 1;
            if ( tnt[i] == "</span" ) {
                if ( nt < 1 ) return this.strip( e );
                nt = nt - 1;
            }
        }

        return newText;
    },
    parseBold: function( e ) {
        var c = e.match( /\u0002/g, "" );
        var nt = 0;
        for ( var i in c ) {
            if ( nt == 0 ) {
                nt = 1;
                e = e.replace( /\u0002/, '<span style="font-weight:bold;text-shadow:none;">' );
            } else {
                nt = 0;
                e = e.replace( /\u0002/, '</span>' );
            }
        }
        if ( nt == 1 ) e += "</span>";
        return e;
    },
    parseItalic: function( e ) {
        var c = e.match( /\x1D/g, "" );
        var nt = 0;
        for ( var i in c ) {
            if ( nt == 0 ) {
                nt = 1;
                e = e.replace( /\x1D/, '<span style="font-style:italic;text-shadow:none;">' );
            } else {
                nt = 0;
                e = e.replace( /\x1D/, '</span>' );
            }
        }
        if ( nt == 1 ) e += "</span>";
        return e;
    },
    parseUnderline: function( e ) {
        var c = e.match( /\x1F/g, "" );
        var nt = 0;
        for ( var i in c ) {
            if ( nt == 0 ) {
                nt = 1;
                e = e.replace( /\x1F/, '<span style="text-decoration:underline;text-shadow:none;">' );
            } else {
                nt = 0;
                e = e.replace( /\x1F/, '</span>' );
            }
        }
        if ( nt == 1 ) e += "</span>";
        return e;
    },
    parseStrike: function( e ) {
        var c = e.match( /\x1E/g, "" );
        var nt = 0;
        for ( var i in c ) {
            if ( nt == 0 ) {
                nt = 1;
                e = e.replace( /\x1E/, '<span style="text-decoration: line-through;text-shadow:none;">' );
            } else {
                nt = 0;
                e = e.replace( /\x1E/, '</span>' );
            }
        }
        if ( nt == 1 ) e += "</span>";
        return e;
    },
    parseMonospace: function( e ) {
        var c = e.match( /\x11/g, "" );
        var nt = 0;
        for ( var i in c ) {
            if ( nt == 0 ) {
                nt = 1;
                e = e.replace( /\x11/, '<span style="font-family: Courier, Monaco, \'Ubuntu Mono\', monospace;">' );
            } else {
                nt = 0;
                e = e.replace( /\x11/, '</span>' );
            }
        }
        if ( nt == 1 ) e += "</span>";
        return e;
    }
}


var snackbar = {
    callback: function(e){},
    show: function(e){
        this.callback = e.callback;
        $("div.snack-content").html(e.text);
        $("div.snack-button").remove();
        for(var i in e.buttons){
            $("div#snackbar").prepend('<div class="snack-button">' + e.buttons[i] + '</div>');
        }
        $("div#snackbar").show(200);
    }
}


function mainMenu(){
    var svr = burd.getServer(burd.lastServer);
    menu.show([
        {text: "Preferences", callback: function(){
            overlay.iframe("settings.html", {tab: "appearance"});
        }},
        {text: "-", callback: function(){}},
        {text: "Network List", callback: function(){
            overlay.iframe("networks.html", {tab: "appearance"});
        }},
        {text: "New Network", callback: function(){
            overlay.iframe("newnetwork.html", {tab: "appearance"});
        }},
        {text: "-", callback: function(){}},
        {text: "About", callback: function(){
            overlay.iframe("about.html", {tab: "appearance"});
        }}
        
    ]);
}


function showUserMenu(nick){
    var svr = burd.getServer(burd.lastServer);
    menu.show([
        {header: removeHtml(nick)},
        {text: "-"},
        {text: "Send a PM", callback: function(){
            var chan = burd.getChannel(svr.id, nick, "pm");
            if(!chan){
                $("div.server[sid='" + svr.id + "'] div.items").append('<div class="nav-item" channel="'+ removeHtml(nick.toLowerCase()) +'" type="pm"><div class="item-name">' + removeHtml(nick) + '</div><div class="counter" num="0">0</div><div class="closer">&nbsp;</div></div>');
                svr.channels.push(
                    {
                        channel: nick,
                        type: "pm",
                        topic: "",
                        topicSetter: "",
                        users: [
                        ],
                        content: []
                    }
                );
            }
            $("div.nav-item[channel='" + nick.toLowerCase() + "'][type='pm']").click();
        }},
        {text: "Whois", callback: function(){
            burd.controlServer.send(JSON.stringify(
                [":" + svr.socket + " WHOIS " + nick]
            ));
        }},
        {text: "Ignore", callback: function(){
            var mask = svr.users[nick].mask;
            if(mask == ""){
                //burd.sendLast("MODE " + burd.lastChannel.name + " +b " + nick);
                if(ignore.addString(nick+"!*@*")){
                    burd.addChannelMessage(burd.lastServer, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: removeHtml("Added " + nick + "!*@* to ignore list")},true);
                }else{
                    burd.addChannelMessage(burd.lastServer, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: removeHtml("User already ignored")},true);
                }
            }else{
                if(ignore.addString("*!" + mask.split("!")[1])){
                    burd.addChannelMessage(burd.lastServer, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: removeHtml("Added *!" + mask.split("!")[1] + " to ignore list")},true);
                }else{
                    burd.addChannelMessage(burd.lastServer, burd.lastChannel.name, burd.lastChannel.type, {type: "info",  time: Date.now(), message: removeHtml("User already ignored")},true);
                }
            }
        }},
        {text: "-"},
        {text: "CTCP", callback: function(){
            var one = String.fromCharCode(1);
            menu.show([
                {header: removeHtml(nick)},
                {text: "-"},
                {text: "Ping", callback: function(){
                    burd.sendLast("PRIVMSG " + nick + " :" + one + "PING " + parseInt(Date.now()/1000) + one);
                }},
                {text: "Time", callback: function(){
                    burd.sendLast("PRIVMSG " + nick + " :" + one + "TIME" + one);
                }},
                {text: "Version", callback: function(){
                    burd.sendLast("PRIVMSG " + nick + " :" + one + "VERSION" + one);
                }},
                {text: "Client Info", callback: function(){
                    burd.sendLast("PRIVMSG " + nick + " :" + one + "CLIENTINFO" + one);
                }},
                {text: "User Info", callback: function(){
                    burd.sendLast("PRIVMSG " + nick + " :" + one + "USERINFO" + one);
                }}
            ]);
        }},
        {text: "-"},
        {text: "OP Actions", callback: function(){
            menu.show([
                {header: removeHtml(nick)},
                {text: "-"},
                {text: "OP User", callback: function(){
                    burd.sendLast("MODE " + burd.lastChannel.name + " +o " + nick);
                }},
                {text: "DEOP User", callback: function(){
                    burd.sendLast("MODE " + burd.lastChannel.name + " -o " + nick);
                }},
                {text: "VOICE User", callback: function(){
                    burd.sendLast("MODE " + burd.lastChannel.name + " +v " + nick);
                }},
                {text: "UNVOICE User", callback: function(){
                    burd.sendLast("MODE " + burd.lastChannel.name + " -v " + nick);
                }},
                {text: "-"},
                {text: "KICK User", callback: function(){
                    burd.sendLast("KICK " + burd.lastChannel.name + " " + nick + " :" + settings.banreason);
                }},
                {text: "BAN User", callback: function(){
                    var mask = svr.users[nick].mask;
                    if(mask == ""){
                        burd.sendLast("MODE " + burd.lastChannel.name + " +b " + nick);
                    }else{
                        var bmask = settings.banmask;
                        bmask = bmask.replace(/\%n/g, nick);
                        bmask = bmask.replace(/\%i/g, mask.split("!")[1].split("@")[0]);
                        bmask = bmask.replace(/\%h/g, mask.split("@")[1]);
                        burd.sendLast("MODE " + burd.lastChannel.name + " +b *!" + bmask);
                    }
                }},
                {text: "BAN/KICK User", callback: function(){
                    var mask = svr.users[nick].mask;
                    if(mask == ""){
                       burd.sendLast("MODE " + burd.lastChannel.name + " +b " + nick);
                    }else{
                       burd.sendLast("MODE " + burd.lastChannel.name + " +b *!" + mask.split("!")[1]);
                    }
                    burd.sendLast("KICK " + burd.lastChannel.name + " " + nick + " :" + settings.banreason);
                }}
            ]);
        }}
    ]);
}

function getChannelSettings(network, channel){
    if(channelSettings[network] == undefined) return channelSettings["default"]["default"];
    if(channelSettings[network][channel] == undefined) return channelSettings["default"]["default"];
    return channelSettings[network][channel];
}

function linkify(e) {
    // https://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;\(\)]*[a-z0-9-+&@#\/%=~_|\(\)]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return e
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
}

function formatAttr(e){
    //e = e.replace(/\'/g, "&rdquo;");
    if(e==undefined) return "";
    e = e.replace(/\"/g, '&quot;');
    e = e.replace(/\\/g, "&bsol;");
    return e;
}
function formatSel(e){
    //e = e.replace(/\'/g, "&rdquo;");
    e = e.replace(/\\/g, "\\\\");
    e = e.replace(/\"/g, '\\"');
    return e;
}

function timeConverter(e){
    //https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    var a = new Date(e);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + pad(hour) + ':' + pad(min) + ':' + pad(sec) ;
    return time;
    
    function pad(e){
        if(e < 10) e = "0" + e;
        return e;
    }
}

function userAsRegex( e ){
	var returnStr = "";
	for( var i in e ) {
		returnStr += e[i].replace( /[^a-zA-Z\d\s\*:]/, "\\" + e[i] );
	}
	returnStr = returnStr.replace( /\s/g, "\\s" );
	returnStr = returnStr.replace( /\*/g, "(.*)" );
	return new RegExp(returnStr, "ig");
}

function strToColor(str) {
  var hash = 0;
  str = str + str + str + str;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = hash.toString().replace(/\-/g, "");
  var colors = "ABCDEFABCDEFABCDEFABCDEFABCDEFABCDEF";
  var cColor = "";
  for(var i in hash){
      cColor += colors[hash[i]];
  }
  return ("#" + cColor.substr(0,6));
}
function removeHtml(e){
	return e.replace(/\&/g, "&amp;").replace(/\</g, "&lt;");
}

var updateServers = true;
setInterval(function(){
    if(updateServers){
        iplugin.contentWindow.postMessage({command: "servers", servers: burd.servers},"*");
        updateServers = false;
    }
},3000);