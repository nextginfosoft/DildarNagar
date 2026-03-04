// Search and Filter Module
const CONTENT_API_BASE = '/api';

const CATEGORIES = {
  listings: ['Electronics', 'Furniture', 'Vehicles', 'Real Estate', 'Services', 'Other'],
  services: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mechanic', 'Salon', 'Other'],
  news: ['Local News', 'Events', 'Announcements', 'Community', 'Business', 'Other'],
  events: ['Community', 'Sports', 'Cultural', 'Business', 'Educational', 'Other'],
  jobs: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

let currentFilters = {
  contentType: 'listings',
  search: '',
  category: '',
  jobType: ''
};

document.addEventListener('DOMContentLoaded', initializeSearch);

function initializeSearch() {
  setupSearchForm();
  setupCategoryFilters();
  // Don't auto-search on init - only search when user triggers it
}

function setupSearchForm() {
  const searchInput = document.getElementById('global-search-input');
  const contentTypeSelect = document.getElementById('content-type-select');
  const searchButton = document.getElementById('search-button');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  if (contentTypeSelect) {
    contentTypeSelect.addEventListener('change', (e) => {
      currentFilters.contentType = e.target.value;
      updateFilterUI();
      performSearch();
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }
}

function setupCategoryFilters() {
  const categoryContainer = document.getElementById('category-filter-chips');
  if (!categoryContainer) return;

  const contentType = currentFilters.contentType;
  const categories = contentType === 'jobs' ? JOB_TYPES : 
                    (CATEGORIES[contentType] || []);

  categoryContainer.innerHTML = '';
  
  categories.forEach((cat) => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      const filterKey = contentType === 'jobs' ? 'jobType' : 'category';
      currentFilters[filterKey] = currentFilters[filterKey] === cat ? '' : cat;
      updateFilterUI();
      performSearch();
    });
    categoryContainer.appendChild(chip);
  });
}



function updateFilterUI() {
  // Update search input
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.value = currentFilters.search;
  }

  // Update category chips
  const chips = document.querySelectorAll('.filter-chip');
  const activeFilter = currentFilters.contentType === 'jobs' ? currentFilters.jobType : currentFilters.category;
  
  chips.forEach((chip) => {
    if (chip.textContent === activeFilter) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });



  // Update active filter display
  updateActiveFiltersDisplay();
}

function updateActiveFiltersDisplay() {
  const activeFiltersDiv = document.getElementById('active-filters-display');
  if (!activeFiltersDiv) return;

  const filters = [];
  if (currentFilters.search) filters.push(`Search: "${currentFilters.search}"`);
  if (currentFilters.category) filters.push(`Category: ${currentFilters.category}`);
  if (currentFilters.jobType) filters.push(`Job Type: ${currentFilters.jobType}`);

  if (filters.length > 0) {
    activeFiltersDiv.innerHTML = '<strong>Active Filters:</strong> ' + filters.join(' • ');
    activeFiltersDiv.style.display = 'block';
  } else {
    activeFiltersDiv.style.display = 'none';
  }
}

async function performSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    currentFilters.search = searchInput.value;
  }

  let contentType = currentFilters.contentType;
  const params = new URLSearchParams();

  if (currentFilters.search) params.append('search', currentFilters.search);


  // Services maps to listings with category filter
  let endpoint;
  if (contentType === 'services') {
    endpoint = `${CONTENT_API_BASE}/listings?${params.toString()}`;
    if (currentFilters.category) {
      params.append('category', 'Services');
    }
    endpoint = `${CONTENT_API_BASE}/listings?${params.toString()}`;
    displaySearchResults(await (await fetch(endpoint)).json(), 'services');
  } else {
    // Add type-specific filters
    if (contentType === 'listings' && currentFilters.category) {
      params.append('category', currentFilters.category);
    } else if (contentType === 'news' && currentFilters.category) {
      params.append('category', currentFilters.category);
    } else if (contentType === 'events' && currentFilters.category) {
      params.append('category', currentFilters.category);
    } else if (contentType === 'jobs' && currentFilters.jobType) {
      params.append('job_type', currentFilters.jobType);
    }

    endpoint = `${CONTENT_API_BASE}/${contentType}?${params.toString()}`;

    try {
      const response = await fetch(endpoint);
      const items = await response.json();
      displaySearchResults(items, contentType);
      updateActiveFiltersDisplay();
    } catch (error) {
      console.error('Search error:', error);
      document.getElementById('search-results').innerHTML = 
        '<p style="text-align: center; color: red;">Error loading results</p>';
    }
  }
}

function displaySearchResults(items, contentType) {
  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) return;

  if (items.length === 0) {
    resultsDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No results found</p>';
    return;
  }

  resultsDiv.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'search-results-grid';

  items.forEach((item) => {
    const card = createResultCard(item, contentType);
    grid.appendChild(card);
  });

  resultsDiv.appendChild(grid);
}

function createResultCard(item, contentType) {
  const card = document.createElement('div');
  card.className = 'search-result-card';

  let content = '';

  if (contentType === 'listings' || contentType === 'services') {
    content = `
      <img src="${item.image_url || '/images/placeholder.png'}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p class="category-badge">${item.category}</p>
      <p class="location">📍 ${item.location || 'Location not specified'}</p>
      <p class="description">${item.description?.substring(0, 100) || ''}...</p>
      ${item.phone ? `<p class="meta">📞 ${item.phone}</p>` : ''}
      ${item.price ? `<p class="price">₹${item.price}</p>` : ''}
    `;
  } else if (contentType === 'news') {
    content = `
      <img src="${item.image_url || '/images/placeholder.png'}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p class="category-badge">${item.category}</p>
      <p class="summary">${item.summary?.substring(0, 120) || ''}...</p>
      <p class="meta">${item.location || 'Local'} • ${new Date(item.created_at).toLocaleDateString()}</p>
    `;
  } else if (contentType === 'events') {
    const eventDate = new Date(item.event_date).toLocaleDateString();
    content = `
      <img src="${item.image_url || '/images/placeholder.png'}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p class="category-badge">${item.category}</p>
      <p class="description">${item.description?.substring(0, 100) || ''}...</p>
      <p class="location">📍 ${item.location}</p>
      <p class="meta">📅 ${eventDate}</p>
    `;
  } else if (contentType === 'jobs') {
    content = `
      <h3>${item.title}</h3>
      <p class="company">${item.company_name}</p>
      <p class="job-type-badge">${item.job_type}</p>
      <p class="location">📍 ${item.location}</p>
      <p class="meta">${item.experience || 'Experience not specified'}</p>
      <p class="salary">${item.salary || 'Salary negotiable'}</p>
    `;
  }

  card.innerHTML = content;
  return card;
}

function clearAllFilters() {
  currentFilters = {
    contentType: 'listings',
    search: '',
    category: '',
    jobType: ''
  };

  const contentTypeSelect = document.getElementById('content-type-select');
  if (contentTypeSelect) contentTypeSelect.value = 'listings';

  updateFilterUI();
  setupCategoryFilters();
  performSearch();
}
