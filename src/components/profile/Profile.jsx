import React from "react";
import Left from "./ProfileComponents/Left";
import Right from "../wall/WallComponents/Right"
import Mid from "./ProfileComponents/Mid"

import "./Profile.css";

function Profile() {
    return ( 
        <div className="container">
            <Left/>
            <Mid/>
            <Right/>
        </div>
     );
}

export default Profile;