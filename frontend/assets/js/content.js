// News, Events, Jobs homepage renderer (Option 2)

const CONTENT_API_BASE = window.API_BASE || 'http://127.0.0.1:8001/api';

document.addEventListener('DOMContentLoaded', () => {
  renderNewsSection();
  renderEventsSection();
  renderJobsSection();
});

async function renderNewsSection() {
  const featured = document.getElementById('news-featured');
  const list = document.getElementById('news-list');
  if (!featured || !list) return;

  try {
    const response = await fetch(`${CONTENT_API_BASE}/news?limit=6`);
    if (!response.ok) return;

    const items = await response.json();
    if (!items || items.length === 0) return;

    const [top, ...rest] = items;

    featured.innerHTML = `
      <div class="news-feat-img" style="${top.image_url ? `background-image:url('${top.image_url}');background-size:cover;background-position:center;` : ''}">
        ${top.image_url ? '' : '📰'}
        <div class="news-feat-overlay">
          <span class="news-cat-tag" style="background:var(--saffron);color:#fff;">${escapeHtml(top.category)}</span>
          <div class="news-feat-title">${escapeHtml(top.title)}</div>
        </div>
      </div>
      <div class="news-feat-body">
        <div class="news-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(top.created_at)}</span>
          <span><i class="fas fa-user"></i> ${escapeHtml(top.source || 'DD Reporter')}</span>
        </div>
        <div class="news-excerpt">${escapeHtml(top.summary)}</div>
      </div>
    `;

    list.innerHTML = rest.slice(0, 3).map((item) => `
      <div class="news-item">
        <div class="news-item-icon">🗞️</div>
        <div>
          <div class="news-item-title">${escapeHtml(item.title)}</div>
          <div class="news-item-meta">
            <span class="news-cat-tag" style="background:#EFF6FF;color:#1D4ED8;font-size:10px;padding:2px 6px;border-radius:3px;">${escapeHtml(item.category)}</span>
            &nbsp; ${formatDate(item.created_at)}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering news:', error);
  }
}

async function renderEventsSection() {
  const container = document.getElementById('events-grid');
  if (!container) return;

  try {
    const response = await fetch(`${CONTENT_API_BASE}/events?limit=6`);
    if (!response.ok) return;

    const items = await response.json();
    if (!items || items.length === 0) return;

    container.innerHTML = items.map((item) => {
      const eventDate = new Date(item.event_date);
      const day = String(eventDate.getDate()).padStart(2, '0');
      const month = eventDate.toLocaleDateString('en-IN', { month: 'short' });
      return `
        <div class="event-card">
          <div class="event-date"><div class="event-day">${day}</div><div class="event-month">${month}</div></div>
          <div>
            <div class="event-title">${escapeHtml(item.title)}</div>
            <div class="event-place"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</div>
            <span class="event-tag tag-orange">${escapeHtml(item.category)}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error rendering events:', error);
  }
}

async function renderJobsSection() {
  const container = document.getElementById('jobs-grid');
  if (!container) return;

  try {
    const response = await fetch(`${CONTENT_API_BASE}/jobs?limit=6`);
    if (!response.ok) return;

    const items = await response.json();
    if (!items || items.length === 0) return;

    container.innerHTML = items.map((item) => `
      <div class="job-card">
        <div class="job-header">
          <div>
            <div class="job-company">${escapeHtml(item.company_name)}</div>
            <div class="job-title">${escapeHtml(item.title)}</div>
          </div>
          <span class="job-type full-time">${escapeHtml(item.job_type)}</span>
        </div>
        <div class="job-details">
          <span class="job-detail"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</span>
          ${item.qualification ? `<span class="job-detail"><i class="fas fa-graduation-cap"></i> ${escapeHtml(item.qualification)}</span>` : ''}
          ${item.experience ? `<span class="job-detail"><i class="fas fa-clock"></i> ${escapeHtml(item.experience)}</span>` : ''}
        </div>
        <div class="job-footer">
          <span class="job-salary">${escapeHtml(item.salary || 'Negotiable')}</span>
          <button class="btn-apply" onclick="${item.contact_phone ? `window.location.href='tel:${item.contact_phone}'` : 'void(0)'}">Apply Now</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering jobs:', error);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
