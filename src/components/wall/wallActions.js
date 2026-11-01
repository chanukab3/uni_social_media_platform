import{ supabase } from '../../../supabase'

const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function createWallActions({
  activePage,
  chatSection,
  communities,
  composerFile,
  composerImage,
  composerText,
  currentChat,
  currentGroupChat,
  joinedCommunities,
  messageDraft,
  people,
  posts,
  profileName,
  savedPosts,
  setActivePage,
  setComposerFile,
  setComposerImage,
  setComposerText,
  setChatSection,
  setCurrentChat,
  setCurrentGroupChat,
  setFriendRequests,
  setMessages,
  setNotifications,
  setMessageDraft,
  setOpenMenu,
  setPosts,
  setSavedPosts,
  setModal,
  showToast,
  userId,
}){
  const publishPost = async(event) =>{
    event.preventDefault()
    const text = composerText.trim()
    if(!text && !composerImage){
      showToast('Write an update or add a photo before posting.')
      return false
    }
    if(composerFile &&(!supportedPhotoTypes.has(composerFile.type) || composerFile.size >= 5_000_000)){
      showToast('Choose one JPG, PNG, WebP, or GIF photo smaller than 5 MB.')
      return false
    }

    let postId = Date.now()
    let imageUrl = composerImage
    if(supabase && userId){
      if(composerFile){
        const safeName = composerFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const imagePath = `${userId}/${crypto.randomUUID()}-${safeName}`
        const{ error: uploadError } = await supabase.storage.from('post-images').upload(imagePath, composerFile,{ upsert: false })
        if(uploadError){
          showToast(`Could not upload your photo: ${uploadError.message}`)
          return false
        }
        imageUrl = supabase.storage.from('post-images').getPublicUrl(imagePath).data.publicUrl
      }
      const{ data, error } = await supabase.from('posts').insert({
        author_id: userId,
        author_name: profileName,
        handle: '@Username',
        body: text,
        image_url: imageUrl || null,
      }).select('id').single()
      if(error){
        showToast(`Could not publish your post: ${error.message}`)
        return false
      }
      postId = data.id
    }
    const newPost ={
      id: postId,
      author: profileName,
      handle: '@Username',
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
    if(supabase && userId && composerImage.startsWith('blob:')) URL.revokeObjectURL(composerImage)
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
    setPosts((current) => current.map((item) => item.id === postId
      ?{ ...item, liked: !item.liked, likes: item.likes +(item.liked ? -1 : 1) }
      : item))
  }

  const addComment = async(postId, text) =>{
    if(!text) return false
    if(supabase && !userId){
      showToast('Sign in to comment on posts.')
      return false
    }
    if(supabase && userId && typeof postId === 'string'){
      const{ error } = await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: userId,
        author_name: profileName,
        body: text,
      })
      if(error){
        showToast(`Could not add your comment: ${error.message}`)
        return false
      }
    }
    setPosts((current) => current.map((item) => item.id === postId
      ?{ ...item, comments: [...item.comments,{ author: profileName, text }] }
      : item))
    showToast('Comment added.')
    return true
  }

  const toggleSave =(postId) =>{
    const isSaved = savedPosts.includes(postId)
    setSavedPosts((current) => isSaved ? current.filter((id) => id !== postId) : [...current, postId])
    setOpenMenu(null)
    showToast(isSaved ? 'Post removed from your saved items.' : 'Post saved for later.')
  }

  const sharePost = async(post) =>{
    const shareText = `${post.author} on Mahagedara: ${post.text}`
    try{
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(shareText)
        showToast('Post text copied to clipboard.')
      } else{
        setModal({ type: 'share', post })
      }
    } catch{
      setModal({ type: 'share', post })
    }
  }

  const deletePost =(postId) =>{
    setPosts((current) => current.filter((item) => item.id !== postId))
    setOpenMenu(null)
    showToast('Your post was deleted.')
  }

  const reportPost =() =>{
    setOpenMenu(null)
    showToast('Thanks. This post has been reported for review.')
  }

  const sendMessage =(event) =>{
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
    setMessages((current) =>({
      ...current,
      [conversationKey]: [...(current[conversationKey] || []),{ from: profileName, text, time: 'now' }],
    }))
    if(supabase && userId && isWorldChat){
      supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        recipient_id: null,
        body: text,
        room: 'world',
      }).then(({ error }) =>{
        if(error) showToast(`Could not send your message: ${error.message}`)
      })
    } else if(supabase && userId && selectedGroup?.id){
      supabase.from('messages').insert({
        sender_id: userId,
        sender_name: profileName,
        group_id: selectedGroup.id,
        body: text,
      }).then(({ error }) =>{
        if(error) showToast(`Could not send your group message: ${error.message}`)
      })
    } else if(supabase && userId && selectedGroup){
      showToast('This group is not connected to Supabase yet.')
      return
    } else if(supabase && userId){
      const recipient = people.find((person) => person.name === currentChat)
      if(recipient?.id){
        supabase.from('messages').insert({
          sender_id: userId,
          sender_name: profileName,
          recipient_id: recipient.id,
          body: text,
        }).then(({ error }) =>{
          if(error) showToast(`Could not send your message: ${error.message}`)
        })
      }
    }
    setMessageDraft('')
  }

  const openFriendChat = async(friend) =>{
    setCurrentChat(friend.name)
    setChatSection('Inbox')
    if(!supabase || !userId || !friend.id) return
    const{ data: directMessages, error } = await supabase
      .from('messages')
      .select('sender_id, sender_name, body, created_at')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${friend.id}),and(sender_id.eq.${friend.id},recipient_id.eq.${userId})`)
      .order('created_at',{ ascending: true })
      .limit(50)
    if(error){
      showToast(`Could not load your conversation: ${error.message}`)
      return
    }
    setMessages((current) =>({
      ...current,
      [friend.name]: directMessages.map((message) =>({
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
      .select('sender_id, sender_name, body, created_at')
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
    if(supabase && userId && person?.id){
      const{ error } = await supabase.from('friend_requests').insert({
        sender_id: userId,
        recipient_id: person.id,
      })
      if(error){
        showToast(`Could not send your friend request: ${error.message}`)
        return
      }
    }
    setFriendRequests((current) => current.includes(name) ? current : [...current, name])
    showToast(`Friend request sent to ${name}.`)
  }

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

  return{
    publishPost,
    toggleLike,
    addComment,
    toggleSave,
    sharePost,
    deletePost,
    reportPost,
    sendMessage,
    openFriendChat,
    openGroupChat,
    sendFriendRequest,
    markNotificationsRead,
    markNotificationRead,
  }
}
