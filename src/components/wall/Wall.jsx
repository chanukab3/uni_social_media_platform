import React from "react";
import LeftWall from "./WallComponents/LeftWall";
import Right from "./WallComponents/Right";
import MidWall from "./WallComponents/MidWall";

import "./Wall.css"


function Wall() {
    return ( 
        <div className="container">
            <LeftWall/>
            <MidWall/>
            <Right/>
        </div>
     );
}

export default Wall;