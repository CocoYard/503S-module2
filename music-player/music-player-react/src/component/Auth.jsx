import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../firebase/clientApp";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

// Configure FirebaseUI
const uiConfig = {
    // Redirect to / after sign in is successful. Alternatively you can provide a callback
    // signInSuccessUrl: "/",
    // We will display GitHub as auth providers.
    signInOptions: [GoogleAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    GithubAuthProvider.PROVIDER_ID],
};

function SignInScreen(){
    return (
        <div className="o-background">
        <div
            style={{
                maxWidth: "500px",
                display: "flex",
                marginTop:"10%",
                marginLeft: "auto",
                marginRight: "auto",

                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                float:"center"
            }}
        >
            <strong style={{color: "#fff",textAlign: "center", lineHeight: "1.3", margin:" 1.3rem 0 1.8rem",  fontSize: "3rem"}}>Soulmate Music</strong>
            <p style={{color: "#fff",textAlign: "center", lineHeight: "1.3", margin:" 1.3rem 0 1.8rem",  fontSize: "1rem"}}>Please sign-in:</p>
            <StyledFirebaseAuth className= {"login-stype"} uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
        </div>
    )
}

export default SignInScreen;