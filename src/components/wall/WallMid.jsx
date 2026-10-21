import "./WallMid.css";
import EventsSlider from "./EventsSlider";

function WallMid() {

    const myDiv = document.getElementById("search");

    window.addEventListener("scroll", () => {
      if (window.scrollY > 0) {
        myDiv.style.display = "none";   // hide when scrolling starts
      } else {
        myDiv.style.display = "block";  // show again at top
      }
    });

    return ( 
        <div className="mid">
            <div className="search">
                <div className="search-icon"><img className="search-icon-img" src="src\assets\dummy-post-square-1.jpg"></img></div>
                <div className="search-text">Search people, groups and little things you love</div>
            </div>  

              

           

            <div className="posts">
                 <div className="EventsSlide"><EventsSlider/></div>
                 
                <article className="social-card">
               
                    <header className="card-header">
                        <div className="author-info">
                            <img src="src\assets\dummy-post-square-1.jpg" alt="Maya Chen" className="avatar" />
                            <div className="author-details">
                                <h3 className="author-name">Maya Chen</h3>
                                <span className="post-meta">Brooklyn creatives &bull; 24 min ago</span>
                            </div>
                        </div>
                        <button className="options-btn" aria-label="More options">
                         &bull;&bull;&bull;
                        </button>
                    </header>


                    <div className="card-body">
                         <p className="post-text">
                        Our little studio is finally open! A space to make things, meet good people, and embrace a few happy accidents. Come by ☕
                        </p>
                    </div>

                
                    <div className="card-media">
                        <img src="src\assets\dummy-post-square-1.jpg" alt="Pottery studio interior with people working" className="post-image" />
                        </div>

                   
                    <div className="card-stats">
                        <span className="likes-count">48 neighbors loved this</span>
                        <span className="comments-count">12 comments</span>
                    </div>

                
                    <footer className="card-footer">
                        <button className="action-btn">
                            <svg className="icon" /* heart icon SVG */></svg>
                            <span>Love this</span>
                        </button>
                        <button className="action-btn">
                            <svg className="icon" /* comment icon SVG */></svg>
                            <span>Say something</span>
                        </button>
                        <button className="action-btn bookmark-btn" aria-label="Bookmark">
                            <svg className="icon" /* bookmark icon SVG */></svg>
                        </button>
                    </footer>
                </article>

                <article className="social-card">
               
                    <header className="card-header">
                        <div className="author-info">
                            <img src="src\assets\dummy-post-square-1.jpg" alt="Maya Chen" className="avatar" />
                            <div className="author-details">
                                <h3 className="author-name">Maya Chen</h3>
                                <span className="post-meta">Brooklyn creatives &bull; 24 min ago</span>
                            </div>
                        </div>
                        <button className="options-btn" aria-label="More options">
                         &bull;&bull;&bull;
                        </button>
                    </header>


                    <div className="card-body">
                         <p className="post-text">
                        Our little studio is finally open! A space to make things, meet good people, and embrace a few happy accidents. Come by ☕
                        </p>
                    </div>

                
                    <div className="card-media">
                        <img src="src\assets\dummy-post-square-1.jpg" alt="Pottery studio interior with people working" className="post-image" />
                        </div>

                   
                    <div className="card-stats">
                        <span className="likes-count">48 neighbors loved this</span>
                        <span className="comments-count">12 comments</span>
                    </div>

                
                    <footer className="card-footer">
                        <button className="action-btn">
                            <svg className="icon" /* heart icon SVG */></svg>
                            <span>Love this</span>
                        </button>
                        <button className="action-btn">
                            <svg className="icon" /* comment icon SVG */></svg>
                            <span>Say something</span>
                        </button>
                        <button className="action-btn bookmark-btn" aria-label="Bookmark">
                            <svg className="icon" /* bookmark icon SVG */></svg>
                        </button>
                    </footer>
                </article>
            </div>
        </div>
     );
}

export default WallMid;