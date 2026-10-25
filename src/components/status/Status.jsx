import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase'
import './Status.css'

function Status({ events, setEvents, isAdmin, userId, profileName, showToast, eventIndex: controlledEventIndex, setEventIndex: setControlledEventIndex }) {
  const [internalEventIndex, setInternalEventIndex] = useState(0)
  const eventIndex = controlledEventIndex ?? internalEventIndex
  const setEventIndex = setControlledEventIndex ?? setInternalEventIndex
  const [createOpen, setCreateOpen] = useState(false)
  useEffect(() => {
    if (!events.length) return undefined
    const intervalId = window.setInterval(() => {
      setEventIndex((index) => (index + 1) % events.length)
    }, 6000)
    return () => window.clearInterval(intervalId)
  }, [events.length, setEventIndex])

  if (!events.length) return null
  const currentIndex = eventIndex % events.length
  const event = events[currentIndex]
  const nextEvent = events[(currentIndex + 1) % events.length]
  const moveEvent = (direction) => {
    setEventIndex((index) => (index + direction + events.length) % events.length)
  }
  const publishEvent = async (formEvent) => {
    formEvent.preventDefault()
    const formData = new FormData(formEvent.currentTarget)
    const title = String(formData.get('event-title') || '').trim()
    const date = String(formData.get('event-date') || '')
    const detail = String(formData.get('event-detail') || '').trim()
    if (!title || !date) {
      showToast('Add an event name and date.')
      return
    }
    if (!supabase || !userId) {
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
    if (error) {
      showToast(`Could not publish your event: ${error.message}`)
      return
    }
    setEvents((current) => [{
      title,
      detail: `${date} · ${detail || 'Community event'}`,
      date: new Date(`${date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: '2-digit' }).toUpperCase().replace(' ', '\n'),
      image: events[0].image,
      tag: 'COMMUNITY EVENT',
    }, ...current])
    setEventIndex(0)
    setCreateOpen(false)
    showToast('Your event is on the community wall.')
  }

  return (
    <>
      <section className="wall-events" aria-label="Community events">
        <div className="wall-event-heading">
          <div><h2>{event.title}</h2><small>{event.detail}</small></div>
          <div className="wall-event-controls">
            <button type="button" aria-label="Previous event" onClick={() => moveEvent(-1)}>‹</button>
            <button type="button" aria-label="Next event" onClick={() => moveEvent(1)}>›</button>
            {isAdmin && <button type="button" className="event-create" onClick={() => setCreateOpen(true)}>＋</button>}
          </div>
        </div>
        <div className="wall-event-track">
          <div className="wall-event-feature-viewport">
            <div className="wall-event-feature-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {events.map((slide) => (
                <article
                  key={slide.title}
                  className="wall-event-feature"
                  style={{ backgroundImage: `linear-gradient(0deg, rgba(30,22,20,.72), transparent 72%), url("${slide.image}")` }}
                >
                  <span className="wall-event-tag">✦ {slide.tag}</span>
                  <span className="wall-event-date">{slide.date.split('\n').map((line) => <span key={line}>{line}</span>)}</span>
                  <p>{slide.detail.split(' · ')[0]}</p>
                </article>
              ))}
            </div>
          </div>
          <article className="wall-event-side">
            <img src={nextEvent.image} alt="" />
            <small>THIS WEEK · 2 PM</small>
            <strong>{nextEvent.title}</strong>
            <span>{nextEvent.detail}</span>
          </article>
        </div>
        <div className="wall-event-dots" aria-hidden="true">
          {events.map((slide, index) => <span key={slide.title} className={index === currentIndex ? 'active' : ''} />)}
        </div>
      </section>
      {createOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setCreateOpen(false)}>
          <section className="modal-card" role="dialog" aria-modal="true" onClick={(formEvent) => formEvent.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setCreateOpen(false)} aria-label="Close dialog">×</button>
            <h2>Publish a community event</h2><p className="modal-intro">Only community admins can publish event announcements.</p>
            <form onSubmit={publishEvent}>
              <label className="field-label">Event name<input name="event-title" autoFocus placeholder="e.g. Saturday neighborhood picnic" required /></label>
              <label className="field-label">Date<input name="event-date" type="date" required /></label>
              <label className="field-label">A few details<input name="event-detail" placeholder="Place, time, or what to bring" /></label>
              <button className="primary-btn modal-submit" type="submit">Publish event</button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default Status