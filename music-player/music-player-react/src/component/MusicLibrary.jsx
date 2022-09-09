import React, { useEffect, useState } from "react";
import { IoPlay, IoPause, IoPlayForward, IoPlayBack } from "react-icons/io5";
import 'firebase/firestore';
import 'firebase/auth';
import { db, auth } from "../firebase/clientApp";
import { addDoc, updateDoc, getDocs, setDoc, getFirestore, deleteDoc, doc, collection, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import App from "../App";

const MusicLibrary =  (props) => {
  // setCurSong is no use 
  // error: Cannot update a component (`App`) while rendering a different component (`MusicLibrary`).
  const handleSwitch = props.handleSwitch;
  const {mscs, setCurSong, curIdx} = props;
  const doc_id = "hThd42c69mdeXEHs57cM";
  // const switchMsc = () => {
  //   // props.setIsPlay(true);
  //   props.curAudio.current.play();
  //   updatePlay(true);
  // }
  // setNames( [<Music name="asd"/>]);

  // console.log(names);

  // 1. If click a music then change the div class="c-player__details"(done)
  // <strong> name </strong>
  // <span> artist</span>
  // 2. Change the cur_music in collection(db, `rooms/${doc_id}`)

  const switchSong = async(id, idx) => {
    // set idx;
    curIdx.current = idx;
    console.log("id & idx: ", id, " & ", idx);
    await updateDoc(doc(db, `rooms/${doc_id}`), {
      cur_music: id
    });
    
  }
  function Music(props){
    const {id, idx} = props;
    const {name, url} = props.msc;
    return (<li><a value={url} onClick={()=>{switchSong(id, idx)}} > {name} </a></li>);
  }


  return (

        <div className="menu-wrap">
          <input type="checkbox" className="toggler" />
          <div className="hamburger"><div></div></div>
          <div className="menu">
            <div>
              <ul>
                {mscs&&mscs.map((msc, index) => <Music key={msc.name} id={msc.id} msc={msc} idx={index}/>)}

              </ul>
            </div>
          </div>
        </div>

    );

  }




export default MusicLibrary;
