'use client'

import Link from 'next/link'

export default function PlansPage() {
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .planCard { animation: fadeInUp 0.6s ease-out forwards; }
        .planCard:nth-child(1) { animation-delay: 0.1s; }
        .planCard:nth-child(2) { animation-delay: 0.2s; }
        .planCard:nth-child(3) { animation-delay: 0.3s; }
        .featureList { list-style: none; padding: 0; margin: 0; }
        .featureList li { 
          padding: 8px 0; 
          display: flex; 
          align-items: center; 
          gap: 12px;
          color: rgba(226, 232, 255, 0.9);
        }
        .featureList li::before { 
          content: "✓"; 
          color: #10B981; 
          font-weight: bold; 
          font-size: 16px;
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
            fontWeight: 800,
            margin: '0 0 16px 0',
            background: 'linear-gradient(90deg, #E5E7FF 0%, #C7D2FE 50%, #E5E7FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.4vw, 18px)',
            color: 'rgba(226, 232, 255, 0.8)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Choose the plan that fits your goals. Start free, upgrade anytime.
          </p>
        </header>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Free Plan */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }} className="planCard">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6B7280 0%, #9CA3AF 100%)'
            }} />
            
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Free
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: '#E5E7FF' }}>$0</span>
              <span style={{ color: 'rgba(226,232,255,0.6)', fontSize: '16px' }}>/month</span>
            </div>
            
            <ul className="featureList">
              <li>3 wins per day</li>
              <li>Basic categories</li>
              <li>Weekly leaderboards</li>
              <li>Basic badges</li>
              <li>Community feed</li>
            </ul>
            
            <a href="/waitlist" style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              fontWeight: '600',
              marginTop: '24px',
              transition: 'all 0.2s ease'
            }}>
              Get Started Free
            </a>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '32px',
            border: '2px solid rgba(124,58,237,0.4)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden',
            transform: 'scale(1.05)'
          }} className="planCard">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)'
            }} />
            
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Most Popular
            </div>
            
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Pro
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: '#E5E7FF' }}>$4.99</span>
              <span style={{ color: 'rgba(226,232,255,0.6)', fontSize: '16px' }}>/month</span>
            </div>
            
            <ul className="featureList">
              <li>Unlimited wins per day</li>
              <li>All categories + custom</li>
              <li>Advanced analytics</li>
              <li>Premium badges</li>
              <li>Priority support</li>
              <li>Export data</li>
              <li>Team challenges</li>
            </ul>
            
            <a href="/waitlist" style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              fontWeight: '600',
              marginTop: '24px',
              boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
              transition: 'all 0.2s ease'
            }}>
              Start Pro Trial
            </a>
          </div>

          {/* Team Plan */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }} className="planCard">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
            }} />
            
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Team
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: '#E5E7FF' }}>$19.99</span>
              <span style={{ color: 'rgba(226,232,255,0.6)', fontSize: '16px' }}>/month</span>
            </div>
            
            <ul className="featureList">
              <li>Up to 10 team members</li>
              <li>Team leaderboards</li>
              <li>Collaborative challenges</li>
              <li>Admin dashboard</li>
              <li>Team insights</li>
              <li>Custom branding</li>
              <li>Priority support</li>
            </ul>
            
            <a href="/waitlist" style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              fontWeight: '600',
              marginTop: '24px',
              transition: 'all 0.2s ease'
            }}>
              Contact Sales
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <section style={{
          maxWidth: '800px',
          margin: '80px auto 0',
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
            Frequently Asked Questions
          </h2>
          
          <div style={{ textAlign: 'left' }}>
            <details style={{
              marginBottom: '16px',
              padding: '20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                color: '#E5E7FF',
                fontSize: '16px'
              }}>
                Can I change plans later?
              </summary>
              <p style={{
                margin: '16px 0 0 0',
                color: 'rgba(226,232,255,0.8)',
                lineHeight: 1.6
              }}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </details>
            
            <details style={{
              marginBottom: '16px',
              padding: '20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                color: '#E5E7FF',
                fontSize: '16px'
              }}>
                Is there a free trial?
              </summary>
              <p style={{
                margin: '16px 0 0 0',
                color: 'rgba(226,232,255,0.8)',
                lineHeight: 1.6
              }}>
                Pro plans come with a 7-day free trial. No credit card required to start.
              </p>
            </details>
            
            <details style={{
              marginBottom: '16px',
              padding: '20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                color: '#E5E7FF',
                fontSize: '16px'
              }}>
                What payment methods do you accept?
              </summary>
              <p style={{
                margin: '16px 0 0 0',
                color: 'rgba(226,232,255,0.8)',
                lineHeight: 1.6
              }}>
                We accept all major credit cards, PayPal, and Apple Pay. All payments are secure and encrypted.
              </p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
