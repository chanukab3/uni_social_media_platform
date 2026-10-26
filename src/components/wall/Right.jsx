import "./Right.css";

function Right() {
    return ( 
        <div className="right">
            <div className="suggestions">
                <section className="recommendations-card">

  <header className="card-header">
    <h2 className="card-title">People you may know</h2>
    <a href="#" className="see-all-link">See all</a>
  </header>


  <div className="people-grid">
    
    <article className="person-card">
      <img src="src\assets\dummy-post-square-1.jpg" alt="Sofia Patel" className="avatar-suggest" />
      <h3 className="person-name">Sofia Patel</h3>
      <p className="mutual-friends">6 mutual friends</p>
      <button className="connect-btn">
        <svg className="icon" /* connect user icon SVG */></svg>
        <span>Connect</span>
      </button>
    </article>

    <article className="person-card">
      <img src="src\assets\dummy-post-square-1.jpg" alt="James Wilson" className="avatar-suggest" />
      <h3 className="person-name">James Wilson</h3>
      <p className="mutual-friends">4 mutual friends</p>
      <button className="connect-btn">
        <svg className="icon" /* connect user icon SVG */></svg>
        <span>Connect</span>
      </button>
    </article>

    <article className="person-card">
      <img src="src\assets\dummy-post-square-1.jpg" alt="Emma Lee" className="avatar-suggest" />
      <h3 className="person-name">Emma Lee</h3>
      <p className="mutual-friends">3 mutual friends</p>
      <button className="connect-btn">
        <svg className="icon" /* connect user icon SVG */></svg>
        <span>Connect</span>
      </button>
    </article>

    <article className="person-card">
      <img src="src\assets\dummy-post-square-1.jpg" alt="Oliver Park" className="avatar-suggest" />
      <h3 className="person-name">Oliver Park</h3>
      <p className="mutual-friends">5 mutual friends</p>
      <button className="connect-btn">
        <svg className="icon" /* connect user icon SVG */></svg>
        <span>Connect</span>
      </button>
    </article>

  </div>
</section>
            </div>
            <div className="chat-box">Chat box</div>
        </div>
     );
}

export default Right;