# Soul Reapers Esports Website

A professional esports website for Soul Reapers Esports (SRE), featuring Rainbow Six Siege rosters, staff management, and Discord integration.

## Features

- **Modern Esports Design**: Dark theme with neon accents inspired by professional esports teams
- **Dual Roster System**: Main team and Academy team with detailed player profiles
- **Staff Management**: Complete staff directory with Discord role integration
- **Owner Profiles**: Detailed information about team owners
- **Responsive Design**: Fully responsive across all devices
- **Interactive Elements**: Smooth animations, hover effects, and transitions
- **Discord Integration**: Staff members linked to Discord roles
- **Social Media Integration**: Links to all major social platforms
- **Multi-Page Architecture**: Separate pages for better SEO and user experience
- **SEO Optimized**: Meta tags, structured data, sitemap, and robots.txt
- **Performance Optimized**: Minified CSS/JS files for faster loading
- **Legal Compliance**: Privacy policy and terms of service pages

## Structure

```
soul-reapers-esports/
├── index.html          # Main homepage
├── rosters.html        # Team rosters page
├── staff.html          # Staff members page
├── owners.html         # Team owners page
├── about.html          # About us page
├── contact.html        # Contact and community page
├── privacy.html        # Privacy policy page
├── terms.html          # Terms of service page
├── styles.css          # Complete styling
├── styles.min.css      # Minified CSS for production
├── script.js           # Interactive JavaScript
├── script.min.js       # Minified JS for production
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine directives
├── assets/
│   ├── SREtp - Copy.png # Team logo
│   ├── players/        # Player profile images
│   ├── staff/          # Staff member photos
│   └── owners/         # Owner photos
└── README.md           # This file
```

## Sections

### 1. Navigation
- Fixed header with smooth scrolling
- Mobile-responsive hamburger menu
- Active state indicators

### 2. Hero Section
- Animated gradient text
- Call-to-action buttons
- Parallax background effects

### 3. Rosters Section
- Tab-based navigation between Main and Academy teams
- Player cards with:
  - Profile images
  - In-game names and real names
  - Team roles
  - Social media links

### 4. Staff Section
- Staff member cards with Discord role badges
- Position titles and Discord usernames
- Social media integration

### 5. Owners Section
- Detailed owner biographies
- Professional backgrounds
- Social media links

### 6. About Section
- Team history and achievements
- Animated statistics counters
- Mission statement

### 7. Contact Section
- Discord server integration
- Social media grid
- Community call-to-action

## Interactive Features

### JavaScript Functionality
- **Mobile Navigation**: Responsive hamburger menu
- **Smooth Scrolling**: Seamless navigation between sections
- **Tab System**: Switch between Main and Academy rosters
- **Intersection Observer**: Scroll-triggered animations
- **Hover Effects**: Interactive card animations
- **Discord Role Modals**: Click Discord roles for more information
- **Counter Animations**: Animated statistics
- **Typing Effect**: Hero title typing animation
- **Ripple Effects**: Button click animations
- **Parallax Scrolling**: Hero section background movement

### CSS Features
- **Gradient Backgrounds**: Modern color schemes
- **Glass Morphism**: Translucent card effects
- **Custom Animations**: Smooth transitions and keyframes
- **Responsive Grid**: Flexible layout system
- **Hover States**: Interactive feedback
- **Loading States**: Professional loading animations

## Customization

### Adding Players
To add new players to the rosters:

1. Add player images to `assets/players/`
2. Update the HTML in the rosters section:
```html
<div class="player-card">
    <div class="player-image">
        <img src="assets/players/newplayer.jpg" alt="Player">
    </div>
    <div class="player-info">
        <h4 class="player-name">"Nickname"</h4>
        <p class="player-real-name">Real Name</p>
        <p class="player-role">Team Role</p>
        <div class="player-socials">
            <!-- Social media links -->
        </div>
    </div>
</div>
```

### Adding Staff Members
To add new staff members:

1. Add staff photos to `assets/staff/`
2. Update the staff section with new cards
3. Configure Discord role by modifying the `discord-role` div

### Updating Discord Roles
The Discord role system is integrated into staff cards. Each role badge shows the corresponding Discord server role and can be clicked for more information.

### Color Scheme
The primary colors are:
- **Primary**: `#ff0066` (Hot pink/red)
- **Secondary**: `#00ccff` (Cyan)
- **Discord**: `#5865F2` (Discord blue)
- **Background**: `#0a0a0a` (Dark black)

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance
- Optimized animations using CSS transforms
- Lazy loading for images
- Efficient JavaScript with event delegation
- Minimal external dependencies

## SEO & Performance Optimizations

### Search Engine Optimization
- **Meta Tags**: Comprehensive title, description, and keyword tags
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Structured Data**: Schema.org markup for better search visibility
- **XML Sitemap**: Complete sitemap for search engines
- **Robots.txt**: Search engine crawling directives
- **Canonical URLs**: Prevent duplicate content issues

### Performance Features
- **Minified Assets**: Production-ready CSS and JavaScript files
- **Optimized Images**: Properly sized and compressed images
- **Font Preloading**: Faster font loading with preconnect directives
- **Lazy Loading**: Images load as needed for better performance
- **Efficient Animations**: CSS transforms for smooth 60fps animations
- **Minimal Dependencies**: Reduced external library usage

## Backend API

This project now includes a real backend service that keeps the static website pages and adds API routes for content and contact management.

### Run locally
```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 server.py
```

Then open:
- http://localhost:8080/
- http://localhost:8080/api/health
- http://localhost:8080/api/rosters
- http://localhost:8080/api/staff
- http://localhost:8080/api/owners

### Main endpoints
- GET /api/health — app status and version info
- GET /api/site — branded site metadata
- GET /api/rosters — roster data
- GET /api/staff — staff directory
- GET /api/owners — owners data
- POST /api/contact — saves contact submissions to SQLite
- GET /api/admin/contact-messages — admin-only list of messages with X-Admin-Key header

### Contact submissions
Contact messages are saved in a local SQLite database at `sre.db`.

## Sign-in security and providers

- Password sign-in requires a 6-digit email verification code. Codes expire after 10 minutes and allow up to five attempts.
- **Remember me** keeps a verified session for 30 days. Without it, the session expires after 12 hours and uses a browser-session cookie.
- Google sign-in is optional and uses Google OpenID Connect. Google sign-in also requires email-code delivery to be configured.
- New registrations are not signed in automatically; they must complete password and email-code verification.

Configure the server environment before enabling sign-in. Copy `.env.example` to `.env` beside `server.py` and set real values; the app loads it on startup, and `.env` is ignored by Git. Never commit secrets. For SMTP, use your mail provider's host, port, account, app password, and verified sender address. Port 587 uses STARTTLS; port 465 uses SMTP-over-SSL.

For local development without an email provider, set `APP_ENV=development` and `AUTH_EMAIL_MODE=console`. The one-time code prints in the server terminal so you can test the complete flow. This is a development convenience, not email delivery; never enable it in production. Real email sign-in requires SMTP.

For Google sign-in, create an OAuth 2.0 Web application client in Google Cloud and add this authorized redirect URI:

```text
https://YOUR-DOMAIN/auth/google/callback
```

For local development, also register `http://localhost:8080/auth/google/callback`. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a long random `OAUTH_STATE_SECRET`. Use `COOKIE_SECURE=1` in HTTPS production deployments. Restart the server after changing environment variables.

If SMTP is not configured, password sign-in intentionally stops before creating a session and reports that email verification is unavailable. Google sign-in remains disabled until both Google OAuth and SMTP are configured.

## Deployment

### Production Setup
For production deployment, use the minified versions:
```html
<link rel="stylesheet" href="styles.min.css">
<script src="script.min.js"></script>
```

### Development Setup
For development, use the unminified versions:
```html
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
```

## Future Enhancements
- [ ] Player statistics integration
- [ ] Match schedule and results
- [ ] Live streaming integration
- [ ] Merchandise store
- [ ] News and blog section
- [ ] Tournament brackets
- [ ] Team ranking system

## License
This project is open source and available under the [MIT License](LICENSE).

## Contact
For questions or support regarding this website, please contact the development team or join our Discord server.

---

**Soul Reapers Esports** - Professional Rainbow Six Siege Organization
