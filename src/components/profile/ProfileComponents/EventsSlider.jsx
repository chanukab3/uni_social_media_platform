import React, { useRef } from 'react';
import '../ProfileComponents-css/EventsSlider.css';

const eventsData = [
  {
    id: 1,
    title: 'seat at the Sunday table',
    subtitle: 'Prospect Park • Sunday, 12:00 PM',
    dateBadge: { month: 'OCT', day: '24' },
    isWeekend: true,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    type: 'large',
  },
  {
    id: 2,
    title: 'Make a little mess',
    subtitle: 'Clay & coffee workshop',
    dateBadge: { month: 'SEPT', day: '8' },
    isWeekend: false,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    type: 'large',
  },
  {
    id: 3,
    title: 'Morning Yoga in the Park',
    subtitle: 'Mindfulness & fresh air',
    dateBadge: { month: 'OCT', day: '24' },
    isWeekend: true,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    type: 'large',
  },
];

export default function EventsSlider() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="events-section">
      {/* Header Controls */}
      <header className="section-header">
        <div className="header-title-group">
          <h2 className="section-title">Good things are happening</h2>
          <span className="section-counter">12 near you</span>
        </div>
        <div className="carousel-controls">
          <button
            className="carousel-btn prev-btn"
            onClick={() => scroll('left')}
            aria-label="Previous events"
          >
            <svg viewBox="0 0 24 24" className="icon">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            className="carousel-btn next-btn"
            onClick={() => scroll('right')}
            aria-label="Next events"
          >
            <svg viewBox="0 0 24 24" className="icon">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Carousel Track */}
      <div className="events-carousel" ref={scrollRef}>
        {eventsData.map((event) =>
          event.type === 'large' ? (
            <article key={event.id} className="event-card large-card">
              <div className="card-media">
                <img src={event.image} alt={event.title} className="event-image" />
                <div className="badge-container">
                  {event.isWeekend && (
                    <span className="badge weekend-badge">✦ THIS WEEKEND</span>
                  )}
                  {event.dateBadge && (
                    <div className="date-badge">
                      <span className="month">{event.dateBadge.month}</span>
                      <span className="day">{event.dateBadge.day}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-overlay-content">
                <h3 className="event-title">{event.title}</h3>
                <div className="event-meta">
                  <span>📍 {event.subtitle}</span>
                </div>
              </div>
            </article>
          ) : (
            <article key={event.id} className="event-card small-card">
              <div className="card-media">
                <img src={event.image} alt={event.title} className="event-image" />
              </div>
              <div className="card-body">
                <span className="event-datetime">{event.datetime}</span>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-subtitle">{event.subtitle}</p>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}