import "../ProfileComponents-css/Left.css";

function Left() {
    return ( 
        <div className="left">
            <div className="logo">
                <div className="logo-img"><img src="src\assets\dummy-post-square-1.jpg" className="logo-img-real"></img></div>
                <div className="logo-text">MahaGedara</div>
            </div>
            <div className="profile">Profile</div>
        </div>
     );
}

export default Left;