import './App.css';
import MusicPlayer from './component/MusicPlayer'
import MusicLibrary from './component/MusicLibrary'
import Auth from './component/Auth'
import React, { useState, useRef, useEffect } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "./firebase/clientApp";
import { db, auth } from "./firebase/clientApp";
import { addDoc, onSnapshot, where, getDocs, setDoc, getFirestore, deleteDoc, doc, collection, serverTimestamp, query, orderBy, limit, connectFirestoreEmulator } from "firebase/firestore";

function App() {

  // User Authentication  
  const [user, loading, error] = useAuthState(firebase.auth());
  const [isPlay, setIsPlay] = useState(false);
  const curAudio = useRef(null);
  const curIdx = useRef(0);
  const doc_id = "hThd42c69mdeXEHs57cM";

  const id2idx = useRef({});
  // list
  // const roomID = "hThd42c69mdeXEHs57cM";
  // const cur_doc = doc(db, "rooms", roomID);

  // music list
  const [mscs, setMscs] = useState([]);
  const mscsRef = collection(db, "musics");
  const songs_list = [];
  const querySnapshot = '';
  const [curSong, setCurSong] = useState();

  useEffect(() => {
    // query current song in this room
    const q = query(collection(db, `rooms`), where("users", "array-contains-any", ['uid1'])); // uid1 should be replaced by user's name
    const getItems = async () => {
      // Set music list (mscs)
      const list = await getDocs(mscsRef);
      list.docs.map((doc, idx) => {
        // Create look-up table
        id2idx.current[doc.id] = idx;
        songs_list.push({ ...doc.data(), id: doc.id });
      });
      setMscs(songs_list); // music list

      // Set curSong
      const querySnapshot = await getDocs(q);
      // Find current music in this room
      querySnapshot.forEach((doc) => (doc.data().cur_music));
      setCurSong(querySnapshot[0]); // cur_music

      // Set current index
      curIdx.current = id2idx[querySnapshot[0]];

      console.log("curSong: ", querySnapshot[0]);
      console.log("curIdx: ", curIdx.current);
    }
    getItems();
  }, []);

  return (
    <div className="App">
      {!user && <Auth />}
      {user &&
        <>
          <MusicLibrary id2idx={id2idx} curIdx={curIdx} curSong={curSong} setCurSong={(val) => setCurSong(val)} setIsPlay={(val) => setIsPlay(val)} mscs={mscs} />
          <MusicPlayer id2idx={id2idx} curIdx={curIdx} curSong={curSong} setCurSong={(val) => setCurSong(val)} isPlay={isPlay} setIsPlay={setIsPlay} mscs={mscs} curAudio={curAudio} />
        </>}
    </div>

  );

}

export default App;
