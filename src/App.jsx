import{ useCallback, useEffect, useMemo, useState } from 'react'
import BellIcon from '@iconify-react/bitcoin-icons/bell-outline'
import EmailIcon from '@iconify-react/bitcoin-icons/email-outline'
import GridIcon from '@iconify-react/bitcoin-icons/grid-outline'
import HomeIcon from '@iconify-react/bitcoin-icons/home-outline'
import SearchIcon from '@iconify-react/bitcoin-icons/search-outline'
import SunIcon from '@iconify-react/bitcoin-icons/sun-outline'
import './App.css'
import{ supabase } from '../supabase'
import Community,{ CommunityDirectory, CreateCommunityForm } from './components/community/Community'
import Login from './components/login/Login'
import Register from './components/login/Register'
import ForgotPassword from './components/login/Froget'
import ResetPassword from './components/login/ResetPassword'
import{ ProfilePage } from './components/profile/Profile'
import{ PostCard, PostComposer } from './components/wall/Wall'

const navigation = [
 { label: 'Home', icon: HomeIcon },
 { label: 'Explore', icon: SearchIcon },
 { label: 'Communities', icon: GridIcon },
 { label: 'Status', icon: SunIcon },
 { label: 'Messages', icon: EmailIcon },
]

const pageDetails = {
  Home: ['Community feed', 'See what your neighbors are sharing.'],
  Explore: ['Explore', 'Discover the latest happenings in your community.'],
  Status: ['Your status', 'Share your latest update with friends and neighbors.'],
  Communities: ['Communities', 'Discover groups, clubs, and local spaces.'],
  Messages: ['Messages', 'Keep in touch with your friends and groups.'],
  Profile: ['Profile', 'Your activity, details, and community presence.'],
}

const communityTones = ['#b9d8b1', '#f0c38f', '#d5bfd9', '#e8a78d']
const personColors = ['#bd8f75', '#78977f', '#a897b4', '#bd9b68']
const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function App(){
  const [activePage, setActivePage] = useState('Home')
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [joinedCommunities, setJoinedCommunities] = useState([])
  const [discoverGroupIds, setDiscoverGroupIds] = useState(null)
  const [people, setPeople] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [query, setQuery] = useState('')
  const [composerText, setComposerText] = useState('')
  const [composerImage, setComposerImage] = useState('')
  const [composerFile, setComposerFile] = useState(null)
  const [modal, setModal] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState('')
  const [authPage, setAuthPage] = useState('login')
  const [openMenu, setOpenMenu] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [profileHandle, setProfileHandle] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [profileDraft, setProfileDraft] = useState('')
  const [profileBioDraft, setProfileBioDraft] = useState('')
  const [currentChat, setCurrentChat] = useState('World')
  const [currentGroupChat, setCurrentGroupChat] = useState('')
  const [chatSection, setChatSection] = useState('World')
  const [inboxConversations, setInboxConversations] = useState([])
  const [inboxSelected, setInboxSelected] = useState(false)
  const [profileTarget, setProfileTarget] = useState(null)
  const [events, setEvents] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [friendsList, setFriendsList] = useState([])
  const [incomingFriendRequests, setIncomingFriendRequests] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState(null)
  const [messages, setMessages] = useState({})
  const [messageDraft, setMessageDraft] = useState('')
  const [commentsByPost, setCommentsByPost] = useState({})
  const [expandedCommentPosts, setExpandedCommentPosts] = useState([])
  const [commentsHasMore, setCommentsHasMore] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [shareRecipientIds, setShareRecipientIds] = useState([])
  const showToast = useCallback((message) =>{
    setToast(message)
  }, [])

  useEffect(() =>{
    if(!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 2600)
    return() => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() =>{
    if(!supabase) return undefined
    let active = true
    const applySession =(session) =>{
      setUserId(session?.user?.id || null)
    }
    const{ data:{ subscription } } = supabase.auth.onAuthStateChange((event, session) =>{
      if(!active) return
      applySession(session)
      if(event === 'SIGNED_IN') setAuthPage(null)
      if(event === 'SIGNED_OUT') setAuthPage('login')
      if(event === 'PASSWORD_RECOVERY') setAuthPage('reset')
    })

    supabase.auth.getSession().then(({ data, error }) =>{
      if(!active) return
      if(error){
        showToast(`Could not load your Supabase session: ${error.message}`)
        setAuthPage('login')
        return
      }
      applySession(data.session)
      setAuthPage(data.session ? null : 'login')
    }).catch((error) =>{
      if(!active) return
      showToast(`Could not load your Supabase session: ${error.message}`)
      setAuthPage('login')
    })

    return() =>{
      active = false
      subscription.unsubscribe()
    }
  }, [showToast])

  useEffect(() =>{
    let active = true
    const loadWallData = async() =>{
      if(!supabase) return
      const{ data:{ user }, error: authError } = await supabase.auth.getUser()
      if(!active) return
      if(authError && authError.name !== 'AuthSessionMissingError'){
        showToast(`Could not load your Supabase session: ${authError.message}`)
      }

      if(!user){
        setPeople([])
        setFriendRequests([])
        setFriendsList([])
        setIncomingFriendRequests([])
        setJoinedCommunities([])
        setNotifications([])
        setInboxConversations([])
        setInboxSelected(false)
        setMessages({})
        setProfilePhotoUrl('')
        setIsAdmin(false)
      }

      if(user){
        setUserId(user.id)
        const{ data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, handle, role, avatar_url, bio, is_banned')
          .eq('id', user.id)
          .maybeSingle()
        if(!active) return
        if(profileError){
          showToast(`Could not load your profile: ${profileError.message}`)
          return
        }
        if(profile?.is_banned){
          showToast('This account has been banned. Contact a community administrator.')
          const{ error: signOutError } = await supabase.auth.signOut()
          if(signOutError) showToast(`Could not end the banned session: ${signOutError.message}`)
          if(!active) return
          setUserId(null)
          setAuthPage('login')
          return
        }
        if(supabase && !userId){
          showToast('Sign in to your Supabase account before posting.')
          return
        }
        if(profile?.display_name) setProfileName(profile.display_name)
        setProfileHandle(profile?.handle || `@${user.email?.split('@')[0] || ''}`)
        setProfileBio(profile?.bio || '')
        setProfilePhotoUrl(profile?.avatar_url || '')
        setIsAdmin(profile?.role === 'admin')
      }

      const{ data: wallPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, author_id, author_name, handle, body, image_url, likes, comment_count, is_event, event_title, event_date, created_at')
        .order('created_at',{ ascending: false })
        .limit(50)
      if(!active) return
      if(postsError){
        showToast(`Could not load posts: ${postsError.message}`)
      }
      if(!postsError && wallPosts){
        const regularPosts = wallPosts.filter((post) => !post.is_event)
        setPosts(regularPosts.map((post) =>({
          id: post.id,
          authorId: post.author_id,
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
        if(user && regularPosts.length){
          const{ data: likes, error: likesError } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', regularPosts.map((post) => post.id))
          if(!active) return
          if(likesError) showToast(`Could not load your post likes: ${likesError.message}`)
          else{
            const likedIds = new Set(likes.map((like) => like.post_id))
            setPosts((current) => current.map((post) =>({ ...post, liked: likedIds.has(post.id) })))
          }
        }
        const remoteEvents = wallPosts.filter((post) => post.is_event && post.event_title).map((post) =>({
          title: post.event_title,
          detail: `${post.event_date ? new Date(post.event_date).toLocaleDateString() : 'Community event'} · ${post.body || 'Join your neighbors'}`,
          date: post.event_date ? new Date(post.event_date).toLocaleDateString('en',{ month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n') : 'SOON',
          id: post.id,
          image: post.image_url || '',
          tag: 'COMMUNITY EVENT',
        }))
        setEvents(remoteEvents)
      }

      const{ data: groupRows, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, description, image_url, image_path, invite_link, created_by, group_members(count)')
        .order('created_at',{ ascending: false })
      if(!active) return
      if(groupsError){
        showToast(`Could not load groups: ${groupsError.message}`)
        setCommunities([])
        setJoinedCommunities([])
        setDiscoverGroupIds([])
      } else if(groupRows){
        const remoteGroups = groupRows.map((group, index) =>({
          id: group.id,
          name: group.name,
          description: group.description || '',
          image_url: group.image_url || '',
          image_path: group.image_path || '',
          invite_link: group.invite_link || '',
          created_by: group.created_by,
          members: String(group.group_members?.[0]?.count ?? 0),
          tone: communityTones[index % communityTones.length],
        }))
        setCommunities(remoteGroups)
        let memberIds = new Set()
        if(user){
          const{ data: memberships, error: membershipsError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id)
          if(!active) return
          if(membershipsError) showToast(`Could not load your group memberships: ${membershipsError.message}`)
          else{
            memberIds = new Set(memberships.map((membership) => membership.group_id))
            setJoinedCommunities(remoteGroups.filter((group) => memberIds.has(group.id)).map((group) => group.name))
          }
        } else setJoinedCommunities([])
        const shuffledGroups = remoteGroups.filter((group) => !memberIds.has(group.id) && group.created_by !== user?.id)
        for(let index = shuffledGroups.length - 1; index > 0; index -= 1){
          const swapIndex = Math.floor(Math.random() *(index + 1))
          ;[shuffledGroups[index], shuffledGroups[swapIndex]] = [shuffledGroups[swapIndex], shuffledGroups[index]]
        }
        setDiscoverGroupIds(shuffledGroups.slice(0, 3).map((group) => group.id))
      }

      const{ data: profiles, error: peopleError } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, bio, is_banned')
        .neq('id', user?.id || '00000000-0000-0000-0000-000000000000')
      if(!active) return
      if(peopleError) showToast(`Could not load people suggestions: ${peopleError.message}`)
      else if(profiles?.length){
        const peopleRows = profiles.map((person, index) =>({
          id: person.id,
          name: person.display_name,
          handle: person.handle || '',
          avatarUrl: person.avatar_url || '',
          bio: person.bio || '',
          isBanned: Boolean(person.is_banned),
          status: 'Member',
          color: personColors[index % personColors.length],
        }))
        setPeople(peopleRows)
        if(user){
          const{ data: requests, error: requestsError } = await supabase
            .from('friend_requests')
            .select('recipient_id')
            .eq('sender_id', user.id)
            .eq('status', 'pending')
          if(!active) return
          if(requestsError) showToast(`Could not load your friend requests: ${requestsError.message}`)
          else{
            const requestedIds = new Set(requests.map((request) => request.recipient_id))
            setFriendRequests(profiles.filter((person) => requestedIds.has(person.id)).map((person) => person.display_name))
          }
          const{ data: acceptedRequests, error: acceptedError } = await supabase
            .from('friend_requests')
            .select('sender_id, recipient_id')
            .eq('status', 'accepted')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          if(!active) return
          if(acceptedError) showToast(`Could not load your friends: ${acceptedError.message}`)
          else{
            const acceptedIds = new Set(acceptedRequests.map((request) => request.sender_id === user.id ? request.recipient_id : request.sender_id))
            setFriendsList(peopleRows.filter((person) => acceptedIds.has(person.id)))
          }
          const{ data: incomingRequests, error: incomingError } = await supabase
            .from('friend_requests')
            .select('id, sender_id')
            .eq('recipient_id', user.id)
            .eq('status', 'pending')
          if(!active) return
          if(incomingError) showToast(`Could not load incoming friend requests: ${incomingError.message}`)
          else setIncomingFriendRequests(incomingRequests.map((request) =>{
            const sender = peopleRows.find((person) => person.id === request.sender_id)
            return sender ?{ ...sender, requestId: request.id } : null
          }).filter(Boolean))
        }
      } else if(user){
        setPeople([])
        setFriendsList([])
        setIncomingFriendRequests([])
      }
      if(!user){
        setFriendRequests([])
        setFriendsList([])
        setIncomingFriendRequests([])
      }

      const{ data: worldMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, sender_name, body, created_at')
        .eq('room', 'world')
        .order('created_at',{ ascending: true })
        .limit(30)
      if(!active) return
      if(messagesError) showToast(`Could not load world chat: ${messagesError.message}`)
      else if(worldMessages){
        setMessages((current) =>({
          ...current,
          World: worldMessages.map((message) =>({
            id: message.id,
            from: message.sender_id === user?.id ? profileName : message.sender_name,
            text: message.body,
            time: new Date(message.created_at).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' }),
          })),
        }))
      }

      if(user){
        const{ data: userNotifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('id, body, read_at, created_at')
          .eq('user_id', user.id)
          .order('created_at',{ ascending: false })
          .limit(20)
        if(!active) return
        if(notificationsError) showToast(`Could not load notifications: ${notificationsError.message}`)
        else if(userNotifications){
          setNotifications(userNotifications.map((item) =>({
            id: item.id,
            text: item.body,
            time: new Date(item.created_at).toLocaleDateString(),
            read: Boolean(item.read_at),
          })))
        }
      }
    }

    loadWallData()
    return() =>{
      active = false
    }
  }, [profileName, showToast, userId])

  useEffect(() =>{
    if(!supabase) return undefined
    const channel = supabase.channel(`community-live-${userId || 'visitor'}`)
      .on('postgres_changes',{ event: 'INSERT', schema: 'public', table: 'messages' },({ new: message }) =>{
        const messageTime = new Date(message.created_at).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' })
        const formatted ={
          id: message.id,
          from: message.sender_id === userId ? profileName : message.sender_name,
          text: message.body,
          time: messageTime,
        }
        let key
        if(message.room === 'world') key = 'World'
        else if(message.group_id) key = `group:${message.group_id}`
        else if(userId &&(message.sender_id === userId || message.recipient_id === userId)){
          const otherId = message.sender_id === userId ? message.recipient_id : message.sender_id
          key = people.find((person) => person.id === otherId)?.name
          if(!key) return
        } else return

        setMessages((current) =>{
          const existing = current[key] || []
          if(existing.some((item) => item.id === message.id)) return current
          return{ ...current, [key]: [...existing, formatted] }
        })
      })
      .on('postgres_changes',{ event: 'INSERT', schema: 'public', table: 'notifications', filter: userId ? `user_id=eq.${userId}` : undefined },({ new: item }) =>{
        setNotifications((current) => current.some((notification) => notification.id === item.id)
          ? current
          : [{ id: item.id, text: item.body, time: 'Just now', read: Boolean(item.read_at) }, ...current])
      })
      .on('postgres_changes',{ event: 'INSERT', schema: 'public', table: 'profiles' },({ new: profile }) =>{
        if(!profile.id || profile.id === userId) return
        setPeople((current) => current.some((person) => person.id === profile.id)
          ? current
          : [...current,{
            id: profile.id,
            name: profile.display_name,
            handle: profile.handle || '',
            avatarUrl: profile.avatar_url || '',
            bio: profile.bio || '',
            isBanned: Boolean(profile.is_banned),
            status: 'Member',
            color: personColors[current.length % personColors.length],
          }])
      })
      .on('postgres_changes',{ event: 'UPDATE', schema: 'public', table: 'profiles' },({ new: profile }) =>{
        if(!profile.id) return
        if(profile.id === userId){
          if(profile.avatar_url) setProfilePhotoUrl(profile.avatar_url)
          if(profile.display_name) setProfileName(profile.display_name)
          setProfileBio(profile.bio || '')
          if(profile.is_banned){
            showToast('Your account has been banned by a community administrator.')
            supabase.auth.signOut().then(({ error }) =>{
              if(error) showToast(`Could not end your banned session: ${error.message}`)
              setUserId(null)
              setAuthPage('login')
            })
          }
          return
        }
        const updatedPerson =(person) => person.id === profile.id
          ?{
            ...person,
            name: profile.display_name || person.name,
            handle: profile.handle || person.handle,
            avatarUrl: profile.avatar_url || '',
            bio: profile.bio || '',
            isBanned: Boolean(profile.is_banned),
          }
          : person
        setPeople((current) => current.map(updatedPerson))
        if(profile.is_banned){
          setFriendsList((current) => current.filter((person) => person.id !== profile.id))
          setInboxConversations((current) => current.filter((person) => person.id !== profile.id))
          setIncomingFriendRequests((current) => current.filter((person) => person.id !== profile.id))
        } else{
          setFriendsList((current) => current.map(updatedPerson))
          setInboxConversations((current) => current.map(updatedPerson))
          setIncomingFriendRequests((current) => current.map(updatedPerson))
        }
      })
      .on('postgres_changes',{ event: 'INSERT', schema: 'public', table: 'groups' },({ new: group }) =>{
        if(!group.id) return
        setCommunities((current) => current.some((item) => item.id === group.id)
          ? current
          : [...current,{
            id: group.id,
            name: group.name,
            description: group.description || '',
            image_url: group.image_url || '',
            image_path: group.image_path || '',
            invite_link: group.invite_link || '',
            created_by: group.created_by,
            members: '0',
            tone: communityTones[current.length % communityTones.length],
          }])
        if(group.created_by !== userId){
          setDiscoverGroupIds((current) => current === null
            ? null
            : [...new Set([group.id, ...current])].slice(0, 3))
        }
      })
      .on('postgres_changes',{ event: '*', schema: 'public', table: 'friend_requests' },({ eventType, new: request, old }) =>{
        if(!userId) return
        if(eventType === 'INSERT'){
          if(request.sender_id === userId){
            const recipient = people.find((person) => person.id === request.recipient_id)
            if(recipient){
              setFriendRequests((current) => current.includes(recipient.name) ? current : [...current, recipient.name])
            }
          } else if(request.recipient_id === userId && request.status === 'pending'){
            const sender = people.find((person) => person.id === request.sender_id)
            if(sender){
              setIncomingFriendRequests((current) => current.some((item) => item.requestId === request.id)
                ? current
                : [...current,{ ...sender, requestId: request.id }])
            }
          }
          return
        }
        if(eventType === 'UPDATE' && request.status === 'accepted'){
          const otherUserId = request.sender_id === userId ? request.recipient_id : request.sender_id
          const friend = people.find((person) => person.id === otherUserId)
          if(friend) setFriendsList((current) => current.some((item) => item.id === friend.id) ? current : [...current, friend])
          setIncomingFriendRequests((current) => current.filter((item) => item.requestId !== request.id))
          setFriendRequests((current) => current.filter((name) => name !== friend?.name))
        }
        if(eventType === 'DELETE'){
          setIncomingFriendRequests((current) => current.filter((item) => item.requestId !== old.id))
        }
      })
      .subscribe((status) =>{
        if(status === 'CHANNEL_ERROR') showToast('Live updates are unavailable. Check Supabase Realtime settings.')
      })
    return() =>{
      supabase.removeChannel(channel)
    }
  }, [people, profileName, showToast, userId])

  const filteredPosts = useMemo(() =>{
    const term = query.trim().toLowerCase()
    const source = activePage === 'Status'
      ? posts.filter((post) => post.mine)
      : activePage === 'Profile'
        ? profileTarget?.id
          ? posts.filter((post) => post.authorId === profileTarget.id)
          : profileTarget
            ? posts.filter((post) => post.author === profileTarget.name)
            : posts.filter((post) => post.mine)
        : posts

    if(!term) return source
    return source.filter((post) => `${post.author} ${post.handle} ${post.text}`.toLowerCase().includes(term))
  }, [activePage, posts, profileTarget, query])

  const unreadCount = notifications.filter((item) => !item.read).length

  const navigate =(page) =>{
    setActivePage(page === 'Profile' ? 'Profile' : 'Home')
    if(page === 'Profile') setProfileTarget(null)
    setQuery('')
    setNotificationsOpen(false)
    setOpenMenu(null)
  }

  const publishPost = async(event) =>{
    event.preventDefault()
    const text = composerText.trim()
    if(!text && !composerImage){
      showToast('Write an update or add a photo before posting.')
      return false
    }
    if(composerFile &&(!supportedPhotoTypes.has(composerFile.type) || composerFile.size >= 5_000_000)){
      showToast('Choose one image smaller than 5 MB.')
      return false
    }

    let postId = Date.now()
    let imageUrl = composerImage
    let uploadedImagePath = ''
    if(supabase && userId){
      if(composerFile){
        const safeName = composerFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const imagePath = `${userId}/${crypto.randomUUID()}-${safeName}`
        const{ error: uploadError } = await supabase.storage.from('post-images').upload(imagePath, composerFile,{ upsert: false })
        if(uploadError){
          showToast(`Could not upload your photo: ${uploadError.message}`)
          return false
        }
        uploadedImagePath = imagePath
        imageUrl = supabase.storage.from('post-images').getPublicUrl(imagePath).data.publicUrl
      }
      const{ data, error } = await supabase.from('posts').insert({
        author_id: userId,
        author_name: profileName,
        handle: profileHandle,
        body: text,
        image_url: imageUrl || null,
      }).select('id').single()
      if(error){
        if(uploadedImagePath){
          const{ error: cleanupError } = await supabase.storage.from('post-images').remove([uploadedImagePath])
          if(cleanupError){
            showToast(`Could not publish your post: ${error.message}. The uploaded photo also could not be removed: ${cleanupError.message}`)
            return false
          }
        }
        showToast(`Could not publish your post: ${error.message}`)
        return false
      }
      postId = data.id
    }
    const newPost ={
      id: postId,
      authorId: userId,
      author: profileName,
      handle: profileHandle,
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
    if(composerImage.startsWith('blob:')) URL.revokeObjectURL(composerImage)
    setComposerImage('')
    setComposerFile(null)
    showToast('Your update has been posted.')
    setActivePage('Home')
    return true
  }

  const toggleLike = async(postId) =>{
    const post = posts.find((item) => item.id === postId)
    if(supabase && !userId){
      showToast('Sign in to like posts.')
      return
    }
    if(supabase && userId && typeof postId === 'string'){
      const request = post?.liked
        ? supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
        : supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
      const{ error } = await request
      if(error){
        showToast(`Could not update your like: ${error.message}`)
        return
      }
    }
    setPosts((current) => current.map((post) => post.id === postId
      ?{ ...post, liked: !post.liked, likes: post.likes +(post.liked ? -1 : 1) }
      : post))
  }

  const addComment = async(postId, text) =>{
    if(!text) return false
    if(supabase && !userId){
      showToast('Sign in to comment on posts.')
      return false
    }
    let comment
    if(supabase && userId && typeof postId === 'string'){
      const{ data, error } = await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: userId,
        author_name: profileName,
        body: text,
      }).select('id, author_name, body, created_at').single()
      if(error){
        showToast(`Could not add your comment: ${error.message}`)
        return false
      }
      comment ={
        id: data.id,
        author: data.author_name,
        text: data.body,
        createdAt: data.created_at,
      }
    } else{
      comment ={ id: crypto.randomUUID(), author: profileName, text, createdAt: new Date().toISOString() }
    }
    setCommentsByPost((current) =>({
      ...current,
      [postId]: [comment, ...(current[postId] || [])],
    }))
    setPosts((current) => current.map((post) => post.id === postId
      ?{ ...post, commentCount: post.commentCount + 1 }
      : post))
    setExpandedCommentPosts((current) => current.includes(postId) ? current : [...current, postId])
    showToast('Comment added.')
    return true
  }

  const toggleComments = async(postId) =>{
    if(expandedCommentPosts.includes(postId)){
      setExpandedCommentPosts((current) => current.filter((id) => id !== postId))
      return
    }
    setExpandedCommentPosts((current) => [...current, postId])
    if(!supabase || typeof postId !== 'string' || commentsByPost[postId]) return
    setLoadingComments((current) =>({ ...current, [postId]: true }))
    const{ data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, body, created_at')
      .eq('post_id', postId)
      .order('created_at',{ ascending: false })
      .limit(4)
    setLoadingComments((current) =>({ ...current, [postId]: false }))
    if(error){
      showToast(`Could not load comments: ${error.message}`)
      return
    }
    const latestComments = data.slice(0, 3).map((comment) =>({
      id: comment.id,
      author: comment.author_name,
      text: comment.body,
      createdAt: comment.created_at,
    }))
    setCommentsByPost((current) =>({ ...current, [postId]: latestComments }))
    setCommentsHasMore((current) =>({ ...current, [postId]: data.length > 3 }))
  }

  const loadOlderComments = async(postId) =>{
    if(!supabase || typeof postId !== 'string' || loadingComments[postId]) return
    const currentComments = commentsByPost[postId] || []
    const oldestComment = currentComments[currentComments.length - 1]
    if(!oldestComment) return
    setLoadingComments((current) =>({ ...current, [postId]: true }))
    const{ data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, body, created_at')
      .eq('post_id', postId)
      .lt('created_at', oldestComment.createdAt)
      .order('created_at',{ ascending: false })
      .limit(20)
    setLoadingComments((current) =>({ ...current, [postId]: false }))
    if(error){
      showToast(`Could not load older comments: ${error.message}`)
      return
    }
    const olderComments = data.map((comment) =>({
      id: comment.id,
      author: comment.author_name,
      text: comment.body,
      createdAt: comment.created_at,
    }))
    setCommentsByPost((current) =>({
      ...current,
      [postId]: [...(current[postId] || []), ...olderComments],
    }))
    setCommentsHasMore((current) =>({ ...current, [postId]: data.length === 20 }))
  }

  const toggleSave =(postId) =>{
    const isSaved = savedPosts.includes(postId)
    setSavedPosts((current) => isSaved ? current.filter((id) => id !== postId) : [...current, postId])
    setOpenMenu(null)
    showToast(isSaved ? 'Post removed from your saved items.' : 'Post saved for later.')
  }

  const sharePost =(post) =>{
    setShareRecipientIds([])
    setModal({ type: 'share', post })
  }

  const sendSharedPost = async() =>{
    if(!shareRecipientIds.length){
      showToast('Choose at least one friend or group.')
      return
    }
    const shareText = `Shared a post by ${modal.post.author}: ${modal.post.text || 'Photo'}${modal.post.image ? `\n${modal.post.image}` : ''}`
    const messagesToSend = shareRecipientIds.map((selectedId) =>{
      const [type, id] = selectedId.split(':')
      return{
        sender_id: userId,
        sender_name: profileName,
        body: shareText,
        ...(type === 'friend' ?{ recipient_id: id } :{ group_id: id }),
      }
    })
    if(supabase && userId){
      const{ error } = await supabase.from('messages').insert(messagesToSend)
      if(error){
        showToast(`Could not share the post: ${error.message}`)
        return
      }
    } else if(supabase){
      showToast('Sign in to share a post.')
      return
    } else{
      setMessages((current) =>{
        const updated ={ ...current }
        shareRecipientIds.forEach((selectedId) =>{
          const [type, id] = selectedId.split(':')
          const recipient = type === 'friend'
            ? friendsList.find((friend) => friend.id === id)
            : communities.find((group) => group.id === id)
          const conversationKey = type === 'friend' ? recipient?.name : `group:${id}`
          if(!conversationKey) return
          updated[conversationKey] = [...(updated[conversationKey] || []),{
            from: profileName,
            text: shareText,
            time: 'now',
          }]
        })
        return updated
      })
    }
    setModal(null)
    setShareRecipientIds([])
    showToast('Post shared.')
  }

  const toggleJoin = async(name) =>{
    const isMember = joinedCommunities.includes(name)
    const group = communities.find((item) => item.name === name)
    if(supabase && !userId){
      showToast('Sign in to join a group.')
      return
    }
    if(supabase && userId && group?.id){
      const request = isMember
        ? supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', userId)
        : supabase.from('group_members').insert({ group_id: group.id, user_id: userId })
      const{ error } = await request
      if(error){
        showToast(`Could not update group membership: ${error.message}`)
        return
      }
    }
    setJoinedCommunities((current) => isMember ? current.filter((item) => item !== name) : [...current, name])
    showToast(isMember ? `You left ${name}.` : `You joined ${name}.`)
  }

  const sendMessage = async(event) =>{
    event.preventDefault()
    const text = messageDraft.trim()
    if(!text) return
    if(supabase && !userId){
      showToast('Sign in to send a message.')
      return
    }
    const isWorldChat = activePage === 'Home' && chatSection === 'World'
    const selectedGroup = activePage === 'Home' && chatSection === 'Groups'
      ? communities.find((group) => group.name === currentGroupChat)
      : null
    if(activePage === 'Home' && chatSection === 'Groups' && !selectedGroup){
      showToast('Choose a group before sending a message.')
      return
    }
    if(selectedGroup && !joinedCommunities.includes(selectedGroup.name)){
      showToast('Join this group before sending a message.')
      return
    }
    const conversationKey = isWorldChat
      ? 'World'
      : selectedGroup
        ? `group:${selectedGroup.id || selectedGroup.name}`
        : currentChat
    const newMessage ={ from: profileName, text, time: 'now' }
    if(supabase && userId && isWorldChat){
      const{ data, error } = await supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        recipient_id: null,
        body: text,
        room: 'world',
      })
        .select('id, created_at')
        .single()
      if(error){
        showToast(`Could not send your message: ${error.message}`)
        return
      }
      newMessage.id = data.id
    } else if(supabase && userId && selectedGroup?.id){
      const{ data, error } = await supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        group_id: selectedGroup.id,
        body: text,
      })
        .select('id, created_at')
        .single()
      if(error){
        showToast(`Could not send your group message: ${error.message}`)
        return
      }
      newMessage.id = data.id
    } else if(supabase && userId && selectedGroup){
      showToast('This group is not connected to Supabase yet.')
      return
    } else if(supabase && userId){
      const recipient = [...people, ...friendsList, ...inboxConversations].find((person) => person.name === currentChat)
      if(!recipient?.id){
        showToast('Could not find this person’s account.')
        return
      }
      const{ data, error } = await supabase.from('messages').insert({
          sender_id: userId,
          sender_name: profileName,
          recipient_id: recipient.id,
          body: text,
        })
        .select('id, created_at')
        .single()
      if(error){
        showToast(`Could not send your message: ${error.message}`)
        return
      }
      newMessage.id = data.id
    }
    setMessages((current) =>({
      ...current,
      [conversationKey]:(current[conversationKey] || []).some((item) => item.id && item.id === newMessage.id)
        ? current[conversationKey]
        : [...(current[conversationKey] || []), newMessage],
    }))
    setMessageDraft('')
  }

  const openFriendChat = async(friend) =>{
    setCurrentChat(friend.name)
    setChatSection('Inbox')
    setInboxSelected(true)
    if(!supabase || !userId || !friend.id) return
    const{ data: directMessages, error } = await supabase
      .from('messages')
      .select('id, sender_id, sender_name, body, created_at')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${friend.id}),and(sender_id.eq.${friend.id},recipient_id.eq.${userId})`)
      .not('deleted_for', 'cs', `{${userId}}`)
      .order('created_at',{ ascending: true })
      .limit(50)
    if(error){
      showToast(`Could not load your conversation: ${error.message}`)
      return
    }
    setMessages((current) =>({
      ...current,
      [friend.name]: directMessages.map((message) =>({
        id: message.id,
        from: message.sender_id === userId ? profileName : message.sender_name,
        text: message.body,
        time: new Date(message.created_at).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' }),
      })),
    }))
  }

  const openGroupChat = async(group) =>{
    setCurrentGroupChat(group.name)
    setChatSection('Groups')
    if(!supabase || !userId || !group.id) return
    const{ data: groupMessages, error } = await supabase
      .from('messages')
      .select('id, sender_id, sender_name, body, created_at')
      .eq('group_id', group.id)
      .order('created_at',{ ascending: true })
      .limit(50)
    if(error){
      showToast(`Could not load group messages: ${error.message}`)
      return
    }
    setMessages((current) =>({
      ...current,
      [`group:${group.id}`]: groupMessages.map((message) =>({
        id: message.id,
        from: message.sender_id === userId ? profileName : message.sender_name,
        text: message.body,
        time: new Date(message.created_at).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' }),
      })),
    }))
  }

  const sendFriendRequest = async(name) =>{
    const person = people.find((friend) => friend.name === name)
    if(supabase && !userId){
      showToast('Sign in to connect with people.')
      return
    }
    if(person && friendsList.some((friend) => friend.id === person.id)){
      showToast(`You and ${name} are already friends.`)
      return
    }
    if(friendRequests.includes(name)){
      showToast(`You have already sent ${name} a friend request.`)
      return
    }
    if(person && incomingFriendRequests.some((request) => request.id === person.id)){
      showToast(`${name} has already sent you a request. Accept it from Friends or Notifications.`)
      setChatSection('Friends')
      return
    }
    if(supabase && userId && person?.id){
      const{ error } = await supabase.from('friend_requests').insert({
        sender_id: userId,
        recipient_id: person.id,
        status: 'pending',
      })
      if(error){
        showToast(`Could not send your friend request: ${error.message}`)
        return
      }
    }
    setFriendRequests((current) => current.includes(name) ? current : [...current, name])
    showToast(`Friend request sent to ${name}.`)
  }

  const acceptFriendRequest = async(request) =>{
    if(!supabase || !userId){
      showToast('Sign in to accept friend requests.')
      return false
    }
    const{ error } = await supabase.rpc('accept_community_friend_request',{ request_id: request.requestId })
    if(error){
      showToast(`Could not accept ${request.name}’s friend request: ${error.message}`)
      return false
    }
    const friend = people.find((person) => person.id === request.id)
    const acceptedFriend ={ ...request, status: 'Member' }
    setFriendsList((current) => current.some((item) => item.id === request.id)
      ? current
      : [...current, friend || acceptedFriend])
    setIncomingFriendRequests((current) => current.filter((item) => item.requestId !== request.requestId))
    showToast(`You and ${request.name} are now friends.`)
    return true
  }

  const openInbox = async() =>{
    setInboxSelected(false)
    if(!supabase || !userId){
      setInboxConversations(people.filter((person) =>(messages[person.name] || []).length))
      return
    }
    const{ data: directMessages, error } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, sender_name, body, created_at')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .not('recipient_id', 'is', null)
      .not('deleted_for', 'cs', `{${userId}}`)
      .order('created_at',{ ascending: false })
      .limit(100)
    if(error){
      showToast(`Could not load your inbox: ${error.message}`)
      return
    }
    const latestByPerson = new Map()
    for(const message of directMessages){
      const otherId = message.sender_id === userId ? message.recipient_id : message.sender_id
      if(!latestByPerson.has(otherId)){
        const person = people.find((item) => item.id === otherId)
        latestByPerson.set(otherId,{
          ...(person ||{ id: otherId, name: message.sender_name || 'Community member', color: '#bd8f75' }),
          lastMessage: message.body,
        })
      }
    }
    setInboxConversations([...latestByPerson.values()])
  }

  const openProfile =(person) =>{
    setProfileTarget(person?.id === userId || person?.name === profileName ? null : person)
    setActivePage('Profile')
    setQuery('')
    setNotificationsOpen(false)
    setOpenMenu(null)
  }

  const uploadProfilePhoto = async(file) =>{
    if(!file || !supportedPhotoTypes.has(file.type) || file.size >= 1_000_000){
      showToast('Choose one image smaller than 1 MB.')
      return false
    }
    if(!supabase || !userId){
      showToast('Sign in to add a profile photo.')
      return false
    }
    const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    const imagePath = `${userId}/${crypto.randomUUID()}.${extension}`
    const{ error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(imagePath, file,{ upsert: false, contentType: file.type })
    if(uploadError){
      showToast(`Could not upload your profile photo: ${uploadError.message}`)
      return false
    }
    const imageUrl = supabase.storage.from('profile-photos').getPublicUrl(imagePath).data.publicUrl
    const{ error: profileError } = await supabase.from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('id', userId)
      .select('id')
      .single()
    if(profileError){
      const{ error: removeError } = await supabase.storage.from('profile-photos').remove([imagePath])
      if(removeError) showToast(`Could not save your profile photo, and its upload could not be removed: ${removeError.message}`)
      else showToast(`Could not save your profile photo: ${profileError.message}`)
      return false
    }
    setProfilePhotoUrl(imageUrl)
    setPeople((current) => current.map((person) => person.id === userId ?{ ...person, avatarUrl: imageUrl } : person))
    showToast('Your profile photo was updated.')
    return true
  }

  const deletePost = async(post) =>{
    if(supabase && typeof post.id === 'string'){
      if(isAdmin){
        const{ error } = await supabase.rpc('admin_delete_post',{ target_post_id: post.id })
        if(error){
          showToast(`Could not delete this post: ${error.message}`)
          return
        }
      } else if(userId){
        const{ data, error } = await supabase.from('posts').delete()
          .eq('id', post.id)
          .eq('author_id', userId)
          .select('id')
          .maybeSingle()
        if(error){
          showToast(`Could not delete your post: ${error.message}`)
          return
        }
        if(!data){
          showToast('You do not have permission to delete this post.')
          return
        }
      } else{
        showToast('Sign in to delete your post.')
        return
      }
    }
    setPosts((current) => current.filter((item) => item.id !== post.id))
    setOpenMenu(null)
    showToast('Post deleted.')
  }

  const deleteEvent = async(event) =>{
    if(!isAdmin || !supabase || !event.id){
      showToast('Only admins can delete published events.')
      return false
    }
    const{ error } = await supabase.rpc('admin_delete_event',{ target_event_id: event.id })
    if(error){
      showToast(`Could not delete this event: ${error.message}`)
      return false
    }
    setEvents((current) => current.filter((item) => item.id !== event.id))
    showToast('Event deleted.')
    return true
  }

  const banUser = async(person) =>{
    if(!isAdmin || !person.id || person.id === userId){
      showToast('You cannot change this account’s ban status.')
      return
    }
    const shouldBan = !person.isBanned
    const action = shouldBan ? 'ban' : 'unban'
    if(!window.confirm(`Are you sure you want to ${action} ${person.name}?`)) return
    const{ error } = await supabase.rpc('admin_set_user_banned',{
      target_user_id: person.id,
      should_ban: shouldBan,
    })
    if(error){
      showToast(`Could not ${action} this user: ${error.message}`)
      return
    }
    setPeople((current) => current.map((user) => user.id === person.id
      ?{ ...user, isBanned: shouldBan }
      : user))
    if(shouldBan){
      setFriendsList((current) => current.filter((friend) => friend.id !== person.id))
      setInboxConversations((current) => current.filter((friend) => friend.id !== person.id))
      setIncomingFriendRequests((current) => current.filter((request) => request.id !== person.id))
    }
    showToast(shouldBan ? `${person.name} has been banned.` : `${person.name} has been unbanned.`)
  }

  const deleteGroup = async(group) =>{
    if(!isAdmin || !supabase || !group.id){
      showToast('Only admins can delete published groups.')
      return false
    }
    if(!window.confirm(`Delete ${group.name} and its group messages?`)) return false
    const{ error } = await supabase.rpc('admin_delete_group',{ target_group_id: group.id })
    if(error){
      showToast(`Could not delete this group: ${error.message}`)
      return false
    }
    setCommunities((current) => current.filter((item) => item.id !== group.id))
    setJoinedCommunities((current) => current.filter((name) => name !== group.name))
    setMessages((current) =>{
      const next ={ ...current }
      delete next[`group:${group.id}`]
      return next
    })
    if(currentGroupChat === group.name) setCurrentGroupChat('')
    setModal(null)
    showToast(`${group.name} was deleted.`)
    return true
  }

  const renderWall =() =>(
    <Community
      profileName={profileName}
      profileHandle={profileHandle}
      profilePhotoUrl={profilePhotoUrl}
      communities={communities}
      joinedCommunities={joinedCommunities}
      discoverGroupIds={discoverGroupIds}
      people={people}
      friendsList={friendsList}
      incomingFriendRequests={incomingFriendRequests}
      friendRequests={friendRequests}
      query={query}
      setQuery={setQuery}
      messages={messages}
      chatSection={chatSection}
      currentChat={currentChat}
      currentGroupChat={currentGroupChat}
      notifications={notifications}
      unreadCount={unreadCount}
      events={events}
      setEvents={setEvents}
      isAdmin={isAdmin}
      userId={userId}
      composer={renderComposer()}
      renderPost={renderPost}
      filteredPosts={filteredPosts}
      messageDraft={messageDraft}
      setMessageDraft={setMessageDraft}
      setChatSection={setChatSection}
      setCurrentChat={setCurrentChat}
      setCurrentGroupChat={setCurrentGroupChat}
      setModal={setModal}
      navigate={navigate}
      toggleJoin={toggleJoin}
      sendMessage={sendMessage}
      sendFriendRequest={sendFriendRequest}
      acceptFriendRequest={acceptFriendRequest}
      openGroupChat={openGroupChat}
      onOpenWallTab={(tab) =>{
        setChatSection(tab)
        if(tab === 'Groups') setCurrentGroupChat('')
      }}
      markNotificationRead={markNotificationRead}
      markNotificationsRead={markNotificationsRead}
      onProfileClick={openProfile}
      onDeleteEvent={deleteEvent}
      onGroupAction={(group) => setModal({ type: 'group-options', group })}
      onDeleteChat={(friendName) => setModal({ type: 'delete-chat', friendName })}
      onViewInbox={openInbox}
      onSelectInboxChat={(friend) =>{
        setInboxSelected(true)
        openFriendChat(friend)
      }}
      inboxConversations={inboxConversations}
      inboxSelected={inboxSelected}
      toast={toast}
      showToast={showToast}
      onRequestLogin={() => setAuthPage('login')}
      profileContent={activePage === 'Profile' ? renderProfile() : null}
    />
  )
  const markNotificationsRead = async() =>{
    setNotifications((current) => current.map((item) =>({ ...item, read: true })))
    if(supabase && userId){
      const{ error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      if(error) showToast(`Could not update notifications: ${error.message}`)
    }
  }

  const markNotificationRead = async(notificationId) =>{
    setNotifications((current) => current.map((item) => item.id === notificationId ?{ ...item, read: true } : item))
    if(supabase && userId && typeof notificationId === 'string'){
      const{ error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
      if(error) showToast(`Could not update notification: ${error.message}`)
    }
  }

  const signOut = async() =>{
    if(supabase){
      const{ error } = await supabase.auth.signOut()
      if(error){
        showToast(`Could not sign out: ${error.message}`)
        return
      }
    }
    setUserId(null)
    setProfileHandle('')
    setProfileBio('')
    setProfilePhotoUrl('')
    setIsAdmin(false)
    setAuthPage('login')
  }

  const renderComposer =() =>(
    <PostComposer
      composerText={composerText}
      composerImage={composerImage}
      profileName={profileName}
      profilePhotoUrl={profilePhotoUrl}
      onComposerTextChange={setComposerText}
      onComposerImageChange={setComposerImage}
      onComposerFileChange={setComposerFile}
      onPublish={publishPost}
      showToast={showToast}
    />
  )

  const renderPost =(post) =>(
    <PostCard
      key={post.id}
      post={{
        ...post,
        avatarUrl: post.authorId === userId
          ? profilePhotoUrl
          : people.find((person) => person.id === post.authorId)?.avatarUrl || '',
      }}
      openMenu={openMenu}
      savedPosts={savedPosts}
      canModerate={isAdmin}
      comments={commentsByPost[post.id] || []}
      commentsExpanded={expandedCommentPosts.includes(post.id)}
      commentsHasMore={Boolean(commentsHasMore[post.id])}
      commentsLoading={Boolean(loadingComments[post.id])}
      onToggleComments={toggleComments}
      onLoadOlderComments={loadOlderComments}
      onSetOpenMenu={setOpenMenu}
      onToggleSave={toggleSave}
      onDelete={() => deletePost(post)}
      onReport={() =>{
        setOpenMenu(null)
        showToast('Thanks. This post has been reported for review.')
      }}
      onToggleLike={toggleLike}
      onShare={sharePost}
      onAddComment={addComment}
      onProfileClick={openProfile}
    />
  )

  const renderFeed =(title, subtitle, showComposer = false) =>(
    <>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
       {activePage === 'Explore' && <span className="feed-label">For you</span>}
      </div>
     {(showComposer || activePage === 'Status') && renderComposer()}
      <section className="feed" aria-label="Post feed">
       {filteredPosts.length
          ? filteredPosts.map(renderPost)
          : <div className="empty-state"><span></span><h3>{query ? 'No matches found' : 'Nothing here yet'}</h3><p>{query ? 'Try a different search.' : 'Share an update to get the conversation started.'}</p></div>}
      </section>
    </>
  )

  const renderMessages =() =>{
    const chatMessages = messages[currentChat] || []
    return(
      <>
        <div className="section-title"><div><h2>Messages</h2><p>Keep in touch with your friends.</p></div></div>
        <section className="messages-layout">
          <div className="conversation-list">
           {people.map((friend) =>(
              <button type="button" key={friend.name} className={currentChat === friend.name ? 'conversation active' : 'conversation'} onClick={() => openFriendChat(friend)}>
                <span className="avatar small" style={{ background: friend.color }}>{friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : friend.name[0]}</span>
                <span><strong>{friend.name}</strong><small>{(messages[friend.name] || []).at(-1)?.text || friend.status}</small></span>
               {(friend.status === 'online' || friend.status === 'away') && <i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} />}
              </button>
            ))}
          </div>
          <div className="chat-panel">
            <div className="chat-heading"><span className="avatar tiny avatar-olive">{people.find((friend) => friend.name === currentChat)?.avatarUrl
              ? <img src={people.find((friend) => friend.name === currentChat).avatarUrl} alt="" />
              : currentChat[0]}</span><div><strong>{currentChat}</strong><small>{people.find((friend) => friend.name === currentChat)?.status}</small></div></div>
            <div className="chat-messages">
             {chatMessages.map((message, index) =>(
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

  const renderProfile =() =>{
    const viewedPostCount = profileTarget?.id
      ? posts.filter((post) => post.authorId === profileTarget.id).length
      : profileTarget
        ? posts.filter((post) => post.author === profileTarget.name).length
        : posts.filter((post) => post.mine).length
    return(
      <ProfilePage
        profileTarget={profileTarget}
        profileName={profileName}
        profileHandle={profileHandle}
        profileBio={profileTarget ? profileTarget.bio || '' : profileBio}
        profilePhotoUrl={profilePhotoUrl}
        userId={userId}
        postCount={viewedPostCount}
        friendsList={friendsList}
        filteredPosts={filteredPosts}
        renderPost={renderPost}
        onSignOut={signOut}
        onEditProfile={() =>{
            setProfileDraft(profileName)
            setProfileBioDraft(profileBio)
            setModal({ type: 'edit-profile' })
        }}
        onHome={() => navigate('Home')}
        onProfileClick={openProfile}
        isAdmin={isAdmin}
        people={people}
        onBanUser={banUser}
        onUploadProfilePhoto={uploadProfilePhoto}
        communities={communities}
        onDeleteGroup={deleteGroup}
      />
    )
  }



  const renderMain =() =>{
    if(activePage === 'Communities') return(
      <CommunityDirectory
        communities={communities}
        joinedCommunities={joinedCommunities}
        query={query}
        onCreate={() => setModal({ type: 'create-community' })}
        onToggleJoin={toggleJoin}
      />
    )
    if(activePage === 'Messages') return renderMessages()
    if(activePage === 'Profile') return renderProfile()
    const [title, subtitle] = pageDetails[activePage] || pageDetails.Home
    return renderFeed(title, subtitle, activePage === 'Home')
  }

  if(authPage === 'login') return(
    <Login
      onRegister={() => setAuthPage('register')}
      onForgotPassword={() => setAuthPage('forgot')}
      onLoginSuccess={(user) =>{
        if(user) setUserId(user.id)
        setAuthPage(null)
      }}
    />
  )
  if(authPage === 'register') return(
    <Register
      onLogin={() => setAuthPage('login')}
      onRegisterSuccess={(user) =>{
        if(user) setUserId(user.id)
        setAuthPage(null)
      }}
    />
  )
  if(authPage === 'forgot') return <ForgotPassword onLogin={() => setAuthPage('login')} />
  if(authPage === 'reset') return <ResetPassword onLogin={() => setAuthPage('login')} />

  return(
    <div className={activePage === 'Home' || activePage === 'Profile' ? 'page-shell wall-shell dark-mode' : 'page-shell dark-mode'}>
     {activePage === 'Home' || activePage === 'Profile' ? renderWall() : <div className="social-app">
        <aside className="sidebar">
          <button type="button" className="brand-wrap" onClick={() => navigate('Home')} aria-label="Go to home">
            <span className="brand-mark">M</span>
            <span><span className="eyebrow">community</span><strong className="brand-name">Maha gedara</strong></span>
          </button>

          <nav className="nav" aria-label="Main navigation">
           {navigation.map((item) =>(
              <button key={item.label} className={activePage === item.label ? 'nav-item active' : 'nav-item'} type="button" onClick={() => navigate(item.label)}>
                <span className="nav-icon" aria-hidden="true"><item.icon className="ui-icon" /></span><span>{item.label}</span>
               {item.label === 'Messages' && <span className="nav-count">2</span>}
              </button>
            ))}
          </nav>

          <button type="button" className="mini-card profile-card" onClick={() => navigate('Profile')}>
            <div className="avatar large avatar-rose">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : profileName[0]}</div>
            <span><strong>{profileName}</strong><small>{profileHandle}</small></span>
            <span className="badge">Pro</span>
          </button>
          <div className="sidebar-footer"><span className="online-dot" /> Your community is better with you.</div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <label className="search-wrap">
              <span aria-hidden="true"><SearchIcon className="ui-icon" /></span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search friends, posts or places" aria-label="Search friends, posts or places" />
             {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </label>
            <div className="top-actions">
              <div className="notification-wrap">
                <button className="icon-button notification-button" type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => setNotificationsOpen(!notificationsOpen)}>
                  <BellIcon className="ui-icon" />{unreadCount > 0 && <span className="notification-dot" />}
                </button>
               {notificationsOpen &&(
                  <div className="notification-popover">
                    <div className="popover-heading"><strong>Notifications</strong><button type="button" onClick={markNotificationsRead}>Mark all read</button></div>
                   {notifications.map((item) =>{
                      const request = incomingFriendRequests.find((friendRequest) =>
                        item.text === `${friendRequest.name} sent you a friend request.`
                      )
                      return(
                        <div key={item.id} className={item.read ? 'notification-item' : 'notification-item unread'}>
                          <span className="notification-avatar"></span>
                          <p>{item.text}<small>{item.time}</small></p>
                         {request && <button type="button" onClick={async() =>{
                            if(await acceptFriendRequest(request)) markNotificationRead(item.id)
                          }}>Accept</button>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <button className="icon-button" type="button" aria-label="Open messages" onClick={() => navigate('Messages')}><EmailIcon className="ui-icon" /></button>
              <button className="avatar small avatar-olive top-avatar" type="button" aria-label="Open your profile" onClick={() => navigate('Profile')}>{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : profileName[0]}</button>
            </div>
          </header>
          <div className="main-content">{renderMain()}</div>
        </main>

        <aside className="right-panel">
          <section className="profile-summary">
            <div className="cover" />
            <div className="profile-info">
              <div className="avatar large avatar-olive">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : profileName[0]}</div>
              <h2>{profileName}</h2><p>{profileHandle}</p>
              <button type="button" className="profile-link" onClick={() => navigate('Profile')}>View profile <span>→</span></button>
            </div>
            <div className="stats-grid">
             {[['Posts', `${posts.filter((post) => post.mine).length + 18}`], ['Followers', '86k'], ['Following', '132']].map(([label, value]) =>(
                <div key={label} className="stat-box"><strong>{value}</strong><span>{label}</span></div>
              ))}
            </div>
          </section>

          <section className="mini-card side-section">
            <div className="section-head"><h3>Communities</h3></div>
           {communities.slice(0, 3).map((community) =>(
              <button type="button" key={community.name} className="community-item" onClick={() => navigate('Communities')}>
                <span className="dot" style={{ background: community.tone }} />
                <span><strong>{community.name}</strong><small>{community.members} members</small></span>
               {joinedCommunities.includes(community.name) && <span className="joined-mark">✓</span>}
              </button>
            ))}
          </section>

          <section className="mini-card side-section">
            <div className="section-head"><h3>Friends</h3><button type="button" onClick={() => navigate('Messages')}>Message</button></div>
           {people.map((friend) =>(
              <button type="button" key={friend.name} className="friend-item" onClick={() =>{
                openFriendChat(friend)
                navigate('Messages')
              }}>
                <span className="avatar tiny" style={{ background: friend.color }}>{friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : friend.name[0]}</span>
                <span className="friend-meta"><strong>{friend.name}</strong><small>{friend.status}</small></span>
               {(friend.status === 'online' || friend.status === 'away') && <i className={friend.status === 'online' ? 'online-dot' : 'online-dot away'} />}
              </button>
            ))}
          </section>
          <p className="copyright">© 2026 Mahagedara · Made for community</p>
        </aside>
      </div>}

     {modal &&(
        <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}>
          <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setModal(null)} aria-label="Close dialog">×</button>
           {modal.type === 'edit-profile' &&(
              <>
                <h2>Edit your profile</h2><p className="modal-intro">Update how your community sees you.</p>
                <form onSubmit={async(event) =>{
                  event.preventDefault()
                  if(!profileDraft.trim()){
                    showToast('Your name cannot be empty.')
                    return
                  }
                  if(supabase && userId){
                    const{ error } = await supabase.from('profiles').update({
                      display_name: profileDraft.trim(),
                      bio: profileBioDraft.trim(),
                    }).eq('id', userId)
                    if(error){
                      showToast(`Could not update your profile: ${error.message}`)
                      return
                    }
                  }
                  setProfileName(profileDraft.trim())
                  setProfileBio(profileBioDraft.trim())
                  setModal(null)
                  showToast('Profile updated.')
                }}>
                  <label className="field-label">Display name<input autoFocus value={profileDraft} onChange={(event) => setProfileDraft(event.target.value)} /></label>
                  <label className="field-label">Username<input value={profileHandle} readOnly /></label>
                  <label className="field-label">Bio<textarea rows="4" maxLength="300" placeholder="Tell your community a little about yourself." value={profileBioDraft} onChange={(event) => setProfileBioDraft(event.target.value)} /></label>
                  <small className="bio-character-count">{profileBioDraft.length}/300</small>
                  <button className="primary-btn modal-submit" type="submit">Save changes</button>
                </form>
              </>
            )}
           {modal.type === 'create-community' &&(
              <CreateCommunityForm
                supabase={supabase}
                userId={userId}
                communities={communities}
                friendsList={friendsList}
                setCommunities={setCommunities}
                setJoinedCommunities={setJoinedCommunities}
                setCurrentGroupChat={setCurrentGroupChat}
                setChatSection={setChatSection}
                setDiscoverGroupIds={setDiscoverGroupIds}
                setModal={setModal}
                showToast={showToast}
              />
            )}
           {modal.type === 'group-options' &&(
              <>
                <h2>{modal.group.name}</h2>
                <p className="modal-intro">{modal.group.description}</p>
               {modal.group.invite_link && <label className="field-label">Invite link<input readOnly value={modal.group.invite_link} /></label>}
                <button className="secondary-btn group-option-button" type="button" onClick={async() =>{
                  const group = modal.group
                  if(!group.id || !userId){
                    showToast('Sign in to manage group membership.')
                    return
                  }
                  const{ error } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', userId)
                  if(error){
                    showToast(`Could not leave this group: ${error.message}`)
                    return
                  }
                  setJoinedCommunities((current) => current.filter((name) => name !== group.name))
                  setCurrentGroupChat('')
                  setModal(null)
                  showToast(`You left ${group.name}.`)
                }}>Leave group</button>
                <button className="secondary-btn group-option-button" type="button" onClick={() => setModal({ type: 'add-group-member', group: modal.group })}>Add friend</button>
               {(isAdmin || modal.group.created_by === userId) && <button className="text-action danger-action group-option-button" type="button" onClick={async() =>{
                  const group = modal.group
                  const{ error } = isAdmin
                    ? await supabase.rpc('admin_delete_group',{ target_group_id: group.id })
                    : await supabase.rpc('delete_community_group',{ target_group_id: group.id })
                  if(error){
                    showToast(`Could not delete this group: ${error.message}`)
                    return
                  }
                  setCommunities((current) => current.filter((item) => item.id !== group.id))
                  setJoinedCommunities((current) => current.filter((name) => name !== group.name))
                  setCurrentGroupChat('')
                  setModal(null)
                  showToast(`${group.name} was deleted.`)
                }}>Delete group</button>}
              </>
            )}
           {modal.type === 'add-group-member' &&(
              <>
                <h2>Add a friend</h2><p className="modal-intro">Invite someone to{modal.group.name}.</p>
                <form onSubmit={async(event) =>{
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  const friendId = String(formData.get('friend-id') || '')
                  const friend = friendsList.find((person) => person.id === friendId)
                  if(!friend){
                    showToast('Choose one of your friends.')
                    return
                  }
                  const{ error } = await supabase.rpc('add_community_group_members',{
                    target_group_id: modal.group.id,
                    member_ids: [friend.id],
                  })
                  if(error){
                    showToast(`Could not add ${friend.name} to the group: ${error.message}`)
                    return
                  }
                  setModal(null)
                  showToast(`${friend.name} was added to ${modal.group.name}.`)
                }}>
                  <label className="field-label">Friend
                    <select name="friend-id" required defaultValue="">
                      <option value="" disabled>Select a friend</option>
                     {friendsList.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}
                    </select>
                  </label>
                  <button className="primary-btn modal-submit" type="submit">Add to group</button>
                </form>
              </>
            )}
           {modal.type === 'delete-chat' &&(
              <>
                <h2>Delete conversation?</h2><p className="modal-intro">This removes the conversation with{modal.friendName} from your inbox.</p>
                <button className="text-action danger-action group-option-button" type="button" onClick={async() =>{
                  const friend = people.find((person) => person.name === modal.friendName)
                  if(supabase && userId && friend?.id){
                    const{ error } = await supabase.rpc('hide_direct_conversation',{ other_user_id: friend.id })
                    if(error){
                      showToast(`Could not delete this conversation: ${error.message}`)
                      return
                    }
                  }
                  setMessages((current) =>({ ...current, [modal.friendName]: [] }))
                  setInboxConversations((current) => current.filter((person) => person.name !== modal.friendName))
                  setInboxSelected(false)
                  setCurrentChat('World')
                  setModal(null)
                  showToast('Conversation deleted.')
                }}>Delete conversation</button>
              </>
            )}
           {modal.type === 'create-event' && isAdmin &&(
              <>
                <h2>Publish a community event</h2><p className="modal-intro">Only community admins can publish event announcements.</p>
                <form onSubmit={async(event) =>{
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  const title = String(formData.get('event-title') || '').trim()
                  const date = String(formData.get('event-date') || '')
                  const detail = String(formData.get('event-detail') || '').trim()
                  if(!title || !date){
                    showToast('Add an event name and date.')
                    return
                  }
                  if(!supabase || !userId){
                    showToast('Sign in with your Supabase account to publish an event.')
                    return
                  }
                  const{ error } = await supabase.from('posts').insert({
                    author_id: userId,
                    author_name: profileName,
                    handle: profileHandle,
                    body: detail,
                    is_event: true,
                    event_title: title,
                    event_date: new Date(`${date}T12:00:00`).toISOString(),
                  })
                  if(error){
                    showToast(`Could not publish your event: ${error.message}`)
                    return
                  }
                  setEvents((current) => [{ title, detail: `${date} · ${detail || 'Community event'}`, date: new Date(`${date}T12:00:00`).toLocaleDateString('en',{ month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n'), image: '', tag: 'COMMUNITY EVENT' }, ...current])
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
           {modal.type === 'share' &&(
              <>
                <h2>Share this post</h2><p className="modal-intro">Choose friends and groups to share it with.</p>
                <div className="share-recipient-list">
                  <strong>Friends</strong>
                 {friendsList.filter((friend) => friend.id).map((friend) =>{
                    const recipientId = `friend:${friend.id}`
                    return <label className="share-recipient" key={recipientId}>
                      <input
                        type="checkbox"
                        checked={shareRecipientIds.includes(recipientId)}
                        onChange={() => setShareRecipientIds((current) => current.includes(recipientId)
                          ? current.filter((id) => id !== recipientId)
                          : [...current, recipientId])}
                      />
                      <span>{friend.name}</span>
                    </label>
                  })}
                 {!friendsList.some((friend) => friend.id) && <p className="wall-muted">No friends available to share with.</p>}
                  <strong>Groups</strong>
                 {communities.filter((group) => joinedCommunities.includes(group.name) && group.id).map((group) =>{
                    const recipientId = `group:${group.id}`
                    return <label className="share-recipient" key={recipientId}>
                      <input
                        type="checkbox"
                        checked={shareRecipientIds.includes(recipientId)}
                        onChange={() => setShareRecipientIds((current) => current.includes(recipientId)
                          ? current.filter((id) => id !== recipientId)
                          : [...current, recipientId])}
                      />
                      <span>{group.name}</span>
                    </label>
                  })}
                 {!communities.some((group) => joinedCommunities.includes(group.name) && group.id) && <p className="wall-muted">No joined groups available to share with.</p>}
                </div>
                <button className="primary-btn modal-submit" type="button" onClick={sendSharedPost}>Share post</button>
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
