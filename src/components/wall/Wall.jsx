import React from "react";
import WallLeft from "./WallLeft";
import Right from "./Right";
import WallMid from "./WallMid";

import "./Wall.css"


function Wall() {
    return ( 
        <div className="container">
            <WallLeft/>
            <WallMid/>
            <Right/>
        </div>
     );
}

export default Wall;