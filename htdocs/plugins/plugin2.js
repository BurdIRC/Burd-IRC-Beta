class plugin{
    name = "Test plugin";
    author = "matt ryan";
    
    onPrivMsg(e){
        //console.log(e);
        if(e.message.indexOf("the") > -1){
            //var chan = server(e.sID).channel(e.channel);
            //var lastM = chan.content[chan.content.length - 1];
            //lastM.message = lastM.message.replace("the", "LOL");
        }
        //lastM.message = "test";
        
    }
}

