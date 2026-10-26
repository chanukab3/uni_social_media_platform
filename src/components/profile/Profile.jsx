import React from "react";
import Right from "../wall/Right";
import ProfileMid from "./ProfileMid";
import ProfileLeft from "./ProfileLeft";

import "./Profile.css";

function Profile() {
    return ( 
        <div className="container">
            <ProfileLeft/>
            <ProfileMid/>
            <Right/>
        </div>
     );
}

export default Profile;