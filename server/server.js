var events = require('events'),
    event = new events.EventEmitter,
    fs = require('fs'),
    ws = require('ws').Server,
    WebSocketServer = new ws({port: 8080}),
    $Server,
    USER_ID = '',
    usersFile = __dirname + '/users.json';

/*===================== CORE BLOCK > =====================*/
//Server Side Functions
var Core = {};

/**
 * Error handler
 *
 * @param err
 */
Core.errorHandler = function(err) {
    if(err)
        console.log(err);
};

/**
 * Creates folder for new user
 *
 * @param json
 */
Core.createNewUser = function(json) {
    fs.readFile(usersFile, function(err, data) {
        Core.errorHandler(err);

        var userID = JSON.parse(data).count + 1,
            path = __dirname + '/users/user_' + userID,
            usersJson =  JSON.stringify({count: userID}, null, 2);

        //save user counter
        fs.writeFile(usersFile,usersJson, function(err) {
            Core.errorHandler(err);

            //create user folder
            fs.mkdir(path, function(err) {
                Core.errorHandler(err);

                json['user-id'] = userID;

                SendEvent.sendUserID(userID);
                SendEvent.newImage(json);
            });
        });
    });
};

/*===================== CORE BLOCK < =====================*/


/*===================== SEND EVENT BLOCK > =====================*/
//Event sender object
var SendEvent = {};

/**
 * Save image
 *
 * @param data JSON
 */
SendEvent.newImage = function(json) {
    var base64Data = json.dataURI.replace(/^data:image\/jpeg;base64,/, ""),
        path = __dirname + '/users/user_' + json['user-id'] +'/'+json['image-name'];

    fs.writeFile(path, base64Data, 'base64', function(err) {
        Core.errorHandler(err);

        console.log(path + ' saved');
    });
};

/**
 * Sends User Folder ID
 *
 * @param id
 */
SendEvent.sendUserID = function(id) {
    var jsonStr = JSON.stringify({event: 'saveID', id: id})

    SendEvent.toUser(jsonStr);
};

/*===================== SEND EVENT BLOCK < =====================*/


/*===================== CONNECTION BLOCK > =====================*/

/**
 * Server Connection
 *
 * @param Socket
 * @constructor
 */
function Connection(Socket) {
    console.log('user connected');

    //WebSocket Server
    $Server = this;

    //User WebSocket ID
    USER_ID = Socket['upgradeReq']['headers']['sec-websocket-key'];


    /**
     * Send data to all users
     *
     * @param msg
     */
    SendEvent.toAll = function(data) {
        for(var i = 0, size = $Server.clients.length; i < size; i++) {
            if($Server.clients[i] != Socket)
                $Server.clients[i].send(data);
        }
    };

    /**
     * Send data to current user
     *
     * @param data
     */
    SendEvent.toUser = function(data) {
        Socket.send(data);
    };

    /**
     * Receiving message event
     */
    Socket.on('message', function(msg) {
        var jsonArr = JSON.parse(msg);
        event.emit(jsonArr.event, jsonArr);

        //check for user
        if(jsonArr['user-id'] == '')
            event.emit('createUser', jsonArr);
    });

    /**
     * Disconnect user
     */
    Socket.on('close', function() {
        //notification
        console.log('user disconnected');

        //show online
        console.log('online: ' + $Server.clients.length)
    });
}

/*===================== CONNECTION BLOCK < =====================*/


/*===================== EVENT LISTENERS BLOCK > =====================*/

WebSocketServer.on('connection', Connection);
event.on('newImage', SendEvent.newImage);
event.on('createUser', Core.createNewUser);

/*===================== EVENT LISTENERS BLOCK < =====================*/