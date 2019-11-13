/* handlers for click events */
//http://іmgur.comﾉindex.ga
$(function(){
	$("body").on("mousedown", function(e){
		var t = $(e.target);
		if(!t.parents().hasClass("emoji")) $("div.emoji").hide();
	});
	$("input.emoji-button").on("click", function(e){
		$("div.emoji").fadeIn(100);
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
		overlay.iframe("settings.html", {test: 123});
	});
	$("div.add-menu").on("click", function(e){
		menu.show([
			{text: "Network list", callback: function(){alert("lol")}},
			{text: "New network", callback: function(){alert("lol")}}
		]);
	});
	$("body").on("click", "div.emoji-icon", function(e){
		$("input.input-box").val($("input.input-box").val() + $(this).text());
		//$("div.emoji").fadeIn(100);
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
		}
		e.preventDefault();
	});
});