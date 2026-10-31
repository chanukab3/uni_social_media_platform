import { useEffect, useRef, useState } from 'react'
import './community.css'
import BellIcon from '@iconify-react/bitcoin-icons/bell-outline'
import ContactsIcon from '@iconify-react/bitcoin-icons/contacts-outline'
import EmailIcon from '@iconify-react/bitcoin-icons/email-outline'
import GridIcon from '@iconify-react/bitcoin-icons/grid-outline'
import MessageIcon from '@iconify-react/bitcoin-icons/message-outline'
import PlusIcon from '@iconify-react/bitcoin-icons/plus-outline'
import SearchIcon from '@iconify-react/bitcoin-icons/search-outline'
import SendIcon from '@iconify-react/bitcoin-icons/send-outline'
import{ FriendSuggestions, WallProfileCard } from '../profile/Profile'
import Status from '../status/Status'


export function CommunityDirectory({ communities, joinedCommunities, query, onCreate, onToggleJoin }){
  const term = query.trim().toLowerCase()
  const visibleCommunities = communities.filter((community) => `${community.name} ${community.description}`.toLowerCase().includes(term))

  return(
    <>
      <div className="section-title">
        <div><h2>Communities</h2><p>Find your people and join the conversation.</p></div>
        <button className="primary-btn compact" type="button" onClick={onCreate}><PlusIcon className="ui-icon" /> Create</button>
      </div>
      <div className="community-grid">
       {visibleCommunities.map((community) =>{
          const member = joinedCommunities.includes(community.name)
          return(
            <article className="community-card" key={community.id || community.name}>
              <div className="community-cover" style={{ background: `linear-gradient(135deg, ${community.tone}, #fff3e4)` }}>
                <PlusIcon className="ui-icon" aria-hidden="true" />
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
}){
  return(
    <>
      <h2>Create a community</h2><p className="modal-intro">Start a new space around something you care about.</p>
      <form onSubmit={async(event) =>{
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const name = String(formData.get('community-name') || '').trim()
        const description = String(formData.get('community-description') || '').trim()
        const inviteLink = `${window.location.origin}/?invite=${crypto.randomUUID()}`
        const invitedFriendIds = formData.getAll('group-friend').map(String)
        if(!name){
          showToast('Give your community a name first.')
          return
        }
        if(!description){
          showToast('Add a short description for your community.')
          return
        }
        if(communities.some((community) => community.name.toLowerCase() === name.toLowerCase())){
          showToast('A community with that name already exists.')
          return
        }
        if(!supabase || !userId){
          showToast('Sign in to create a group.')
          return
        }
        const{ data: group, error } = await supabase.from('groups').insert({
          name,
          description,
          invite_link: inviteLink,
          created_by: userId,
        }).select('id').single()
        if(error){
          showToast(`Could not create your group: ${error.message}`)
          return
        }
        const memberIds = [...new Set([userId, ...invitedFriendIds])]
        const{ error: membershipError } = await supabase.rpc('add_community_group_members',{
          target_group_id: group.id,
          member_ids: memberIds,
        })
        if(membershipError){
          const{ error: rollbackError } = await supabase.rpc('delete_community_group',{ target_group_id: group.id })
          const rollbackNote = rollbackError ? ` Cleanup failed: ${rollbackError.message}` : ''
          showToast(`Could not save the group members: ${membershipError.message}.${rollbackNote}`)
          return
        }
        const createdGroup ={ id: group.id, name, members: String(memberIds.length), tone: '#d5bfd9', description, invite_link: inviteLink, created_by: userId }
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
          <legend>Invite friends(choose up to 5)</legend>
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
  profileHandle,
  profileBio,
  profilePhotoUrl,
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
  unreadChats,
  onMarkChatRead,
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
  onOpenWallTab,
  markNotificationRead,
  markNotificationsRead,
  onProfileClick,
  onDeleteEvent,
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
}){
  const [expandedMessages, setExpandedMessages] = useState(new Set())
  const chatMessagesRef = useRef(null)
  const term = query.trim().toLowerCase()
  const discoverGroups = communities
    .filter((group) => !joinedCommunities.includes(group.name))
    .filter((group) => discoverGroupIds === null || discoverGroupIds.includes(group.id))
  const joinedGroups = communities.filter((group) => joinedCommunities.includes(group.name))
  const selectedGroup = communities.find((group) => group.name === currentGroupChat)
  const conversationKey = selectedGroup ? `group:${selectedGroup.id}` : currentChat
  const activeMessages = messages[conversationKey] || []
  const isInboxList = chatSection === 'Inbox' && !inboxSelected
  const hasUnreadWorld = unreadChats.has('World')
  const hasUnreadGroups = [...unreadChats].some((key) => key.startsWith('group:'))
  const hasUnreadDirect = [...unreadChats].some((key) => key !== 'World' && !key.startsWith('group:'))
  const hasUnreadFriend = friendsList.some((friend) => unreadChats.has(friend.name))
  const showingChatMessages = chatSection === 'World'
    || (chatSection === 'Groups' && Boolean(selectedGroup))
    || (chatSection === 'Inbox' && inboxSelected)
  const truncate = (input, maxChars = 100) =>
  input?.length > maxChars ? `${input.substring(0, maxChars)}...` : input;
  const toggleMessageExpanded = (messageKey) => {
    setExpandedMessages((current) => {
      const updated = new Set(current)
      if(updated.has(messageKey)) updated.delete(messageKey)
      else updated.add(messageKey)
      return updated
    })
  }

  useEffect(() =>{
    if(!showingChatMessages) return
    const messageList = chatMessagesRef.current
    if(messageList) messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' })
  }, [chatSection, currentChat, currentGroupChat, inboxSelected, messages, showingChatMessages])

  return(
    <div className="wall-layout">
     {profileContent ? <div className="wall-profile-view">{profileContent}</div> : <>
      <aside className="wall-left">
        <button type="button" className="wall-brand" onClick={() => navigate('Home')}>
          <span className="brand-mark"><img src="/mg.png" width="25px" height="auto"/></span><strong>Mahagedara</strong>
        </button>
        <WallProfileCard
          profileId={userId}
          profileName={profileName}
          profileHandle={profileHandle}
          profileBio={profileBio}
          profilePhotoUrl={profilePhotoUrl}
          friendsCount={friendsList.length}
          groupsCount={joinedCommunities.length}
          onProfileClick={onProfileClick}
          onOpenWallTab={onOpenWallTab}
        />
        <section className="mini-card wall-group-section">
          <div className="section-head"><h3>Find your circle</h3></div>
         {discoverGroups.slice(0, 3).map((group, index) =>(
            <article className="wall-group-suggestion" key={group.id || group.name}>
              <div className={`wall-group-cover group-cover-${index % 2}`} />
              <strong>{group.name}</strong>
              <small>{group.members} members ·{group.description}</small>
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
        <div className="wall-feed-scroll">
          <header className="topbar wall-topbar">
            <label className="search-wrap">
              <span aria-hidden="true"><SearchIcon className="ui-icon" /></span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, groups, and little things you love" aria-label="Search people, groups and posts" />
            </label>
            <button className="wall-icon-button" type="button" aria-label="Notifications" onClick={() => setChatSection('Notifications')}>
              <BellIcon className="ui-icon" />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>
          </header>
          <Status
            events={events}
            setEvents={setEvents}
            isAdmin={isAdmin}
            userId={userId}
            profileName={profileName}
            profileHandle={profileHandle}
            showToast={showToast}
            onDeleteEvent={onDeleteEvent}
          />
         {composer}
          <section className="feed" aria-label="Post feed">
           {filteredPosts.length
              ? filteredPosts.map(renderPost)
              : <div className="empty-state"><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try another search.' : 'Share an update to get the conversation started.'}</p></div>}
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
            <span className="wall-chat-avatar">{chatSection === 'World' ? '🌐' :(selectedGroup?.name || currentChat || 'M')[0]}</span>
            <span><strong>{chatSection === 'Notifications' ? 'Notifications' : chatSection === 'Inbox' ? (inboxSelected ? currentChat : 'Inbox') : chatSection === 'Groups' ?(selectedGroup?.name || 'Groups') : chatSection === 'Friends' ? 'Friends' : 'World chat'}</strong><small>{chatSection === 'World' ? 'A little room for everyone' : 'Messages and conversations'}</small></span>
           {(chatSection === 'Groups' && selectedGroup) && <button type="button" aria-label="Group options" onClick={() => onGroupAction(selectedGroup)}>•••</button>}
           {chatSection === 'Inbox' && inboxSelected && <button type="button" aria-label="Chat options" onClick={() => onDeleteChat(currentChat)}>•••</button>}
           {chatSection !== 'Groups' && chatSection !== 'Inbox' && <span />}
          </header>

         {chatSection === 'Notifications' ? (
            <div className="wall-notification-list">
              <div>
                {notifications.map((item) =>{
                const request = incomingFriendRequests.find((friendRequest) =>
                  item.text === `${friendRequest.name} sent you a friend request.`
                )
                return(
                  <article key={item.id} className={item.read ? '' : 'unread'}>
                    <button type="button" className="wall-notification-item" onClick={() => markNotificationRead(item.id)}>
                     {item.text}<small>{item.time}</small>
                    </button>
                   {request && <button type="button" className="wall-notification-accept" onClick={async() =>{
                      if(await acceptFriendRequest(request)) markNotificationRead(item.id)
                    }}>Accept request</button>}
                  </article>
                )
              })}
             {!notifications.length && <p className="wall-muted">You’re all caught up.</p>}
              </div>
              <button type="button" className="wall-mark-read" onClick={markNotificationsRead}>Mark all as read</button>
            </div>
          ) : chatSection === 'Friends' ?(
            <div className="wall-chat-friends">
             {incomingFriendRequests.map((request) => <div className="wall-friend-request" key={request.requestId}>
                <span>{request.name} sent you a friend request.</span>
                <button type="button" onClick={() => acceptFriendRequest(request)}>Accept</button>
              </div>)}
             {friendsList.filter((person) => person.name.toLowerCase().includes(term)).map((friend) => <div className="inbox-conversation" key={friend.id || friend.name}>
                <button type="button" className="inbox-profile-link" onClick={() => onProfileClick(friend)} aria-label={`View ${friend.name}'s profile`}>
                  <span className="avatar tiny" style={{ background: friend.color }}>{friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : friend.name[0]}</span>
                  <span>{friend.name}<small>View profile · {friend.status}</small></span>
                  
                <button type="button" className="inbox-open-chat" onClick={() => onSelectInboxChat(friend)} aria-label={`Open chat with ${friend.name}`}>
                  <MessageIcon className="ui-icon"/>{unreadChats.has(friend.name) && <span className="conversation-unread-dot" role="img" aria-label={`Unread messages from ${friend.name}`} />}
                  </button>
                </button>
                
              </div>)}
             {!friendsList.length && !incomingFriendRequests.length && <p className="wall-muted">Your accepted friends will appear here.</p>}
            </div>
          ) : chatSection === 'Groups' && !selectedGroup ?(
            <div className="wall-chat-friends wall-chat-group-list">
             <div>
              {joinedGroups.filter((group) => `${group.name} ${group.description}`.toLowerCase().includes(term)).map((group) => <button type="button" key={group.id || group.name} className={currentGroupChat === group.name ? 'selected' : ''} onClick={() => openGroupChat(group)}>
                <span className="wall-group-icon" style={{ background: group.tone }}></span><span>{group.name}<small>{group.members} members</small></span>
                {unreadChats.has(`group:${group.id}`) && <span className="conversation-unread-dot" role="img" aria-label={`Unread messages in ${group.name}`} />}
              </button>)}
             </div>
             {!joinedGroups.length && <p className="wall-muted">Join a group to start chatting.</p>}
              <button type="button" className="wall-create-group" onClick={() => setModal({ type: 'create-community' })}><PlusIcon className="ui-icon" /> Create a group</button>
            </div>
          ) : isInboxList ?(
            <div className="wall-chat-friends">
             {inboxConversations.map((friend) => <div className="inbox-conversation" key={friend.id || friend.name}>
                <button type="button" className="inbox-profile-link" onClick={() => onProfileClick(friend)} aria-label={`View ${friend.name}'s profile`}>
                  <span className="avatar tiny" style={{ background: friend.color }}>{friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : friend.name[0]}</span>
                  <span>{friend.name}<small>{truncate(friend.lastMessage, 65) || 'Open profile'}</small></span>
                  <button type="button" className="inbox-open-chat" onClick={() => onSelectInboxChat(friend)} aria-label={`Open chat with ${friend.name}`}><MessageIcon className="ui-icon"/>
                  {unreadChats.has(friend.name) && <span className="conversation-unread-dot" role="img" aria-label={`Unread messages from ${friend.name}`} />}
                  </button>
                </button>
                
              </div>)}
             {!inboxConversations.length && <p className="wall-muted">No previous conversations yet.</p>}
            </div>
          ) :(
            <>
              <div className="wall-chat-messages" aria-live="polite" ref={chatMessagesRef}>
               {(chatSection === 'World' ?(messages.World || []) : activeMessages).map((message, index) => {
                 const messageKey = `${chatSection === 'World' ? 'World' : conversationKey}:${message.id || message.from}-${index}`
                 const words = (message.text || '').trim().split(/\s+/).filter(Boolean)
                 const isLongMessage = words.length > 30
                 const isExpanded = expandedMessages.has(messageKey)
                 return(
                   <div key={messageKey} className={message.from === profileName ? 'wall-message own' : 'wall-message'}>
                     <small>{message.from} ·{message.time}</small>
                     <p>{isLongMessage && !isExpanded ? `${words.slice(0, 30).join(' ')}...` : message.text}</p>
                     {isLongMessage && <button type="button" className="wall-message-actions" onClick={() => toggleMessageExpanded(messageKey)}>{isExpanded ? 'See less' : 'See more'}</button>}
                   </div>
                 )
               })}
               {chatSection === 'World' && !(messages.World || []).length && <p className="wall-chat-empty">Welcome to the neighborhood. Say hello and start a conversation.</p>}
              </div>
              <form className="wall-chat-form" onSubmit={sendMessage}>
                <input aria-label="Write a message" placeholder={chatSection === 'World' ? 'Say hello to the neighborhood...' : `Message ${selectedGroup?.name || currentChat}...`} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} />
                <button type="submit" aria-label="Send message"><SendIcon className="ui-icon" /></button>
              </form>
              
            </>
          )}

          <nav className="wall-chat-tabs" aria-label="Community sections">
           {[['World', EmailIcon, hasUnreadWorld], ['Groups', GridIcon, hasUnreadGroups], ['Friends', ContactsIcon, hasUnreadFriend], ['Inbox', MessageIcon, hasUnreadDirect], ['Notifications', BellIcon, false]].map(([label, Icon, hasUnread]) => <button type="button" key={label} className={chatSection === label ? 'active' : ''} onClick={() =>{
              setChatSection(label)
              if(label === 'World'){
                setCurrentChat('World')
                onMarkChatRead('World')
              }
              if(label === 'Groups') setCurrentGroupChat('')
              if(label === 'Inbox') onViewInbox()
              if(label === 'Notifications') markNotificationsRead()
            }}><Icon className="ui-icon" aria-hidden="true" />{label}{hasUnread && <span className="chat-unread-dot" aria-label="Unread messages" />}</button>)}
          </nav>
        </section>
      </aside>
     {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

export default Community
