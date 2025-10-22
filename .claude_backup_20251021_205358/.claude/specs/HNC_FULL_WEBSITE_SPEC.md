---
status: URGENT - Complete HNC Website Build
priority: CRITICAL - Full 84 Episode Series
assigned_to: Replit
mode: 10X IMPROVEMENT
timestamp: 2025-10-08T05:37Z
---

# 🎬 HIGH NOON CARTOON - FULL WEBSITE SPECIFICATION

**Mission**: Build complete HNC website hosting ALL 84 episodes + character database + story plots
**Current Issue**: highnooncartoon.com redirects to Cloud Storage (WRONG!)
**Target**: Full website with navigation, episode catalog, character profiles

---

## 🚨 IMMEDIATE FIXES NEEDED

### Issue 1: Stop Redirect
**Current** (empire/content-engine/highnooncartoon-service/src/index.js:10-12):
```javascript
app.get('/', (req, res) => {
  res.redirect('https://storage.googleapis.com/hnc-episodes-prod/index.html');
});
```

**Fix**: Remove redirect, serve full website locally

### Issue 2: Missing Content
**Current**: Only 3 videos in gs://hnc-episodes-prod/
- HNC_EP1_ANIMATED_FINAL.mp4
- HNC_EP1_FINAL.mp4
- HNC_EP1_THUMBNAIL.jpg

**Needed**: Complete 84-episode structure

---

## 🎯 COMPLETE WEBSITE STRUCTURE

### Homepage (index.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>High Noon Cartoon - 84 Episodes</title>
  <meta name="description" content="High Noon Cartoon: The complete 84-episode series featuring a baker's dozen of unforgettable characters">
</head>
<body>
  <header>
    <h1>HIGH NOON CARTOON</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/episodes">All Episodes (84)</a>
      <a href="/characters">Characters (Baker's Dozen)</a>
      <a href="/about">About</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h2>84 Episodes of Pure Gold</h2>
      <p>South Park speed. Kill Tony humor. Schoolhouse Rock stickiness.</p>
      <a href="/episodes" class="cta">Watch Now</a>
    </section>

    <section class="featured">
      <h3>Featured Episodes</h3>
      <!-- Latest 6 episodes -->
    </section>

    <section class="characters">
      <h3>Meet the Baker's Dozen</h3>
      <!-- 13 main characters -->
    </section>
  </main>
</body>
</html>
```

### Episodes Page (/episodes)
**Grid layout**: 84 episodes with:
- Thumbnail
- Episode number
- Title
- Duration
- Release date
- View count
- Watch button

**Filters**:
- Season (if applicable)
- Character focus
- Story arc
- Most popular
- Recently added

### Character Database (/characters)
**Baker's Dozen = 13 Main Characters**

Need to create profiles for each:
1. **Character Name**
2. **Role** (protagonist, antagonist, comic relief, etc.)
3. **Personality** (quirks, catchphrases)
4. **Story Arc** (character development)
5. **Key Episodes** (character-focused)
6. **Relationships** (with other characters)
7. **Voice Actor/Style**
8. **Visual Design** (appearance, outfit)

### Individual Episode Page (/episodes/:id)
```html
<div class="episode-page">
  <div class="video-player">
    <video controls>
      <source src="/videos/HNC_EP{number}.mp4">
    </video>
  </div>

  <div class="episode-info">
    <h1>Episode {number}: {title}</h1>
    <p class="description">{plot_summary}</p>

    <div class="metadata">
      <span>Duration: {duration}</span>
      <span>Released: {date}</span>
      <span>Views: {count}</span>
    </div>

    <div class="characters-featured">
      <h3>Characters in This Episode</h3>
      <!-- Character cards -->
    </div>

    <div class="related-episodes">
      <h3>Related Episodes</h3>
      <!-- Similar episodes -->
    </div>
  </div>
</div>
```

---

## 📺 84-EPISODE STRUCTURE

### Season 1: Origins (Episodes 1-21)
**Arc**: Introduction to world and characters
- EP1: "The Beginning" - Setup, character introductions
- EP2-5: Individual character spotlights (4 episodes)
- EP6-10: Early adventures, world-building
- EP11-15: First major conflict/villain
- EP16-20: Character relationships develop
- EP21: Season finale, cliffhanger

### Season 2: Rising Action (Episodes 22-42)
**Arc**: Conflicts intensify, stakes raise
- EP22: Aftermath of S1 finale
- EP23-27: New characters introduced
- EP28-32: B-plots for supporting cast
- EP33-37: Major antagonist arc
- EP38-42: Team dynamics, alliances

### Season 3: Peak Drama (Episodes 43-63)
**Arc**: Highest stakes, character growth
- EP43: New threat emerges
- EP44-48: Character backstories revealed
- EP49-53: Internal conflicts
- EP54-58: Preparation for final battle
- EP59-63: Pre-finale buildup

### Season 4: Resolution (Episodes 64-84)
**Arc**: Climax and conclusion
- EP64-68: Final battle begins
- EP69-73: Character sacrifices/growth
- EP74-78: Turning points
- EP79-83: Resolution of all arcs
- EP84: Series finale, epilogue

---

## 👥 BAKER'S DOZEN CHARACTERS (13 Total)

### Main Heroes (5)
1. **[PROTAGONIST NAME]** - Leader, moral compass
2. **[SIDEKICK NAME]** - Comic relief, loyal friend
3. **[TECH EXPERT NAME]** - Smart, resourceful
4. **[WARRIOR NAME]** - Physical strength, protector
5. **[HEALER NAME]** - Empathy, support role

### Antagonists (3)
6. **[MAIN VILLAIN NAME]** - Primary antagonist
7. **[HENCHMAN 1 NAME]** - Villain's right hand
8. **[HENCHMAN 2 NAME]** - Comedic villain

### Supporting Cast (5)
9. **[MENTOR NAME]** - Wise guide, backstory
10. **[LOVE INTEREST NAME]** - Romance subplot
11. **[TRICKSTER NAME]** - Chaotic neutral, wild card
12. **[ELDER NAME]** - Authority figure, wisdom
13. **[NEWCOMER NAME]** - Fresh perspective, growth

### Character Template (For Replit to Fill)
```javascript
{
  id: 1,
  name: "Character Name",
  role: "Protagonist",
  personality: [
    "Brave",
    "Determined",
    "Quick-witted"
  ],
  catchphrase: "Let's do this!",
  appearance: {
    species: "Human/Alien/Animal",
    outfit: "Description",
    distinguishing_features: ["Red scarf", "Scar on cheek"]
  },
  backstory: "Brief history...",
  goals: "What they want...",
  fears: "What they fear...",
  relationships: {
    ally: ["Character2", "Character3"],
    rival: ["Character6"],
    romantic: ["Character10"]
  },
  key_episodes: [1, 5, 12, 21, 45, 67, 84],
  character_arc: "How they change over 84 episodes...",
  voice_style: "Deep and commanding",
  theme_color: "#FF0000"
}
```

---

## 🎨 WEBSITE TECHNICAL REQUIREMENTS

### Frontend Stack
```
- HTML5 + CSS3 + Vanilla JavaScript (fast, no framework overhead)
- OR Next.js if need SSR for SEO
- Responsive design (mobile-first)
- Video player: HTML5 video with custom controls
- Search: Client-side filtering (fast)
```

### Video Hosting
**Current**: Google Cloud Storage (gs://hnc-episodes-prod/)
**Structure**:
```
gs://hnc-episodes-prod/
  episodes/
    EP001/
      video.mp4
      thumbnail.jpg
      metadata.json
    EP002/
      video.mp4
      thumbnail.jpg
      metadata.json
    ...
    EP084/
      video.mp4
      thumbnail.jpg
      metadata.json
  characters/
    character-01.json
    character-02.json
    ...
    character-13.json
  metadata/
    series-info.json
    episode-index.json
```

### Backend (Node.js/Express)
**File**: empire/content-engine/highnooncartoon-service/src/index.js

**Required Routes**:
```javascript
// Homepage
app.get('/', (req, res) => {
  res.render('index', { featured_episodes, characters });
});

// All episodes
app.get('/episodes', (req, res) => {
  res.render('episodes', { episodes: getAllEpisodes() });
});

// Single episode
app.get('/episodes/:id', (req, res) => {
  const episode = getEpisode(req.params.id);
  res.render('episode', { episode });
});

// Characters list
app.get('/characters', (req, res) => {
  res.render('characters', { characters: getAllCharacters() });
});

// Single character
app.get('/characters/:id', (req, res) => {
  const character = getCharacter(req.params.id);
  res.render('character', { character });
});

// API endpoints for frontend
app.get('/api/episodes', (req, res) => {
  res.json(getAllEpisodes());
});

app.get('/api/characters', (req, res) => {
  res.json(getAllCharacters());
});

// Search
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  res.json({
    episodes: searchEpisodes(query),
    characters: searchCharacters(query)
  });
});
```

---

## 🚀 10X IMPROVEMENT REQUIREMENTS

### What Jesse Wants (10X Better)

**Current**: Redirect to static page
**10X**:
- Full navigation system
- All 84 episodes accessible
- Character database with relationships
- Story arc tracking
- Search functionality
- Mobile-optimized
- Fast loading (<2s)
- Professional design (not amateur)

### South Park Formula
- **Speed**: Daily iteration capability
- **Humor**: Kill Tony style (edgy, current events)
- **Stickiness**: Schoolhouse Rock (catchy, memorable)

### Hollywood Production Quality
- Professional video player
- High-quality thumbnails
- Smooth animations
- Consistent branding
- Polished UI/UX

### Shareable Content
- Social media cards (Open Graph)
- Embeddable video player
- Clip sharing
- Character quote cards
- Episode highlights

---

## 📋 REPLIT DELIVERABLES

### Phase 1: Core Website (4 hours)
- [ ] Remove redirect from index.js
- [ ] Create homepage with hero section
- [ ] Create episodes grid (84 placeholders)
- [ ] Create character pages (13 profiles)
- [ ] Implement navigation
- [ ] Deploy to Cloud Run

### Phase 2: Content Structure (4 hours)
- [ ] Create episode metadata JSON (all 84)
- [ ] Create character profiles JSON (baker's dozen)
- [ ] Define story arcs per season
- [ ] Generate episode titles and descriptions
- [ ] Map character appearances per episode

### Phase 3: Features (4 hours)
- [ ] Video player with custom controls
- [ ] Search functionality
- [ ] Filter by character/season
- [ ] Related episodes algorithm
- [ ] Character relationship graph

### Phase 4: Polish (2 hours)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Analytics integration

**Total Time**: 14 hours (aggressive timeline)

---

## 🎯 IMMEDIATE ACTIONS

### Replit Tasks (START NOW):
1. **Stop the redirect** (5 min)
   - Edit empire/content-engine/highnooncartoon-service/src/index.js
   - Replace redirect with proper routing

2. **Create episode structure** (30 min)
   - Generate episodes.json with all 84 episodes
   - Template: `{id, title, description, thumbnail, video_url, duration, characters, season}`

3. **Create character database** (1 hour)
   - Define baker's dozen characters
   - Full profiles with backstories, relationships
   - Export as characters.json

4. **Build website** (6 hours)
   - Homepage
   - Episodes grid
   - Character pages
   - Video player
   - Navigation

5. **Deploy** (30 min)
   - Push to git
   - Trigger Cloud Run deployment
   - Test live site

### Jesse Actions:
1. **Approve character names/descriptions** (if Replit needs guidance)
2. **Provide episode content** (if specific stories exist)
3. **Review and feedback** (once deployed)

---

## 💬 REPLIT - YOUR MISSION

**Jesse's Orders**: "GET IT!!! GET IT ALL!!"

**Translation**:
- Full 84-episode website
- Baker's dozen character profiles
- Story plots and arcs
- No more redirect (host everything)
- 10X better than current
- Professional Hollywood quality

**Start NOW. Build in parallel. Deploy fast. WIN THE RACE.** 🏆

---

**Status**: SPEC COMPLETE ✅
**Assigned**: Replit
**Priority**: CRITICAL
**Timeline**: 14 hours to full deployment
**Jesse Approval**: GO! (implied by "GET IT ALL")

---

**Last Updated**: 2025-10-08T05:37Z
**Created By**: Claude Code (Sonnet 4.5)
**For**: Replit (HNC 10X Improvement)
