var whoPollTimer = setInterval(function(){
	/*
		this timer will do a WHO on a channel you're in to check for users that are away.
		One channel per server per 30 seconds.
	*/

    for(var i in burd.servers){
        var svr = burd.servers[i];
        if(svr.whoPollList.length > 0){
            burd.controlServer.send(JSON.stringify(
                [":" + svr.socket + " WHO " + svr.whoPollList[0]]
            ));
            svr.whoPollList.splice(0, 1);
        }
        
        if(svr.whoPollList.length == 0){
            for(var a in svr.channels){
                if(svr.channels[a].type == "channel") svr.whoPollList.push(svr.channels[a].channel.toLowerCase());
            }
        }
    }

},30000);