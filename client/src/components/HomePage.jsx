import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { triggerConfetti } from './Canvas/Confetti';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Redirect authenticated users to appropriate page
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'group_admin') {
        navigate('/dashboard');
      } else {
        navigate('/feed');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Try to play programmatically (some browsers require a play() call even when muted)
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      const tryPlay = () => {
        v.play().catch(() => {});
      };
      tryPlay();
      v.addEventListener('loadedmetadata', tryPlay, { once: true });
      return () => v.removeEventListener('loadedmetadata', tryPlay);
    }
  }, []);

  return (
    <div>
      {/* HERO SECTION with background image */}
      <section style={{
        position: 'relative',
        height: 360,
        color: 'white',
        overflow: 'hidden',
        backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute', 
          inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{position: 'relative', zIndex: 1}}>
          <div className="container" style={{
            maxWidth: 1100, 
            margin: '0 auto', 
            textAlign: 'center', 
            padding: '70px 20px'
          }}>
            <h1 style={{
              fontSize: '3rem', 
              marginBottom: 10,
              textShadow: '3px 3px 6px rgba(0,0,0,0.9)'
            }}>
              FoodieConnect
            </h1>
            <p style={{
              opacity: 0.95, 
              fontSize: '1.2rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Create and manage cooking groups, share group recipes, and chat in real‑time.
            </p>
            {!isAuthenticated && (
              <div style={{
                display: 'flex', 
                gap: 16, 
                justifyContent: 'center', 
                marginTop: 24
              }}>
                <Link
                  to="/register"
                  style={{
                    background: '#ffffff',
                    color: '#5B86E5',
                    borderRadius: 50,
                    padding: '12px 28px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
                  }}
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="container" style={{
        maxWidth: 1100, 
        margin: '0 auto', 
        padding: '60px 20px'
      }}>
        <h2 style={{
          textAlign: 'center', 
          marginBottom: 40,
          fontSize: '2.5rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          What can you do?
        </h2>
        
        <div className="features-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          <div className="feature-card" style={{
            padding: '30px',
            background: 'white',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}>
            <div className="feature-icon" style={{fontSize: '3rem', marginBottom: '15px'}}>👨‍🍳</div>
            <h3 style={{marginBottom: '10px', color: '#333'}}>Manage Your Groups</h3>
            <p style={{color: '#666', lineHeight: '1.6'}}>Create and manage cooking groups, approve join requests, and keep members engaged.</p>
          </div>

          <div className="feature-card" style={{
            padding: '30px',
            background: 'white',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}>
            <div className="feature-icon" style={{fontSize: '3rem', marginBottom: '15px'}}>🍲</div>
            <h3 style={{marginBottom: '10px', color: '#333'}}>Share Group Recipes</h3>
            <p style={{color: '#666', lineHeight: '1.6'}}>Publish recipes to your groups and highlight the most popular ones.</p>
          </div>

          <div className="feature-card" style={{
            padding: '30px',
            background: 'white',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}>
            <div className="feature-icon" style={{fontSize: '3rem', marginBottom: '15px'}}>💬</div>
            <h3 style={{marginBottom: '10px', color: '#333'}}>Real‑time Chat</h3>
            <p style={{color: '#666', lineHeight: '1.6'}}>Start chatting instantly with your group members—no setup required.</p>
          </div>

          <div className="feature-card" style={{
            padding: '30px',
            background: 'white',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}>
            <div className="feature-icon" style={{fontSize: '3rem', marginBottom: '15px'}}>📊</div>
            <h3 style={{marginBottom: '10px', color: '#333'}}>Admin Dashboard</h3>
            <p style={{color: '#666', lineHeight: '1.6'}}>See total recipes you created and total pending join requests across all your groups.</p>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: 40}}>
          <Link
            to="/groups"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: 50,
              padding: '14px 36px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(102,126,234,0.35)',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 28px rgba(102,126,234,0.45)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(102,126,234,0.35)';
            }}
          >
            Explore Groups →
          </Link>
        </div>
      </section>

      {/* VIDEO SECTION - HTML5 Video requirement */}
      <section className="container" style={{
        maxWidth: 1100, 
        margin: '0 auto', 
        padding: '40px 20px',
        background: '#f9fafb',
        borderRadius: 20,
        marginBottom: 40
      }}>
        <h2 style={{
          textAlign: 'center', 
          marginBottom: 20,
          fontSize: '2.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          color: '#333'
        }}>
          🌟 Get Inspired. Cook. Share.
        </h2>
        <p style={{
          textAlign: 'center', 
          marginBottom: 30, 
          color: '#555',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Discover amazing recipes from home chefs around the world!
        </p>
        
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{maxWidth: 720, width: '100%'}}>
            <div style={{
              position: 'relative',
              borderRadius: 15,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              backgroundColor: '#000'
            }}>
              <video 
                ref={videoRef}
                controls 
                autoPlay 
                muted 
                loop 
                playsInline
                preload="metadata"
                style={{ width: '100%', display: 'block' }}
              >
                {/* HTML5 Video element as required - cooking video */}
                <source src="https://res.cloudinary.com/dnelwpbaq/video/upload/v1761722711/73050-548172845_small_pnpv1l.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => triggerConfetti({ durationMs: 1500 })}
                style={{
                  background: '#fff',
                  color: '#5B86E5',
                  borderRadius: 50,
                  padding: '10px 22px',
                  border: '1px solid #5B86E5',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Celebrate (Canvas)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;