import "./ProfileLeft.css";

function ProfileLeft() {
    return ( 
        <div className="p-left">
            <div className="p-logo">
                <div className="p-logo-img"><img src="src\assets\dummy-post-square-1.jpg" className="p-logo-img-real"></img></div>
                <div className="p-logo-text">MahaGedara</div>
            </div>
            <div className="p-profile">Profile</div>
        </div>
     );
}

export default ProfileLeft;