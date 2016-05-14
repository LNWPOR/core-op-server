var shortId 	=	require('shortid');

module.exports = function(io){	
	var clients = [];
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
			console.log(data);
			currentUser = {
				id:shortId.generate(),
				name:data.name,
				position:"0,0,0"
			}

			clients.push(currentUser);
			socket.emit("CONNECTED", currentUser );
			// socket.broadcast.emit("USER_CONNECTED",currentUser);
			// socket.emit("USER_CONNECTED",currentUser);
			listOfUsers();

		});

		socket.on("USER_CONNECTED_LOBBY", function(){
			// console.log("server: USER_CONNECTED_LOBBY");
			socket.emit("USER_CONNECTED_LOBBY", currentUser );
		});

		socket.on("GET_CONNECTED_LOBBY_USER", function(){
			// console.log("GET_CONNECTED_LOBBY_USER");
			var onlineUser = {
				totalClients:clients.length,
				clients:clients
			}
			socket.emit("GET_CONNECTED_LOBBY_USER", onlineUser );
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
			socket.broadcast.emit('USER_DISCONNECTED',currentUser);
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].name === currentUser.name && clients[i].id === currentUser.id) {

					console.log("User "+clients[i].name+" id: "+clients[i].id+" has disconnected");
					clients.splice(i,1);
					playerReadyCount--;

				};
			};
		});

	});

	listOfUsers = function (){
		for( var i = 0; i < clients.length; i++ ){
			console.log("Now "+clients[i].name+" ONLINE");
		}
		console.log('----------------------------------------');
	}
}