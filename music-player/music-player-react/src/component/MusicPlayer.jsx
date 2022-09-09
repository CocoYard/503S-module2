import React, { useState, useEffect } from "react";
import { IoPlay, IoPause, IoPlayForward, IoPlayBack, IoChatbox, IoEllipsisHorizontalSharp, IoHeart } from "react-icons/io5";
import firebase from "../firebase/clientApp";
import { FaSignOutAlt, FaShareAlt } from "react-icons/fa";
import { RiGroupFill } from "react-icons/ri";
import { Menu, Dropdown, Button } from 'antd';
import { BsFillChatLeftFill, BsFillChatRightFill, BsChatSquareDotsFill } from "react-icons/bs";
import Management from './Management';
import ChatBox from './ChatBox'
import { db, auth } from "../firebase/clientApp";
import { doc, collection, onSnapshot, updateDoc, setDoc, getDoc, deleteDoc, arrayUnion, query, where } from "firebase/firestore";

// import { width } from "@mui/system";
import { prodErrorMap } from "firebase/auth";

const MusicPlayer = (props) => {
  const { id2idx, curIdx, curSong, setCurSong, curAudio, mscs } = props;
  const doc_id = "hThd42c69mdeXEHs57cM";
  const [isLike, setIsLike] = useState(false)
  const [barPercent, setBarPercent] = useState();

  const isPlay = props.isPlay;
  console.log(isPlay)
  const [showChat, setShowChat] = useState(true);

  const roomID = "hThd42c69mdeXEHs57cM";
  const collection_dir = `rooms`;
  const cur_doc = doc(db, collection_dir, roomID);



  const unsub = onSnapshot(cur_doc, (doc) => {
    /************************************************
     *                                              *
     *     Set listener for play state change       *
     *                                              *
     ************************************************/

    props.setIsPlay(doc.data().isPlay);
    if (isPlay && props.curAudio.current.src != 'http://localhost:3000/') {
      props.curAudio.current.play();
    }
    else {
      props.curAudio.current.pause();
    }
  });


  const q_like = query(collection(db, `users/${auth.currentUser.uid}/likes`));
  const listenLike = onSnapshot(q_like, (querySnapshot) => {
    /************************************************
     *                                              *
     *     Set listener for like status changes     *
     *                                              *
     ************************************************/
    const like_list = [];
    querySnapshot.forEach((doc) => {
      like_list.push(doc.id);
    });
    if(mscs.length != 0){
      const cur_music_id = mscs[curIdx.current].id;
      console.log('cur_music_id', cur_music_id);
      const like_status = like_list.includes(mscs[curIdx.current].id)
      setIsLike(like_status);
    }
  });



  const roomRef = doc(db, "rooms", roomID)

  useEffect(() => {
    console.log('MusicPlayer test');
    const q = query(roomRef)
    /************************************************
     *                                              *
     *     Set listener for database changes        *
     *                                              *
     ************************************************/
    const listenSong = onSnapshot(q, (doc_info) => {
      const cur_id = doc_info.data().cur_music;
      console.log("cur_song: ", cur_id);
      // const mscsRef = collection(db, "musics");
      const songRef = doc(db, "musics", cur_id)
      const setSong = async () => {
        const songData = await getDoc(songRef);
        setCurSong(songData.data());

        // Change current list index
        curIdx.current = id2idx.current[songData.id];

        console.log("cur_song_infos:", songData.data());
        console.log("cur_song idx:", curIdx.current);
      };

      setSong();
    });
    if (isPlay) {
      props.curAudio.current.play();
    }
    else {
      props.curAudio.current.pause();

    }


  }, [])

  // logout function 
  function signOutUser() {
    const url = 'http://localhost:3000/';
    window.open(url, '_self');
    firebase.auth().signOut();
  }

  // update like info to firebase
  const updateLike = async () => {
    if (!isLike) {
      await setDoc(doc(db, `users/${auth.currentUser.uid}/likes`, mscs[curIdx.current].id), {
        music_name: curSong.name
      });
    } else {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/likes`, mscs[curIdx.current].id));
    }

  };


  const updatePlay = async (isPlay) => {
    await updateDoc(cur_doc, { "isPlay": isPlay });
  };


  const handlePlay = () => {
    // props.setIsPlay(true);
    props.curAudio.current.play();
    updatePlay(true);
  }

  const handlePause = () => {
    // props.setIsPlay(false);
    props.curAudio.current.pause();
    updatePlay(false);


  }

  const handleChatRoom = () => {
    setShowChat(!showChat);
  }

  const handlePreNext = async (idx) => {
    // set idx;
    curIdx.current = idx < 0 ? mscs.length - 1 : idx;
    curIdx.current = curIdx.current > mscs.length - 1 ? 0 : curIdx.current;
    // console.log("id & idx: ", id, " & ", idx);
    await updateDoc(doc(db, `rooms/${doc_id}`), {
      cur_music: mscs[curIdx.current].id
    });
  }

  const handleLike = () => {
    setIsLike(!isLike);
    updateLike();
  }
  const updateBar = (e) => {
    const curTime = e.target.currentTime;
    const duration = e.target.duration;
    const cur_percent = (curTime*100/duration).toString() + '%';
    setBarPercent(cur_percent);

  }

  return (

    <div className="o-background">
      <>
        <FaSignOutAlt onClick={signOutUser} style={{ fill: "#a4daff", float: 'right', width: '30px', height: '30px', margin: '20px 20px 0px 0px', cursor: "pointer" }} />
        {/* <RiGroupFill style={{ fill: "#a4daff", float: 'right', width: '28px', height: '28px', margin: '20px 20px 0px 0px', cursor: "pointer" }} /> */}
        <BsChatSquareDotsFill onClick={handleChatRoom} style={{ fill: "#a4daff", float: 'right', width: '26px', height: '26px', margin: '22px 20px 0px 0px', cursor: "pointer" }} />
        <IoHeart onClick={handleLike} style={{ fill: isLike ? "#f38689" : "#a4daff", float: 'right', width: '30px', height: '30px', margin: '20px 20px 0px 0px', cursor: "pointer" }} />
        {showChat && <ChatBox />}
      </>

      <div className="c-player">


        <div className="co_listen-box" style={{ margin: "0 auto" }}>
          {/* <div > 
              <BsFillChatRightFill style={{marginRight:"20px", width:'50px', height:'30px'}}>
                <p style={{color:'black'}}> test</p>

              </BsFillChatRightFill>
              <BsFillChatLeftFill style={{width:'50px', height:'30px'}}/>
          </div> */}
          <img src={require('../img/1.jpeg')} alt="member1" />
          <img src={require('../img/2.jpeg')} alt="member1" />

          <p><strong>You </strong>connected with<strong> Me</strong></p>
        </div>


        <div className="c-player__picture">
          <div className="c-player__picture__images"><img src={curSong === undefined ? "" : curSong.img} /><img src="img/2.jpg" /></div>
        </div>


        <div className="c-player__details"><strong>{curSong === undefined ? "" : curSong.name}</strong><span>{curSong === undefined ? "" : curSong.artist}</span></div>

        <div className="c-player__ui">
          <div className="c-player__ui__prev" onClick={() => handlePreNext(curIdx.current - 1)}>
            <IoPlayForward />    {/* that is a tag <svg></svg> */}
          </div>

          <div className="o-controls">

            {!isPlay && <>
              <div className="c-player__ui__play">
                <IoPlay onClick={handlePlay} />
              </div>
            </>}

            {isPlay && <>
              <div className="c-player__ui__pause">
                <IoPause onClick={handlePause} />
              </div>
            </>}

            {/* <div className="c-player__ui__pause">
              <IoPause onClick={hadlePause}/>
            </div> */}
          </div>

          <div className="c-player__ui__next" onClick={() => handlePreNext(curIdx.current + 1)}>
            <IoPlayForward />
          </div>

          {/* play bar */}
          <div className="c-player__ui__seek">
            <div className="c-player__ui__seek__seeker" style={{ opacity: "1", width: "100%" }}>
              <div style={{ width: barPercent }}></div>
            </div>
          </div>
        </div>
      </div>
      <audio id="audio" src={curSong === undefined ? "" : curSong.url} ref={curAudio} onTimeUpdate={updateBar}/>


    </div>



  );
}

export default MusicPlayer;
