/*
This code is released under the Mozilla Public License 2.0
*/

/* handlers for key press events */
var inputCache = {
	cache: [],
	index: 0
};
$(function(){
	$("input.input-box").on("keyup", function(e){
		var val = $(this).val();
		if(val.substr(0,1) == "/" && val.length > 1 && settings.cmdautocomplete){
			$("div.ccom").remove();
			var count = 0;
			for(var i in commands){
				if(i.substr(0,val.length - 1) == val.substr(1).toLowerCase()){
					$("div#ccoms").append('<div class="ccom">' + removeHtml(commands[i].usage) + '</div>');
					count++;
				}
				
			}
			if($("div#ccoms").text().length > 2){
				$("div#ccoms").show();
			}else{
				$("div#ccoms").hide();
			}
		}else{
			$("div#ccoms").hide();
		}
		switch(e.keyCode){
			case 13:
				parseInput(val,$(this));
				inputCache.cache.push(val);
				if(inputCache.cache.length > 1024) inputCache.cache.splice(0, 1);
				inputCache.index = 0;
				$(this).val("");
				break;
				
			case 9:
				e.preventDefault();
				
				break;

				
			default:
				break;
		}
		//console.log(e.keyCode);
	});
	$("input.input-box").on("keydown", function(e){
		switch(e.keyCode){
			
			case 9:
				//tab
				console.log("xxx");
				tabuser();
				e.preventDefault();
				
				break;
				
			case 38:
				//up
				inputCache.index--;
				if(inputCache.index == -1) inputCache.index = inputCache.cache.length - 1;
				$("input.input-box").val(inputCache.cache[inputCache.index]);
				setTimeout(function(){
					$("input.input-box")[0].selectionStart = $("input.input-box")[0].selectionEnd = $("input.input-box")[0].value.length;
				},10);
				break;
				
			case 40:
				//down
				inputCache.index++;
				if(inputCache.index == inputCache.cache.length) inputCache.index = 0;
				$("input.input-box").val(inputCache.cache[inputCache.index]);

				break;
				
			default:
				tabUsers.search = "";
				break;
		}
	});
});

var tabUsers = {
	users: [],
	index: 0,
	search: "",
	usertext: ""
}
function tabuser(){
	if(tabUsers.search == ""){
		tabUsers.usertext = $("input.input-box").val();
		tabUsers.users = [];
		var s = tabUsers.usertext.split(" ");
		tabUsers.search = s[s.length - 1].toLowerCase();
		var count = $("span.usertext").length - 1;
		$("span.usertext").each(function(i){
			var usr = $(this).text();
			if(usr.substr(0,tabUsers.search.length).toLowerCase() == tabUsers.search){
				tabUsers.users.push($(this).text());
			}
			if(i == count){
				if(tabUsers.users.length == 0){
					tabUsers.search = "";
					return;
				}
				$("input.input-box").val(tabUsers.usertext.substr(0, tabUsers.usertext.length - tabUsers.search.length) + tabUsers.users[0] + " ");
				if(tabUsers.usertext.length == tabUsers.search.length) $("input.input-box").val($("input.input-box").val().slice(0,-1) + ": ");
			}
		});
	}else{
		tabUsers.index++;
		if(tabUsers.index > (tabUsers.users.length - 1)) tabUsers.index = 0;
		$("input.input-box").val(tabUsers.usertext.substr(0, tabUsers.usertext.length - tabUsers.search.length) + tabUsers.users[tabUsers.index] + " ");
		if(tabUsers.usertext.length == tabUsers.search.length) $("input.input-box").val($("input.input-box").val().slice(0,-1) + ": ");
	}
}