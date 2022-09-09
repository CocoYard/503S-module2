// Require the packages we will use:
const http = require("http"),
	fs = require("fs");
url = require('url'),
	path = require('path'),
	mime = require('mime'),
	path = require('path');

const port = 3456;
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, resp) {
	// This callback runs when a new connection is made to our HTTP server.
	var filename = path.join(__dirname, "static", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function (exists) {
		if (exists) {
			fs.readFile(filename, function (err, data) {
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}

				// File exists and is readable
				var mimetype = mime.getType(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		} else {
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: " + filename);
			resp.end();
			return;
		}
	});
});
server.listen(port);

// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(http, {
	wsEngine: 'ws'
});




// data management
let usersSet = new Set();
let rooms = { "Home": null }; // all rooms (room name => builder)
let room_type = new Map([['Home', 'open']]);
let private_rooms = {}; // set for private only. 
let name2id = {};
let id2name = {};
let room_members = new Map([
	["Home", new Set()]
]);
let member2rooms = {}; // key:member value:[ ] array of roomnames
let room_ban = {'Home': []};
let member_ban = {};	// user => the rooms he was banned from



// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);
// This callback runs when a new Socket.IO connection is established.
io.sockets.on("connection", function (socket) {
	// callback request of rooms a certain user joined
	socket.on("my_rooms_from_client", function (data) {
		// socket.io (or whatever transport mechanism) is probably using JSON as the serialization format. Unfortunately, Maps and Sets and other ES2015 datatypes cannot be JSON-encoded.
		let username = data.userName;
		let socket_id = data.socket_id;
		let rooms = {};
		room_members.forEach((members, room_name) => {
			console.log("members: ", members);
			// console.log("room_name: ", room_name);
			if (members.has(username)) {
				console.log("yes");
				type = room_type.get(room_name);
				rooms[room_name] = type;
			}
		})
		console.log(socket_id);

		/// doesn't work ????
		this.emit("rooms_to_client", rooms);// ????
	})


	// callback with new user
	socket.on("newUser_to_server", function (data) {
		let new_usr = data['user']
		let new_id = data.socket_id;
		let isValidUser = false;

		if (!usersSet.has(new_usr)) {
			usersSet.add(new_usr); // users set
			// name2id.set(new_usr, new_id); // user name to socket id
			id2name[new_id] = new_usr;
			name2id[new_usr] = new_id;
			room_members.set("Home", room_members.get("Home").add(new_usr));
			member2rooms[new_usr] = ["Home"];
			console.log("new_id: ", new_id);
			isValidUser = true;
			// join Home
			socket.join('Home');
			member_ban[new_usr] = [];
			
			let cur_room_members = Array.from(room_members.get("Home"))
			io.to('Home').emit("is_valid_login", { rooms: rooms, isValidUser: isValidUser, private_rooms, member2rooms: member2rooms, cur_room_members: cur_room_members, name2id: name2id });

		}else{
			this.emit("is_valid_login", { rooms: rooms, isValidUser: isValidUser, private_rooms});
		}
		console.log(isValidUser)


		//socket.to(socket_id).emit("welcome", {msg: "hello! "});
	});


	// callback with new open room
	socket.on("create_open_room", function (data) {
		// check room name duplicate
		existed_Room = false;
		room_names = Object.keys(rooms)
		for (let i = 0; i < room_names.length; i++) {
			if (room_names[i] == data["room"]) {
				existed_Room = true;
			}
		}

		// create new room
		if (!existed_Room) {
			rooms[data["room"]] = data["user"]; // builder
			// init room members
			room_members.set(data['room'], new Set([data['user']]));
			member2rooms[data["user"]].push(data["room"]);
			room_ban[data.room] = [];

			socket.join(data["room"]);
			console.log("builder name: ", room_members.get(data['room']));
			// console.log(room_members.get(data['room']));
			// io.sockets.emit("room_created", { rooms: rooms, users: usersSet, private_rooms: private_rooms, member2rooms: member2rooms });
			io.sockets.emit("room_created", { rooms: rooms, users: usersSet, private_rooms: private_rooms, member2rooms: member2rooms, room: data['room'], type:'open'});


		}
	});

	// join room
	socket.on("join_room", function (data) {
		cur_usrname = data["userName"];
		console.log('join_test', room_members, data['room']);
		cur_room_members = Array.from(room_members.get(data['room']))

		to_join = data["to_join"]; // check "join room" button onclick
		if (room_members.get(data['room']).has(cur_usrname)) {
			// check join state: if the user is in the room. 
			console.log('1')
			if (data['room']=="Home"){
				this.emit("room_joined", { rooms: rooms, cur_room: data['room'],private_rooms: private_rooms, cur_room_members: cur_room_members, name2id: name2id, is_join: true, member2rooms:member2rooms });
			}else{
				this.emit("room_joined", { rooms: rooms, cur_room: data['room'], private_rooms: private_rooms, cur_room_members: cur_room_members, name2id: name2id, is_join: true, member2rooms:member2rooms });
			}

			// io.sockets.emit("room_joined", { rooms: rooms, private_rooms: private_rooms, cur_room_members: cur_room_members, name2id: name2id, is_join: true, member2rooms:member2rooms });

		} else if (to_join) {
			// if the user click on the join button
			console.log('2')
			if (data["cur_room_type"] == "open") {
				socket.join(data["room"]);
				room_members.get(data['room']).add(data["userName"]);
				console.log(member2rooms, data['userName']);
				member2rooms[data["userName"]].push(data["room"]);
				console.log(room_members);
				cur_room_members = Array.from(room_members.get(data['room']))
				io.to(data["room"]).emit("room_joined", { rooms: rooms, cur_room: data['room'], private_rooms: private_rooms, cur_room_members: cur_room_members, cur_usrname: cur_usrname, name2id: name2id, is_join: true, member2rooms: member2rooms });
			}else {
				// private room
				if (data["has_password"] == private_rooms[data['room']]){
					socket.join(data["room"]);
					room_members.get(data['room']).add(data["userName"]);
					console.log(member2rooms, data['userName']);
					member2rooms[data["userName"]].push(data["room"]);
					console.log(room_members);
					cur_room_members = Array.from(room_members.get(data['room']))
					io.to(data["room"]).emit("room_joined", { rooms: rooms, cur_room: data['room'], private_rooms: private_rooms, cur_room_members: cur_room_members, cur_usrname: cur_usrname, name2id: name2id, is_join: true, member2rooms: member2rooms });

				}else{
					this.emit("room_joined", { rooms: rooms, private_rooms: private_rooms, cur_room_members: cur_room_members, cur_usrname: cur_usrname, name2id: name2id, is_join: false, member2rooms: member2rooms, wrong_psw:true});
				}


			}


		} else {
			console.log('3')

			console.log('cannot join rightnow')
			// check join state: not join and not click on "join_room" button
			this.emit("room_joined", { rooms: rooms, private_rooms: private_rooms, cur_room_members: cur_room_members, cur_usrname: cur_usrname, name2id: name2id, is_join: false, member2rooms: member2rooms });

		}

	});




	socket.on("create_private_room", function (data) {
		// check room name duplicate
		existed_Room = false;
		room_names = Object.keys(rooms)
		for (let i = 0; i < room_names.length; i++) {
			if (room_names[i] == data["room"]) {
				existed_Room = true;
			}
		}

		if (!existed_Room) {
			rooms[data["room"]] = data["user"];

			// init room members
			room_members.set(data['room'], new Set([data['user']]));
			member2rooms[data["user"]].push(data["room"]);


			socket.join(data["room"]);

			private_rooms[data["room"]] = data["password"];

			room_ban[data.room] = [];

			io.sockets.emit("room_created", { rooms: rooms, users: usersSet, private_rooms: private_rooms, member2rooms: member2rooms });

		}
	});


	// This callback runs when the server receives a new message from the client.
	socket.on('message_to_server', function (data) {
		let msg = {
			"from": data.from,
			"roomname": data.roomname,
			"message": data.message,
			"to": data.to
		}
		console.log("open message: " + msg.from + ' ' + msg.roomname + ' ' + msg.message + msg.to); // log it to the Node.JS output
		room = data.roomname;
		this.to(room).emit("message_to_client", msg) // broadcast the message to other users

	});

	socket.on("message_to_server_private", function (data) {
		let msg = {
			"from": data.from,
			"roomname": data.roomname,
			"message": data.message,
			"to": data.to
		}
		console.log("open message: " + msg.from + ' ' + msg.roomname + ' ' + msg.message + msg.to); // log it to the Node.JS output
		room = data.roomname;
		this.to(msg.to).emit("message_to_client", msg) // broadcast the message to other users
	})

	// socket.on("new user", function (data) {
	// 	this.emit("new user", { msg: "hi new user" });
	// });

	
	// Kick someone
	socket.on("kick_from_client", function(id_room){
		let id = id_room.id;
		let name = id2name[id];
		let room = id_room.room;
		console.log(name);
		console.log(room);
		// delete from room_members
		console.log("room_members: ",room_members);
		room_members.get(room).delete(name);
		// delete from member2rooms
		console.log("member2rooms: ",  member2rooms);
		let hisrooms = member2rooms[name];
		let p = 0;
		console.log("hisrooms: ", hisrooms);
		hisrooms.forEach((value, i)=>{
			if (value == room) {
				p = i;
			}
		})
		hisrooms.splice(p, 1);

		socket.to(id).emit("kick_from_server", {room:room});
		// this.emit("room_joined", {room:room})

		// update the room_owner's room
		cur_usrname = id2name[socket.id];
		cur_room_members = Array.from(room_members.get(room))
	
		this.emit("room_joined", { rooms: rooms, cur_room: room,private_rooms: private_rooms, cur_room_members: cur_room_members, name2id: name2id, is_join: true, member2rooms:member2rooms });
		


	})
	
	socket.on("leave", function (data){
		socket.leave(data.room);	// this doesn't stop kicked user from sending messages, so you need to change the front end.
		// Then change the room tag to show "join" botton
		socket.emit("leave_my_room", data);

	})
	
	// Ban someone
	socket.on("ban_from_client", function(id_room){
		let id = id_room.id;
		let name = id2name[id];
		let room = id_room.room;
		// delete from room_members
		room_members.get(room).delete(name);
		// delete from member2rooms
		let hisrooms = member2rooms[name];
		let p = 0;
		hisrooms.forEach((value, i)=>{
			if (value == room) {
				p = i;
			}
		})
		hisrooms.splice(p, 1);
		// update
		room_ban[room].push(name);
		member_ban[name].push(room);
		console.log("member_ban:", member_ban);
		socket.to(id).emit("ban_from_server", {room:room, cur_user:name});

	})

	socket.on("leave_forever", function (data){
		socket.leave(data.room);
		// Then delete the room tag 
		
		socket.emit("delete_my_room", {room:data.room, rooms: rooms, private_rooms:private_rooms, member2rooms: member2rooms, cur_member_ban:member_ban[data["cur_user"]]});

	})
	
});

