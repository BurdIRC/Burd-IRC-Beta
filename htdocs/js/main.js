var version = "0.7.0";
var settings = {
	focusOnJoin: true,
	logPackets: true,
	muted: false,
	sounds: {
		alert: "state-change_confirm-down.ogg",
		newPM: "hero_simple-celebration-03.ogg",
		notice: "navigation_hover-tap.ogg",
		privmsg: "",
		highlight: "notification_decorative-02.ogg"
	},
	networks:[
		{
			name: "Freenode",
			nick: "duckgoose",
			realName: "Matt",
			auth: {
				method: "server-password",
				password: "abc123456"
			},
			
			channels:[
				{
					channel: "#freenode",
					key: "",
					showJoins: true,
					showParts: true,
					showModes: true
				}
			],
			
			servers: [
				{address: "irc.freenode.net", port:"6667", tls: false}
			]
		}
	]
};

var mouse = {x: "0", y: "0"};
var resizer = "";

var sounds = {
	play: function(e){
		if(settings.muted) return;
		for(var i in settings.sounds){
			if(i == e && settings.sounds[i] != ""){
				$("div#audio").html('<audio autoplay><source src="sounds/' + settings.sounds[i] + '" type="audio/ogg"></audio>');
				$("audio")[0].play();
			}
		}
	}
}

var overlay = {
	callback: false,
	args: {tab: "about"},
	show: function(e){
		$("div#overlay").show(100, function(){
			$("div#" + e.type ).show(100);
		});
		if(e.type == "dialog"){
			sounds.play("alert");
			var dv = $("div#" + e.type + " div.obox-content" );
			dv.html("");
			dv.append('<div class="dtitle" style="font-size:18px;margin-bottom:5px;">' + e.title + '</div>');
			dv.append('<div class="dmessage">' + e.text + '</div>');
			if(e.inputs){
				for(var i in e.inputs){
					dv.append('<div class="dinput"><div class="inputtitle">' + e.inputs[i] + ':</div> <input type="text" name="' + e.inputs[i] + '"></div>');
				}
			}
			for(var i in e.buttons){
				dv.append('<div class="dlinks"><a href="input:callback">' + e.buttons[i] + '</a> &nbsp;</div>');
			}
		}
		this.callback = e.callback;
	},
	iframe: function(a,b){
		this.show({type: "loader"});
		$("iframe#oiframe").attr("src", "iframes/" + a);
	},
	hide: function(){
		$("div#overlay,div.obox").hide();
		
	}
}

$(function(){
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
	window.addEventListener("message", function(e){
		console.log(e.data.command);
		switch(e.data.command){
			case "iframe-size":
				$("div#frame").css("height", e.data.height).css("width", e.data.width);
				break;
			case "show-main-iframe":
				$("div#loader").fadeOut(100, function(){
					$("div#frame").show(200);
				});
				e.source.postMessage({command: "iframe-args", args: overlay.args}, "*");
				break;
			case "get-version":
				e.source.postMessage({command: "version", version: version}, "*");
				break;
		}
	}, false);
});

$.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
	  .indexOf(m[3].toUpperCase()) >= 0;
};