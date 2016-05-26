var shortId 	=	require('shortid'),
	User 		= 	require('../models/user'),
	bcrypt      =   require('bcrypt-nodejs');

module.exports = function(io){	
	var clients = []; // who is in lobby scene
	
	var roomTotal = 3;
	var maxRoomPlayer  = 2;

	var rooms = [];
	for (var i = 0; i < roomTotal; i++) {
		rooms[i] = {
			players:[]
		}
	}

	// var playerReadyCount = 0;
	io.on('connection', function (socket){
		console.log("socket.io avariable");
		var currentUser;
		var result = {
			code:200,
			result:"success"
		}
		socket.emit("NET_AVARIABLE",result);


		socket.on("SIGNUP", function (data){
		 	
			User.findOne ({username: data.username}, function(err, user) {
				if(user){
					console.log(data.username + " already exist");
				}else if(!user){
					var hash = bcrypt.hashSync(data.password);
					var user = new User({ username:data.username ,password: hash });
					user.save(function(err) {
					    if(err) {
					     	console.log(err);
					    } else {
					      	console.log('user: ' + user.username + " saved.");
					    }
					});
				}else{
					console.log(err);
				}
			});
		    
		});

		socket.on("LOGIN", function (data){

			// User.findOne ({username: data.username}, function(err, user) {
			// 	if(user){
			// 		if(bcrypt.compareSync(data.password, user.password)){
			// 			console.log(user.username + "login success");
			// 		}
			// 	}else{
			// 		console.log(err);
			// 	}
			    
		 //  	})


			console.log(data);
			currentUser = {
				id:shortId.generate(),
				name:data.name,
				playerNumber:null,
				roomNumber:null,
				position:"0,0,0"
			}
			socket.emit("CONNECTED", currentUser );
			listOfUsers();

		});

		socket.on("USER_CONNECTED_LOBBY", function(){
			// console.log("server: USER_CONNECTED_LOBBY");
			clients.push(currentUser);
			socket.broadcast.emit("USER_CONNECTED_LOBBY", currentUser );
		});

		socket.on("USER_CONNECTED_ROOM", function(data){



			var EnterRoomStatus;
			var EnterRoomStatusForOther;
			var roomNumber = parseInt(data.roomNumber);

			if (rooms[roomNumber].players.length < maxRoomPlayer) {
				rooms[roomNumber].players.push(currentUser);
				currentUser.playerNumber = rooms[roomNumber].players.length-1;
				currentUser.roomNumber = roomNumber;

				console.log("User " + currentUser.name + " is playerNumber " + currentUser.playerNumber + " in roomNumber " + currentUser.roomNumber);
				
				EnterRoomStatus = {
					canEnterRoom:true,
					roomSelected:rooms[roomNumber]
				};

				EnterRoomStatusForOther = {
					userNumberEntered:rooms[roomNumber].players.length-1,
					userNameEntered:currentUser.name,
					roomNumberEntered:roomNumber
				};
				socket.broadcast.emit("OTHER_USER_CONNECTED_ROOM", EnterRoomStatusForOther );

				
			}
			else{
				EnterRoomStatus = {
					canEnterRoom:false
				}
			}
			socket.emit("USER_CONNECTED_ROOM",EnterRoomStatus);

			
			
		});

		socket.on("GET_CONNECTED_LOBBY_USER", function(){
			// console.log("GET_CONNECTED_LOBBY_USER");
			var onlineUser = {
				totalClients:clients.length,
				clients:clients
			}
			socket.emit("GET_CONNECTED_LOBBY_USER", onlineUser );
		});

		socket.on("GET_CONNECTED_ROOM_USER", function(){
			// console.log("GET_CONNECTED_LOBBY_USER");
			var currentRoomsStatus = {
				totalRooms:rooms.length,
				rooms:rooms,
				maxRoomPlayer:maxRoomPlayer
			}
			socket.emit("GET_CONNECTED_ROOM_USER", currentRoomsStatus );
		});

		socket.on("ROOM_READY", function(){
			socket.emit("ROOM_READY");
			socket.broadcast.emit("ROOM_READY");
		});

		socket.on("UPDATE_OTHER_PLAYER", function(data){
			// socket.emit("UPDATE_OTHER_PLAYER");
			currentUser.position = data.position;
			socket.broadcast.emit("UPDATE_OTHER_PLAYER",currentUser);
		});

	// 	socket.on("PLAY_REQUEST", function (){

	// 		var players = {
	// 			player1:clients[0],
	// 			player2:clients[1]
	// 		}

	// 		socket.emit("PLAY_AVARIABLE", players);
	// 		socket.broadcast.emit("PLAY_AVARIABLE", players);
	// 	});

	// 	socket.on("BALL_MOVE", function (data){

	// 		var position = {
	// 			posx:data.posx,
	// 			posy:data.posy
	// 		}

	// 		socket.broadcast.emit("BALL_MOVE", position);

	// 	});

	// 	socket.on("RACKET_MOVE", function (data){

	// 		currentUser.position = data.position;
	// 		socket.broadcast.emit("RACKET_MOVE", currentUser);

	// 	});

	//     socket.on("READY", function ( data ){
	//        if( data.id === clients[0].id || data.id === clients[1].id ){
	//            playerReadyCount++;
	//        }

	//        if(playerReadyCount == 2){

	//            playerReadyCount = 0;
	// 					 console.log("playerReadyCount : "+playerReadyCount);
	//            socket.emit("READY");
	//            socket.broadcast.emit("READY");

	//        }

	//     });

	// 	socket.on("SHOOT", function (data){
	// 		socket.broadcast.emit("GET_SHOOT", data);
	// 		socket.emit("GET_SHOOT", data);
	// 	});

		socket.on("disconnect", function (){
			removeUserLobby();
			// removePlayerRoom();
		});

		removeUserLobby = function(){
			socket.broadcast.emit('USER_DISCONNECTED',currentUser);
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].name === currentUser.name && clients[i].id === currentUser.id) {

					console.log("User "+clients[i].name+" id: "+clients[i].id+" has disconnected");
					clients.splice(i,1);
					// playerReadyCount--;

				};
			};
		}

		removePlayerRoom = function(){
			socket.broadcast.emit('USER_DISCONNECTED_ROOM',currentUser);

			console.log("User " + currentUser.name + " as PlayerNumber " + currentUser.playerNumber + " is logout from roomNumber " + currentUser.roomNumber);
			rooms[currentUser.roomNumber].players.splice(currentUser.playerNumber,1);
		}


	});

	


	listOfUsers = function (){
		for( var i = 0; i < clients.length; i++ ){
			console.log("Now "+clients[i].name+" ONLINE");
		}
		console.log('----------------------------------------');
	}

	getType = function(val){
	    if (typeof val === 'undefined') return 'undefined';
	    if (typeof val === 'object' && !val) return 'null';
	    return ({}).toString.call(val).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	}
}