'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [plan, setPlan] = useState('free')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you'd typically send to your backend
    console.log('Waitlist signup:', { email, name, plan })
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(180deg, #0b1026 0%, #121a3b 50%, #1b2559 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,140,82,0.15) 0%, rgba(255,140,82,0) 60%)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0) 60%)',
          filter: 'blur(48px)'
        }} />

        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '500px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 16px 0',
            background: 'linear-gradient(90deg, #E5E7FF 0%, #C7D2FE 50%, #E5E7FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            You&apos;re on the list!
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(226, 232, 255, 0.8)',
            margin: '0 0 32px 0',
            lineHeight: 1.6
          }}>
            We&apos;ll notify you as soon as Small Wins is ready. Get ready to start winning every day!
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '14px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
            color: 'white',
            textDecoration: 'none',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(79,70,229,0.3)'
          }}>
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .formContainer { animation: fadeInUp 0.6s ease-out forwards; }
        .floatingIcon { animation: float 3s ease-in-out infinite; }
        .inputField {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        .inputField:focus {
          outline: none;
          border-color: #7C3AED;
          background: rgba(255,255,255,0.12);
        }
        .inputField::placeholder {
          color: rgba(226,232,255,0.5);
        }
        .selectField {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 16px;
          cursor: pointer;
        }
        .selectField:focus {
          outline: none;
          border-color: #7C3AED;
        }
        .submitButton {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          background: linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%);
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(79,70,229,0.3);
          transition: all 0.2s ease;
        }
        .submitButton:hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
      
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(180deg, #0b1026 0%, #121a3b 50%, #1b2559 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        color: 'white',
        padding: '32px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,140,82,0.15) 0%, rgba(255,140,82,0) 60%)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0) 60%)',
          filter: 'blur(48px)'
        }} />

        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '60px',
          position: 'relative',
          zIndex: 1
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(226,232,255,0.8)',
            textDecoration: 'none',
            fontSize: 14,
            marginBottom: '32px'
          }}>
            ← Back to Small Wins
          </Link>
          
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: '800',
            margin: '0 0 16px 0',
            background: 'linear-gradient(90deg, #E5E7FF 0%, #C7D2FE 50%, #E5E7FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Join the Waitlist
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.4vw, 18px)',
            color: 'rgba(226, 232, 255, 0.8)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Join 500+ people already waiting. Get early access, exclusive perks, and help shape the future of Small Wins!
          </p>
        </header>

        {/* Form Section */}
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.2)',
            position: 'relative'
          }} className="formContainer">
            {/* Floating icons */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              fontSize: '32px'
            }} className="floatingIcon">
              🎯
            </div>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '32px'
            }} className="floatingIcon">
              ⭐
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              fontSize: '32px'
            }} className="floatingIcon">
              🏆
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              fontSize: '32px'
            }} className="floatingIcon">
              ✨
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#E5E7FF'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="inputField"
                />
              </div>

              <div>
                <label htmlFor="email" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#E5E7FF'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="inputField"
                />
              </div>

              <div>
                <label htmlFor="plan" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#E5E7FF'
                }}>
                  Plan Interest
                </label>
                <select
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="selectField"
                >
                  <option value="free">Free Plan</option>
                  <option value="pro">Pro Plan ($4.99/month)</option>
                  <option value="team">Team Plan ($19.99/month)</option>
                </select>
              </div>

              <button type="submit" className="submitButton">
                Join the Waitlist
              </button>
            </form>

            <p style={{
              fontSize: '14px',
              color: 'rgba(226,232,255,0.6)',
              textAlign: 'center',
              margin: '24px 0 0 0',
              lineHeight: 1.5
            }}>
              By joining, you&apos;ll get early access, exclusive updates, and be the first to know when we launch. 
              No spam, just wins! 🎉
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <section style={{
          maxWidth: '600px',
          margin: '60px auto 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>👥</div>
            <p style={{
              fontSize: '16px',
              color: 'rgba(226,232,255,0.8)',
              margin: '0',
              lineHeight: 1.5
            }}>
              <strong>500+ people</strong> have already joined the waitlist. 
              Be part of the community that&apos;s changing how we celebrate daily wins.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{
          maxWidth: '800px',
          margin: '60px auto 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '700',
            margin: '0 0 40px 0',
            color: '#E5E7FF'
          }}>
            What You&apos;ll Get
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            {[
              {
                icon: '🚀',
                title: 'Early Access',
                description: 'Be among the first to try Small Wins when we launch'
              },
              {
                icon: '💌',
                title: 'Exclusive Updates',
                description: 'Get behind-the-scenes insights and feature previews'
              },
              {
                icon: '🎁',
                title: 'Special Perks',
                description: 'Early waitlist members get exclusive bonuses and discounts'
              },
              {
                icon: '🤝',
                title: 'Direct Feedback',
                description: 'Help shape the app with your suggestions and ideas'
              }
            ].map((benefit, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{benefit.icon}</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#E5E7FF'
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(226,232,255,0.7)',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
