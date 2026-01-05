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
