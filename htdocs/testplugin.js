{
    name: "My Test Plugin",
    version: "1.0.0",
    onPrivMsg: function(e){
        if(e.message == "test") server(e.sID).addMessage("*", "someone said test");
    },
    onPart: function(e){
    },
    onQuit: function(e){
    },
    onJoin: function(e){
    },
    onKick: function(e){
    },
    onData: function(e){
    },
    onInput: function(e){
    }
    
    
}