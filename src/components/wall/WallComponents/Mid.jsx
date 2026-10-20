import "../WallComponents-css/Mid.css";

function Mid() {
    return ( 
        <div className="mid">
            <div className="search">
                <div className="search-icon"><img className="search-icon-img" src="src\assets\dummy-post-square-1.jpg"></img></div>
                <div className="search-text">Search people, groups and little things you love</div>
            </div>     
            <div className="events-slides">
                <div className="event-text"></div>
            </div>
            <div className="add-post"></div>
            <div className="posts"></div>
        </div>
     );
}

export default Mid;