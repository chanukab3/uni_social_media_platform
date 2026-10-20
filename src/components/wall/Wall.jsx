import React from "react";
import Left from "./WallComponents/LeftWall";
import Right from "./WallComponents/Right";
import Mid from "./WallComponents/Mid";

import "./Wall.css"


function Wall() {
    return ( 
        <div className="container">
            <Left/>
            <Mid/>
            <Right/>
        </div>
     );
}

export default Wall;