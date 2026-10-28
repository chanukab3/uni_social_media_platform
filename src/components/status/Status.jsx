import{ useRef, useState } from 'react'
import{ supabase } from '../../../supabase'
import './Status.css'

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const maxEventImageSize = 10_000_000

function EventCards({ events, onSelect }){
  return events.map((event, index) =>(
    <button
      type="button"
      className="wall-event-card"
      key={`${event.title}-${index}`}
      style={{ backgroundImage: event.image
        ? `linear-gradient(0deg, rgba(10, 6, 18, .84), rgba(10, 6, 18, .08) 78%), url("${event.image}")`
        : 'linear-gradient(0deg, rgba(10, 6, 18, .84), rgba(10, 6, 18, .08) 78%)' }}
      onClick={() => onSelect(index)}
    >
      
      <span className="wall-event-date">{event.date.split('\n').map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{line}</span>)}</span>
      <span className="wall-event-card-copy">
        <strong>{event.title}</strong>
        <span>{event.detail}</span>
      </span>
    </button>
  ))
}

function Status({ events, setEvents, isAdmin, userId, profileName, profileHandle, showToast, onDeleteEvent }){
  const [createOpen, setCreateOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [eventImage, setEventImage] = useState(null)
  const eventImageInputRef = useRef(null)

  const closeCreateEvent =() =>{
    setCreateOpen(false)
    setEventImage(null)
    if(eventImageInputRef.current) eventImageInputRef.current.value = ''
  }

  const publishEvent = async(formEvent) =>{
    formEvent.preventDefault()
    const formData = new FormData(formEvent.currentTarget)
    const title = String(formData.get('event-title') || '').trim()
    const date = String(formData.get('event-date') || '')
    const detail = String(formData.get('event-detail') || '').trim()
    if(!title || !date){
      showToast('Add an event name and date.')
      return
    }
    if(!isAdmin){
      showToast('Only admins can publish community events.')
      return
    }
    if(eventImage &&(!supportedImageTypes.has(eventImage.type) || eventImage.size >= maxEventImageSize)){
      showToast('Choose one JPG, PNG, WebP, or GIF event image smaller than 10 MB.')
      return
    }
    if(!supabase || !userId){
      showToast('Sign in with your Supabase account to publish an event.')
      return
    }
    let imageUrl = ''
    let uploadedImagePath = ''
    if(eventImage){
      const extension = eventImage.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
      uploadedImagePath = `${userId}/${crypto.randomUUID()}.${extension}`
      const{ error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(uploadedImagePath, eventImage,{ upsert: false, contentType: eventImage.type })
      if(uploadError){
        showToast(`Could not upload the event image: ${uploadError.message}`)
        return
      }
      imageUrl = supabase.storage.from('event-images').getPublicUrl(uploadedImagePath).data.publicUrl
    }
    const{ data, error } = await supabase.from('posts').insert({
      author_id: userId,
      author_name: profileName,
      handle: profileHandle,
      body: detail,
      is_event: true,
      event_title: title,
      event_date: new Date(`${date}T12:00:00`).toISOString(),
      image_url: imageUrl || null,
    }).select('id').single()
    if(error){
      if(uploadedImagePath){
        const{ error: cleanupError } = await supabase.storage.from('event-images').remove([uploadedImagePath])
        if(cleanupError){
          showToast(`Could not publish your event: ${error.message}. The uploaded image could not be removed: ${cleanupError.message}`)
          return
        }
      }
      showToast(`Could not publish your event: ${error.message}`)
      return
    }
    setEvents((current) => [{
      id: data.id,
      title,
      detail: `${date} · ${detail || 'Community event'}`,
      date: new Date(`${date}T12:00:00`).toLocaleDateString('en',{ month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n'),
      image: imageUrl,
      tag: 'COMMUNITY EVENT',
    }, ...current])
    closeCreateEvent()
    showToast('Your event is on the community wall.')
  }

  return(
    <>
      <section className="wall-events" aria-label="Community events">
        <header className="wall-event-heading">
          <div><h2>Ongoing events</h2><small>See what’s happening in your community</small></div>
         {isAdmin && <button type="button" className="event-create" onClick={() => setCreateOpen(true)} aria-label="Create event">＋</button>}
        </header>
        <div className="wall-event-strip">
         {events.length
            ? <EventCards events={events} onSelect={(index) =>{
              setSelectedEventIndex(index)
              setEventsOpen(true)
            }} />
            : <p className="wall-muted">No community events yet.</p>}
        </div>
      </section>

     {eventsOpen &&(
        <section className="wall-event-overlay" aria-label="Community event details">
          <header className="wall-event-overlay-heading">
            <div><h2>Community events</h2><p>Scroll sideways to explore what’s happening.</p></div>
            <button type="button" className="wall-event-overlay-close" onClick={() => setEventsOpen(false)} aria-label="Close events">Back to posts</button>
          </header>
          <div className="wall-event-dialog-strip">
            <EventCards events={events} onSelect={setSelectedEventIndex} />
          </div>
         {events[selectedEventIndex] &&(
            <article className="wall-event-detail">
             {events[selectedEventIndex].image && <img src={events[selectedEventIndex].image} alt="" />}
              <div>
                
                <h3>{events[selectedEventIndex].title}</h3>
                <p>{events[selectedEventIndex].detail}</p>
                <span className="wall-event-detail-date">{events[selectedEventIndex].date.replace('\n', ' ')}</span>
               {isAdmin && events[selectedEventIndex].id && onDeleteEvent && <button
                  className="text-action danger-action event-delete-button"
                  type="button"
                  onClick={async() =>{
                    const event = events[selectedEventIndex]
                    if(await onDeleteEvent(event)) setEventsOpen(false)
                  }}
                >Delete event</button>}
              </div>
            </article>
          )}
        </section>
      )}

     {createOpen &&(
        <div className="modal-backdrop" role="presentation" onClick={closeCreateEvent}>
          <section className="modal-card" role="dialog" aria-modal="true" onClick={(formEvent) => formEvent.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeCreateEvent} aria-label="Close dialog">×</button>
            <h2>Publish a community event</h2><p className="modal-intro">Only community admins can publish event announcements.</p>
            <form onSubmit={publishEvent}>
              <label className="field-label">Event name<input name="event-title" autoFocus placeholder="e.g. Saturday neighborhood picnic" required /></label>
              <label className="field-label">Date<input name="event-date" type="date" required /></label>
              <label className="field-label">A few details<input name="event-detail" placeholder="Place, time, or what to bring" /></label>
              <label className="field-label">Event image<input
                ref={eventImageInputRef}
                name="event-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>{
                  const file = event.target.files?.[0] || null
                  if(!file){
                    setEventImage(null)
                    return
                  }
                  if(!supportedImageTypes.has(file.type)){
                    showToast('Choose a JPG, PNG, WebP, or GIF event image.')
                    event.target.value = ''
                    setEventImage(null)
                    return
                  }
                  if(file.size >= maxEventImageSize){
                    showToast('Choose an event image smaller than 10 MB.')
                    event.target.value = ''
                    setEventImage(null)
                    return
                  }
                  setEventImage(file)
                }}
              /></label>
              <small className="event-image-hint">One image · JPG, PNG, WebP, or GIF · max 10 MB</small>
              <button className="primary-btn modal-submit" type="submit">Publish event</button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default Status
