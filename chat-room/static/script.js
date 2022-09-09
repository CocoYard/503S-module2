var socketio = io.connect();
let my_socket_id = "";
let cur_usrname = "";
let cur_room = "Home"
let room_type_list = ["open", "private"] // May change to 'open'?
let room_msg_pairs = new Map([
   [
      "open", new Map([
         // the third item '0' means whether sent privately
         ["Home", []]
      ])
   ],
   [
      "private", new Map()
   ]
]);
let room2type = new Map([
   ['Home', 'open']
]);
let id2name_manager = {};
let cur_member_ban = [];


// FIFO
function htmlEntities(str) {
   return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/********************************  listen to Server  ********************************/
socketio.on("connect", () => {
   console.log(socketio.id);
   my_socket_id = socketio.id;
});

// this function help receive open messages rather than private ones
socketio.on("message_to_client", function (data) {
   console.log("new message! ", data);
   let from = data['from'];
   let to = data['to'];
   let room = data['roomname'];
   // FIFO
   function htmlEntities(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
   }
   let message = htmlEntities(data['message']);
   // To all people in the group
   if (to == "0") {
      room_msg_pairs.get(room2type.get(room)).get(room).push([from, message, 0])
   }
   // To current login user's socket id
   else if (to == my_socket_id) {
      // This should be a private message
      room_msg_pairs.get(room2type.get(room)).get(room).push([from, message, 1])
   }

   if (document.getElementsByClassName("chat-list-item active")[0].getElementsByTagName("span")[0].textContent == room) {
      let cur_msgs = document.getElementsByClassName("chat-wrapper")[0].innerHTML;
      if (to == my_socket_id) {
         // A private message
         cur_msgs += '<div class="message-wrapper"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
            + from + '&nbsp;&nbsp;  (private)</span><div class="message-box">' + message + '</div></div></div>';
      }
      else {
         cur_msgs += '<div class="message-wrapper"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
            + from + '</span><div class="message-box">' + message + '</div></div></div>';
      }

      document.getElementsByClassName("chat-wrapper")[0].innerHTML = cur_msgs;
      document.getElementsByClassName("chat-wrapper")[0].scrollTop += 500;
   }

});



socketio.on("is_valid_login", function (data) {
   is_valid_user = data["isValidUser"];
   console.log(is_valid_user)
   if (is_valid_user) {
      // display username in app-login-box 
      document.getElementsByClassName("app-login-box-name")[0].innerHTML = userName;

      // display profile img in app-login-box
      document.getElementById("login-profile-pic").style.display = "block";
      console.log('tetete:', data['member2rooms'])
      // display existed room-lists 
      displayRoomLists(data['rooms'], data['private_rooms'], data['member2rooms'], cur_member_ban);

      // display the "Home" chat room
      let cur_room_members = data["cur_room_members"];
      let name2id = data['name2id'];
      let room_owner = data["rooms"][cur_room]; // default: home=>null. 
      displayChatRoom(cur_room_members, name2id, room_owner)


   } else {
      alert('Existed nickname! Please use another one!')
      document.getElementById("switchStatus").checked = false;
   }


});

socketio.on("room_created", function (data) {
   let rooms = data['rooms']; // room => builder
   let private_rooms = data['private_rooms'];
   let member2rooms = data['member2rooms']
   // // prepare for sending messages in this new room
   room_msg_pairs.get('open').set(data['room'], []);
   room2type.set(data['room'], data.type);

   displayRoomLists(rooms, private_rooms, member2rooms, cur_member_ban);
});



socketio.on("room_joined", function (data) {
   // displayRoomLists(data['rooms'], data['private_rooms'], data['member2rooms']);
   let cur_room_members = data["cur_room_members"];
   let name2id = data['name2id'];
   let is_join = data['is_join']
   let room_owner = data["rooms"][cur_room]; // default: home=>null. 

   console.log(is_join)
   if (!is_join) {
      document.getElementsByClassName("chat-wrapper")[0].style.display = "none";
      document.getElementsByClassName("chat-input-wrapper")[0].style.display = "none";
      document.getElementById("join-room-box").style.display = "block";
      document.getElementById("room-member-list").innerHTML = ""
      document.getElementsByClassName("app-password-box")[0].style.display = "none";
      if (room2type.get(cur_room) == 'private') {
         document.getElementsByClassName("app-password-box")[0].style.display = "flex";
         if (data["wrong_psw"]) {
            alert("Wrong! please check your password!");
         }
      }

   } else {
      // ?
      let names = document.getElementsByClassName("chat-list-name");
      let cur_room_item = names[1];
      console.log(cur_room);
      for (i = 1; i < names.length; ++i) {
         if (names[i].textContent == cur_room) {
            cur_room_item = names[i];
            break;
         }
      }
      if (cur_room != 'Home')
         cur_room_item.nextSibling.innerHTML = '(joined)';
      
      if (data['cur_room'] == cur_room) {
         if (!room_msg_pairs.get(room2type.get(cur_room)).has(cur_room)) {
            room_msg_pairs.get(room2type.get(cur_room)).set(cur_room, []);
         }
         document.getElementsByClassName("app-password-box")[0].style.display = "none"; // hidden the password box
         displayChatRoom(cur_room_members, name2id, room_owner);
         displayChatRoomHistory(cur_room);
      }
   }
});












function sendMessage() {
   // get the message content
   let message = document.getElementById("main-chat-input").value;

   // get the active room
   let roomname = document.getElementsByClassName("chat-list-item active")[0].getElementsByTagName("span")[0].textContent;
   // get the target person
   let to = document.getElementsByClassName("chat-input-room-member")[0].value; // this should be the socket id for the target
   let msg = {
      "from": userName,
      "roomname": roomname,
      "message": message,
      "to": to
   }
   let private = "";
   // Update chat history
   // To all people in the group
   if (to == "0") {
      room_msg_pairs.get(room2type.get(roomname)).get(roomname).push([userName, message, 0])
   }
   // To current login user's socket id
   else {
      // This should be a private message
      private = "&nbsp; &nbsp; (private)";
      room_msg_pairs.get(room2type.get(roomname)).get(roomname).push([userName, message, 1])
   }
   let cur_msgs = document.getElementsByClassName("chat-wrapper")[0].innerHTML;

   cur_msgs += '<div class="message-wrapper reverse"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
      + userName + private + '</span><div class="message-box">' + htmlEntities(message) + '</div></div></div>';
   document.getElementsByClassName("chat-wrapper")[0].innerHTML = cur_msgs;
   console.log(msg);
   if (msg.to != '0') {
      socketio.emit("message_to_server_private", msg);
   }
   else {
      socketio.emit("message_to_server", msg);
   }
   document.getElementsByClassName("chat-wrapper")[0].scrollTop += 500;
}

/********************************  listen to Message  ********************************/
document.getElementById("send-group-chat").onclick = function () {
   sendMessage();
}


$("#main-chat-input").keypress(function (e) {
   if (e.which == 13) {
      sendMessage();
      document.getElementById("main-chat-input").value = '';
   }
});









/********************************  Login Functions  ********************************/

document.getElementById("switchStatus").onclick = function () {
   isLogin = document.getElementById("switchStatus").checked;

   if (isLogin) {
      userName = document.getElementById("username-input").value;
      // save cur user_info in both client and server sides
      cur_usrname = userName;
      if (userName != "") {
         socketio.emit("newUser_to_server", { user: cur_usrname, socket_id: my_socket_id });
      } else {
         // check empty nickname
         alert("Nickname cannot be empty!")
         document.getElementById("switchStatus").checked = false;
      }

   } else {
      before_login_input = 'NickName: &nbsp;<div class="input-wrapper"><input type="text" class="chat-input" id= "username-input"placeholder="Enter your name"></div>'
      document.getElementsByClassName("app-login-box-name")[0].innerHTML = before_login_input

      // hidden profile img in app-login-box
      document.getElementById("login-profile-pic").style.display = "none";
      location.reload();
      /*need ot add log out socket.emit here 
       * 
       * write code here
       * 
       * 
      */

   }
}


/********************************  Rooms Functions  ********************************/


// display/hidden create-room-box
{
   // display the create-room-box
   document.getElementsByClassName("list-header-creatRoom")[0].onclick = function () {
      document.getElementById('new-room-box').style.display = "block";
   }

   // hidden the create-room-box

   // listen to exit button and close the box.
   document.getElementById("new-room-box-exit").onclick = function () {
      document.getElementById('new-room-box').style.display = "none";
   }


   // close the float window, when click other place. 
   window.onclick = function (event) {
      if (event.target == document.getElementById('new-room-box')) {
         document.getElementById('new-room-box').style.display = "none";
      }
   }

}



// Choose room's category
document.getElementById("open-stype").onclick = function () {
   document.getElementById('password-box').style.display = "none";
}
document.getElementById("private-stype").onclick = function () {
   document.getElementById('password-box').style.display = "flex";
}

// save button on create-room-box
document.getElementById("new-room-box-save").onclick = function () {
   if(cur_usrname == "") {
      alert("Please login before creating rooms!");
      return;
   }
   let room_name = document.getElementById("room-name-input").value;
   if (room_name == ""){
      alert("Please input the room name");
      return;
   }
   document.getElementById('new-room-box').style.display = "none";

   let room_type;
   for (let i = 0; i < 2; i++) {
      if (document.getElementsByClassName("room-type")[i].checked) {
         room_type = room_type_list[i];
      }
   }
   if (room_type == "open") {
      room_msg_pairs.get('open').set(room_name, []);
      // rooms.set(room_name, 'open');
      socketio.emit("create_open_room", { user: cur_usrname, room: room_name })
   } else {
      password = document.getElementById("password-input").value;
      room_msg_pairs.get('private').set(room_name, []);
      // rooms.set(room_name, 'private');
      socketio.emit("create_private_room", { user: cur_usrname, room: room_name, password: password })
   }

}

// display different room chat history
function displayChatRoomHistory(room_name) {
   let msg = '';
   // loop all history in this room
   room_msg_pairs.get(room2type.get(room_name)).get(room_name).forEach((cur_name_msg_pri, i) => {
      let from = cur_name_msg_pri[0];
      let cur_msg = cur_name_msg_pri[1];
      let private = cur_name_msg_pri[2];
      // concatenate
      if (from == userName) {
         // From myself
         if (private) {
            msg += '<div class="message-wrapper reverse"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
               + from + '&nbsp; &nbsp; (private)</span><div class="message-box">' + htmlEntities(cur_msg) + '</div></div></div>';
         }
         else {
            msg += '<div class="message-wrapper reverse"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
               + from + '</span><div class="message-box">' + htmlEntities(cur_msg) + '</div></div></div>';
         }
      }
      else if (private) {
         // A private message
         msg += '<div class="message-wrapper"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
            + from + '    (private)</span><div class="message-box">' + htmlEntities(cur_msg) + ' </div></div></div>';
      }
      else {
         // Normal messages
         msg += '<div class="message-wrapper"><img class="message-pp" src="img/member.jpg" alt="profile-pic"><div class="message-box-wrapper"><span>'
            + from + '</span><div class="message-box">' + htmlEntities(cur_msg) + '</div></div></div>';
      }
   })
   document.getElementsByClassName("chat-wrapper")[0].innerHTML = msg;
   document.getElementsByClassName("chat-wrapper")[0].scrollTop += 20000;
}
// display rooms list in the app-left
function displayRoomLists(rooms, private_rooms, member2rooms_list, member_ban) {
   member_ban_set = new Set(cur_member_ban);
   cur_member2rooms = new Set(member2rooms_list[cur_usrname]);

   // display rooms
   open_rooms_html = '<li class="chat-list-item"><img src="img/home.jpg" alt="chat"><span class="chat-list-name">Home</span></li>';
   private_rooms_html = '';
   room_names = Object.keys(rooms);
   console.log(cur_member2rooms);

   let join_state;
   for (var i = 0; i < room_names.length; i++) {
      if (!member_ban_set.has(room_names[i])) {
         if (cur_member2rooms.has(room_names[i])) {
            join_state = '(joined)';

         } else {
            join_state = '';

         }



         if (!private_rooms.hasOwnProperty(room_names[i])) {
            room2type.set(room_names[i], 'open');

            if (room_names[i] != 'Home') {
               // active on 'Home" room
               open_rooms_html += '<li class="chat-list-item"><img src="img/group.jpg" alt="chat"><span class="chat-list-name">' + room_names[i] + '</span><p class="join-state-info">' + join_state + '</p></li>';
            }

         } else {
            room2type.set(room_names[i], 'private');
            private_rooms_html += '<li class="chat-list-item"><img src="img/group.jpg" alt="chat"><span class="chat-list-name">' + room_names[i] + '</span><p class="join-state-info">' + join_state + '</p></li>';
         }
      }
   }
   // rooms list display
   document.getElementById('open-rooms-list').innerHTML = open_rooms_html
   document.getElementById('private-rooms-list').innerHTML = private_rooms_html

   // number of rooms display
   document.getElementById('open-rooms-number').textContent = room_names.length - Object.keys(private_rooms).length
   document.getElementById('private-rooms-number').textContent = Object.keys(private_rooms).length

   // Direct to the current room
   let names = document.getElementsByClassName("chat-list-name");
   // find the cur_room room tag
   for (i = 0; i < names.length; ++i) {
      if (names[i].textContent == cur_room) {
         names[i].parentNode.className = "chat-list-item active";
         break;
      }
   }
   onclickRoomItem();

}


// onclick room items
function onclickRoomItem() {
   $(".chat-list-item").each(
      function () {
         // change cur_room infomation
         this.onclick = function () {
            document.getElementsByClassName("chat-list-item active")[0].className = "chat-list-item";
            this.className = "chat-list-item active";
            cur_room = document.getElementsByClassName("chat-list-item active")[0].getElementsByTagName('span')[0].innerHTML;
            // check joined the room or not?  display the content or join icon
            socketio.emit("join_room", { userName: cur_usrname, room: cur_room, cur_room_type: room2type.get(cur_room), to_join: false, has_password: null });

         }
      }
   )
}

document.getElementById("join-room-box").onclick = function () {
   if (cur_usrname == ""){
      alert("Please login before joining!");
      return;
   }


   if (room2type.get(cur_room) == "open") {
      // join the member into open room. 
      socketio.emit("join_room", { userName: cur_usrname, room: cur_room, cur_room_type: room2type.get(cur_room), to_join: true, has_password: null });
   }
   else {
      // join the member into private room.
      let password = document.getElementById("password-validate-input").value;
      socketio.emit("join_room", { userName: cur_usrname, room: cur_room, cur_room_type: room2type.get(cur_room), to_join: true, has_password: password });

   }

}





function displayChatRoom(cur_room_members, name2id, room_owner) {
   // display main-chat-box
   document.getElementsByClassName("chat-wrapper")[0].style.display = "block";
   document.getElementsByClassName("chat-input-wrapper")[0].style.display = "flex";

   // hidden the join button
   document.getElementById("join-room-box").style.display = "none";

   // set the option "chat-input-room-member"
   chat_roommember_options = '<option value="0"> All members</option>'; // send msg to all members
   for (let i = 0; i < cur_room_members.length; i++) {
      if (cur_room_members[i] != cur_usrname) {
         chat_roommember_options += '<option value=' + name2id[cur_room_members[i]] + '> ' + cur_room_members[i] + '</option>';
      }
   }
   document.getElementsByClassName('chat-input-room-member')[0].innerHTML = chat_roommember_options;



   // display the room member box
   if (!room_owner) {
      // Home Room
      member_list_html = '<li class="member-list-item" value=' + name2id[cur_usrname] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + cur_usrname + '</span></li>'
   } else {
      // display the owner in the top
      member_list_html = '<li class="member-list-item" value=' + name2id[room_owner] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + room_owner + ' (owner)' + '</span></li>'
      // display current login user
      if (room_owner != cur_usrname) {
         member_list_html += '<li class="member-list-item" value=' + name2id[cur_usrname] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + cur_usrname + '</span></li>'
      }
   }


   for (let i = 0; i < cur_room_members.length; i++) {
      // display remaining users
      if (cur_room_members[i] != cur_usrname) {
         if (!room_owner) {
            member_list_html += '<li class="member-list-item" value=' + name2id[cur_room_members[i]] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + cur_room_members[i] + '</span></li>'
         } else {
            if (room_owner == cur_usrname) {
               member_list_html += ' <li class="member-list-item" value=' + name2id[cur_room_members[i]] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + cur_room_members[i] + '</span><div class="member-icons-box"><button class="member-icons" id="ban">ban</button><button class="member-icons" id="kick">kick</button></div></li>'
            } else {
               if (room_owner != cur_room_members[i]) {
                  member_list_html += '<li class="member-list-item" value=' + name2id[cur_room_members[i]] + '><img src="img/member.jpg" alt="chat"><span class="chat-list-name">' + cur_room_members[i] + '</span></li>'
               }
            }
         }
      }

   }

   document.getElementById("room-member-list").innerHTML = member_list_html;


   // number of rooms display
   document.getElementById('room-member-number').textContent = cur_room_members.length

   let room = document.getElementsByClassName("chat-list-item active")[0].getElementsByTagName("span")[0].textContent;

   // bind onclick for every room member
   let members = document.getElementsByClassName("member-icons-box");
   if (members.length != 0) {
      for (let i = 0; i < members.length; i++) {
         let id = members[i].parentElement.getAttribute("value");
         // Ban someone
         members[i].firstChild.onclick = function () {
            socketio.emit("ban_from_client", { id: id, room: room });

            cur_room = document.getElementsByClassName("chat-list-item active")[0].getElementsByTagName('span')[0].innerHTML;
            // update owner's room member list
            socketio.emit("join_room", { userName: cur_usrname, room: cur_room, cur_room_type: room2type.get(cur_room), to_join: false, has_password: null });

         }
         // Kick someone
         members[i].lastChild.onclick = function () {
            socketio.emit("kick_from_client", { id: id, room: room });
         }

      }

   }


}

socketio.on("ban_from_server", function (data) {
   console.log("    got!  ");
   socketio.emit("leave_forever", data);
})
socketio.on("kick_from_server", function (data) {
   console.log("    got!  ");
   socketio.emit("leave", data);
})

socketio.on("leave_my_room", function (data) {
   // currently in this room
   if(cur_room == data.room){
         // change the room tag to show "join" botton
      
         document.getElementsByClassName("chat-wrapper")[0].style.display = "none";
         document.getElementsByClassName("chat-input-wrapper")[0].style.display = "none";
         document.getElementById("join-room-box").style.display = "block";
         document.getElementById("room-member-list").innerHTML = ""
         document.getElementsByClassName("app-password-box")[0].style.display = "none";
         if (room2type.get(cur_room) == 'private') {
            document.getElementsByClassName("app-password-box")[0].style.display = "flex";
            if (data["wrong_psw"]) {
               alert("Wrong! please check your password!");
            }
         }

   }
   // any situation should remove "joined"
   let names = document.getElementsByClassName("chat-list-name");
   let cur_room_item = "";
   // find the leaved room tag
   console.log(data.room);
   for (i = 1; i < names.length; ++i) {
      if (names[i].textContent == data.room) {
         cur_room_item = names[i];
         break;
      }
   }
   if (cur_room_item != "") {
      cur_room_item.nextSibling.innerHTML = '';
   }


})

socketio.on("delete_my_room", function (data) {
   // delete the room tag
   console.log(data);
   // If current room will be deleted then head to 'Home'
   if (data.room == cur_room){
      cur_room = "Home";
   }
   cur_member_ban = data['cur_member_ban'];
   displayRoomLists(data['rooms'], data['private_rooms'], data['member2rooms'], data['member_ban']);

})