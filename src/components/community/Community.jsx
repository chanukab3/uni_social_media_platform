import './community.css'
import { FriendSuggestions, WallProfileCard } from '../profile/Profile'
import Status from '../status/Status'

export function CommunityDirectory({ communities, joinedCommunities, query, onCreate, onToggleJoin }) {
  const term = query.trim().toLowerCase()
  const visibleCommunities = communities.filter((community) => `${community.name} ${community.description}`.toLowerCase().includes(term))

  return (
    <>
      <div className="section-title">
        <div><h2>Communities</h2><p>Find your people and join the conversation.</p></div>
        <button className="primary-btn compact" type="button" onClick={onCreate}>＋ Create</button>
      </div>
      <div className="community-grid">
        {visibleCommunities.map((community) => {
          const member = joinedCommunities.includes(community.name)
          return (
            <article className="community-card" key={community.id || community.name}>
              <div className="community-cover" style={{ background: `linear-gradient(135deg, ${community.tone}, #fff3e4)` }}>
                <span>✦</span>
              </div>
              <div className="community-card-body">
                <h3>{community.name}</h3>
                <p>{community.description}</p>
                <div className="community-card-footer">
                  <small>{community.members} members</small>
                  <button className={member ? 'secondary-btn joined' : 'secondary-btn'} type="button" onClick={() => onToggleJoin(community.name)}>{member ? 'Joined ✓' : 'Join'}</button>
                </div>
              </div>
            </article>
          )
        })}
        {!visibleCommunities.length && <div className="empty-state"><h3>No communities found</h3><p>Try another search term.</p></div>}
      </div>
    </>
  )
}

export function CreateCommunityForm({
  supabase,
  userId,
  communities,
  friendsList,
  setCommunities,
  setJoinedCommunities,
  setCurrentGroupChat,
  setChatSection,
  setDiscoverGroupIds,
  setModal,
  showToast,
}) {
  return (
    <>
      <h2>Create a community</h2><p className="modal-intro">Start a new space around something you care about.</p>
      <form onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const name = String(formData.get('community-name') || '').trim()
        const description = String(formData.get('community-description') || '').trim()
        const inviteLink = `${window.location.origin}/?invite=${crypto.randomUUID()}`
        const invitedFriendIds = formData.getAll('group-friend').map(String)
        if (!name){
          showToast('Give your community a name first.')
          return
        }
        if (!description){
          showToast('Add a short description for your community.')
          return
        }
        if (communities.some((community) => community.name.toLowerCase() === name.toLowerCase())){
          showToast('A community with that name already exists.')
          return
        }
        if (!supabase || !userId){
          showToast('Sign in to create a group.')
          return
        }
        const { data: group, error } = await supabase.from('groups').insert({
          name,
          description,
          invite_link: inviteLink,
          created_by: userId,
        }).select('id').single()
        if (error){
          showToast(`Could not create your group: ${error.message}`)
          return
        }
        const memberIds = [...new Set([userId, ...invitedFriendIds])]
        const { error: membershipError } = await supabase.rpc('add_community_group_members', {
          target_group_id: group.id,
          member_ids: memberIds,
        })
        if (membershipError){
          const { error: rollbackError } = await supabase.rpc('delete_community_group', { target_group_id: group.id })
          const rollbackNote = rollbackError ? ` Cleanup failed: ${rollbackError.message}` : ''
          showToast(`Could not save the group members: ${membershipError.message}.${rollbackNote}`)
          return
        }
        const createdGroup = { id: group.id, name, members: String(memberIds.length), tone: '#d5bfd9', description, invite_link: inviteLink, created_by: userId }
        setCommunities((current) => [createdGroup, ...current])
        setJoinedCommunities((current) => [...current, name])
        setCurrentGroupChat(name)
        setChatSection('Groups')
        setDiscoverGroupIds((current) => [group.id, ...(current || [])].slice(0, 3))
        setModal(null)
        showToast(`${name} is ready to grow.`)
      }}>
        <label className="field-label">Group name<input name="community-name" autoFocus placeholder="e.g. Weekend Gardeners" required /></label>
        <label className="field-label">Description<textarea name="community-description" placeholder="What is this group about?" required /></label>
        <fieldset className="group-invite-picker">
          <legend>Invite friends (choose up to 5)</legend>
          {friendsList.slice(0, 5).map((person) => <label key={person.id} className="group-invite-choice">
            <input type="checkbox" name="group-friend" value={person.id} disabled={!person.id} />
            <span>{person.name}</span>
          </label>)}
        </fieldset>
        <button className="primary-btn modal-submit" type="submit">Create community</button>
      </form>
    </>
  )
}

function Community({
  profileName,
  communities,
  joinedCommunities,
  discoverGroupIds,
  people,
  friendsList,
  incomingFriendRequests,
  friendRequests,
  setQuery,
  query,
  messages,
  chatSection,
  currentChat,
  currentGroupChat,
  notifications,
  unreadCount,
  events,
  setEvents,
  isAdmin,
  userId,
  composer,
  renderPost,
  filteredPosts,
  messageDraft,
  setMessageDraft,
  setChatSection,
  setCurrentChat,
  setCurrentGroupChat,
  setModal,
  navigate,
  toggleJoin,
  sendMessage,
  sendFriendRequest,
  acceptFriendRequest,
  openGroupChat,
  markNotificationRead,
  markNotificationsRead,
  onProfileClick,
  onGroupAction,
  onDeleteChat,
  onViewInbox,
  onSelectInboxChat,
  inboxConversations,
  inboxSelected,
  toast,
  showToast,
  onRequestLogin,
  profileContent,
}) {
  const term = query.trim().toLowerCase()
  const discoverGroups = communities
    .filter((group) => !joinedCommunities.includes(group.name))
    .filter((group) => discoverGroupIds === null || discoverGroupIds.includes(group.id))
  const joinedGroups = communities.filter((group) => joinedCommunities.includes(group.name))
  const selectedGroup = communities.find((group) => group.name === currentGroupChat)
  const conversationKey = selectedGroup ? `group:${selectedGroup.id}` : currentChat
  const activeMessages = messages[conversationKey] || []
  const isInboxList = chatSection === 'Inbox' && !inboxSelected

  return (
    <div className="wall-layout">
      {profileContent ? <div className="wall-profile-view">{profileContent}</div> : <>
      <aside className="wall-left">
        <button type="button" className="wall-brand" onClick={() => navigate('Home')}>
          <span className="brand-mark">M</span><strong>Mahagedara</strong>
        </button>
        <WallProfileCard
          profileId={userId}
          profileName={profileName}
          friendsCount={people.length}
          groupsCount={joinedCommunities.length}
          onProfileClick={onProfileClick}
        />
        <section className="mini-card wall-group-section">
          <div className="section-head"><h3>Find your circle</h3></div>
          {discoverGroups.slice(0, 3).map((group, index) => (
            <article className="wall-group-suggestion" key={group.id || group.name}>
              <div className={`wall-group-cover group-cover-${index % 2}`} />
              <strong>{group.name}</strong>
              <small>{group.members} members · {group.description}</small>
              <button type="button" className="secondary-btn compact" onClick={() => toggleJoin(group.name)}>Join</button>
            </article>
          ))}
          {!discoverGroups.length && <p className="wall-muted">You’re already part of every community.</p>}
        </section>
        <div className="wall-left-footer">
          {!userId && <button type="button" onClick={onRequestLogin}>Sign in</button>}
          <span>· Community guidelines · Privacy</span>
        </div>
      </aside>

      <main className="wall-center">
        <header className="topbar wall-topbar">
          <label className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, groups, and little things you love" aria-label="Search people, groups and posts" />
          </label>
          <button className="wall-icon-button" type="button" aria-label="Notifications" onClick={() => setChatSection('Notifications')}>
            ♧{unreadCount > 0 && <span className="notification-dot" />}
          </button>
        </header>

        <Status
          events={events}
          setEvents={setEvents}
          isAdmin={isAdmin}
          userId={userId}
          profileName={profileName}
          showToast={showToast}
        />

        <div className="wall-feed-scroll">
          {composer}
          <section className="feed" aria-label="Post feed">
            {filteredPosts.length
              ? filteredPosts.map(renderPost)
              : <div className="empty-state"><span>✧</span><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try another search.' : 'Share an update to get the conversation started.'}</p></div>}
          </section>
        </div>
      </main>
      </>}

      <aside className="wall-right">
        <FriendSuggestions
          people={people}
          friendsList={friendsList}
          query={query}
          friendRequests={friendRequests}
          sendFriendRequest={sendFriendRequest}
          onProfileClick={onProfileClick}
        />

        <section className="wall-chat-card">
          <header className="wall-chat-heading">
            <span className="wall-chat-avatar">{chatSection === 'World' ? '◎' : (selectedGroup?.name || currentChat || 'M')[0]}</span>
            <span><strong>{chatSection === 'Notifications' ? 'Notifications' : chatSection === 'Inbox' ? (inboxSelected ? currentChat : 'Inbox') : chatSection === 'Groups' ? (selectedGroup?.name || 'Groups') : chatSection === 'Friends' ? 'Friends' : 'World chat'}</strong><small>{chatSection === 'World' ? 'A little room for everyone' : 'Messages and conversations'}</small></span>
            {(chatSection === 'Groups' && selectedGroup) && <button type="button" aria-label="Group options" onClick={() => onGroupAction(selectedGroup)}>•••</button>}
            {chatSection === 'Inbox' && inboxSelected && <button type="button" aria-label="Chat options" onClick={() => onDeleteChat(currentChat)}>•••</button>}
            {chatSection !== 'Groups' && chatSection !== 'Inbox' && <span />}
          </header>

          {chatSection === 'Notifications' ? (
            <div className="wall-notification-list">
              {notifications.map((item) => <button type="button" key={item.id} className={item.read ? '' : 'unread'} onClick={() => markNotificationRead(item.id)}>{item.text}<small>{item.time}</small></button>)}
              <button type="button" className="wall-mark-read" onClick={markNotificationsRead}>Mark all as read</button>
            </div>
          ) : chatSection === 'Friends' ? (
            <div className="wall-chat-friends">
              {incomingFriendRequests.map((request) => <div className="wall-friend-request" key={request.requestId}>
                <span>{request.name} sent you a friend request.</span>
                <button type="button" onClick={() => acceptFriendRequest(request)}>Accept</button>
              </div>)}
              {friendsList.filter((person) => person.name.toLowerCase().includes(term)).map((friend) => <button type="button" key={friend.id || friend.name} onClick={() => onProfileClick(friend)}>
                <span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span><span>{friend.name}<small>{friend.status}</small></span>
              </button>)}
              {!friendsList.length && <p className="wall-muted">Your accepted friends will appear here.</p>}
            </div>
          ) : chatSection === 'Groups' && !selectedGroup ? (
            <div className="wall-chat-friends wall-chat-group-list">
              {joinedGroups.filter((group) => `${group.name} ${group.description}`.toLowerCase().includes(term)).map((group) => <button type="button" key={group.id || group.name} onClick={() => openGroupChat(group)}>
                <span className="wall-group-icon" style={{ background: group.tone }}>✦</span><span>{group.name}<small>{group.members} members</small></span>
              </button>)}
              {!joinedGroups.length && <p className="wall-muted">Join a group to start chatting.</p>}
              <button type="button" className="wall-create-group" onClick={() => setModal({ type: 'create-community' })}>＋ Create a group</button>
            </div>
          ) : isInboxList ? (
            <div className="wall-chat-friends">
              {inboxConversations.map((friend) => <button type="button" key={friend.id || friend.name} onClick={() => onSelectInboxChat(friend)}>
                <span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span><span>{friend.name}<small>{friend.lastMessage || 'Open conversation'}</small></span>
              </button>)}
              {!inboxConversations.length && <p className="wall-muted">No previous conversations yet.</p>}
            </div>
          ) : (
            <>
              <div className="wall-chat-messages" aria-live="polite">
                {(chatSection === 'World' ? (messages.World || []) : activeMessages).map((message, index) => <div key={`${message.id || message.from}-${index}`} className={message.from === profileName ? 'wall-message own' : 'wall-message'}><small>{message.from} · {message.time}</small><p>{message.text}</p></div>)}
                {chatSection === 'World' && !(messages.World || []).length && <p className="wall-chat-empty">Welcome to the neighborhood. Say hello and start a conversation.</p>}
              </div>
              <form className="wall-chat-form" onSubmit={sendMessage}>
                <input aria-label="Write a message" placeholder={chatSection === 'World' ? 'Say hello to the neighborhood...' : `Message ${selectedGroup?.name || currentChat}...`} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} />
                <button type="submit" aria-label="Send message">↑</button>
              </form>
              <p className="wall-chat-note">A shared space, a little kindness, a lot of good conversations.</p>
            </>
          )}

          <nav className="wall-chat-tabs" aria-label="Community sections">
            {[['World', '◎'], ['Groups', '▤'], ['Friends', '♧'], ['Inbox', '✉'], ['Notifications', '♢']].map(([label, icon]) => <button type="button" key={label} className={chatSection === label ? 'active' : ''} onClick={() => {
              setChatSection(label)
              if (label === 'World') setCurrentChat('World')
              if (label === 'Groups') setCurrentGroupChat('')
              if (label === 'Inbox') onViewInbox()
              if (label === 'Notifications') markNotificationsRead()
            }}><span>{icon}</span>{label}</button>)}
          </nav>
        </section>
        <p className="wall-right-footer">Local community. Real connections.</p>
      </aside>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

export default Community
