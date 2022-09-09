// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import "firebase/compat/auth"
// import "firebase/firestore"
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnVS9vBhDOo83O81kMD4qGTei41wt6kCQ",
  authDomain: "music-player-dfcc2.firebaseapp.com",
  projectId: "music-player-dfcc2",
  storageBucket: "music-player-dfcc2.appspot.com",
  messagingSenderId: "86575337716",
  appId: "1:86575337716:web:d83c55f108434820868ea1",
  measurementId: "G-4HCBZNZ2E1"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);


export default firebase;
export const auth  = getAuth(app);
export const db = getFirestore(app);
