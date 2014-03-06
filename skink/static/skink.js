/*
Copyright (c) 2014 "OKso http://okso.me"

This file is part of Skink.

Intercom is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

window.onload = function() {
    "use strict";

    var websocket = "ws://" + window.location.host + "/realtime/";
    var ws;
    if (window.WebSocket) {
        ws = new WebSocket(websocket);
    }
    else if (window.MozWebSocket) {
        ws = new MozWebSocket(websocket);
    }
    else {
        alert("WebSocket Not Supported");
        return;
    }

    window.onbeforeunload = function(e) {
        console.log("Bye bye...");
        ws.close(1000, "%(username)s left the room");

        if (!e) e = window.event;
        e.stopPropagation();
        e.preventDefault();
    };
    ws.onmessage = function (evt) {
        console.log("received message [", evt.data + "]");

        // Execute a void command:
        if (evt.data.indexOf("$") === 0) {
            var command = evt.data.substr(1);
            //console.log('exec of [ ' + command + ' ]');
            eval(command);
        }

        // Execute a command and return the synchronously:
        else if (evt.data.indexOf("?") === 0) {
            var command = evt.data.substr(1).split("=", 2);
            console.log("raw command = [ " + command + " ]");
            var callback_id = command[0];
            var command = command[1];
            console.log("callback_id = [ " + callback_id + " ]");
            console.log("processed command = [ " + command + " ]");
            try {
                var result = eval(command);
                console.log("result = [" + result + "]");
                ws.send("?" + callback_id + "=" + typeof(result) + ":" + result);
            }
            catch(err) {
                console.log("error : " + err.name + err.message);
                ws.send("!" + callback_id + "=" + err.name + ":" + err.message);
            }
        }
        console.log("log" + evt.data);
    };
    ws.onopen = function() {
        ws.send("%(username)s entered the room");
    };
    ws.onclose = function(evt) {
        $("#stderr").val("Connection closed by server: " + evt.code + " \"" + evt.reason + "\"\n");
    };

    window.skink = ws;
};