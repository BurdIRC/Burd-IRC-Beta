/*
This code is released under the Mozilla Public License 2.0
*/

var commands = {
 "admin":{
	 "usage":"/admin [<target>]",
	 "desc":"find information about the administrator of the server"
 },
 "ban":{
	 "usage":"/ban [<channel>] [<nick> [<nick>...]]",
	 "desc":"ban nicks or hosts"
 },
 "ctcp":{
	 "usage":"/ctcp <target> <type> [<arguments>]",
	 "desc":"send a CTCP message (Client-To-Client Protocol)"
 },
 "cycle":{
	 "usage":"/cycle [<channel>] [<message>]",
	 "desc":"leave and rejoin a channel"
 },
 "dehalfop":{
	 "usage":"/dehalfop <nick> [<nick>...]",
	 "desc":"remove channel half-operator status from nick(s)"
 },
 "deop":{
	 "usage":"/deop <nick> [<nick>...]",
	 "desc":"remove channel operator status from nick(s)"
 },
 "devoice":{
	 "usage":"/devoice <nick> [<nick>...]",
	 "desc":"remove voice from nick(s)"
 },
 "die":{
	 "usage":"/die [<target>]",
	 "desc":"shutdown the server"
 },
 "halfop":{
	 "usage":"/halfop <nick> [<nick>...]",
	 "desc":"give channel half-operator status to nick(s)"
 },
 "ignore":{
	 "usage":"/ignore <nick|regex> [-regex]",
	 "desc":"ignore nicks/hosts"
 },
 "info":{
	 "usage":"/info [<target>]",
	 "desc":"get information describing the server"
 },
 "invite":{
	 "usage":"/invite [<channel>] <nick>",
	 "desc":"invite a nick to the channel"
 },
 "ison":{
	 "usage":"/ison <nick> [<nick>...]",
	 "desc":"check if a nick is currently on IRC"
 },
 "join":{
	 "usage":"/join <channel> [<key>]",
	 "desc":"join a channel"
 },
 "kick":{
	 "usage":"/kick <nick> [<reason>]",
	 "desc":"forcibly remove a user from a channel"
 },
 "kickban":{
	 "usage":"/kickban <nick> [<reason>]",
	 "desc":"kicks and bans a nick from a channel"
 },
 "kill":{
	 "usage":"/kill <nick> <reason>",
	 "desc":"close client-server connection"
 },
 "me":{
	 "usage":"/me <message>",
	 "desc":"send a CTCP action to the current channel"
 },
 "mode":{
	 "usage":"/mode [<channel>] [+|-]o|p|s|i|t|n|m|l|b|e|v|k [<arguments>]",
	 "desc":"change channel or user mode"
 },
 "motd":{
	 "usage":"/motd [<target>]",
	 "desc":"get the \"Message Of The Day\""
 },
 "msg":{
	 "usage":"/msg <target> [<text>]",
	 "desc":"send message to a nick or channel"
 },
 "nick":{
	 "usage":"/nick <nick>",
	 "desc":"change current nick"
 },
 "notice":{
	 "usage":"/notice <target> <text>",
	 "desc":"send notice message to user"
 },
 "op":{
	 "usage":"/op <nick> [<nick>...]",
	 "desc":"give channel operator status to nick(s)"
 },
 "oper":{
	 "usage":"/oper <user> <password>",
	 "desc":"get operator privileges"
 },
 "part":{
	 "usage":"/part <channel> [<message>]",
	 "desc":"leave a channel"
 },
 "quiet":{
	 "usage":"/quiet <nick>",
	 "desc":"quiet nicks or hosts"
 },
 "quote":{
	 "usage":"/quote <data>",
	 "desc":"send raw data to server without parsing"
 },
 "topic":{
	 "usage":"/topic [<channel>] <topic>",
	 "desc":"get/set channel topic"
 },
 "unban":{
	 "usage":"/unban [<channel>] <nick>",
	 "desc":"unban nick or host"
 },
 "version":{
	 "usage":"/version <nick>",
	 "desc":"give the version info of nick"
 },
 "voice":{
	 "usage":"/voice [<channel>] <nick>",
	 "desc":"give voice to nick"
 },
 "whois":{
	 "usage":"/whois <nick>",
	 "desc":"query information about a user"
 },
 "whowas":{
	 "usage":"/whowas <nick>",
	 "desc":"ask for information about a nick which no longer exists"
 }
}
