let banWindow = false;
window.addEventListener("message", function(e){
    console.log(e.data);
    switch(e.data.command){
        case "iframe-size":
            $("div#frame").css("height", e.data.height).css("width", e.data.width);
            break;
        case "show-main-iframe":
            $("div#loader").fadeOut(100, function(){
                $("div#frame").fadeIn(200);
            });
            e.source.postMessage({command: "iframe-args", args: overlay.args}, "*");
            break;
        case "close-main-iframe":
            overlay.hide();
            $("div#frame").attr("src", "about:blank");
            break;
        case "get-version":
            e.source.postMessage({command: "version", version: version}, "*");
            break;
        case "new-server":
            for(var i in settings.networks){
                if(settings.networks[i].name.toLowerCase() == e.data.server.name.toLowerCase()){
                    e.source.postMessage({command: "error", message: "A network with that name already exists"}, "*");
                    return;
                }
            }
            e.data.server.id = genID();
            settings.networks.push(e.data.server);
            e.source.postMessage({command: "added"}, "*");
            break;
        case "delete-server":
            for(var i in settings.networks){
                if(settings.networks[i].id == e.data.id){
                    settings.networks.splice(i,1);
                }
            }
            break;
        case "add-plugin":
            settings.plugins.push(e.data.plugin);
            break;
        case "remove-plugin":
            settings.plugins.splice(e.data.index, 1);
            break;
        case "get-plugins":
            e.source.postMessage({command: "plugins", plugins: settings.plugins}, "*");
            break;
        case "get-bans":
            banWindow = e.source;
            sendData(e.data.network, "MODE " + e.data.channel + " +b");
            break;
            
        case "get-settings":
            e.source.postMessage({command: "settings", settings: settings}, "*");
            break;
        case "get-channel-settings":
            if(channelSettings[e.data.network] != undefined && channelSettings[e.data.network][e.data.channel] != undefined){
                e.source.postMessage({command: "channel-settings", settings: channelSettings[e.data.network][e.data.channel]}, "*");
            }
            break;
        case "set-channel-settings":
            channelSettings[e.data.network][e.data.channel] = e.data.settings;
            break;
        case "set-setting":
            settings[e.data.setting] = e.data.value;
            break;
            
        case "replace-settings":
            settings = e.data.settings;
            if(settings.timestamps){
                $("style#nots").remove();
            }else{
                $("head").append('<style id="nots">div.channel-content div.message-date{ display:none; }</style>');
            }
            $("div.item-selected").click();
            break;
            
        case "get-server":
            for(var i in settings.networks){
                if(settings.networks[i].id == e.data.server)  e.source.postMessage({command: "server", server: settings.networks[i]}, "*");
            }
            break;
            
        case "last-channel":
            e.source.postMessage({command: "last-channel", channel: burd.lastChannel, network: burd.lastServer}, "*");
            break;
            
        case "edit-server":
            for(var i in settings.networks){
                if(settings.networks[i].id == e.data.server.id){
                    settings.networks[i] = e.data.server;
                }
            }
            e.source.postMessage({command: "edited"}, "*");
            break;
            
        case "connect":
            var si = burd.getServerInfo(e.data.id);
            burd.connectServer(si.id);
            console.log(si);
            break;
            
        case "add-message":
            console.log(e);
            if(e.data.channel == "*"){
                e.data.channel = burd.lastChannel.name;
                e.data.server = burd.lastServer;
            }
            burd.addChannelMessage(e.data.server, e.data.channel, "channel", {type: "info",  time: Date.now(), message: removeHtml(e.data.message)}, true);
            break;
    }
}, false);