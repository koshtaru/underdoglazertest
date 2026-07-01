import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

function About() {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    { 
      name: 'Todd', 
      role: 'Owner, Graphic Designer, Laser Designer', 
      image: '/img/todd-photo.jpg',
      bio: 'Founder and lead artisan behind Underdog Lazer, Todd brings years of hands-on experience in precision laser engraving and fabrication. He specializes in all material types from wood and metal to acrylic and leather, handling everything from corporate branding and promotional products to custom industrial marking. Todd personally oversees each project to ensure exceptional quality and client satisfaction.'
    },
    { 
      name: 'James', 
      role: 'Web Developer & IT Support | Founder, Crawfordigital', 
      image: '/img/james-photo.jpeg',
      bio: 'Founder of Crawfordigital and full-stack developer responsible for Underdog Lazer\'s complete digital presence and technical infrastructure. James designed and built this website from the ground up, manages all online operations, and handles comprehensive IT support for the business. His expertise in modern web development, analytics integration, and digital marketing ensures Underdog Lazer maintains a professional online presence that drives business growth.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>About — Underdog Lazer</title>
        <meta name="description" content="Learn about Underdog Lazer — custom laser engraving based in Fox Valley, WI. Personal service, no minimums, ships anywhere in the US." />
        <meta property="og:title" content="About — Underdog Lazer" />
        <meta property="og:description" content="Custom laser engraving based in Fox Valley, WI. Personal service, no minimums." />
      </Helmet>
      {/* About Hero Section */}
      <section className="about-hero" aria-labelledby="about-hero-title">
        <div className="container">
          <div className="about-hero__content">
            <h1 className="hero__title" id="about-hero-title">
              About Underdog Lazer
            </h1>
            <p className="hero__subtitle">
              Precision, quality, and exceptional service are at the heart of everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section" aria-labelledby="story-title">
        <div className="container">
          <div className="grid grid-2" style={{ gap: 'var(--space-xl)' }}>
            <div>
              <h2>Our Story</h2>
              <p>
                Underdog Lazer began the way most small businesses do – out of necessity and a little bit of stubborn 
                determination. Started with projects for local folks: custom signage, personalized gifts, and specialized 
                work when people couldn't find what they wanted anywhere else. From wood and metal to acrylic and leather, 
                I've built my reputation on delivering quality work across diverse materials and applications.
              </p>
              <p style={{ marginTop: 'var(--space-sm)' }}>
                That grassroots beginning taught me something the big companies never learn – every project is someone's 
                important project. Whether it's industrial marking, corporate branding, promotional products, or custom 
                personal items, I approach it all with the same care and attention to detail that got me started.
              </p>
            </div>

            <div>
              <h2>Our Mission</h2>
              <p>
                I'm not here to mass-produce – I'm here to create. My mission is bringing back the personal 
                touch that got lost in corporate efficiency. When you work with me, you get a craftsman who 
                stakes his name on every piece, whether it's custom promotional products, corporate branding, 
                industrial marking, or that one-of-a-kind personalized gift that means everything to you.
              </p>
              <p style={{ marginTop: 'var(--space-sm)' }}>
                Every project gets the same dedication, from the smallest custom piece to larger production runs. 
                I take the time to understand your vision, select the right materials, and deliver results that 
                reflect the pride I take in my craft. No committees, no corporate processes – just honest 
                craftsmanship and personal accountability for every detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="section" style={{ backgroundColor: 'var(--clr-bg-light)' }} aria-labelledby="team-title">
        <div className="container">
          <h2 className="section-title" id="team-title">Meet Our Team</h2>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {teamMembers.map((member) => (
              <div 
                key={member.name} 
                className="card"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  width: '100%',
                  maxWidth: '500px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedMember(member)}
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  style={{ 
                    width: '120px',
                    height: '120px',
                    borderRadius: 'var(--border-radius)',
                    objectFit: 'cover',
                    flexShrink: 0
                  }} 
                />
                <div>
                  <h3>{member.name}</h3>
                  <p style={{ marginTop: 'var(--space-xs)' }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Member Modal */}
        {selectedMember && (
          <div 
            className="material-modal-overlay"
            onClick={() => setSelectedMember(null)}
          >
            <div 
              className="material-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                backgroundImage: 'none',
                backgroundColor: 'var(--clr-bg)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <button 
                className="material-modal-close"
                onClick={() => setSelectedMember(null)}
                aria-label="Close modal"
              >
                ×
              </button>
              
              <div className="material-modal-header" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', textAlign: 'left' }}>
                <div className="material-modal-icon" style={{ fontSize: '4rem', marginBottom: 0, flexShrink: 0 }}>
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name}
                    style={{ 
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="material-modal-title">{selectedMember.name}</h3>
                  <p className="material-modal-tagline">{selectedMember.role}</p>
                </div>
              </div>
              
              <div className="material-modal-body">
                <p className="material-modal-description">
                  {selectedMember.bio}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default About; 