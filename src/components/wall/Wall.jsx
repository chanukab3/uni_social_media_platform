import React from "react";
import LeftWall from "./WallComponents/LeftWall";
import Right from "./WallComponents/Right";
import Mid from "./WallComponents/Mid";

import "./Wall.css"


function Wall() {
    return ( 
        <div className="container">
            <LeftWall/>
            <Mid/>
            <Right/>
        </div>
     );
}

export default Wall;