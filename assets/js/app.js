const state = {
  currentPage: 'dashboard',
  currentVideo: null,
  filter: 'all'
};

function getChannel(id) {
  return MOCK_DATA.channels.find(c => c.id === id);
}

function formatViews(views) {
  if (views.endsWith('K')) return views;
  const n = parseInt(views);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return views;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function renderOurChannelAnalytics() {
  const a = CHANNEL_ANALYTICS;
  const maxYearly = Math.max(...a.yearlyViews.map(y => y.value));
  const maxMonthly = Math.max(...a.monthlyViews.map(m => m.value));
  const maxDaily = Math.max(...a.dailyViews.map(d => d.value));

  // Days of week aggregation
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  a.dailyViews.forEach(d => {
    const dt = new Date(d.date);
    const dow = dt.getDay();
    dayTotals[dow] += d.value;
    dayCounts[dow]++;
  });
  const dayAvgs = dayTotals.map((t, i) => dayCounts[i] ? Math.round(t / dayCounts[i]) : 0);
  const maxDayAvg = Math.max(...dayAvgs);

  const yearlyBars = a.yearlyViews.map(y =>
    `<div class="bar-group">
      <div class="bar-value">${y.display}</div>
      <div class="bar" style="height:${(y.value / maxYearly) * 100}%;background:var(--accent);"></div>
      <div class="bar-label">${y.label}</div>
    </div>`
  ).join('');

  const monthlyBars = a.monthlyViews.map(m =>
    `<div class="bar-group">
      <div class="bar-value">${m.display}</div>
      <div class="bar" style="height:${(m.value / maxMonthly) * 100}%;background:var(--success);"></div>
      <div class="bar-label">${m.label}</div>
    </div>`
  ).join('');

  const dailyBars = a.dailyViews.map(d => {
    return `<div class="spark-dot" title="${d.date}: ${d.value}" style="height:${(d.value / maxDaily) * 100}%;background:var(--accent);"></div>`;
  }).join('');

  const dowBars = dayAvgs.map((v, i) =>
    `<div class="bar-group">
      <div class="bar" style="height:${(v / maxDayAvg) * 100}%;background:var(--warning);"></div>
      <div class="bar-label">${dayNames[i]}</div>
    </div>`
  ).join('');

  const topVideoBars = a.topVideos.map(v => {
    return `<div class="hbar-item">
      <span class="hbar-rank">${v.rank}</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width:${v.pct}%;background:var(--accent);">
          <span>${v.title}</span>
        </div>
      </div>
      <span class="hbar-views">${v.views}</span>
    </div>`;
  }).join('');

  return `
    <div class="our-channel">
      <div class="our-channel-header">
        <img class="our-channel-avatar" src="${OUR_CHANNEL.avatar}" alt="">
        <div class="our-channel-info">
          <div class="our-channel-name">${OUR_CHANNEL.name}</div>
          <div class="our-channel-handle">${OUR_CHANNEL.handle}</div>
          <span class="our-channel-badge">● Your Channel</span>
          <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">${a.period}</span>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Views</div>
          <div class="metric-value">${a.overview.views.value}</div>
          <div class="metric-change up">${a.overview.views.change}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Subscribers</div>
          <div class="metric-value">${a.overview.subscribers.value}</div>
          <div class="metric-change up">${a.overview.subscribers.change}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Impressions</div>
          <div class="metric-value">${a.performance.impressions}</div>
          <div class="metric-change up">${a.performance.ctr} CTR</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Watch Time</div>
          <div class="metric-value">${a.performance.watchTime}</div>
          <div class="metric-change up">${a.performance.avgViewDuration} avg</div>
        </div>
      </div>

      <div class="analytics-row">
        <div class="analytics-card">
          <div class="analytics-card-title">📊 Yearly Views</div>
          <div class="bar-chart">${yearlyBars}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-title">🏆 Top Videos All Time</div>
          <div class="hbar-list">${topVideoBars}</div>
        </div>
      </div>

      <div class="analytics-row">
        <div class="analytics-card">
          <div class="analytics-card-title">📈 Last 12 Months</div>
          <div class="bar-chart">${monthlyBars}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-title">📅 Avg Views by Day of Week</div>
          <div class="bar-chart" style="height:100px;">${dowBars}</div>
        </div>
      </div>

      <div class="analytics-card-full">
        <div class="analytics-card-title">📊 Daily Views (2026, 168 days)</div>
        <div class="sparkline">${dailyBars}</div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px;">
          <span>Jan 1</span>
          <span>Mar 1</span>
          <span>May 1</span>
          <span>Jun 16</span>
        </div>
      </div>
    </div>
  `;
}

// Dashboard
function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  container.innerHTML = renderOurChannelAnalytics();
}

function renderVideoCard(v) {
  const ch = getChannel(v.channelId);
  const tags = v.tags.map(t => {
    const cls = t === 'idea' ? 'tag-idea' : t === 'discuss' ? 'tag-review' : t === 'watch' ? 'tag-watch' : 'tag-archive';
    return `<span class="tag ${cls}">${t}</span>`;
  }).join('');

  return `
    <div class="video-card" data-video-id="${v.id}">
      <div class="video-thumbnail">
        <img src="${v.thumbnail}" alt="" loading="lazy">
        <span class="video-duration">${v.duration}</span>
      </div>
      <div class="video-info">
        <div class="video-title">${v.title}</div>
        <div class="video-meta">
          <span>${ch.name}</span>
          <span class="dot"></span>
          <span>${v.views} views</span>
          <span class="dot"></span>
          <span>${v.date}</span>
        </div>
        <div class="video-tags">${tags}</div>
      </div>
    </div>
  `;
}

// Video detail
function openVideo(id) {
  const v = MOCK_DATA.videos.find(x => x.id === id);
  if (!v) return;
  state.currentVideo = id;

  const ch = getChannel(v.channelId);

  document.getElementById('video-detail-title').textContent = v.title;
  document.getElementById('video-detail-meta').innerHTML = `
    <span>${ch.name}</span>
    <span>•</span>
    <span>${v.views} views</span>
    <span>•</span>
    <span>${v.date}</span>
    <span>•</span>
    <span>${v.duration}</span>
  `;

  // Subtitles
  const subsList = document.getElementById('subtitles-list');
  if (v.subtitles.length) {
    subsList.innerHTML = v.subtitles.map(s => `
      <div class="subtitle-line" data-time="${s.time}">
        <span class="subtitle-time">${s.time}</span>
        <span>${s.text}</span>
      </div>
    `).join('');
  } else {
    subsList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">No subtitles available</div>`;
  }

  // Notes
  const notesList = document.getElementById('notes-list');
  if (v.notes.length) {
    notesList.innerHTML = v.notes.map(n => `
      <div class="note-item">
        <div class="note-time">⏱ ${n.time}</div>
        <div class="note-text">${n.text}</div>
        <div class="note-author">— ${n.author}</div>
      </div>
    `).join('');
  } else {
    notesList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">No notes yet</div>`;
  }

  navigate('video');
  document.getElementById('page-title').textContent = v.title;
}

// Channels page
function renderChannels() {
  const container = document.getElementById('channels-content');
  let html = `<h2 style="margin-bottom:20px;">Tracked Channels</h2><div class="channels-grid">`;

  MOCK_DATA.channels.forEach(ch => {
    const videoCount = MOCK_DATA.videos.filter(v => v.channelId === ch.id).length;
    html += `
      <div class="channel-card" data-channel-id="${ch.id}">
        <div class="channel-card-avatar">
          <img src="${ch.avatar}" alt="">
        </div>
        <div class="channel-card-info">
          <div class="channel-card-name">${ch.name}</div>
          <div class="channel-card-meta">${ch.handle} · ${ch.subscribers} · ${ch.videos} videos</div>
          <div class="channel-card-status">● ${videoCount} new</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Notes page
function renderNotes() {
  const container = document.getElementById('notes-content');
  let allNotes = [];

  MOCK_DATA.videos.forEach(v => {
    if (v.notes.length) {
      v.notes.forEach(n => {
        const ch = getChannel(v.channelId);
        allNotes.push({
          ...n,
          videoTitle: v.title,
          channelName: ch.name,
          videoId: v.id,
          channelAvatar: ch.avatar
        });
      });
    }
  });

  allNotes.sort((a, b) => {
    const [am, as] = a.time.split(':').map(Number);
    const [bm, bs] = b.time.split(':').map(Number);
    return (am * 60 + as) - (bm * 60 + bs);
  });

  if (!allNotes.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📝</div><h3>No notes</h3><p>Add notes while watching videos</p></div>`;
    return;
  }

  let html = `<h2 style="margin-bottom:20px;">All Team Notes</h2>`;
  allNotes.forEach(n => {
    html += `
      <div class="video-card" style="padding:16px;cursor:default;margin-bottom:12px;" data-video-id="${n.videoId}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <img src="${n.channelAvatar}" style="width:20px;height:20px;border-radius:50%;" alt="">
          <span style="font-size:13px;color:var(--text-secondary);">${n.channelName}</span>
          <span style="font-size:12px;color:var(--text-muted);">·</span>
          <span style="font-size:12px;color:var(--text-muted);">${n.videoTitle}</span>
        </div>
        <div class="note-time">⏱ ${n.time}</div>
        <div class="note-text" style="margin:4px 0;">${n.text}</div>
        <div class="note-author">— ${n.author}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.video-card')) {
        openVideo(card.dataset.videoId);
      }
    });
  });
}

// Team page
function renderTeam() {
  const container = document.getElementById('team-content');
  let html = `<h2 style="margin-bottom:20px;">Team</h2><div class="channels-grid">`;

  MOCK_DATA.team.forEach(m => {
    const noteCount = MOCK_DATA.videos.reduce((acc, v) => acc + v.notes.filter(n => n.author === m.name).length, 0);
    html += `
      <div class="channel-card" style="cursor:default;">
        <div class="channel-card-avatar" style="background:${m.color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:white;">
          ${m.initials}
        </div>
        <div class="channel-card-info">
          <div class="channel-card-name">${m.name}</div>
          <div class="channel-card-meta">${noteCount} notes · online</div>
          <div class="channel-card-status" style="color:var(--success);">● online</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Navigation
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  state.currentPage = page;

  if (page !== 'video') {
    const titles = { dashboard: 'Dashboard', channels: 'Channels', notes: 'Notes', team: 'Team' };
    document.getElementById('page-title').textContent = titles[page] || 'FTS Hub';
  }
}

// Hash routing
function handleHash() {
  const hash = location.hash.slice(1) || 'dashboard';
  if (hash === 'video') return;
  navigate(hash);
  switch (hash) {
    case 'dashboard': renderDashboard(); break;
    case 'channels': renderChannels(); break;
    case 'notes': renderNotes(); break;
    case 'team': renderTeam(); break;
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      location.hash = page;
    });
  });

  // Hash change
  window.addEventListener('hashchange', handleHash);

  // Dynamic badges
  const totalNotes = MOCK_DATA.videos.reduce((acc, v) => acc + v.notes.length, 0);
  document.getElementById('channel-count').textContent = MOCK_DATA.channels.length;
  document.getElementById('notes-count').textContent = totalNotes;

  // Init
  handleHash();
});
