import React, { useState, useRef, useEffect } from "react";
import { Input, Button, message } from 'antd'
import 'firebase/firestore';
import 'firebase/auth';
import { db, auth } from "../firebase/clientApp";
import { addDoc, getDocs, setDoc, getFirestore, deleteDoc, doc, collection, serverTimestamp, query, orderBy, limit, onSnapshot, QuerySnapshot } from "firebase/firestore";

// Initialize Firebase

// Initialize Cloud Firestore and get a reference to the service


const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');

    const doc_id = "hThd42c69mdeXEHs57cM";
    const messagesRef = collection(db, `rooms/${doc_id}/messages`);

    const [messages, setMessages] = useState([]);


    useEffect(() => {
        const q = query(messagesRef)
        // console.log(q);
        const listenMSGs = onSnapshot(q, (querySnapshot) => {
            const msg_lists = [];
            querySnapshot.forEach((doc) => {
                msg_lists.push(doc.data());
            });
            setMessages(msg_lists);
        });

        const getItems = async () => {
            const data = await getDocs(messagesRef);
            console.log("data: ", data);
            setMessages(data.docs.map((doc) => ({ ...doc.data() })));
        };
        getItems();

    }, []);

    const handleKeyPress = (event) => {
        if(event.key === 'Enter'){
          sendMessage();
        }
      }

    const sendMessage = async () => {
        if (inputValue != ''){
        const { uid, photoURL } = auth.currentUser;
        const curTime = Date.now();
        await setDoc(doc(db, `rooms/${doc_id}/messages`, `${curTime}`), {
            text: inputValue,
            uid: uid,
            Timestamp: serverTimestamp()
        });
        setInputValue('');
        document.getElementsByClassName('chat-box')[0].scrollTop += 2000;
    }
    };

    return (
        <div className="chat-box-container">
            <div className="chat-box">
                {messages && messages.map(msg => <ChatMessage key={msg.Timestamp} message={msg} />)}
            </div>

            <Input.Group style={{ borderRadius: "30px", background: "white" }}>
                <Input value={inputValue} onKeyPress={handleKeyPress} onChange={(e) => setInputValue(e.target.value)} className="test" style={{ borderRadius: "30px", width: 'calc(100% - 80px)', border: "none", boxShadow: "0px", background: "white", color: "#8bd0ff", fontWeight: "bold" }} />
                <Button onClick={sendMessage} type="primary" style={{ fill: "#8bd0ff", background: "#8bd0ff", border: "none", borderRadius: "30px", float: "right" }}>Send</Button>
            </Input.Group>
        </div>


    );

}


function ChatMessage(props) {

    const { text, uid } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'send' : 'receive';

    return (<>
        <p className={messageClass}>{text}</p>

    </>)
}


export default ChatBox;

