import { useRef } from 'react'
import Community from '../community/Community'
import Profile, { ProfileAvatar } from '../profile/Profile'
import Status from '../status/Status'
import './Wall.css'

function formatCount(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : count
}

export function PostComposer({
  composerText,
  composerImage,
  onComposerTextChange,
  onComposerImageChange,
  onComposerFileChange,
  onPublish,
  showToast,
}) {
  const fileInputRef = useRef(null)
  const submitPost = async (event) => {
    const published = await onPublish(event)
    if (published && fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form className="composer" onSubmit={submitPost}>
      <div className="avatar small avatar-peach">A</div>
      <div className="composer-fields">
        <div className="composer-photo-first">
          {composerImage && (
            <div className="attachment-preview">
              <img src={composerImage} alt="Selected post attachment" />
              <button className="remove-attachment" type="button" onClick={() => {
                URL.revokeObjectURL(composerImage)
                onComposerImageChange('')
                onComposerFileChange(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }} aria-label="Remove attached image">×</button>
            </div>
          )}
          <button type="button" className="composer-photo-button" onClick={() => fileInputRef.current?.click()}>
            {composerImage ? 'Change photo' : '＋ Add photo'}
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (!file.type.startsWith('image/')) {
                showToast('Choose an image file to attach.')
                event.target.value = ''
                return
              }
              if (composerImage.startsWith('blob:')) URL.revokeObjectURL(composerImage)
              onComposerFileChange(file)
              onComposerImageChange(URL.createObjectURL(file))
            }}
          />
        </div>
        <textarea
          aria-label="Write an update"
          placeholder="Add a caption to your photo..."
          value={composerText}
          onChange={(event) => onComposerTextChange(event.target.value)}
          rows="2"
        />
      </div>
      <button type="submit" className="primary-btn">Post</button>
    </form>
  )
}

export function PostCard({
  post,
  openMenu,
  savedPosts,
  commentDraft,
  onSetOpenMenu,
  onToggleSave,
  onDelete,
  onReport,
  onToggleLike,
  onShare,
  onAddComment,
  onCommentDraftChange,
  onProfileClick,
}) {
  return (
    <article className="post-card">
      <div className="post-header">
        <ProfileAvatar
          person={{ id: post.authorId, name: post.author, handle: post.handle, color: post.accent }}
          onClick={onProfileClick}
        />
        <div>
          <div className="author-row">
            <button type="button" className="profile-name-link" onClick={() => onProfileClick({ id: post.authorId, name: post.author, handle: post.handle, color: post.accent })}>{post.author}</button>
            {!post.mine && <span className="verified" aria-label="Verified">✓</span>}
          </div>
          <small>{post.handle} · {post.time}</small>
        </div>
        <div className="post-menu-wrap">
          <button type="button" className="ghost-btn" aria-label={`More options for ${post.author}'s post`} onClick={() => onSetOpenMenu(openMenu === post.id ? null : post.id)}>•••</button>
          {openMenu === post.id && (
            <div className="post-menu">
              <button type="button" onClick={() => onToggleSave(post.id)}>{savedPosts.includes(post.id) ? 'Remove saved post' : 'Save post'}</button>
              {post.mine
                ? <button type="button" onClick={() => onDelete(post.id)}>Delete post</button>
                : <button type="button" onClick={onReport}>Report post</button>}
            </div>
          )}
        </div>
      </div>
      {post.text && <p className="post-text">{post.text}</p>}
      {post.image && (
        <div className="photo-frame">
          <img src={post.image} alt={`Photo shared by ${post.author}`} />
        </div>
      )}
      <div className="post-actions">
        <button type="button" className={post.liked ? 'post-action liked' : 'post-action'} onClick={() => onToggleLike(post.id)} aria-pressed={post.liked}>
          <span aria-hidden="true">{post.liked ? '♥' : '♡'}</span> {formatCount(post.likes)}
        </button>
        <button type="button" className="post-action" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}>
          <span aria-hidden="true">▢</span> {formatCount(post.commentCount + post.comments.length)}
        </button>
        <button type="button" className="post-action" onClick={() => onShare(post)}>
          <span aria-hidden="true">↗</span> {formatCount(post.shares)}
        </button>
      </div>
      {post.comments.length > 0 && (
        <div className="comment-list">
          {post.comments.map((comment, index) => (
            <p key={`${post.id}-${index}`}><strong>{comment.author}</strong> {comment.text}</p>
          ))}
        </div>
      )}
      <form className="comment-form" onSubmit={(event) => onAddComment(event, post.id)}>
        <input
          id={`comment-${post.id}`}
          type="text"
          aria-label={`Comment on ${post.author}'s post`}
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(event.target.value)}
        />
        <button type="submit" aria-label="Send comment">Send</button>
      </form>
    </article>
  )
}

export function PostFeed({ posts, query, openMenu, savedPosts, commentDraft, postActions, onCommentDraftChange, onProfileClick, emptyState }) {
  return (
    <section className="feed" aria-label="Post feed">
      {posts.length
        ? posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            openMenu={openMenu}
            savedPosts={savedPosts}
            commentDraft={commentDraft}
            onSetOpenMenu={postActions.setOpenMenu}
            onToggleSave={postActions.toggleSave}
            onDelete={postActions.deletePost}
            onReport={postActions.reportPost}
            onToggleLike={postActions.toggleLike}
            onShare={postActions.sharePost}
            onAddComment={postActions.addComment}
            onCommentDraftChange={onCommentDraftChange}
            onProfileClick={onProfileClick}
          />
        ))
        : emptyState || <div className="empty-state"><span>✧</span><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try a different search.' : 'Share an update to get the conversation started.'}</p></div>}
    </section>
  )
}

function Wall({
  activePage,
  query,
  onQueryChange,
  onClearQuery,
  unreadCount,
  profileName,
  postCount,
  communities,
  joinedCommunities,
  people,
  friendRequests,
  onNavigate,
  onSignIn,
  showSignIn,
  onCreateCommunity,
  setJoinedCommunities,
  onSendFriendRequest,
  chatSection,
  onChatSectionChange,
  onSelectChatTab,
  currentChat,
  currentGroupChat,
  messages,
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  onOpenFriendChat,
  onOpenGroupChat,
  notifications,
  onMarkNotificationRead,
  onMarkNotificationsRead,
  events,
  setEvents,
  isAdmin,
  userId,
  showToast,
  posts,
  openMenu,
  savedPosts,
  commentDraft,
  postActions,
  onCommentDraftChange,
  composerText,
  composerImage,
  onComposerTextChange,
  onComposerImageChange,
  onComposerFileChange,
  profileProps,
}) {
  const term = query.trim().toLowerCase()
  const selectedGroup = communities.find((group) => group.name === currentGroupChat)
  const chatName = chatSection === 'World'
    ? 'World chat'
    : chatSection === 'Groups'
      ? selectedGroup?.name || 'Group chats'
      : currentChat
  const conversationKey = selectedGroup ? `group:${selectedGroup.id || selectedGroup.name}` : currentChat
  const chatMessages = messages[conversationKey] || []
  const visibleSuggestions = people.filter((friend) => friend.name.toLowerCase().includes(term))
  return (
    <div className="wall-layout">
      <aside className={activePage === 'Profile' ? 'wall-left wall-left-profile' : 'wall-left'}>
        <button type="button" className="wall-brand" onClick={() => onNavigate('Home')}>
          <span className="brand-mark">M</span><strong>Mahagedara</strong>
        </button>
        {activePage === 'Profile' ? (
          <Profile {...profileProps} />
        ) : (
          <>
            <section className="mini-card wall-profile">
              <button type="button" className="wall-profile-button" onClick={() => onNavigate('Profile')}>
                <span className="avatar large avatar-olive">A</span>
                <span><strong>{profileName}</strong><small>@amanda.silva</small></span>
              </button>
              <p>Finding my people, one coffee and creative project at a time.</p>
              <div className="wall-profile-stats"><span><strong>{postCount + 128}</strong><small>Friends</small></span><span><strong>8</strong><small>Groups</small></span><button type="button" aria-label="View profile" onClick={() => onNavigate('Profile')}>↗</button></div>
            </section>
            <Community
              communities={communities}
              joinedCommunities={joinedCommunities}
              setJoinedCommunities={setJoinedCommunities}
              query={query}
              userId={userId}
              showToast={showToast}
              onCreate={onCreateCommunity}
              onOpenGroupChat={onOpenGroupChat}
            />
          </>
        )}
        <div className="wall-left-footer">{showSignIn && <button type="button" onClick={onSignIn}>Sign in</button>}<span>· Community guidelines · Privacy</span></div>
      </aside>

      <main className="wall-center">
        {activePage === 'Profile' ? (
          <>
            <header className="topbar wall-topbar">
              <label className="search-wrap">
                <span aria-hidden="true">⌕</span>
                <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search people, groups, and little things you love" aria-label="Search people, groups and posts" />
                {query && <button type="button" className="clear-search" onClick={onClearQuery} aria-label="Clear search">×</button>}
              </label>
              <button className="wall-icon-button" type="button" aria-label="Notifications" onClick={() => onChatSectionChange('Notifications')}>♧{unreadCount > 0 && <span className="notification-dot" />}</button>
            </header>
            <div className="wall-profile-scroll">
              <Profile {...profileProps} view="posts" />
            </div>
          </>
        ) : (
          <>
            <div className="wall-feed-scroll">
              <header className="topbar wall-topbar">
                <label className="search-wrap">
                  <span aria-hidden="true">⌕</span>
                  <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search people, groups, and little things you love" aria-label="Search people, groups and posts" />
                  {query && <button type="button" className="clear-search" onClick={onClearQuery} aria-label="Clear search">×</button>}
                </label>
                <button className="wall-icon-button" type="button" aria-label="Notifications" onClick={() => onChatSectionChange('Notifications')}>♧{unreadCount > 0 && <span className="notification-dot" />}</button>
              </header>
              <Status
                events={events}
                setEvents={setEvents}
                isAdmin={isAdmin}
                userId={userId}
                profileName={profileName}
                showToast={showToast}
              />
              <PostComposer
                composerText={composerText}
                composerImage={composerImage}
                onComposerTextChange={onComposerTextChange}
                onComposerImageChange={onComposerImageChange}
                onComposerFileChange={onComposerFileChange}
                onPublish={postActions.publishPost}
                showToast={showToast}
              />
              <PostFeed
                posts={posts}
                query={query}
                openMenu={openMenu}
                savedPosts={savedPosts}
                commentDraft={commentDraft}
                postActions={postActions}
                onCommentDraftChange={onCommentDraftChange}
              />
            </div>
          </>
        )}
      </main>

      <aside className="wall-right">
        <section className="mini-card wall-friend-suggestions">
          <div className="section-head"><h3>People you may know</h3></div>
          <div className="suggested-friends">
            {visibleSuggestions.map((friend) => (
              <article className="suggested-friend" key={friend.name}>
                <span className="avatar small" style={{ background: friend.color }}>{friend.name[0]}</span><strong>{friend.name}</strong>
                <button type="button" onClick={() => onSendFriendRequest(friend.name)}>{friendRequests.includes(friend.name) ? 'Requested ✓' : '＋ Connect'}</button>
              </article>
            ))}
            {!visibleSuggestions.length && <p className="wall-muted">No people match your search.</p>}
          </div>
        </section>
        <section className="wall-chat-card">
          <header className="wall-chat-heading">
            <span className="wall-chat-avatar">{chatSection === 'World' ? '◎' : chatName[0]}</span>
            <span><strong>{chatSection === 'Notifications' ? 'Notifications' : chatSection === 'Inbox' ? currentChat : chatName}</strong><small>{chatSection === 'World' ? 'A little room for everyone' : chatSection === 'Notifications' ? 'Your latest activity' : 'Messages and conversations'}</small></span>
            <button type="button" aria-label="More chat options">•••</button>
          </header>
          {chatSection === 'Notifications' ? (
            <div className="wall-notification-list">
              {notifications.map((item) => <button type="button" key={item.id} className={item.read ? '' : 'unread'} onClick={() => onMarkNotificationRead(item.id)}>{item.text}<small>{item.time}</small></button>)}
              <button type="button" className="wall-mark-read" onClick={onMarkNotificationsRead}>Mark all as read</button>
            </div>
          ) : chatSection === 'Friends' ? (
            <div className="wall-chat-friends">{people.filter((friend) => friend.name.toLowerCase().includes(term)).map((friend) => <button type="button" key={friend.name} onClick={() => onOpenFriendChat(friend)}><span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span><span>{friend.name}<small>{friend.status}</small></span><i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} /></button>)}</div>
          ) : chatSection === 'Groups' && !selectedGroup ? (
            <div className="wall-chat-friends">{communities.filter((group) => joinedCommunities.includes(group.name) && `${group.name} ${group.description}`.toLowerCase().includes(term)).map((group) => <button type="button" key={group.name} onClick={() => onOpenGroupChat(group)}><span className="wall-group-icon" style={{ background: group.tone }}>✦</span><span>{group.name}<small>{group.members} members</small></span></button>)}</div>
          ) : (
            <>
              <div className="wall-chat-messages" aria-live="polite">
                {(chatSection === 'World' ? (messages.World || []) : chatMessages).map((message, index) => <div key={`${message.from}-${index}`} className={message.from === profileName ? 'wall-message own' : 'wall-message'}><small>{message.from} · {message.time}</small><p>{message.text}</p></div>)}
                {chatSection === 'World' && !(messages.World || []).length && <p className="wall-chat-empty">Welcome to the neighborhood. Say hello and start a conversation.</p>}
              </div>
              <form className="wall-chat-form" onSubmit={onSendMessage}>
                <input aria-label="Write a message" placeholder={chatSection === 'World' ? 'Say hello to the neighborhood...' : `Message ${chatName}...`} value={messageDraft} onChange={(event) => onMessageDraftChange(event.target.value)} />
                <button type="submit" aria-label="Send message">↑</button>
              </form>
              <p className="wall-chat-note">A shared space, a little kindness, a lot of good conversations.</p>
            </>
          )}
          <nav className="wall-chat-tabs" aria-label="Community sections">
            {[['World', '◎'], ['Groups', '▤'], ['Friends', '♧'], ['Inbox', '✉'], ['Notifications', '♢']].map(([label, icon]) => (
              <button type="button" key={label} className={chatSection === label ? 'active' : ''} onClick={() => {
                onSelectChatTab(label)
              }}><span>{icon}</span>{label}</button>
            ))}
          </nav>
        </section>
        <p className="wall-right-footer">Local community. Real connections.</p>
      </aside>
    </div>
  )
}

export default Wall
