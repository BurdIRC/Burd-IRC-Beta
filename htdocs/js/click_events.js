/* handlers for click events */

$(function(){
	$("body").on("mousedown", function(e){
		var t = $(e.target);
		if(!t.parents().hasClass("emoji")) $("div.emoji").hide();
	});
	$("input.emoji-button").on("click", function(e){
		$("div.emoji").fadeIn(100);
		$.getJSON( "emojis.json", function( data ) {
			var s = data["smileys"].split(" ");
			$("div.emojis").html("");
			for(var i in s){
				$("div.emojis").append('<div class="emoji-icon">' + s[i] + '</div>');
			}
		});
	});
	
	$("input.insert-button").on("click", function(e){
		 $('#file-input').trigger('click'); 
	});
		
	$("div.config-button").on("click", function(e){
		 overlay.iframe("channelconf.html", {channel: "#test123"});
	});		
	
	$("div.media-options").on("click", function(e){
		 $(this).parent().parent().fadeOut(100,function(){
			 $(this).remove();
		 });
	});
	
	$("div#overlay").on("click", function(e){
		if(e.target.id == "overlay") overlay.hide();
	});
	$("div.settings-menu").on("click", function(e){
		/*
		menu.show([
			{text: "test", callback: function(){
				overlay.show({
					type: "dialog",
					title: "test",
					text: "hello whats up",
					buttons: ["Close"],
					callback: function(e){
						console.log(e);
					}
					
				});
			}}
		]);
		*/
		overlay.iframe("settings.html", {tab: "appearance"});
	});
	$("div.add-menu").on("click", function(e){
		/*
		menu.show([
			{text: "Network list", callback: function(){
				overlay.iframe("networks.html", {tab: ""});
			}},
			{text: "New network", callback: function(){
				overlay.iframe("newnetwork.html", {tab: ""});
			}}
		]);
		*/
		overlay.iframe("networks.html", {tab: ""});
	});
	
	$("div.users").on("click", "div.user", function(e){
		showUserMenu($(this).attr("nick"));
	});	
	$("div.channel-content").on("click", "span.name", function(e){
		showUserMenu($(this).text());
	});
	
	
	$("body").on("click", "div.emoji-icon", function(e){
		$("input.input-box").val($("input.input-box").val() + $(this).text());
		//$("div.emoji").fadeIn(100);
	});	
	
	$("div.nav-items").on("click", "div.console", function(e){
		if($(e.target).hasClass("closer")){
			alert()
		}else{
			$("div.item-selected").removeClass("item-selected");
			$(this).addClass("item-selected");
			var sid = $(this).parent().attr("sid");
			$("div.channel-window").hide();
			burd.showChannel(sid,$(this).attr("channel"),$(this).attr("type"));
			$("div.channel-window").show();
			$(this).find("div.counter").text("0").attr("num", "0");
			$(this).removeClass("item-bell");
		}
	});
	
	$("body").on("click", "div.nav-item", function(e){
		var sid = $(this).parent().parent().attr("sid");
		var svr = burd.getServer(sid);
		if($(e.target).hasClass("closer")){
			if($(this).attr("type") == "channel") burd.controlServer.send(JSON.stringify(
				[":" + svr.socket + " PART " + $(this).attr("channel")]
			));
			var p = $(this).prev();
			var t = $(this);
			if(p.hasClass("nav-item")){
				p.click();
			}else{
				t.parent().parent().find("div.console").click();
			}
			burd.removeChannel(svr, $(this).attr("channel"), $(this).attr("type"));
		}else{	
			$("div.item-selected").removeClass("item-selected");
			$(this).addClass("item-selected");
			$("div.channel-window").removeClass("console");
			$("div.channel-window").hide();
			burd.showChannel(sid,$(this).attr("channel"),$(this).attr("type"));
			$("div.channel-window").show();
			$(this).find("div.counter").text("0").attr("num", "0");
			$(this).removeClass("item-bell");
		}
		$("input.input-box").focus();
	});
	
	$("div.channel-content").on("click", function(e){
		$("input.input-box").focus();
	});
	
	$("body").on("click", "a", function(e){
		var t = $(this).attr("href").split(":");
		switch(t[0]){
			case "emoji":
				$.getJSON( "emojis.json", function( data ) {
					var s = data[t[1].toLowerCase()].split(" ");
					$("div.emojis").html("");
					for(var i in s){
						$("div.emojis").append('<div class="emoji-icon">' + s[i] + '</div>');
					}
				});
				break;
			case "http":
			case "https":
			case "ftp":
				window.open($(this).attr("href"), "target=_blank");
				break;
			case "input":
				var ip = $("div.obox:visible input");
				overlay.callback({button: $(this).text(), inputs: ip});
				overlay.hide();
				break;
			case "remove":
				$(this).parent().parent().parent().remove();
				break;
		}
		e.preventDefault();
	});
	
	
});