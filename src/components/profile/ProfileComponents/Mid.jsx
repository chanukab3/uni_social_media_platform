import "../ProfileComponents-css/Mid.css";

function Mid() {
    return ( 
        <div className="mid">
            <div className="search">
                <div className="search-icon"><img className="search-icon-img" src="src\assets\dummy-post-square-1.jpg"></img></div>
                <div className="search-text">Search people, groups and little things you love</div>
            </div>     
            <div className="posts">
                <div className="post-div">
                    <div className="publisher-info">
                        <div className="publisher-logo"></div>
                        <div className="info-texts">
                            <div className="publisher-name"></div>
                            <div className="otherinfo">
                                <div className="location"></div>
                                <div className="time-ago"></div>
                            </div>
                        </div>
                        <div className="more-button"></div>
                    </div>
                    <div className="post-text"></div>
                    <div className="post img"></div>
                    <div className="react-counts"></div>
                    <div className="buttons"></div>
                </div>
            </div>
        </div>
     );
}

export default Mid;