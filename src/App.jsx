import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { supabase } from './supabase'

const navigation = [
  { label: 'Home', icon: '⌂' },
  { label: 'Explore', icon: '⌕' },
  { label: 'Communities', icon: '▦' },
  { label: 'Status', icon: '◉' },
  { label: 'Messages', icon: '✉' },
  { label: 'Settings', icon: '⚙' },
]

const startingPosts = [
  {
    id: 1,
    author: 'Nadun Perera',
    handle: '@nadun',
    time: '8 min ago',
    text: 'Sunrise walk by the lake with my squad. Nothing like a quiet morning to reset the mind.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    likes: 2400,
    comments: [],
    commentCount: 184,
    shares: 42,
    accent: '#d9a172',
    liked: false,
    mine: false,
  },
  {
    id: 2,
    author: 'Maya Silva',
    handle: '@maya_',
    time: '24 min ago',
    text: 'Weekend project update: organizing a community clean-up in Galle Face and inviting everyone to join.',
    likes: 1800,
    comments: [],
    commentCount: 96,
    shares: 30,
    accent: '#8ca685',
    liked: false,
    mine: false,
  },
]

const startingCommunities = [
  { name: 'Green Living', members: '12.4k', tone: '#b9d8b1', description: 'Small steps for a greener Sri Lanka.' },
  { name: 'City Makers', members: '8.7k', tone: '#f0c38f', description: 'Ideas and people shaping better cities.' },
  { name: 'Design Club', members: '5.3k', tone: '#d5bfd9', description: 'A home for curious creatives.' },
  { name: 'Food & Finds', members: '3.8k', tone: '#e8a78d', description: 'Share a good meal or a local gem.' },
]

const friends = [
  { name: 'Anya', status: 'online', color: '#bd8f75' },
  { name: 'Dilan', status: 'online', color: '#78977f' },
  { name: 'Ruzu', status: 'away', color: '#a897b4' },
  { name: 'Kim', status: 'online', color: '#bd9b68' },
]

const eventSlides = [
  {
    title: 'Good things are happening',
    detail: 'Slow Sunday table · 12 going',
    date: 'OCT\n24',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85',
    tag: 'THIS WEEKEND',
  },
  {
    title: 'Make a little mess',
    detail: 'Clay & coffee workshop · 8 going',
    date: 'OCT\n26',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=85',
    tag: 'CREATIVE MEETUP',
  },
  {
    title: 'A morning in the hills',
    detail: 'Ella trail walk · 16 going',
    date: 'NOV\n02',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=85',
    tag: 'OUTDOORS',
  },
]

const initialNotifications = [
  { id: 1, text: 'Anya liked your photo.', time: '5 min ago', read: false },
  { id: 2, text: 'Maya invited you to Green Living.', time: '1 hour ago', read: false },
  { id: 3, text: 'Dilan started following you.', time: 'Yesterday', read: true },
]

function formatCount(count){
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : count
}

function App(){
  const [activePage, setActivePage] = useState('Home')
  const [posts, setPosts] = useState(startingPosts)
  const [communities, setCommunities] = useState(startingCommunities)
  const [joinedCommunities, setJoinedCommunities] = useState(['Green Living'])
  const [people, setPeople] = useState(friends)
  const [savedPosts, setSavedPosts] = useState([])
  const [query, setQuery] = useState('')
  const [composerText, setComposerText] = useState('')
  const [composerImage, setComposerImage] = useState('')
  const [composerFile, setComposerFile] = useState(null)
  const [story, setStory] = useState(null)
  const [modal, setModal] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [toast, setToast] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [profileName, setProfileName] = useState('Amanda Silva')
  const [profileDraft, setProfileDraft] = useState('Amanda Silva')
  const [authMode, setAuthMode] = useState('signin')
  const [isSignedIn, setIsSignedIn] = useState(true)
  const [currentChat, setCurrentChat] = useState('World')
  const [currentGroupChat, setCurrentGroupChat] = useState('')
  const [chatSection, setChatSection] = useState('World')
  const [eventIndex, setEventIndex] = useState(0)
  const [events, setEvents] = useState(eventSlides)
  const [friendRequests, setFriendRequests] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState(null)
  const [messages, setMessages] = useState({
    World: [
      { from: 'Jamie Lee', text: 'Morning, neighbors! Any good coffee spots for a rainy Sunday?', time: '10:20' },
      { from: 'Maya Chen', text: 'Sunny in Bloom, always. Grab the window seat!', time: '10:34' },
    ],
    Anya: [{ from: 'Anya', text: 'Hey! Are you coming to the community meet-up?', time: '10:42' }],
    Dilan: [{ from: 'Dilan', text: 'Sent you the photos from yesterday.', time: 'Yesterday' }],
    Ruzu: [{ from: 'Ruzu', text: 'Thanks for the recommendation!', time: 'Yesterday' }],
    Kim: [{ from: 'Kim', text: 'Let’s catch up soon!', time: 'Monday' }],
  })
  const [messageDraft, setMessageDraft] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    publicProfile: true,
  })
  const fileInputRef = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    let active = true
    const loadWallData = async () => {
      if (!supabase) return
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!active) return
      if (authError && authError.name !== 'AuthSessionMissingError'){
        showToast(`Could not load your Supabase session: ${authError.message}`)
      }

      if (user){
        setUserId(user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, role')
          .eq('id', user.id)
          .maybeSingle()
        if (!active) return
        if (profileError){
          showToast(`Could not load your profile: ${profileError.message}`)
          return
        }
        if (supabase && !userId){
          showToast('Sign in to your Supabase account before posting.')
          return
        }
        if (profile?.display_name) setProfileName(profile.display_name)
        setIsAdmin(profile?.role === 'admin')
      }

      const { data: wallPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, author_id, author_name, handle, body, image_url, likes, comment_count, is_event, event_title, event_date, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!active) return
      if (postsError){
        showToast(`Could not load posts: ${postsError.message}`)
        return
      }
      if (wallPosts?.length){
        const regularPosts = wallPosts.filter((post) => !post.is_event)
        setPosts(regularPosts.map((post) => ({
          id: post.id,
          author: post.author_name,
          handle: post.handle || '',
          time: new Date(post.created_at).toLocaleDateString(),
          text: post.body || '',
          image: post.image_url || '',
          likes: post.likes || 0,
          comments: [],
          commentCount: post.comment_count || 0,
          shares: 0,
          accent: '#d9a172',
          liked: false,
          mine: post.author_id === user?.id,
        })))
        if (user && regularPosts.length){
          const { data: likes, error: likesError } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', regularPosts.map((post) => post.id))
          if (!active) return
          if (likesError) showToast(`Could not load your post likes: ${likesError.message}`)
          else {
            const likedIds = new Set(likes.map((like) => like.post_id))
            setPosts((current) => current.map((post) => ({ ...post, liked: likedIds.has(post.id) })))
          }
        }
        const remoteEvents = wallPosts.filter((post) => post.is_event && post.event_title).map((post) => ({
          title: post.event_title,
          detail: `${post.event_date ? new Date(post.event_date).toLocaleDateString() : 'Community event'} · ${post.body || 'Join your neighbors'}`,
          date: post.event_date ? new Date(post.event_date).toLocaleDateString('en', { month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n') : 'SOON',
          image: post.image_url || eventSlides[0].image,
          tag: 'COMMUNITY EVENT',
        }))
        if (remoteEvents.length) setEvents(remoteEvents)
      }

      const { data: groupRows, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, description, group_members(count)')
        .order('created_at', { ascending: false })
      if (!active) return
      if (groupsError){
        showToast(`Could not load groups: ${groupsError.message}`)
      } else if (groupRows?.length){
        const remoteGroups = groupRows.map((group, index) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          members: String(group.group_members?.[0]?.count ?? 0),
          tone: startingCommunities[index % startingCommunities.length].tone,
        }))
        setCommunities(remoteGroups)
        if (user){
          const { data: memberships, error: membershipsError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id)
          if (!active) return
          if (membershipsError) showToast(`Could not load your group memberships: ${membershipsError.message}`)
          else {
            const memberIds = new Set(memberships.map((membership) => membership.group_id))
            setJoinedCommunities(remoteGroups.filter((group) => memberIds.has(group.id)).map((group) => group.name))
          }
        }
      }

      const { data: profiles, error: peopleError } = await supabase
        .from('profiles')
        .select('id, display_name, handle')
        .neq('id', user?.id || '00000000-0000-0000-0000-000000000000')
        .limit(8)
      if (!active) return
      if (peopleError) showToast(`Could not load people suggestions: ${peopleError.message}`)
      else if (profiles?.length){
        setPeople(profiles.map((person, index) => ({
          id: person.id,
          name: person.display_name,
          status: index % 2 ? 'away' : 'online',
          color: friends[index % friends.length].color,
        })))
        if (user){
          const { data: requests, error: requestsError } = await supabase
            .from('friend_requests')
            .select('recipient_id')
            .eq('sender_id', user.id)
            .eq('status', 'pending')
          if (!active) return
          if (requestsError) showToast(`Could not load your friend requests: ${requestsError.message}`)
          else {
            const requestedIds = new Set(requests.map((request) => request.recipient_id))
            setFriendRequests(profiles.filter((person) => requestedIds.has(person.id)).map((person) => person.display_name))
          }
        }
      }

      const { data: worldMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, sender_name, body, created_at')
        .eq('room', 'world')
        .order('created_at', { ascending: true })
        .limit(30)
      if (!active) return
      if (messagesError) showToast(`Could not load world chat: ${messagesError.message}`)
      else if (worldMessages?.length){
        setMessages((current) => ({
          ...current,
          World: worldMessages.map((message) => ({
            from: message.sender_id === user?.id ? profileName : message.sender_name,
            text: message.body,
            time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })),
        }))
      }

      if (user){
        const { data: userNotifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('id, body, read_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (!active) return
        if (notificationsError) showToast(`Could not load notifications: ${notificationsError.message}`)
        else if (userNotifications?.length){
          setNotifications(userNotifications.map((item) => ({
            id: item.id,
            text: item.body,
            time: new Date(item.created_at).toLocaleDateString(),
            read: Boolean(item.read_at),
          })))
        }
      }
    }

    loadWallData()
    return () => {
      active = false
    }
  }, [profileName, showToast, userId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setEventIndex((index) => (index + 1) % events.length)
    }, 6000)
    return () => window.clearInterval(intervalId)
  }, [events.length])

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase()
    const source = activePage === 'Status'
      ? posts.filter((post) => post.mine)
      : activePage === 'Profile'
        ? posts.filter((post) => post.mine)
        : posts

    if (!term) return source
    return source.filter((post) => `${post.author} ${post.handle} ${post.text}`.toLowerCase().includes(term))
  }, [activePage, posts, query])

  const unreadCount = notifications.filter((item) => !item.read).length

  const navigate = (page) => {
    setActivePage(page)
    setQuery('')
    setNotificationsOpen(false)
    setOpenMenu(null)
  }

  const publishPost = async (event) => {
    event.preventDefault()
    const text = composerText.trim()
    if (!text && !composerImage){
      showToast('Write an update or add a photo before posting.')
      return
    }

    let postId = Date.now()
    let imageUrl = composerImage
    if (supabase && userId){
      if (composerFile){
        const safeName = composerFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const imagePath = `${userId}/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('post-images').upload(imagePath, composerFile, { upsert: false })
        if (uploadError){
          showToast(`Could not upload your photo: ${uploadError.message}`)
          return
        }
        imageUrl = supabase.storage.from('post-images').getPublicUrl(imagePath).data.publicUrl
      }
      const { data, error } = await supabase.from('posts').insert({
        author_id: userId,
        author_name: profileName,
        handle: '@amanda',
        body: text,
        image_url: imageUrl || null,
      }).select('id').single()
      if (error){
        showToast(`Could not publish your post: ${error.message}`)
        return
      }
      postId = data.id
    }
    const newPost = {
      id: postId,
      author: profileName,
      handle: '@amanda',
      time: 'just now',
      text,
      image: imageUrl,
      likes: 0,
      comments: [],
      commentCount: 0,
      shares: 0,
      accent: '#d9a172',
      liked: false,
      mine: true,
    }
    setPosts((current) => [newPost, ...current])
    setComposerText('')
    if (supabase && userId && composerImage.startsWith('blob:')) URL.revokeObjectURL(composerImage)
    setComposerImage('')
    setComposerFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Your update has been posted.')
    setActivePage('Home')
  }

  const toggleLike = async (postId) => {
    const post = posts.find((item) => item.id === postId)
    if (supabase && !userId){
      showToast('Sign in to like posts.')
      return
    }
    if (supabase && userId && typeof postId === 'string'){
      const request = post?.liked
        ? supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
        : supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
      const { error } = await request
      if (error){
        showToast(`Could not update your like: ${error.message}`)
        return
      }
    }
    setPosts((current) => current.map((post) => post.id === postId
      ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      : post))
  }

  const addComment = async (event, postId) => {
    event.preventDefault()
    const text = commentDraft.trim()
    if (!text) return
    if (supabase && !userId){
      showToast('Sign in to comment on posts.')
      return
    }
    if (supabase && userId && typeof postId === 'string'){
      const { error } = await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: userId,
        author_name: profileName,
        body: text,
      })
      if (error){
        showToast(`Could not add your comment: ${error.message}`)
        return
      }
    }
    setPosts((current) => current.map((post) => post.id === postId
      ? { ...post, comments: [...post.comments, { author: profileName, text }] }
      : post))
    setCommentDraft('')
    showToast('Comment added.')
  }

  const toggleSave = (postId) => {
    const isSaved = savedPosts.includes(postId)
    setSavedPosts((current) => isSaved ? current.filter((id) => id !== postId) : [...current, postId])
    setOpenMenu(null)
    showToast(isSaved ? 'Post removed from your saved items.' : 'Post saved for later.')
  }

  const sharePost = async (post) => {
    const shareText = `${post.author} on Mahagedara: ${post.text}`
    try {
      if (navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(shareText)
        showToast('Post text copied to clipboard.')
      } else {
        setModal({ type: 'share', post })
      }
    } catch {
      setModal({ type: 'share', post })
    }
  }

  const toggleJoin = async (name) => {
    const isMember = joinedCommunities.includes(name)
    const group = communities.find((item) => item.name === name)
    if (supabase && !userId){
      showToast('Sign in to join a group.')
      return
    }
    if (supabase && userId && group?.id){
      const request = isMember
        ? supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', userId)
        : supabase.from('group_members').insert({ group_id: group.id, user_id: userId })
      const { error } = await request
      if (error){
        showToast(`Could not update group membership: ${error.message}`)
        return
      }
    }
    setJoinedCommunities((current) => isMember ? current.filter((item) => item !== name) : [...current, name])
    showToast(isMember ? `You left ${name}.` : `You joined ${name}.`)
  }

  const sendMessage = (event) => {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text) return
    if (supabase && !userId){
      showToast('Sign in to send a message.')
      return
    }
    const isWorldChat = activePage === 'Home' && chatSection === 'World'
    const selectedGroup = activePage === 'Home' && chatSection === 'Groups'
      ? communities.find((group) => group.name === currentGroupChat)
      : null
    if (activePage === 'Home' && chatSection === 'Groups' && !selectedGroup){
      showToast('Choose a group before sending a message.')
      return
    }
    if (selectedGroup && !joinedCommunities.includes(selectedGroup.name)){
      showToast('Join this group before sending a message.')
      return
    }
    const conversationKey = isWorldChat
      ? 'World'
      : selectedGroup
        ? `group:${selectedGroup.id || selectedGroup.name}`
        : currentChat
    setMessages((current) => ({
      ...current,
      [conversationKey]: [...(current[conversationKey] || []), { from: profileName, text, time: 'now' }],
    }))
    if (supabase && userId && isWorldChat){
      supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        recipient_id: null,
        body: text,
        room: 'world',
      }).then(({ error }) => {
        if (error) showToast(`Could not send your message: ${error.message}`)
      })
    } else if (supabase && userId && selectedGroup?.id){
      supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        group_id: selectedGroup.id,
        body: text,
      }).then(({ error }) => {
        if (error) showToast(`Could not send your group message: ${error.message}`)
      })
    } else if (supabase && userId && selectedGroup){
      showToast('This group is not connected to Supabase yet.')
      return
    } else if (supabase && userId){
      const recipient = people.find((person) => person.name === currentChat)
      if (recipient?.id){
        supabase.from('messages').insert({
          sender_id: userId,
          sender_name: profileName,
          recipient_id: recipient.id,
          body: text,
        }).then(({ error }) => {
          if (error) showToast(`Could not send your message: ${error.message}`)
        })
      }
    }
    setMessageDraft('')
  }

  const openFriendChat = async (friend) => {
    setCurrentChat(friend.name)
    setChatSection('Inbox')
    if (!supabase || !userId || !friend.id) return
    const { data: directMessages, error } = await supabase
      .from('messages')
      .select('sender_id, sender_name, body, created_at')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${friend.id}),and(sender_id.eq.${friend.id},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(50)
    if (error){
      showToast(`Could not load your conversation: ${error.message}`)
      return
    }
    setMessages((current) => ({
      ...current,
      [friend.name]: directMessages.map((message) => ({
        from: message.sender_id === userId ? profileName : message.sender_name,
        text: message.body,
        time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    }))
  }

  const openGroupChat = async (group) => {
    setCurrentGroupChat(group.name)
    setChatSection('Groups')
    if (!supabase || !userId || !group.id) return
    const { data: groupMessages, error } = await supabase
      .from('messages')
      .select('sender_id, sender_name, body, created_at')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(50)
    if (error){
      showToast(`Could not load group messages: ${error.message}`)
      return
    }
    setMessages((current) => ({
      ...current,
      [`group:${group.id}`]: groupMessages.map((message) => ({
        from: message.sender_id === userId ? profileName : message.sender_name,
        text: message.body,
        time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    }))
  }

  const sendFriendRequest = async (name) => {
    const person = people.find((friend) => friend.name === name)
    if (supabase && !userId){
      showToast('Sign in to connect with people.')
      return
    }
    if (supabase && userId && person?.id){
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: userId,
        recipient_id: person.id,
      })
      if (error){
        showToast(`Could not send your friend request: ${error.message}`)
        return
      }
    }
    setFriendRequests((current) => current.includes(name) ? current : [...current, name])
    showToast(`Friend request sent to ${name}.`)
  }

  const renderWall = () => {
    const term = query.trim().toLowerCase()
    const event = events[eventIndex % events.length]
    const selectedGroup = communities.find((group) => group.name === currentGroupChat)
    const chatName = chatSection === 'World'
      ? 'World chat'
      : chatSection === 'Groups'
        ? selectedGroup?.name || 'Group chats'
        : currentChat
    const conversationKey = selectedGroup ? `group:${selectedGroup.id || selectedGroup.name}` : currentChat
    const chatMessages = messages[conversationKey] || []
    const visibleSuggestions = people.filter((friend) => friend.name.toLowerCase().includes(term))
    const visibleGroups = communities.filter((community) => `${community.name} ${community.description}`.toLowerCase().includes(term))
    return (
      <div className="wall-layout">
        <aside className="wall-left">
          <button type="button" className="wall-brand" onClick={() => navigate('Home')}>
            <span className="brand-mark">M</span><strong>Mahagedara</strong>
          </button>
          <section className="mini-card wall-profile">
            <button type="button" className="wall-profile-button" onClick={() => navigate('Profile')}>
              <span className="avatar large avatar-olive">A</span>
              <span><strong>{profileName}</strong><small>@amanda.silva</small></span>
            </button>
            <p>Finding my people, one coffee and creative project at a time.</p>
            <div className="wall-profile-stats"><span><strong>{posts.filter((post) => post.mine).length + 128}</strong><small>Friends</small></span><span><strong>8</strong><small>Groups</small></span><button type="button" aria-label="View profile" onClick={() => navigate('Profile')}>↗</button></div>
          </section>
          <section className="mini-card wall-group-section">
            <div className="section-head"><h3>Find your circle</h3><button type="button" onClick={() => navigate('Communities')}>See all</button></div>
            {visibleGroups.filter((community) => !joinedCommunities.includes(community.name)).slice(0, 2).map((community, index) => (
              <article className="wall-group-suggestion" key={community.name}>
                <div className={`wall-group-cover group-cover-${index}`} />
                <strong>{community.name}</strong><small>{community.members} members · {community.description}</small>
                <button type="button" className="secondary-btn compact" onClick={() => toggleJoin(community.name)}>Join</button>
              </article>
            ))}
            {!visibleGroups.some((community) => !joinedCommunities.includes(community.name)) && <p className="wall-muted">You’ve found all the circles matching your search.</p>}
          </section>
          <section className="mini-card wall-group-section joined-groups">
            <div className="section-head"><h3>Your groups</h3><button type="button" onClick={() => navigate('Communities')}>View all</button></div>
            {communities.filter((community) => joinedCommunities.includes(community.name)).map((community) => (
              <button type="button" className="wall-joined-group" key={community.name} onClick={() => navigate('Communities')}>
                <span className="wall-group-icon" style={{ background: community.tone }}>✦</span><span><strong>{community.name}</strong><small>New conversations</small></span><small>{community.members}</small>
              </button>
            ))}
            <button type="button" className="wall-create-group" onClick={() => setModal({ type: 'create-community' })}>＋ Create a group</button>
          </section>
          <div className="wall-left-footer">{supabase && !userId && <button type="button" onClick={() => setIsSignedIn(false)}>Sign in</button>}<button type="button" onClick={() => navigate('Settings')}>Settings</button><span>· Community guidelines · Privacy</span></div>
        </aside>

        <main className="wall-center">
          <header className="topbar wall-topbar">
            <label className="search-wrap">
              <span aria-hidden="true">⌕</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, groups, and little things you love" aria-label="Search people, groups and posts" />
              {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </label>
            <button className="wall-icon-button" type="button" aria-label="Notifications" onClick={() => { setChatSection('Notifications'); setNotificationsOpen(!notificationsOpen) }}>♧{unreadCount > 0 && <span className="notification-dot" />}</button>
          </header>
          <section className="wall-events" aria-label="Community events">
            <div className="wall-event-heading"><div><h2>{event.title}</h2><small>{event.detail}</small></div><div className="wall-event-controls"><button type="button" aria-label="Previous event" onClick={() => setEventIndex((eventIndex + events.length - 1) % events.length)}>‹</button><button type="button" aria-label="Next event" onClick={() => setEventIndex((eventIndex + 1) % events.length)}>›</button>{isAdmin && <button type="button" className="event-create" onClick={() => setModal({ type: 'create-event' })}>＋</button>}</div></div>
            <div className="wall-event-track">
              <div className="wall-event-feature-viewport">
                <div className="wall-event-feature-track" style={{ transform: `translateX(-${(eventIndex % events.length) * 100}%)` }}>
                  {events.map((slide) => <article key={slide.title} className="wall-event-feature" style={{ backgroundImage: `linear-gradient(0deg, rgba(30,22,20,.72), transparent 72%), url("${slide.image}")` }}>
                    <span className="wall-event-tag">✦ {slide.tag}</span><span className="wall-event-date">{slide.date.split('\n').map((line) => <span key={line}>{line}</span>)}</span><p>{slide.detail.split(' · ')[0]}</p>
                  </article>)}
                </div>
              </div>
              <article className="wall-event-side"><img src={events[(eventIndex + 1) % events.length].image} alt="" /><small>THIS WEEK · 2 PM</small><strong>{events[(eventIndex + 1) % events.length].title}</strong><span>{events[(eventIndex + 1) % events.length].detail}</span></article>
            </div>
            <div className="wall-event-dots" aria-hidden="true">{events.map((slide, index) => <span key={slide.title} className={index === eventIndex % events.length ? 'active' : ''} />)}</div>
          </section>
          <div className="wall-feed-scroll">
            {renderComposer()}
            <section className="feed" aria-label="Post feed">
              {filteredPosts.length ? filteredPosts.map(renderPost) : <div className="empty-state"><span>✧</span><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try another search.' : 'Share an update to get the conversation started.'}</p></div>}
            </section>
          </div>
        </main>

        <aside className="wall-right">
          <section className="mini-card wall-friend-suggestions">
            <div className="section-head"><h3>People you may know</h3><button type="button" onClick={() => setChatSection('Friends')}>See all</button></div>
            <div className="suggested-friends">
              {visibleSuggestions.slice(0, 4).map((friend) => (
                <article className="suggested-friend" key={friend.name}>
                  <span className="avatar small" style={{ background: friend.color }}>{friend.name[0]}</span><strong>{friend.name}</strong><button type="button" onClick={() => sendFriendRequest(friend.name)}>{friendRequests.includes(friend.name) ? 'Requested ✓' : '＋ Connect'}</button>
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
                {notifications.map((item) => <button type="button" key={item.id} className={item.read ? '' : 'unread'} onClick={() => markNotificationRead(item.id)}>{item.text}<small>{item.time}</small></button>)}
                <button type="button" className="wall-mark-read" onClick={markNotificationsRead}>Mark all as read</button>
              </div>
            ) : chatSection === 'Friends' ? (
              <div className="wall-chat-friends">{people.filter((friend) => friend.name.toLowerCase().includes(term)).map((friend) => <button type="button" key={friend.name} onClick={() => openFriendChat(friend)}><span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span><span>{friend.name}<small>{friend.status}</small></span><i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} /></button>)}</div>
            ) : chatSection === 'Groups' && !selectedGroup ? (
              <div className="wall-chat-friends">{communities.filter((group) => joinedCommunities.includes(group.name) && `${group.name} ${group.description}`.toLowerCase().includes(term)).map((group) => <button type="button" key={group.name} onClick={() => openGroupChat(group)}><span className="wall-group-icon" style={{ background: group.tone }}>✦</span><span>{group.name}<small>{group.members} members</small></span></button>)}</div>
            ) : (
              <>
                <div className="wall-chat-messages" aria-live="polite">
                  {(chatSection === 'World' ? (messages.World || []) : chatMessages).map((message, index) => <div key={`${message.from}-${index}`} className={message.from === profileName ? 'wall-message own' : 'wall-message'}><small>{message.from} · {message.time}</small><p>{message.text}</p></div>)}
                  {chatSection === 'World' && !(messages.World || []).length && <p className="wall-chat-empty">Welcome to the neighborhood. Say hello and start a conversation.</p>}
                </div>
                <form className="wall-chat-form" onSubmit={(event) => {
                  sendMessage(event)
                }}>
                  <input aria-label="Write a message" placeholder={chatSection === 'World' ? 'Say hello to the neighborhood...' : `Message ${chatName}...`} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} />
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
                if (label === 'Inbox') setCurrentChat('Anya')
                if (label === 'Notifications') markNotificationsRead()
              }}><span>{icon}</span>{label}</button>)}
            </nav>
          </section>
          <p className="wall-right-footer">Local community. Real connections.</p>
        </aside>
      </div>
    )
  }

  const markNotificationsRead = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    if (supabase && userId){
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) showToast(`Could not update notifications: ${error.message}`)
    }
  }

  const markNotificationRead = async (notificationId) => {
    setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read: true } : item))
    if (supabase && userId && typeof notificationId === 'string'){
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
      if (error) showToast(`Could not update notification: ${error.message}`)
    }
  }

  const updateSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }

  const renderComposer = () => (
    <form className="composer" onSubmit={publishPost}>
      <div className="avatar small avatar-peach">A</div>
      <div className="composer-fields">
        <textarea
          aria-label="Write an update"
          placeholder="Share an update with your community"
          value={composerText}
          onChange={(event) => setComposerText(event.target.value)}
          rows="1"
        />
        {composerImage && (
          <div className="attachment-preview">
            <img src={composerImage} alt="Selected post attachment" />
            <button className="remove-attachment" type="button" onClick={() => {
              URL.revokeObjectURL(composerImage)
              setComposerImage('')
              setComposerFile(null)
            }} aria-label="Remove attached image">×</button>
          </div>
        )}
        <div className="composer-tools">
          <button type="button" className="text-action" onClick={() => fileInputRef.current?.click()}>▧ <span>Photo</span></button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (!file.type.startsWith('image/')){
                showToast('Choose an image file to attach.')
                return
              }
              if (composerImage.startsWith('blob:')) URL.revokeObjectURL(composerImage)
              setComposerFile(file)
              setComposerImage(URL.createObjectURL(file))
            }}
          />
          <span className="composer-hint">Posting to your community</span>
        </div>
      </div>
      <button type="submit" className="primary-btn">Post</button>
    </form>
  )

  const renderPost = (post) => (
    <article key={post.id} className="post-card">
      <div className="post-header">
        <div className="avatar small" style={{ background: post.accent }}>{post.author.slice(0, 1)}</div>
        <div>
          <div className="author-row">
            <strong>{post.author}</strong>
            {!post.mine && <span className="verified" aria-label="Verified">✓</span>}
          </div>
          <small>{post.handle} · {post.time}</small>
        </div>
        <div className="post-menu-wrap">
          <button type="button" className="ghost-btn" aria-label={`More options for ${post.author}'s post`} onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}>•••</button>
          {openMenu === post.id && (
            <div className="post-menu">
              <button type="button" onClick={() => toggleSave(post.id)}>{savedPosts.includes(post.id) ? 'Remove saved post' : 'Save post'}</button>
              {post.mine
                ? <button type="button" onClick={() => {
                  setPosts((current) => current.filter((item) => item.id !== post.id))
                  setOpenMenu(null)
                  showToast('Your post was deleted.')
                }}>Delete post</button>
                : <button type="button" onClick={() => {
                  setOpenMenu(null)
                  showToast('Thanks. This post has been reported for review.')
                }}>Report post</button>}
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
        <button type="button" className={post.liked ? 'post-action liked' : 'post-action'} onClick={() => toggleLike(post.id)} aria-pressed={post.liked}>
          <span aria-hidden="true">{post.liked ? '♥' : '♡'}</span> {formatCount(post.likes)}
        </button>
        <button type="button" className="post-action" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}>
          <span aria-hidden="true">▢</span>           {formatCount(post.commentCount + post.comments.length)}
        </button>
        <button type="button" className="post-action" onClick={() => sharePost(post)}>
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
      <form className="comment-form" onSubmit={(event) => addComment(event, post.id)}>
        <input
          id={`comment-${post.id}`}
          type="text"
          aria-label={`Comment on ${post.author}'s post`}
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => setCommentDraft(event.target.value)}
        />
        <button type="submit" aria-label="Send comment">Send</button>
      </form>
    </article>
  )

  const renderFeed = (title, subtitle, showStories = false) => (
    <>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {activePage === 'Explore' && <span className="feed-label">For you</span>}
      </div>
      {showStories && (
        <section className="hero-strip" aria-label="Stories">
          {[
            { name: 'Your story', color: '#d88a62', isYou: true },
            { name: 'Ari', color: '#8ca685' },
            { name: 'Nim', color: '#c8a27f' },
            { name: 'Sami', color: '#9f8da8' },
            { name: 'Lah', color: '#6a7a99' },
          ].map((item) => (
            <button type="button" key={item.name} className="story" onClick={() => item.isYou ? setActivePage('Status') : setStory(item)}>
              <span className="story-ring" style={{ background: item.color }}><span>{item.isYou ? '+' : item.name.slice(0, 1)}</span></span>
              <small>{item.name}</small>
            </button>
          ))}
        </section>
      )}
      {(showStories || activePage === 'Status') && renderComposer()}
      <section className="feed" aria-label="Post feed">
        {filteredPosts.length
          ? filteredPosts.map(renderPost)
          : <div className="empty-state"><span>✧</span><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try a different search.' : 'Share an update to get the conversation started.'}</p></div>}
      </section>
    </>
  )

  const renderCommunities = () => {
    const term = query.trim().toLowerCase()
    const visibleCommunities = communities.filter((community) => `${community.name} ${community.description}`.toLowerCase().includes(term))
    return (
      <>
        <div className="section-title">
          <div><h2>Communities</h2><p>Find your people and join the conversation.</p></div>
          <button className="primary-btn compact" type="button" onClick={() => setModal({ type: 'create-community' })}>＋ Create</button>
        </div>
        <div className="community-grid">
          {visibleCommunities.map((community) => {
            const member = joinedCommunities.includes(community.name)
            return (
              <article className="community-card" key={community.name}>
                <div className="community-cover" style={{ background: `linear-gradient(135deg, ${community.tone}, #fff3e4)` }}>
                  <span>✦</span>
                </div>
                <div className="community-card-body">
                  <h3>{community.name}</h3>
                  <p>{community.description}</p>
                  <div className="community-card-footer">
                    <small>{community.members} members</small>
                    <button className={member ? 'secondary-btn joined' : 'secondary-btn'} type="button" onClick={() => toggleJoin(community.name)}>{member ? 'Joined ✓' : 'Join'}</button>
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

  const renderMessages = () => {
    const chatMessages = messages[currentChat] || []
    return (
      <>
        <div className="section-title"><div><h2>Messages</h2><p>Keep in touch with your friends.</p></div></div>
        <section className="messages-layout">
          <div className="conversation-list">
            {people.map((friend) => (
              <button type="button" key={friend.name} className={currentChat === friend.name ? 'conversation active' : 'conversation'} onClick={() => setCurrentChat(friend.name)}>
                <span className="avatar small" style={{ background: friend.color }}>{friend.name[0]}</span>
                <span><strong>{friend.name}</strong><small>{(messages[friend.name] || []).at(-1)?.text || friend.status}</small></span>
                <i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} />
              </button>
            ))}
          </div>
          <div className="chat-panel">
            <div className="chat-heading"><span className="avatar tiny avatar-olive">{currentChat[0]}</span><div><strong>{currentChat}</strong><small>{people.find((friend) => friend.name === currentChat)?.status}</small></div></div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={`${currentChat}-${index}`} className={message.from === profileName ? 'message-bubble own' : 'message-bubble'}>
                  <p>{message.text}</p><small>{message.time}</small>
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input aria-label="Write a message" placeholder={`Message ${currentChat}...`} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} />
              <button className="primary-btn compact" type="submit">Send</button>
            </form>
          </div>
        </section>
      </>
    )
  }

  const renderSettings = () => (
    <>
      <div className="section-title"><div><h2>Settings</h2><p>Make Mahagedara feel like home.</p></div></div>
      <section className="settings-card">
        <div className="settings-group">
          <h3>Appearance</h3>
          <div className="setting-row"><span><strong>Dark appearance</strong><small>Use a darker color palette.</small></span><button type="button" className={settings.darkMode ? 'switch on' : 'switch'} role="switch" aria-checked={settings.darkMode} onClick={() => updateSetting('darkMode')}><span /></button></div>
        </div>
        <div className="settings-group">
          <h3>Privacy & notifications</h3>
          <div className="setting-row"><span><strong>Push notifications</strong><small>Get notified about activity and messages.</small></span><button type="button" className={settings.notifications ? 'switch on' : 'switch'} role="switch" aria-checked={settings.notifications} onClick={() => updateSetting('notifications')}><span /></button></div>
          <div className="setting-row"><span><strong>Public profile</strong><small>Let people find and follow your profile.</small></span><button type="button" className={settings.publicProfile ? 'switch on' : 'switch'} role="switch" aria-checked={settings.publicProfile} onClick={() => updateSetting('publicProfile')}><span /></button></div>
        </div>
        <div className="settings-group account-settings">
          <h3>Account</h3>
          <div className="setting-row"><span><strong>{profileName}</strong><small>@amanda · Personal profile</small></span><button type="button" className="secondary-btn" onClick={() => {
            setProfileDraft(profileName)
            setModal({ type: 'edit-profile' })
          }}>Edit profile</button></div>
          <button type="button" className="text-action danger-action" onClick={async () => {
            if (supabase){
              const { error } = await supabase.auth.signOut()
              if (error){
                showToast(`Could not sign out: ${error.message}`)
                return
              }
            }
            setUserId(null)
            setIsAdmin(false)
            setIsSignedIn(false)
          }}>Sign out</button>
        </div>
      </section>
    </>
  )

  const renderProfile = () => (
    <>
      <section className="profile-page-cover">
        <div className="cover-art"><span>Good things grow together</span></div>
        <div className="profile-page-heading">
          <div className="avatar profile-page-avatar avatar-olive">A</div>
          <div><h2>{profileName}</h2><p>@amanda · Colombo, Sri Lanka</p></div>
          <button className="secondary-btn" type="button" onClick={() => {
            setProfileDraft(profileName)
            setModal({ type: 'edit-profile' })
          }}>Edit profile</button>
        </div>
        <p className="profile-bio">Finding good people, good places and little reasons to smile. 🌿</p>
        <div className="profile-numbers"><span><strong>{posts.filter((post) => post.mine).length + 18}</strong> posts</span><span><strong>86k</strong> followers</span><span><strong>132</strong> following</span></div>
      </section>
      <div className="section-title profile-feed-title"><div><h2>Your posts</h2><p>Updates you have shared with your community.</p></div></div>
      <section className="feed">
        {filteredPosts.length ? filteredPosts.map(renderPost) : <div className="empty-state"><h3>No posts yet</h3><p>Write your first update from the home feed.</p><button type="button" className="secondary-btn" onClick={() => navigate('Home')}>Go to Home</button></div>}
      </section>
    </>
  )

  const pageDetails = {
    Home: ['Good morning, Amanda', 'Your people, places and conversations in one place.'],
    Explore: ['Explore', 'Discover stories and conversations from your community.'],
    Status: ['Your status', 'Share what is on your mind with your community.'],
  }

  const renderMain = () => {
    if (activePage === 'Communities') return renderCommunities()
    if (activePage === 'Messages') return renderMessages()
    if (activePage === 'Settings') return renderSettings()
    if (activePage === 'Profile') return renderProfile()
    const [title, subtitle] = pageDetails[activePage] || pageDetails.Home
    return renderFeed(title, subtitle, activePage === 'Home')
  }

  if (!isSignedIn){
    return (
      <div className={settings.darkMode ? 'page-shell dark-mode auth-shell' : 'page-shell auth-shell'}>
        <section className="auth-card">
          <div className="brand-mark auth-brand">M</div>
          <p className="eyebrow">your community is waiting</p>
          <h1>Welcome home.</h1>
          <p className="auth-intro">Sign in to continue to your Mahagedara demo.</p>
          <form onSubmit={async (event) => {
            event.preventDefault()
            if (!supabase){
              showToast('Add your Supabase URL and publishable key to enable sign in.')
              return
            }
            const formData = new FormData(event.currentTarget)
            const email = String(formData.get('email') || '')
            const password = String(formData.get('password') || '')
            const result = authMode === 'signup'
              ? await supabase.auth.signUp({
                email,
                password,
                options: { data: { display_name: String(formData.get('display-name') || '').trim() } },
              })
              : await supabase.auth.signInWithPassword({ email, password })
            if (result.error){
              showToast(`Could not ${authMode === 'signup' ? 'create your account' : 'sign in'}: ${result.error.message}`)
              return
            }
            if (authMode === 'signup' && !result.data.session){
              showToast('Check your email to confirm your new account, then sign in.')
              setAuthMode('signin')
              return
            }
            if (result.data.user) setUserId(result.data.user.id)
            setIsSignedIn(true)
            showToast(authMode === 'signup' ? 'Welcome to Mahagedara.' : 'Welcome back to Mahagedara.')
          }}>
            {authMode === 'signup' && <label className="field-label">Display name<input type="text" name="display-name" autoComplete="name" placeholder="Your name" required /></label>}
            <label className="field-label">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label className="field-label">Password<input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" minLength="6" required /></label>
            <button className="primary-btn auth-submit" type="submit">{authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
          </form>
          <button className="auth-mode-toggle" type="button" onClick={() => setAuthMode((mode) => mode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
          <p className="auth-demo-note">{supabase ? 'Your account and community data are secured by Supabase.' : 'Add Supabase environment settings to enable accounts and shared data.'}</p>
          {toast && <div className="toast" role="status">{toast}</div>}
        </section>
      </div>
    )
  }

  return (
    <div className={activePage === 'Home' ? (settings.darkMode ? 'page-shell wall-shell dark-mode' : 'page-shell wall-shell') : (settings.darkMode ? 'page-shell dark-mode' : 'page-shell')}>
      {activePage === 'Home' ? renderWall() : <div className="social-app">
        <aside className="sidebar">
          <button type="button" className="brand-wrap" onClick={() => navigate('Home')} aria-label="Go to home">
            <span className="brand-mark">M</span>
            <span><span className="eyebrow">community</span><strong className="brand-name">Maha gedara</strong></span>
          </button>

          <nav className="nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <button key={item.label} className={activePage === item.label ? 'nav-item active' : 'nav-item'} type="button" onClick={() => navigate(item.label)}>
                <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                {item.label === 'Messages' && <span className="nav-count">2</span>}
              </button>
            ))}
          </nav>

          <button type="button" className="mini-card profile-card" onClick={() => navigate('Profile')}>
            <div className="avatar large avatar-rose">A</div>
            <span><strong>{profileName}</strong><small>@amanda</small></span>
            <span className="badge">Pro</span>
          </button>
          <div className="sidebar-footer"><span className="online-dot" /> Your community is better with you.</div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <label className="search-wrap">
              <span aria-hidden="true">⌕</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search friends, posts or places" aria-label="Search friends, posts or places" />
              {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </label>
            <div className="top-actions">
              <div className="notification-wrap">
                <button className="icon-button notification-button" type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => setNotificationsOpen(!notificationsOpen)}>
                  ♧{unreadCount > 0 && <span className="notification-dot" />}
                </button>
                {notificationsOpen && (
                  <div className="notification-popover">
                    <div className="popover-heading"><strong>Notifications</strong><button type="button" onClick={markNotificationsRead}>Mark all read</button></div>
                    {notifications.map((item) => <div key={item.id} className={item.read ? 'notification-item' : 'notification-item unread'}><span className="notification-avatar">✦</span><p>{item.text}<small>{item.time}</small></p></div>)}
                  </div>
                )}
              </div>
              <button className="icon-button" type="button" aria-label="Open messages" onClick={() => navigate('Messages')}>✉</button>
              <button className="avatar small avatar-olive top-avatar" type="button" aria-label="Open your profile" onClick={() => navigate('Profile')}>A</button>
            </div>
          </header>
          <div className="main-content">{renderMain()}</div>
        </main>

        <aside className="right-panel">
          <section className="profile-summary">
            <div className="cover" />
            <div className="profile-info">
              <div className="avatar large avatar-olive">A</div>
              <h2>{profileName}</h2><p>@amanda</p>
              <button type="button" className="profile-link" onClick={() => navigate('Profile')}>View profile <span>→</span></button>
            </div>
            <div className="stats-grid">
              {[['Posts', `${posts.filter((post) => post.mine).length + 18}`], ['Followers', '86k'], ['Following', '132']].map(([label, value]) => (
                <div key={label} className="stat-box"><strong>{value}</strong><span>{label}</span></div>
              ))}
            </div>
          </section>

          <section className="mini-card side-section">
            <div className="section-head"><h3>Communities</h3><button type="button" onClick={() => navigate('Communities')}>View all</button></div>
            {communities.slice(0, 3).map((community) => (
              <button type="button" key={community.name} className="community-item" onClick={() => navigate('Communities')}>
                <span className="dot" style={{ background: community.tone }} />
                <span><strong>{community.name}</strong><small>{community.members} members</small></span>
                {joinedCommunities.includes(community.name) && <span className="joined-mark">✓</span>}
              </button>
            ))}
          </section>

          <section className="mini-card side-section">
            <div className="section-head"><h3>Friends</h3><button type="button" onClick={() => navigate('Messages')}>Message</button></div>
            {people.map((friend) => (
              <button type="button" key={friend.name} className="friend-item" onClick={() => {
                openFriendChat(friend)
                navigate('Messages')
              }}>
                <span className="avatar tiny" style={{ background: friend.color }}>{friend.name[0]}</span>
                <span className="friend-meta"><strong>{friend.name}</strong><small>{friend.status}</small></span>
                <i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} />
              </button>
            ))}
          </section>
          <p className="copyright">© 2026 Mahagedara · Made for community</p>
        </aside>
      </div>}

      {story && (
        <div className="modal-backdrop" role="presentation" onClick={() => setStory(null)}>
          <section className="story-viewer" role="dialog" aria-modal="true" aria-label={`${story.name}'s story`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setStory(null)} aria-label="Close story">×</button>
            <div className="story-viewer-art" style={{ background: `linear-gradient(145deg, ${story.color}, #5b5144)` }}><span>{story.name[0]}</span></div>
            <div className="story-viewer-caption"><strong>{story.name}</strong><p>A little moment from today. ✨</p></div>
            <button type="button" className="primary-btn" onClick={() => {
              setStory(null)
              navigate('Messages')
              setCurrentChat('Anya')
            }}>Reply to story</button>
          </section>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}>
          <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setModal(null)} aria-label="Close dialog">×</button>
            {modal.type === 'edit-profile' && (
              <>
                <h2>Edit your profile</h2><p className="modal-intro">Update how your community sees you.</p>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  if (!profileDraft.trim()){
                    showToast('Your name cannot be empty.')
                    return
                  }
                  if (supabase && userId){
                    const { error } = await supabase.from('profiles').update({ display_name: profileDraft.trim() }).eq('id', userId)
                    if (error){
                      showToast(`Could not update your profile: ${error.message}`)
                      return
                    }
                  }
                  setProfileName(profileDraft.trim())
                  setModal(null)
                  showToast('Profile updated.')
                }}>
                  <label className="field-label">Display name<input autoFocus value={profileDraft} onChange={(event) => setProfileDraft(event.target.value)} /></label>
                  <label className="field-label">Username<input value="@amanda" readOnly /></label>
                  <button className="primary-btn modal-submit" type="submit">Save changes</button>
                </form>
              </>
            )}
            {modal.type === 'create-community' && (
              <>
                <h2>Create a community</h2><p className="modal-intro">Start a new space around something you care about.</p>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  const name = String(formData.get('community-name') || '').trim()
                  if (!name){
                    showToast('Give your community a name first.')
                    return
                  }
                  if (communities.some((community) => community.name.toLowerCase() === name.toLowerCase())){
                    showToast('A community with that name already exists.')
                    return
                  }
                  if (supabase && !userId){
                    showToast('Sign in to create a group.')
                    return
                  }
                  const description = 'A new community, started by you.'
                  let groupId
                  if (supabase && userId){
                    const { data: group, error } = await supabase.from('groups').insert({ name, description, created_by: userId }).select('id').single()
                    if (error){
                      showToast(`Could not create your group: ${error.message}`)
                      return
                    }
                    groupId = group.id
                    const { error: membershipError } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId })
                    if (membershipError){
                      showToast(`Group created, but membership could not be saved: ${membershipError.message}`)
                      return
                    }
                  }
                  setCommunities((current) => [{ id: groupId, name, members: '1', tone: '#d5bfd9', description }, ...current])
                  setJoinedCommunities((current) => [...current, name])
                  setModal(null)
                  showToast(`${name} is ready to grow.`)
                }}>
                  <label className="field-label">Community name<input name="community-name" autoFocus placeholder="e.g. Weekend Gardeners" /></label>
                  <button className="primary-btn modal-submit" type="submit">Create community</button>
                </form>
              </>
            )}
            {modal.type === 'create-event' && isAdmin && (
              <>
                <h2>Publish a community event</h2><p className="modal-intro">Only community admins can publish event announcements.</p>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  const title = String(formData.get('event-title') || '').trim()
                  const date = String(formData.get('event-date') || '')
                  const detail = String(formData.get('event-detail') || '').trim()
                  if (!title || !date){
                    showToast('Add an event name and date.')
                    return
                  }
                  if (!supabase || !userId){
                    showToast('Sign in with your Supabase account to publish an event.')
                    return
                  }
                  const { error } = await supabase.from('posts').insert({
                    author_id: userId,
                    author_name: profileName,
                    handle: '@amanda',
                    body: detail,
                    is_event: true,
                    event_title: title,
                    event_date: new Date(`${date}T12:00:00`).toISOString(),
                  })
                  if (error){
                    showToast(`Could not publish your event: ${error.message}`)
                    return
                  }
                  setEvents((current) => [{ title, detail: `${date} · ${detail || 'Community event'}`, date: new Date(`${date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n'), image: eventSlides[0].image, tag: 'COMMUNITY EVENT' }, ...current])
                  setEventIndex(0)
                  setModal(null)
                  showToast('Your event is on the community wall.')
                }}>
                  <label className="field-label">Event name<input name="event-title" autoFocus placeholder="e.g. Saturday neighborhood picnic" required /></label>
                  <label className="field-label">Date<input name="event-date" type="date" required /></label>
                  <label className="field-label">A few details<input name="event-detail" placeholder="Place, time, or what to bring" /></label>
                  <button className="primary-btn modal-submit" type="submit">Publish event</button>
                </form>
              </>
            )}
            {modal.type === 'share' && (
              <>
                <h2>Share this post</h2><p className="modal-intro">Copy the post text and share it with your friends.</p>
                <textarea className="share-copy" readOnly value={`${modal.post.author} on Mahagedara: ${modal.post.text}`} />
                <button className="primary-btn modal-submit" type="button" onClick={() => {
                  setModal(null)
                  showToast('Select and copy the post text to share it.')
                }}>Done</button>
              </>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

export default App
