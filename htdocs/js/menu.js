/*
This code is released under the Mozilla Public License 2.0
*/

$(function(){
	$("body").on("click", "div.menu-item", function(e){
		$("div.menu-list").remove();
		menu.exec($(this).attr("callback"));
	});
	$("body").on("mousedown", function(e){
		var t = $(e.target);
		if(!t.hasClass("menu-list") && !t.hasClass("menu-item")){
			$("div.menu-list").remove();
		}
	});
});

var menu = {
	callbacks:[],
	show: function(e){
		this.callbacks = [];
		$("div.menu-list").remove();

		var menuHtml = '<div class="menu-list">';
		for(var i in e){
			
			if(e[i].text == "-"){
				menuHtml += '<div class="menu-splitter">&nbsp;</div>';
			}else if(e[i].header != undefined){
				menuHtml += '<div class="menu-header">' + e[i].header + '</div>';
			}else{
				var cID = (Math.random().toString(36)+Math.random().toString(36)).replace(/[^a-z]+/g, '').substr(0, 10);
				menuHtml += '<div class="menu-item" style="background-image:url(\'' + (e[i].image || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==") + '\')" callback="' + cID + '">' + e[i].text + '</div>';
				this.callbacks.push({id: cID, callback: e[i].callback, info: e[i]});
			}
		}
		menuHtml += '</div>';
		$("body").append(menuHtml);
		
		var menuY = (mouse.y - 10);
		var menuX = (mouse.x - 10);
		if((menuY + $("div.menu-list").height() + 5) > $(window).height()){
			menuY = ($(window).height() - $("div.menu-list").height() - 20);
		}
		if((menuX + $("div.menu-list").width()) > $(window).width() + 5){
			menuX = ($(window).width() - $("div.menu-list").width() - 20);
		}
		if(menuX < 5){
			menuX = 5;
		}
		$("div.menu-list").css("top", menuY + "px").css("left", menuX + "px");
        
	},
	exec: function(e){
		for(var i in this.callbacks){
			if(this.callbacks[i] != undefined && this.callbacks[i].id == e){
				this.callbacks[i].callback(this.callbacks[i].info);
				console.log(this.callbacks[i]);
			}
		}
	}
}