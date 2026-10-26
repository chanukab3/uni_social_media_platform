import "./WallLeft.css";

function WallLeft() {
    return ( 
        <div className="w-left">
            <div className="w-logo">
                <div className="w-logo-img"><img src="src\assets\dummy-post-square-1.jpg" className="w-logo-img-real"></img></div>
                <div className="w-logo-text">MahaGedara</div>
            </div>
            <div className="w-profile">Profile</div>
            <div className="w-communities">Communities</div>
            <div className="w-groups">groups</div>
        </div>
     );
}

export default WallLeft;