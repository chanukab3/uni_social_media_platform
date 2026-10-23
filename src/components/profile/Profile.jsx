import './profile.css'

export function ProfileAvatar({ person, className = 'avatar small', onClick }) {
  return (
    <button
      type="button"
      className={`${className} profile-avatar-link`}
      style={{ background: person.color || '#bd8f75' }}
      aria-label={`View ${person.name}'s profile`}
      onClick={() => onClick(person)}
    >
      {person.name?.[0] || '?'}
    </button>
  )
}

export function WallProfileCard({ profileId, profileName, friendsCount, groupsCount, onProfileClick }) {
  const currentUser = { id: profileId, name: profileName, color: '#879174' }
  return (
    <section className="mini-card wall-profile">
      <button type="button" className="wall-profile-button" onClick={() => onProfileClick(currentUser)}>
        <span className="avatar large avatar-olive">A</span>
        <span><strong>{profileName}</strong><small>@amanda.silva</small></span>
      </button>
      <p>Finding my people, one coffee and creative project at a time.</p>
      <div className="wall-profile-stats">
        <span><strong>{friendsCount}</strong><small>Friends</small></span>
        <span><strong>{groupsCount}</strong><small>Groups</small></span>
        <button type="button" aria-label="View profile" onClick={() => onProfileClick(currentUser)}>↗</button>
      </div>
    </section>
  )
}

export function FriendSuggestions({ people, friendsList, query, friendRequests, sendFriendRequest, onProfileClick }) {
  const term = query.trim().toLowerCase()
  const friendIds = new Set(friendsList.map((friend) => friend.id))
  const suggestions = people.filter((person) => !friendIds.has(person.id) && person.name.toLowerCase().includes(term))
  return (
    <section className="mini-card wall-friend-suggestions">
      <div className="section-head"><h3>People you may know</h3></div>
      <div className="suggested-friends">
        {suggestions.slice(0, 4).map((friend) => (
          <article className="suggested-friend" key={friend.id || friend.name}>
            <ProfileAvatar person={friend} onClick={onProfileClick} />
            <button type="button" className="profile-name-link" onClick={() => onProfileClick(friend)}>{friend.name}</button>
            <button type="button" onClick={() => sendFriendRequest(friend.name)}>{friendRequests.includes(friend.name) ? 'Requested ✓' : '＋ Connect'}</button>
          </article>
        ))}
        {!suggestions.length && <p className="wall-muted">No people match your search.</p>}
      </div>
    </section>
  )
}

export function ProfilePage({ profileTarget, profileName, userId, postCount, friendsList, filteredPosts, renderPost, onEditProfile, onHome, onProfileClick }) {
  const viewedName = profileTarget?.name || profileName
  const isOwnProfile = !profileTarget || profileTarget.id === userId
  const viewedHandle = isOwnProfile ? '@amanda' : profileTarget?.handle
  return (
    <div className="wall-profile-columns">
      <aside className="wall-profile-details">
        <button type="button" className="wall-profile-back" onClick={onHome}>← Back to wall</button>
        <section className="wall-profile-identity">
          <div className="avatar wall-profile-avatar avatar-olive">{viewedName[0]}</div>
          <h2>{viewedName}</h2>
          <p>{viewedHandle || ''}</p>
          <p className="wall-profile-bio">Finding good people, good places and little reasons to smile.</p>
          {isOwnProfile && <button className="secondary-btn" type="button" onClick={onEditProfile}>Edit profile</button>}
          <div className="wall-profile-numbers">
            <span><strong>{postCount}</strong><small>Posts</small></span>
            <span><strong>{friendsList.length}</strong><small>Friends</small></span>
          </div>
        </section>
        <section className="wall-profile-friends">
          <h3>{isOwnProfile ? 'Your friends' : 'Friends'}</h3>
          {friendsList.slice(0, 8).map((friend) => (
            <button type="button" key={friend.id || friend.name} onClick={() => onProfileClick(friend)}>
              <span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span>
              <span>{friend.name}<small>{friend.status}</small></span>
            </button>
          ))}
          {!friendsList.length && <p className="wall-muted">Accepted friends will appear here.</p>}
        </section>
      </aside>
      <main className="wall-profile-posts">
        <header className="wall-profile-posts-heading">
          <div><h2>{isOwnProfile ? 'Your posts' : `${viewedName}’s posts`}</h2><p>Updates shared with the community.</p></div>
        </header>
        <section className="feed">
          {filteredPosts.length
            ? filteredPosts.map(renderPost)
            : <div className="empty-state"><h3>No posts yet</h3><p>{isOwnProfile ? 'Write your first update from the home feed.' : 'This person has not shared any posts yet.'}</p>{isOwnProfile && <button type="button" className="secondary-btn" onClick={onHome}>Go to Home</button>}</div>}
        </section>
      </main>
    </div>
  )
}

export default ProfilePage
