import{ useRef, useState } from 'react'
import './profile.css'

export function ProfileAvatar({ person, className = 'avatar small', onClick }){
  const avatarUrl = person.avatarUrl || person.avatar_url
  return(
    <button
      type="button"
      className={`${className} profile-avatar-link`}
      style={{ background: person.color || '#bd8f75' }}
      aria-label={`View ${person.name}'s profile`}
      onClick={() => onClick(person)}
    >
     {avatarUrl ? <img src={avatarUrl} alt="" /> : person.name?.[0] || '?'}
    </button>
  )
}

export function WallProfileCard({ profileId, profileName, profileHandle, profilePhotoUrl, friendsCount, groupsCount, onProfileClick, onOpenWallTab }){
  const currentUser ={ id: profileId, name: profileName, avatarUrl: profilePhotoUrl, color: '#879174' }
  return(
    <section className="mini-card wall-profile">
      <button type="button" className="wall-profile-button" onClick={() => onProfileClick(currentUser)}>
        <span className="avatar large avatar-olive">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : profileName?.[0] || 'A'}</span>
        <span><strong>{profileName}</strong><small>{profileHandle}</small></span>
      </button>
      <p>Finding my people, one coffee and creative project at a time.</p>
      <div className="wall-profile-stats">
        <button type="button" onClick={() => onOpenWallTab('Friends')}><strong>{friendsCount}</strong><small>Friends</small></button>
        <button type="button" onClick={() => onOpenWallTab('Groups')}><strong>{groupsCount}</strong><small>Groups</small></button>
        <button type="button" aria-label="View profile" onClick={() => onProfileClick(currentUser)}>↗</button>
      </div>
    </section>
  )
}

export function FriendSuggestions({ people, friendsList, query, friendRequests, sendFriendRequest, onProfileClick }){
  const term = query.trim().toLowerCase()
  const friendIds = new Set(friendsList.map((friend) => friend.id))
  const suggestions = people.filter((person) =>
    !friendIds.has(person.id)
    && person.name.toLowerCase().includes(term)
  )
  return(
    <section className="mini-card wall-friend-suggestions">
      <div className="section-head"><h3>People you may know</h3></div>
      <div className="suggested-friends">
       {suggestions.map((friend) =>(
          <article className="suggested-friend" key={friend.id || friend.name}>
            <ProfileAvatar person={friend} onClick={onProfileClick} />
            <strong>{friend.name}</strong>
            <button type="button" disabled={friendRequests.includes(friend.name)} onClick={() => sendFriendRequest(friend.name)}>
             {friendRequests.includes(friend.name) ? 'Requested ✓' : '＋ Connect'}
            </button>
          </article>
        ))}
       {!suggestions.length && <p className="wall-muted">No people match your search.</p>}
      </div>
    </section>
  )
}

export function ProfilePage({ profileTarget, profileName, profileHandle, profileBio, profilePhotoUrl, userId, postCount, filteredPosts, renderPost, onSignOut, onEditProfile, onHome, onUploadProfilePhoto, isAdmin, people, onBanUser, communities, onDeleteGroup }){
  const photoInputRef = useRef(null)
  const [adminPanel, setAdminPanel] = useState('')
  const viewedName = profileTarget?.name || profileName
  const isOwnProfile = !profileTarget || profileTarget.id === userId
  const viewedHandle = isOwnProfile ? profileHandle : profileTarget?.handle
  return(
    <div className="wall-profile-columns">
      <aside className="wall-profile-details">
        <button type="button" className="wall-profile-back" onClick={onHome}>← Back to wall</button>
        <section className="wall-profile-identity">
          <div className="profile-identity-heading">
            <div className="avatar wall-profile-avatar avatar-olive">{(isOwnProfile ? profilePhotoUrl : profileTarget?.avatarUrl || profileTarget?.avatar_url)
              ? <img src={isOwnProfile ? profilePhotoUrl : profileTarget?.avatarUrl || profileTarget?.avatar_url} alt="" />
              : viewedName[0]}</div>
            <div className="profile-identity-name">
              <h2>{viewedName}</h2>
              <p>{viewedHandle || ''}</p>
            </div>
          </div>
         {profileBio && <p className="wall-profile-bio">{profileBio}</p>}
         {isOwnProfile && <>
            <div className="profile-controls">
              <button className="secondary-btn" type="button" onClick={() => photoInputRef.current?.click()}>{profilePhotoUrl ? 'Change photo' : 'Add profile photo'}</button>
              <input
                ref={photoInputRef}
                className="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                aria-label="Choose a profile photo smaller than 1 MB"
                onChange={async(event) =>{
                  const file = event.target.files?.[0]
                  if(file) await onUploadProfilePhoto(file)
                  event.target.value = ''
                }}
              />
              <div className="profile-account-actions">
                <button className="secondary-btn" type="button" onClick={onEditProfile}>Edit profile</button>
                <button className="secondary-btn danger-action" type="button" onClick={onSignOut}>Sign out</button>
              </div>
            </div>
            <small className="profile-photo-hint">JPG, PNG, WebP, or GIF · max 1 MB</small>
          </>}
          <div className="wall-profile-numbers"><span><strong>{postCount}</strong><small>Posts</small></span></div>
        </section>
       {isAdmin && isOwnProfile && <section className="admin-profile-actions" aria-label="Admin controls">
          <button className="secondary-btn" type="button" onClick={() => setAdminPanel('users')}>Manage users</button>
          <button className="secondary-btn" type="button" onClick={() => setAdminPanel('groups')}>Manage groups</button>
        </section>}
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
     {adminPanel &&(
        <div className="modal-backdrop" role="presentation" onClick={() => setAdminPanel('')}>
          <section className="modal-card admin-management-modal" role="dialog" aria-modal="true" aria-labelledby="admin-management-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setAdminPanel('')} aria-label="Close admin management">×</button>
            <h2 id="admin-management-title">{adminPanel === 'users' ? 'Manage users' : 'Manage groups'}</h2>
           {adminPanel === 'users' ?(
              <div className="admin-management-list">
               {people.map((person) => <div className="admin-user-row" key={person.id}>
                  <span>{person.name}</span>
                  <button type="button" className={person.isBanned ? 'text-action' : 'text-action danger-action'} onClick={() => onBanUser(person)}>{person.isBanned ? 'Unban' : 'Ban'}</button>
                </div>)}
               {!people.length && <p className="wall-muted">No other users to manage.</p>}
              </div>
            ) :(
              <div className="admin-management-list">
               {communities.map((group) => <div className="admin-user-row" key={group.id}>
                  <span>{group.name}</span>
                  <button type="button" className="text-action danger-action" onClick={async() =>{
                    if(await onDeleteGroup(group)) setAdminPanel('')
                  }}>Delete</button>
                </div>)}
               {!communities.length && <p className="wall-muted">No groups to manage.</p>}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
