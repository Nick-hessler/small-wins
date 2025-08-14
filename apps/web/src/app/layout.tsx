import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

const geist = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Small Wins - The game of your day',
	description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
	keywords: ['small wins', 'achievements', 'productivity', 'goals', 'daily wins'],
	authors: [{ name: 'Small Wins Team' }],
	creator: 'Small Wins',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://smallwins.com',
		title: 'Small Wins - The game of your day',
		description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
		siteName: 'Small Wins',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Small Wins - The game of your day',
		description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
	},
	viewport: 'width=device-width, initial-scale=1',
	themeColor: '#000000',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const navLink = {
		padding: '10px 14px',
		borderRadius: 999,
		textDecoration: 'none',
		fontWeight: 700,
		fontSize: 13,
		border: '1px solid rgba(255,255,255,.12)',
		background: 'rgba(255,255,255,.06)',
		color: 'rgba(226,232,255,.9)'
	} as const
	const navLinkPrimary = {
		...navLink,
		background: 'linear-gradient(180deg, #7C3AED 0%, #4F46E5 100%)',
		border: '1px solid rgba(255,255,255,.18)',
		color: 'white'
	} as const

	return (
		<html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
			<body
				className="antialiased"
				style={{
					margin: 0,
					minHeight: '100svh',
					backgroundColor: '#0b1026',
					color: 'white',
					WebkitFontSmoothing: 'antialiased',
					MozOsxFontSmoothing: 'grayscale',
					overflowX: 'hidden',
					overflowY: 'auto',
				}}
			>
				<header style={{
					position: 'sticky',
					top: 0,
					zIndex: 20,
					backdropFilter: 'saturate(120%) blur(8px)',
					background: 'linear-gradient(180deg, rgba(11,16,38,.72), rgba(11,16,38,.38) 60%, rgba(11,16,38,0))',
					borderBottom: '1px solid rgba(255,255,255,.08)'
				}}>
					<div style={{
						maxWidth: 'min(1180px, 94vw)', margin: '0 auto', padding: '12px 0',
						display: 'flex', alignItems: 'center', justifyContent: 'space-between'
					}}>
						<Link href="/" style={{
							textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10
						}}>
							<span aria-hidden style={{
								display: 'inline-block', width: 10, height: 10, borderRadius: 999,
								background: 'radial-gradient(circle at 30% 30%, #8B5CF6, #22D3EE)'
							}} />
							<b style={{
								background: 'linear-gradient(90deg,#E5E7FF 0%,#C7D2FE 50%,#E5E7FF 100%)',
								WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
								fontSize: 16, letterSpacing: .3
							}}>Small Wins</b>
						</Link>
						<nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
							<Link href="/waitlist" style={navLink}>Waitlist</Link>
							<Link href="/plans" style={navLink}>Plans</Link>
							<Link href="/auth/sign-in" style={navLink}>Sign in</Link>
							<Link href="/auth/sign-up" style={navLinkPrimary}>Create account</Link>
						</nav>
					</div>
				</header>
				{children}
			</body>
		</html>
	)
}
