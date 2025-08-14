'use client'

export default function HomePage() {
	return (
		<>
			<style jsx>{`
				@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
				@keyframes glowPulse { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
				.heroGrid { display:grid; gap:clamp(20px,4vw,36px); align-items:center; }
				@media (min-width: 960px) { .heroGrid { grid-template-columns: 1.1fr 1fr; } }
				.ctaPrimary { display:inline-flex; align-items:center; justify-content:center; padding:14px 20px; border-radius:14px; background:linear-gradient(90deg,#7C3AED 0%,#4F46E5 100%); box-shadow:0 12px 28px rgba(79,70,229,.35); border:1px solid rgba(255,255,255,.12); color:#fff; font-weight:800; text-decoration:none; letter-spacing:.2px; }
				.ctaPrimary:hover { filter:brightness(1.06); transform: translateY(-1px); }
				.ctaSecondary { display:inline-flex; align-items:center; justify-content:center; padding:14px 20px; border-radius:14px; background:transparent; border:1px solid rgba(255,255,255,.2); color:rgba(226,232,255,.9); font-weight:700; text-decoration:none; }
				.ctaSecondary:hover { border-color:rgba(255,255,255,.35); color:#E5E7FF; }
				.socialProof { display:flex; align-items:center; gap:12px; margin-top:16px; color:rgba(226,232,255,.8); font-size:14px; }
				.avatar { width:28px; height:28px; border-radius:999px; background:linear-gradient(135deg,#FDE68A,#FCA5A5); display:inline-flex; align-items:center; justify-content:center; color:#0b1026; font-weight:800; border:1px solid rgba(255,255,255,.5); }
				.phone { width: 320px; height: 640px; border-radius: 40px; background: #1a1a1a; border: 8px solid #2a2a2a; box-shadow: 0 20px 60px rgba(0,0,0,0.8); position: relative; }
				.screen { position: absolute; inset: 12px; border-radius: 32px; background: #0e1434; overflow: hidden; }
				.notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 30px; background: #1a1a1a; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; }
				.appHeader { padding: 60px 20px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
				.streakCard { margin: 20px; padding: 20px; border-radius: 16px; background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15)); border: 1px solid rgba(124,58,237,0.2); }
				.winCard { margin: 0 20px 16px; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
				.addButton { margin: 20px; padding: 20px; border-radius: 16px; background: linear-gradient(135deg, #7C3AED, #4F46E5); text-align: center; color: white; font-weight: 700; }
				@media (prefers-reduced-motion: reduce) { * { animation:none !important; transition:none !important; } }
			`}</style>
			
			<main style={{
				minHeight: '100svh',
				background: 'linear-gradient(180deg, #0b1026 0%, #121a3b 50%, #1b2559 100%)',
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
				color: 'white',
				display: 'block',
				padding: 'clamp(16px, 4vw, 32px)',
				position: 'relative',
				overflow: 'visible'
			}}>
				{/* Subtle radial glows */}
				<div style={{
					position: 'absolute',
					top: '-20%',
					left: '-10%',
					width: '60vw',
					height: '60vw',
					background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,140,82,0.18) 0%, rgba(255,140,82,0) 60%)',
					filter: 'blur(40px)',
					opacity: 0.9
				}} />
				<div style={{
					position: 'absolute',
					bottom: '-25%',
					right: '-10%',
					width: '55vw',
					height: '55vw',
					background: 'radial-gradient(50% 50% at 50% 50%, rgba(78,205,196,0.18) 0%, rgba(78,205,196,0) 60%)',
					filter: 'blur(48px)',
					opacity: 0.9
				}} />

				{/* Hero */}
				<div className="heroGrid" style={{
					width: '100%',
					maxWidth: 'min(1140px, 92vw)',
					margin: '10svh auto 0',
					position: 'relative',
					zIndex: 1
				}}>
					{/* Left: copy */}
					<section style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 18
					}}>
						<div style={{
							padding: '10px 14px',
							borderRadius: 9999,
							width: 'fit-content',
							background: 'rgba(255,255,255,0.06)',
							border: '1px solid rgba(255,255,255,0.12)',
							backdropFilter: 'blur(6px)',
							fontSize: 12,
							letterSpacing: 0.4
						}}>
							Small Wins
						</div>
						<h1 style={{
							margin: 0,
							fontSize: 'clamp(34px, 6.5vw, 68px)',
							lineHeight: 1.05,
							fontWeight: 800,
							letterSpacing: -1.2,
							background: 'linear-gradient(90deg, #E5E7FF 0%, #C7D2FE 50%, #E5E7FF 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent'
						}}>
							Boost your day with small wins.
						</h1>
						<p style={{
							margin: 0,
							marginTop: 10,
							fontSize: 'clamp(16px, 2.3vw, 20px)',
							lineHeight: 1.6,
							color: 'rgba(226, 232, 255, 0.8)'
						}}>
							Turn ordinary moments into momentum. Log tiny victories in seconds, keep a streak that sticks, and cheer on your friends.
						</p>
						<ul style={{
							listStyle: 'none',
							padding: 0,
							margin: '10px 0 0 0',
							color: 'rgba(226,232,255,0.75)',
							fontSize: 14,
							lineHeight: 1.8
						}}>
							<li>✓ Two taps to log a win</li>
							<li>✓ Keep a satisfying daily streak</li>
							<li>✓ Weekly friendly competition</li>
						</ul>
						<div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
							<a className="ctaPrimary" href="/waitlist" aria-label="Join the Small Wins waitlist">Get early access</a>
							<a className="ctaSecondary" href="/plans" aria-label="See the Small Wins plan">See the plan</a>
						</div>
						<div className="socialProof">
							<div className="avatar">N</div>
							<div className="avatar">A</div>
							<div className="avatar">J</div>
							<span>500+ on the waitlist • <span style={{color: '#FBBF24'}}>⭐️⭐️⭐️⭐️⭐️</span> from early testers</span>
						</div>
					</section>

					{/* Right: phone mock */}
					<aside style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
						<div className="phone" style={{ transform: 'rotate(-2deg)', animation: 'float 5s ease-in-out infinite' }}>
							<div className="notch" />
							<div className="screen">
								<div className="appHeader">
									<div style={{ fontSize: 20, fontWeight: 800, color: '#E5E7FF', marginBottom: 4 }}>Small Wins</div>
									<div style={{ fontSize: 12, color: 'rgba(226,232,255,0.6)' }}>Today&apos;s Progress</div>
								</div>
								
								<div className="streakCard">
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											<div style={{ fontSize: 24 }}>🔥</div>
											<div>
												<div style={{ fontSize: 14, fontWeight: 700, color: '#E5E7FF' }}>Current Streak</div>
												<div style={{ fontSize: 12, color: 'rgba(226,232,255,0.7)' }}>3 days</div>
											</div>
										</div>
										<div style={{ padding: '8px 12px', borderRadius: 12, background: 'rgba(16,185,129,0.2)', color: '#10B981', fontSize: 12, fontWeight: 700 }}>+15 pts</div>
									</div>
								</div>

								<div className="winCard">
									<div style={{ color: 'rgba(235,240,255,0.95)', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Beat the toaster by 3 seconds</div>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<span style={{ padding: '6px 10px', borderRadius: 8, background: '#10B981', color: 'white', fontSize: 12, fontWeight: 700 }}>+1</span>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
											<span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.2)', color: '#A78BFA', fontSize: 10 }}>Petty</span>
											<span style={{ fontSize: 10, color: 'rgba(226,232,255,0.5)' }}>Just now</span>
										</div>
									</div>
								</div>

								<div className="winCard">
									<div style={{ color: 'rgba(235,240,255,0.95)', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Green light on Elm</div>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<span style={{ padding: '6px 10px', borderRadius: 8, background: '#10B981', color: 'white', fontSize: 12, fontWeight: 700 }}>+2</span>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
											<span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.2)', color: '#60A5FA', fontSize: 10 }}>Cozy</span>
											<span style={{ fontSize: 10, color: 'rgba(226,232,255,0.5)' }}>2 min ago</span>
										</div>
									</div>
								</div>

								<div className="addButton">
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
										<span style={{ fontSize: 18, fontWeight: 700 }}>+</span>
										<span>Log a win</span>
									</div>
								</div>
							</div>
						</div>
					</aside>
				</div>

				{/* Logos / trust band */}
				<div style={{ maxWidth: 'min(1180px, 94vw)', margin: '36px auto 0', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
					<span style={{ opacity: .8 }}>As seen in</span>
					<span style={{ fontWeight: 800, opacity: .95 }}>Product Daily</span>
					<span style={{ fontWeight: 800, opacity: .95 }}>Morning Brew</span>
					<span style={{ fontWeight: 800, opacity: .95 }}>Indie Hackers</span>
				</div>

				{/* Features */}
				<section style={{ maxWidth: 'min(1180px,94vw)', margin: '48px auto 80px' }}>
					<h2 style={{ margin: 0, fontSize: 'clamp(22px,3.2vw,28px)', fontWeight: 800, color: '#E5E7FF' }}>Why people stick with Small Wins</h2>
					<div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '48px' }}>
						<div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}><div style={{ fontSize: 24, marginBottom: 8 }}>⚡️</div><div style={{ fontWeight: 700, marginBottom: 6 }}>Ridiculously fast</div><div style={{ color: 'rgba(226,232,255,.75)' }}>Open. Tap twice. Done in under 4 seconds.</div></div>
						<div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}><div style={{ fontSize: 24, marginBottom: 8 }}>🔥</div><div style={{ fontWeight: 700, marginBottom: 6 }}>Streaks that motivate</div><div style={{ color: 'rgba(226,232,255,.75)' }}>A gentle nudge and weekly resets keep it fun.</div></div>
						<div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}><div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div><div style={{ fontWeight: 700, marginBottom: 6 }}>Celebrate together</div><div style={{ color: 'rgba(226,232,255,.75)' }}>Your squad sees your wins and sends kudos.</div></div>
						<div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}><div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div><div style={{ fontWeight: 700, marginBottom: 6 }}>You own your data</div><div style={{ color: 'rgba(226,255,255,.75)' }}>Private by default. Export anytime.</div></div>
					</div>
				</section>
			</main>
		</>
	)
}