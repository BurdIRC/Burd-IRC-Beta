var settings = {
	language: "english.json"
};
var language = {};
var args = {};

var onArgs = function(e){};

$(function(){
	$("div.quit").on("click", function(e){
		window.parent.postMessage({command: "close-main-iframe"}, "*");
	});
	setTimeout(function(){
		window.parent.postMessage({command: "show-main-iframe"}, "*");
	},100);
	$("body").on("click", "div.checkbox", function(e){
		if($(this).hasClass("checked")){
			$(this).removeClass("checked");
		}else{
			$(this).addClass("checked");
		}
		onCheckbox($(this),$(this).hasClass("checked"));
	});
});

function onCheckbox(elem, state){
	
}

window.addEventListener("message", function(e){
	switch(e.data.command){
		case "iframe-args":
			if(e.data.args.tab){
				$("div.tab[pane='" + e.data.args.tab + "']").click();
			}
			args = e.data.args;
			onArgs(args);
			break;
	}
}, false);

function removeHtml(e){
	return e.replace(/\&/g, "&amp;").replace(/\</g, "&lt;");
}