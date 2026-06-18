const state = {
  currentPage: 'dashboard',
  currentVideo: null,
  filter: 'all',
  strategyTab: 'category'
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
        <div class="hbar-fill" style="width:${v.pct}%;background:var(--accent);"></div>
        <span class="hbar-title">${v.title}</span>
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
  const active = state.channelsTab || 'all';

  const tabs = [
    { id: 'all', label: 'All Channels', icon: '📺' },
    { id: 'category', label: 'By Category', icon: '🏷️' },
    { id: 'stage', label: 'By Stage', icon: '📊' },
    { id: 'topic', label: 'By Topic', icon: '📌' },
    { id: 'philosophy', label: 'By Philosophy', icon: '⚙️' },
    { id: 'symbol', label: 'By Success Symbol', icon: '💎' },
    { id: 'church', label: 'By Church', icon: '⛪' }
  ];

  const html = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;margin-bottom:8px;">📺 Channels</h2>
      <p style="color:var(--text-secondary);font-size:14px;">${active === 'all' ? 'All tracked channels' : 'Channels grouped by perspective'}</p>
    </div>
    <div class="strategy-tabs" style="flex-wrap:wrap;">
      ${tabs.map(t => `<button class="strategy-tab ${active === t.id ? 'active' : ''}" data-chtab="${t.id}">${t.icon} ${t.label}</button>`).join('')}
    </div>
    <div style="margin-top:20px;" id="channels-panel">${active === 'all' ? renderAllChannels() : renderStrategyCards(active)}</div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('[data-chtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.channelsTab = btn.dataset.chtab;
      const panel = document.getElementById('channels-panel');
      panel.innerHTML = state.channelsTab === 'all' ? renderAllChannels() : renderStrategyCards(state.channelsTab);
      container.querySelectorAll('[data-chtab]').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelectorAll('.channel-card, .strategy-chip').forEach(el => {
        el.addEventListener('click', () => openChannelProfile(el.dataset.channelId || el.dataset.channel));
      });
    });
  });

  container.querySelectorAll('.channel-card, .strategy-chip').forEach(el => {
    el.addEventListener('click', () => openChannelProfile(el.dataset.channelId || el.dataset.channel));
  });
}

function renderAllChannels() {
  return `
    <div class="channels-grid">
      ${MOCK_DATA.channels.map(ch => `
        <div class="channel-card" data-channel-id="${ch.id}">
          <div class="channel-card-avatar">
            <img src="${ch.avatar}" alt="">
          </div>
          <div class="channel-card-info">
            <div class="channel-card-name">${ch.name}</div>
            <div class="channel-card-meta">${ch.handle} · ${ch.subscribers} · ${ch.videos} videos</div>
            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
              <span style="font-size:10px;color:var(--text-muted);padding:2px 8px;background:var(--bg-primary);border-radius:4px;">🎙️ ${ch.tone}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
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

// Workshop — meta layer: Pipeline, Queue, Scoring Guide, Team
function renderWorkshop() {
  const container = document.getElementById('workshop-content');
  const tabs = [
    { id: 'pipeline', label: 'Pipeline', icon: '🧪' },
    { id: 'queue', label: 'Queue', icon: '📌' },
    { id: 'guide', label: 'Scoring Guide', icon: '📏' },
    { id: 'team', label: 'Team', icon: '👥' }
  ];
  const active = state.workshopTab || 'pipeline';

  const html = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;margin-bottom:8px;">🛠️ Workshop</h2>
      <p style="color:var(--text-secondary);font-size:14px;">Internal tools — methodology, queue, rubrics, and team</p>
      <div class="strategy-tabs" style="margin-top:12px;">
        ${tabs.map(t => `<button class="strategy-tab ${active === t.id ? 'active' : ''}" data-wstab="${t.id}">${t.icon} ${t.label}</button>`).join('')}
      </div>
    </div>
    <div id="workshop-panel">${renderWorkshopTab(active)}</div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('[data-wstab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.workshopTab = btn.dataset.wstab;
      document.getElementById('workshop-panel').innerHTML = renderWorkshopTab(state.workshopTab);
      container.querySelectorAll('[data-wstab]').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      bindWorkshopHandlers();
    });
  });

  bindWorkshopHandlers();
}

function renderWorkshopTab(tabId) {
  if (tabId === 'pipeline') return renderPipelineContent();
  if (tabId === 'queue') return renderQueueContent();
  if (tabId === 'guide') return renderScoringGuide();
  if (tabId === 'team') return renderTeamContent();
}

function renderPipelineContent() {
  return `
    <h3 style="font-size:16px;margin-bottom:16px;color:var(--text-secondary);">🧪 Channel Analysis Pipeline</h3>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">How we evaluate every channel before adding it to the map</p>
    <div class="pipeline-steps">
      <div class="pipeline-step">
        <div class="pipeline-step-num">1</div>
        <div class="pipeline-step-content">
          <div class="pipeline-step-title">Data Collection</div>
          <div class="pipeline-step-desc">Gather: channel description, last 30-100 videos, top videos by views, titles, descriptions, tags, thumbnails, transcripts, frequent guests, recurring words.</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Source: YouTube Data API (videos.list, channels.list, search.list)</div>
        </div>
      </div>
      <div class="pipeline-step">
        <div class="pipeline-step-num">2</div>
        <div class="pipeline-step-content">
          <div class="pipeline-step-title">LLM Analysis</div>
          <div class="pipeline-step-desc">For each channel, an agent answers: What does it promise? What does it fight against? What type of person does it create? What counts as success? What stories sell its philosophy? What themes repeat? What is the tone? Who is it similar to? What makes it different? What adjacent niche can we occupy?</div>
        </div>
      </div>
      <div class="pipeline-step">
        <div class="pipeline-step-num">3</div>
        <div class="pipeline-step-content">
          <div class="pipeline-step-title">Scale Scoring</div>
          <div class="pipeline-step-desc">Agent scores 0-10 on: Grind, Freedom, Luxury, Practicality, Philosophy, Systems, Money, Status, Founder Identity, Travel. These map directly to the Market Map axes.</div>
        </div>
      </div>
      <div class="pipeline-step">
        <div class="pipeline-step-num">4</div>
        <div class="pipeline-step-content">
          <div class="pipeline-step-title">Human Review</div>
          <div class="pipeline-step-desc">The agent produces the first draft. You manually correct: "No, this is not about freedom — it's about status." "No, this is not travel — it's wealth signaling." The final score is always human-verified.</div>
          <div style="font-size:11px;color:var(--success);margin-top:4px;">⚠️ This is the most important step. Never fully automate evaluation.</div>
        </div>
      </div>
    </div>
  `;
}

function renderQueueContent() {
  const items = getDiscoveryQueue();
  return `
    <h3 style="font-size:16px;margin-bottom:8px;color:var(--text-secondary);">📌 Discovery Queue</h3>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Ideas for finding new channels — things to search, explore, and automate</p>
    <div style="display:flex;flex-direction:column;gap:8px;" id="workshop-queue">
      ${items.map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);opacity:${item.done ? 0.5 : 1};">
          <button class="dq-toggle" data-dq="${item.id}" style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border);background:${item.done ? 'var(--success)' : 'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;color:${item.done ? 'white' : 'transparent'};flex-shrink:0;">${item.done ? '✓' : ''}</button>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:500;${item.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${item.task}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${item.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderScoringGuide() {
  return `
    <h3 style="font-size:16px;margin-bottom:12px;color:var(--text-secondary);">📏 Scoring Guide</h3>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Rubric for evaluating channels on each axis (0-100)</p>
    <div style="overflow-x:auto;">
      <table class="scoring-table">
        <thead><tr><th>Axis</th><th>0–20</th><th>20–40</th><th>40–60</th><th>60–80</th><th>80–100</th></tr></thead>
        <tbody>
          <tr><td class="scoring-axis">Work Intensity<br><span style="font-weight:400;">Freedom ↔ Grind</span></td><td>Fully automated, 4-hour week</td><td>Systems in place, <30h</td><td>Balanced, ~40h</td><td>High discipline, 50-60h</td><td>Grind 24/7</td></tr>
          <tr><td class="scoring-axis">Money Obsession<br><span style="font-weight:400;">Life ↔ Money</span></td><td>Purpose, meaning, peace</td><td>Freedom over wealth</td><td>Wealth = tool for good life</td><td>Money = scoreboard</td><td>Status, capital accumulation</td></tr>
          <tr><td class="scoring-axis">Luxury Signal<br><span style="font-weight:400;">Modest ↔ Luxury</span></td><td>Minimalist, frugal</td><td>Comfortable, not flashy</td><td>Aspirational lifestyle</td><td>Luxury travel, fine dining</td><td>Ultra-luxury, status display</td></tr>
          <tr><td class="scoring-axis">Practicality<br><span style="font-weight:400;">Philosophy ↔ Tactics</span></td><td>Pure philosophy, inspiration</td><td>Ideas + stories</td><td>Mix of theory & practice</td><td>Mostly how-to, tactics</td><td>Step-by-step frameworks</td></tr>
          <tr><td class="scoring-axis">Freedom Promise<br><span style="font-weight:400;">Richer ↔ Freer</span></td><td>"Make more money"</td><td>"Financial freedom"</td><td>"Time freedom"</td><td>"Lifestyle design"</td><td>"Full autonomy"</td></tr>
          <tr><td class="scoring-axis">Status Promise<br><span style="font-weight:400;">Inner Peace ↔ Premium</span></td><td>Inner peace, quiet life</td><td>Quiet success</td><td>Respected in field</td><td>Premium brand, influencer</td><td>Icon, celebrity status</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderTeamContent() {
  const container = document.createElement('div');
  container.innerHTML = `<div id="workshop-team-temp">${' '}</div>`;
  const temp = document.createElement('div');
  document.body.appendChild(temp);
  temp.innerHTML = `<div id="team-content-temp">${' '}</div>`;
  document.body.removeChild(temp);
  // Just re-use renderTeam logic inline
  let html = `<h3 style="font-size:16px;margin-bottom:12px;color:var(--text-secondary);">👥 Team</h3><div class="channels-grid">`;
  MOCK_DATA.team.forEach(m => {
    const noteCount = MOCK_DATA.videos.reduce((acc, v) => acc + v.notes.filter(n => n.author === m.name).length, 0);
    html += `
      <div class="channel-card" style="cursor:default;">
        <div class="channel-card-avatar" style="background:${m.color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:white;">${m.initials}</div>
        <div class="channel-card-info">
          <div class="channel-card-name">${m.name}</div>
          <div class="channel-card-meta">${noteCount} notes · online</div>
          <div class="channel-card-status" style="color:var(--success);">● online</div>
        </div>
      </div>`;
  });
  html += `</div>`;
  return html;
}

function bindWorkshopHandlers() {
  document.querySelectorAll('.dq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.dq;
      const items = getDiscoveryQueue();
      const idx = items.findIndex(i => i.id === id);
      if (idx > -1) {
        items[idx].done = !items[idx].done;
        localStorage.setItem('fts_dq', JSON.stringify(items));
        const panel = document.getElementById('workshop-panel');
        if (panel) panel.innerHTML = renderWorkshopTab('queue');
        bindWorkshopHandlers();
      }
    });
  });
}
function renderStrategyCards(dimension) {
  const s = STRATEGY;
  let list, field;

  if (dimension === 'category') { list = s.categories; field = 'category'; }
  else if (dimension === 'stage') { list = s.stages; field = 'stage'; }
  else if (dimension === 'topic') { list = s.topics; field = 'topic'; }
  else if (dimension === 'philosophy') { list = s.philosophies; field = 'philosophy'; }
  else if (dimension === 'symbol') { list = s.symbols; field = 'successSymbol'; }
  else if (dimension === 'church') { list = s.churches; field = 'church'; }

  return list.map(item => {
    const channels = MOCK_DATA.channels.filter(ch => ch[field] === item.id);
    if (!channels.length) return '';
    return `
      <div class="strategy-card" style="border-top: 3px solid ${item.color};">
        <div class="strategy-card-header">
          <span style="font-size:24px;">${item.icon}</span>
          <div>
            <div class="strategy-card-name">${item.name}</div>
            <div class="strategy-card-question">${item.desc || item.question}</div>
          </div>
        </div>
        <div class="strategy-card-body">
          ${item.philosophy ? `<p>${item.philosophy}</p>` : ''}
          <div style="margin-top:${item.philosophy ? '12' : '0'}px;">
            ${channels.map(ch =>
              `<span class="strategy-chip" data-channel="${ch.id}">
                <img src="${ch.avatar}" style="width:18px;height:18px;border-radius:50%;"> ${ch.name}
              </span>`
            ).join('')}
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderStrategy() {
  const container = document.getElementById('strategy-content');
  const s = STRATEGY;

  const html = `
    <div style="margin-bottom:32px;">
      <h2 style="font-size:22px;margin-bottom:8px;">🧠 Content Strategy</h2>
      <p style="color:var(--text-secondary);font-size:14px;">How we position @elifacenda</p>
    </div>
    <div class="strat-block strat-block--lg">
      <div class="strat-block-label">Our Position</div>
      <div class="strat-block-title">${s.positioning.title}</div>
      <div class="strat-block-sub">${s.positioning.subtitle}</div>
      <p class="strat-block-body">${s.positioning.description}</p>
    </div>
    <div class="strat-block strat-block--md">
      <div class="strat-block-label">🎯 Positioning</div>
      ${POSITIONING_STATEMENT.map(s => `
        <div style="display:flex;align-items:flex-start;gap:10px;${POSITIONING_STATEMENT.indexOf(s) < POSITIONING_STATEMENT.length - 1 ? 'margin-bottom:8px;' : ''}">
          <span style="color:var(--accent);flex-shrink:0;margin-top:3px;">✦</span>
          <span class="strat-block-body" style="margin:0;">${s}</span>
        </div>
      `).join('')}
    </div>
    <div class="strat-block strat-block--md">
      <div class="strat-block-label">💎 Core Phrase</div>
      <p class="strat-block-body" style="font-size:15px;font-weight:500;margin:0;">${CORE_PHRASE}</p>
    </div>
    <div style="margin-top:32px;">
      <div style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:14px;">💡 Mind Grenades</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${MIND_GRENADES.map(g => `
          <div class="strat-block strat-block--sm">
            <span class="strat-block-body" style="margin:0;">${g.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function getDiscoveryQueue() {
  try { return JSON.parse(localStorage.getItem('fts_dq')) || DISCOVERY_QUEUE; }
  catch { return DISCOVERY_QUEUE; }
}

function renderDiscoveryItems() {
  const items = getDiscoveryQueue();
  return items.map(item => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);opacity:${item.done ? 0.5 : 1};">
      <button class="dq-toggle" data-dq="${item.id}" style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border);background:${item.done ? 'var(--success)' : 'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;color:${item.done ? 'white' : 'transparent'};flex-shrink:0;">${item.done ? '✓' : ''}</button>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;${item.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${item.task}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${item.desc}</div>
      </div>
    </div>
  `).join('');
}

function findListItem(list, id) {
  return list.find(i => i.id === id);
}

function openChannelProfile(channelId) {
  const ch = MOCK_DATA.channels.find(c => c.id === channelId);
  if (!ch) return;

  const cat = findListItem(STRATEGY.categories, ch.category);
  const st = findListItem(STRATEGY.stages, ch.stage);
  const tp = findListItem(STRATEGY.topics, ch.topic);
  const ph = findListItem(STRATEGY.philosophies, ch.philosophy);
  const sy = findListItem(STRATEGY.symbols, ch.successSymbol);
  const pf = findListItem(STRATEGY.proofFormats, ch.proofFormat);

  const fields = [
    { label: 'Promise', icon: '🎯', value: ch.promise },
    { label: 'Enemy', icon: '⚔️', value: ch.enemy },
    { label: 'Hero', icon: '🦸', value: ch.hero },
    { label: 'Tone', icon: '🎙️', value: ch.tone },
    { label: 'Philosophy', icon: cat ? cat.icon : '⚙️', value: ph ? ph.name : ch.philosophy },
    { label: 'Symbol of Success', icon: sy ? sy.icon : '💎', value: sy ? sy.name : ch.successSymbol },
    { label: 'Proof Format', icon: pf ? pf.icon : '📋', value: pf ? pf.name : ch.proofFormat },
    { label: 'Weakness', icon: '⚠️', value: ch.weakness },
    { label: 'Opportunity for Us', icon: '💡', value: ch.opportunity }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'profile-overlay';
  overlay.innerHTML = `
    <div class="profile-modal">
      <button class="profile-close">✕</button>
      <div class="profile-header">
        <img src="${ch.avatar}" class="profile-avatar">
        <div>
          <div class="profile-name">${ch.name}</div>
          <div class="profile-handle">${ch.handle} · ${ch.subscribers} subscribers</div>
          <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
            ${cat ? `<span class="profile-tag" style="background:${cat.color}22;color:${cat.color};">${cat.icon} ${cat.name}</span>` : ''}
            ${st ? `<span class="profile-tag" style="background:${st.color}22;color:${st.color};">${st.icon} ${st.name}</span>` : ''}
            ${tp ? `<span class="profile-tag" style="background:${tp.color}22;color:${tp.color};">${tp.icon} ${tp.name}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="profile-fields">
        ${fields.map(f => `
          <div class="profile-field">
            <span class="profile-field-label">${f.icon} ${f.label}</span>
            <span class="profile-field-value">${f.value}</span>
          </div>
        `).join('')}
      </div>
      ${ch.affinities && ch.affinities.length ? `
        <div style="margin-top:20px;">
          <div style="font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">🔗 Related Channels</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${ch.affinities.map(a => {
              const related = MOCK_DATA.channels.find(c => c.id === a.id);
              if (!related) return '';
              const strengthPct = Math.round(a.strength * 100);
              return `
                <div class="affinity-row" data-channel="${a.id}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;transition:background 0.1s;">
                  <img src="${related.avatar}" style="width:28px;height:28px;border-radius:50%;">
                  <div style="flex:1;">
                    <div style="font-size:13px;font-weight:500;">${related.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${a.label}</div>
                  </div>
                  <div style="font-size:11px;color:${strengthPct > 70 ? 'var(--success)' : strengthPct > 40 ? 'var(--warning)' : 'var(--text-muted)'};font-weight:600;">${strengthPct}%</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('.profile-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelectorAll('.affinity-row').forEach(row => {
    row.addEventListener('click', () => { overlay.remove(); openChannelProfile(row.dataset.channel); });
  });
}

// Network page
let networkTab = 'podcasts';

function renderNetwork() {
  const container = document.getElementById('network-content');
  const tabs = [
    { id: 'podcasts', label: 'Podcasts', icon: '🎙️' },
    { id: 'affinity', label: 'Affinity Map', icon: '🔗' }
  ];

  const html = `
    <div style="margin-bottom:32px;">
      <h2 style="font-size:22px;margin-bottom:8px;">🔗 Network</h2>
      <p style="color:var(--text-secondary);font-size:14px;">Podcast guest map + channel affinity graph</p>
    </div>
    <div class="strategy-tabs" style="margin-bottom:24px;">
      ${tabs.map(t => `<button class="strategy-tab ${networkTab === t.id ? 'active' : ''}" data-ntab="${t.id}">${t.icon} ${t.label}</button>`).join('')}
    </div>
    <div id="network-panel">${networkTab === 'podcasts' ? renderPodcasts() : renderAffinityMap()}</div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('[data-ntab]').forEach(btn => {
    btn.addEventListener('click', () => {
      networkTab = btn.dataset.ntab;
      const panel = document.getElementById('network-panel');
      panel.innerHTML = networkTab === 'podcasts' ? renderPodcasts() : renderAffinityMap();
      container.querySelectorAll('[data-ntab]').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelectorAll('.affinity-row').forEach(row => {
        row.addEventListener('click', () => openChannelProfile(row.dataset.channel));
      });
    });
  });

  container.querySelectorAll('.affinity-row').forEach(row => {
    row.addEventListener('click', () => openChannelProfile(row.dataset.channel));
  });
}

function renderPodcasts() {
  const pd = PODCAST_DATA;

  const showCards = pd.shows.map(show => {
    const cat = STRATEGY.categories.find(c => c.id === show.category);
    const ph = STRATEGY.philosophies.find(p => p.id === show.philosophy);
    const episodes = show.episodes.map(ep => {
      const guest = pd.guests.find(g => g.id === ep.guest);
      return `
        <div class="net-episode">
          <span style="display:flex;align-items:center;gap:6px;">
            <img src="${guest ? guest.avatar : ''}" style="width:18px;height:18px;border-radius:50%;">
            <span style="font-weight:500;">${guest ? guest.name : ep.guest}</span>
          </span>
          <span style="font-size:12px;color:var(--text-muted);flex:1;margin:0 10px;">${ep.title}</span>
          <span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">▶ ${ep.views}</span>
        </div>`;
    }).join('');

    return `
      <div class="net-show-card">
        <div class="net-show-header">
          <img src="${show.avatar}" class="net-show-avatar">
          <div style="flex:1;">
            <div class="net-show-name">${show.name}</div>
            <div class="net-show-host">with ${show.host}</div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            ${cat ? `<span class="profile-tag" style="background:${cat.color}22;color:${cat.color};">${cat.icon} ${cat.name}</span>` : ''}
            ${ph ? `<span class="profile-tag" style="background:${ph.color}22;color:${ph.color};">${ph.icon} ${ph.name}</span>` : ''}
          </div>
        </div>
        <div class="net-episodes">${episodes}</div>
      </div>`;
  }).join('');

  const bridges = pd.guests.filter(g => g.connects.length >= 3).map(g => {
    const shows = g.connects.map(id => pd.shows.find(s => s.id === id)).filter(Boolean);
    return `
      <div class="net-bridge">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <img src="${g.avatar}" style="width:36px;height:36px;border-radius:50%;">
          <div>
            <div style="font-weight:600;font-size:14px;">${g.name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${g.bio}</div>
          </div>
          <span style="margin-left:auto;font-size:11px;color:var(--accent);font-weight:600;">${g.connects.length} shows</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${shows.map(s => `<span class="net-bridge-chip">${s.name}</span>`).join('')}
        </div>
      </div>`;
  }).join('');

  const inviteIdeas = [
    { name: 'Chris Koerner', reason: 'Fits Lifestyle Design / Build Systems — overlaps with Tim Ferriss & MFM audience' },
    { name: 'Shaan Puri', reason: 'Co-host of MFM, solo episodes on business ideas and mindset' },
    { name: 'Dan Koe', reason: 'Creator economy + philosophy — bridges Lifestyle and Creator worlds' },
    { name: 'Simon Squibb', reason: 'Entrepreneurship from zero — great overlap with our travel-to-freedom story' }
  ];

  return `
    <div style="margin-bottom:32px;">
      <h3 style="font-size:16px;margin-bottom:16px;color:var(--text-secondary);">📡 Shows We Track</h3>
      <div class="net-grid">${showCards}</div>
    </div>
    <div style="margin-bottom:32px;">
      <h3 style="font-size:16px;margin-bottom:16px;color:var(--text-secondary);">🌉 Guest Bridges (3+ shows)</h3>
      <div style="display:flex;flex-direction:column;gap:12px;">${bridges || '<div style="color:var(--text-muted);font-size:13px;">No bridges found</div>'}</div>
    </div>
    <div>
      <h3 style="font-size:16px;margin-bottom:16px;color:var(--text-secondary);">🎤 Who We Should Invite</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${inviteIdeas.map(i => `
          <div class="net-invite">
            <div style="font-weight:600;font-size:14px;">${i.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${i.reason}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAffinityMap() {
  const channels = MOCK_DATA.channels;
  const allAffinities = [];

  channels.forEach(ch => {
    if (!ch.affinities) return;
    ch.affinities.forEach(a => {
      const target = channels.find(c => c.id === a.id);
      if (target) allAffinities.push({ from: ch, to: target, type: a.type, strength: a.strength, label: a.label });
    });
  });

  // Group affinity types
  const typeIcons = { collab: '🤝', mentions: '📢', shared_philosophy: '🧠', compared: '⚖️' };
  const typeLabels = { collab: 'Collaboration', mentions: 'Mentions', shared_philosophy: 'Shared Philosophy', compared: 'Compared by Audience' };

  const rows = allAffinities.sort((a, b) => b.strength - a.strength).map(a => {
    const pct = Math.round(a.strength * 100);
    return `
      <div class="affinity-row" data-channel="${a.to.id}" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:background 0.1s;">
        <img src="${a.from.avatar}" style="width:32px;height:32px;border-radius:50%;" title="${a.from.name}">
        <span style="font-size:18px;color:var(--text-muted);">→</span>
        <img src="${a.to.avatar}" style="width:32px;height:32px;border-radius:50%;" title="${a.to.name}">
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;">
            ${a.from.name} <span style="color:var(--text-muted);font-weight:400;">→</span> ${a.to.name}
          </div>
          <div style="font-size:11px;color:var(--text-muted);">${typeIcons[a.type] || '🔗'} ${typeLabels[a.type] || a.type} · ${a.label}</div>
        </div>
        <div style="font-size:11px;color:${pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--text-muted)'};font-weight:600;white-space:nowrap;">${pct}% strength</div>
      </div>`;
  }).join('');

  // Summary stats
  const uniqueFrom = new Set(allAffinities.map(a => a.from.id));
  const uniqueTo = new Set(allAffinities.map(a => a.to.id));

  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
      <div class="metric-card">
        <div class="metric-label">Connections</div>
        <div class="metric-value">${allAffinities.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Connected Channels</div>
        <div class="metric-value">${uniqueFrom.size}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Affinity Types</div>
        <div class="metric-value">${new Set(allAffinities.map(a => a.type)).size}</div>
      </div>
    </div>
    <h3 style="font-size:16px;margin-bottom:16px;color:var(--text-secondary);">Channel Affinities</h3>
    <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
  `;
}

// Market Map
let mapPreset = 'core';
const MAP_PRESETS = {
  core: {
    label: 'Core',
    xLeft: '← Grind 🔥', xRight: 'Freedom 🌴 →',
    yTop: '↑ Life 🌿', yBottom: '↓ Money 💰',
    getX: (ch) => ch.mapPosition ? ch.mapPosition.x : 50,
    getY: (ch) => ch.mapPosition ? ch.mapPosition.y : 50,
    legendX: (p) => `Grind ${100-p}% · Freedom ${p}%`,
    legendY: (p) => `Money ${100-p}% · Life ${p}%`
  },
  style: {
    label: 'Style',
    xLeft: '← Philosophy 📚', xRight: 'Tactics ⚙️ →',
    yTop: '↑ Luxury ✨', yBottom: '↓ Modest 🙌',
    getX: (ch) => ch.mapStyle ? ch.mapStyle.x : 50,
    getY: (ch) => ch.mapStyle ? ch.mapStyle.y : 50,
    legendX: (p) => `Philosophy ${100-p}% · Tactics ${p}%`,
    legendY: (p) => `Modest ${100-p}% · Luxury ${p}%`
  },
  promise: {
    label: 'Promise',
    xLeft: '← Get Richer 💰', xRight: 'Get Freer 🕊️ →',
    yTop: '↑ Premium Life 👑', yBottom: '↓ Inner Peace 🧘',
    getX: (ch) => ch.mapPromise ? ch.mapPromise.x : 50,
    getY: (ch) => ch.mapPromise ? ch.mapPromise.y : 50,
    legendX: (p) => `Get Richer ${100-p}% · Get Freer ${p}%`,
    legendY: (p) => `Inner Peace ${100-p}% · Premium Life ${p}%`
  }
};

function renderMapDots(presetId) {
  const p = MAP_PRESETS[presetId];
  return MOCK_DATA.channels.map(ch => {
    const x = p.getX(ch);
    const y = p.getY(ch);
    return `
      <div class="map-dot" data-channel="${ch.id}" style="left:${x}%;bottom:${y}%;">
        <img src="${ch.avatar}" class="map-dot-avatar">
        <span class="map-dot-name">${ch.name}</span>
      </div>`;
  }).join('');
}

function renderMapLegend(presetId) {
  const p = MAP_PRESETS[presetId];
  return MOCK_DATA.channels.map(ch => {
    const x = p.getX(ch);
    const y = p.getY(ch);
    return `
      <div class="map-legend-item" data-channel="${ch.id}">
        <img src="${ch.avatar}" style="width:24px;height:24px;border-radius:50%;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:500;">${ch.name}</div>
          <div style="font-size:11px;color:var(--text-muted);">${p.legendX(x)} · ${p.legendY(y)}</div>
        </div>
      </div>`;
  }).join('');
}

function renderMarketMap() {
  const container = document.getElementById('map-content');
  const active = mapPreset;

  const tabs = Object.entries(MAP_PRESETS).map(([id, p]) =>
    `<button class="strategy-tab ${active === id ? 'active' : ''}" data-mpreset="${id}">${p.label}</button>`
  ).join('');

  const preset = MAP_PRESETS[active];

  const html = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;margin-bottom:8px;">🗺️ Market Map</h2>
      <p style="color:var(--text-secondary);font-size:14px;">Where channels sit on different axis combinations</p>
      <div class="strategy-tabs" style="margin-top:12px;">${tabs}</div>
    </div>
    <div class="map-container">
      <div class="map-axis-y">
        <span class="map-axis-label top">${preset.yTop}</span>
        <span class="map-axis-label bottom">${preset.yBottom}</span>
      </div>
      <div style="flex:1;position:relative;">
        <div class="map-grid" id="map-grid">
          ${renderMapDots(active)}
        </div>
        <div class="map-axis-x" id="map-x-axis">
          <span class="map-axis-label left">${preset.xLeft}</span>
          <span class="map-axis-label right">${preset.xRight}</span>
        </div>
      </div>
    </div>
    <div style="margin-top:32px;">
      <h3 style="font-size:16px;margin-bottom:12px;color:var(--text-secondary);">Channel Positions</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;" id="map-legend">
        ${renderMapLegend(active)}
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('[data-mpreset]').forEach(btn => {
    btn.addEventListener('click', () => {
      mapPreset = btn.dataset.mpreset;
      container.querySelectorAll('[data-mpreset]').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const p = MAP_PRESETS[mapPreset];
      document.getElementById('map-grid').innerHTML = renderMapDots(mapPreset);
      document.getElementById('map-x-axis').innerHTML = `<span class="map-axis-label left">${p.xLeft}</span><span class="map-axis-label right">${p.xRight}</span>`;
      document.querySelector('.map-axis-y .map-axis-label.top').textContent = p.yTop;
      document.querySelector('.map-axis-y .map-axis-label.bottom').textContent = p.yBottom;
      document.getElementById('map-legend').innerHTML = renderMapLegend(mapPreset);
      container.querySelectorAll('.map-dot, .map-legend-item').forEach(el => {
        el.addEventListener('click', () => openChannelProfile(el.dataset.channel));
      });
    });
  });

  container.querySelectorAll('.map-dot, .map-legend-item').forEach(el => {
    el.addEventListener('click', () => openChannelProfile(el.dataset.channel));
  });
}

// Inspiration
function renderInspiration() {
  const container = document.getElementById('inspiration-content');
  const active = state.inspoTab || 'taki';

  const tabs = INSPIRATION_CHANNELS.map(ch =>
    `<button class="strategy-tab ${active === ch.id ? 'active' : ''}" data-intab="${ch.id}">${ch.name}</button>`
  ).join('');

  const channel = INSPIRATION_CHANNELS.find(c => c.id === active);

  const html = `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:22px;margin-bottom:8px;">✨ Inspiration</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">Thumbnail reference from creators we study</p>
      <div class="strategy-tabs">${tabs}</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span style="font-size:13px;color:var(--text-secondary);">Showing <strong>${channel.name}</strong> — ${channel.videos.length} recent videos</span>
      <a href="${channel.url}" target="_blank" style="font-size:12px;color:var(--accent);text-decoration:none;">Visit channel ↗</a>
    </div>
    <div class="inspo-grid" id="inspo-grid">
      ${channel.videos.map(v => `
        <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" class="inspo-card" title="${v.title}">
          <div class="inspo-thumb">
            <img src="https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg" alt="${v.title}" loading="lazy">
            <div class="inspo-play">▶</div>
          </div>
          <div class="inspo-title">${v.title}</div>
        </a>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('[data-intab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.inspoTab = btn.dataset.intab;
      renderInspiration();
    });
  });
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
    const titles = { dashboard: 'Dashboard', channels: 'Channels', notes: 'Notes', strategy: 'Strategy', network: 'Network', map: 'Market Map', workshop: 'Workshop', inspiration: 'Inspiration' };
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
    case 'strategy': renderStrategy(); break;
    case 'network': renderNetwork(); break;
    case 'map': renderMarketMap(); break;
    case 'workshop': renderWorkshop(); break;
    case 'inspiration': renderInspiration(); break;
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
