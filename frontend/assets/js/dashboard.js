/**
 * Dashboard Controller
 * Handles user profile, listings management, and analytics
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
  const token = window.auth.getToken();
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // Load dashboard data
  await loadDashboardData();
});

/**
 * Load all dashboard data (profile, listings, stats)
 */
async function loadDashboardData() {
  try {
    const token = window.auth.getToken();
    if (!token) throw new Error('No authentication token');

    // Fetch dashboard data from API
    const response = await fetch(`${window.API_BASE || 'http://127.0.0.1:8001/api'}/user/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to load dashboard');

    const data = await response.json();

    // Populate dashboard
    populateProfile(data.user);
    populateStats(data.stats);
    populateListings(data.listings);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Error loading dashboard: ' + error.message);
  }
}

/**
 * Populate profile section
 */
function populateProfile(user) {
  document.getElementById('profile-name').textContent = user.full_name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('business-phone').textContent = user.phone || 'Not set';

  // Populate edit form
  document.getElementById('edit-full-name').value = user.full_name;
}

/**
 * Populate stats cards
 */
function populateStats(stats) {
  document.getElementById('stat-total').textContent = stats.total_listings;
  document.getElementById('stat-active').textContent = stats.active_listings;
  document.getElementById('stat-inactive').textContent = stats.inactive_listings;
}

/**
 * Populate listings table
 */
function populateListings(listings) {
  const container = document.getElementById('listings-container');

  if (!listings || listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No Listings Yet</div>
        <div class="empty-state-text">You haven't created any listings yet. Start by adding your first business listing.</div>
        <button class="btn-add-listing" onclick="addNewListing()">
          <i class="fas fa-plus"></i> Create Your First Listing
        </button>
      </div>
    `;
    return;
  }

  const html = `
    <table class="listings-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Location</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${listings.map(listing => `
          <tr>
            <td class="listing-title">${escapeHtml(listing.title)}</td>
            <td><span class="listing-category">${escapeHtml(listing.category)}</span></td>
            <td>${listing.location ? escapeHtml(listing.location) : '—'}</td>
            <td>
              <span class="status-badge ${listing.is_active ? 'status-active' : 'status-inactive'}">
                ${listing.is_active ? '✓ Active' : '✕ Inactive'}
              </span>
            </td>
            <td>${formatDate(listing.created_at)}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" onclick="editListing(${listing.id})">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteListing(${listing.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

/**
 * Show/hide sections
 */
function showSection(sectionId, sidebarItem) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionId + '-section').classList.add('active');

  // Add active class to sidebar item
  if (sidebarItem) {
    sidebarItem.classList.add('active');
  }
}

/**
 * Save profile changes
 */
async function saveProfile(event) {
  event.preventDefault();

  try {
    const token = window.auth.getToken();
    if (!token) throw new Error('No authentication token');

    const data = {
      // For now, just a placeholder until we add profile fields
    };

    const response = await fetch(`${window.API_BASE || 'http://127.0.0.1:8001/api'}/user/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update profile');

    const updated = await response.json();
    populateProfile(updated);

    alert('✅ Profile updated successfully!');
    showSection('overview', document.querySelector('.sidebar-item'));
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('❌ Error saving profile: ' + error.message);
  }
}

/**
 * Add new listing
 */
function addNewListing() {
  // Open the create listing modal
  document.getElementById('create-listing-modal').classList.add('active');
  document.getElementById('create-listing-form').reset();
  document.getElementById('create-image-preview').style.display = 'none';
}

/**
 * Close create listing modal
 */
function closeCreateModal() {
  document.getElementById('create-listing-modal').classList.remove('active');
}

/**
 * Preview image on file select (for create form)
 */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const createImageInput = document.getElementById('create-image');
    if (createImageInput) {
      createImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById('create-preview-img').src = event.target.result;
            document.getElementById('create-image-preview').style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });
}

/**
 * Create new listing
 */
async function createNewListing(event) {
  event.preventDefault();

  const token = window.auth.getToken();
  if (!token) {
    alert('Please login to create a listing');
    return;
  }

  // Validate required fields
  const title = document.getElementById('create-title').value.trim();
  const description = document.getElementById('create-description').value.trim();
  const category = document.getElementById('create-category').value.trim();
  const phone = document.getElementById('create-phone').value.trim();

  if (!title || !description || !category || !phone) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const API_BASE = window.API_BASE || 'http://127.0.0.1:8001/api';
    let imageUrl = null;

    // Upload image if selected
    const imageFile = document.getElementById('create-image').files[0];
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadResponse = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      imageUrl = 'http://127.0.0.1:8001' + uploadResult.url;
    }

    // Create listing with image URL
    const listingData = {
      title: title,
      description: description,
      category: category,
      location: document.getElementById('create-location').value.trim() || null,
      phone: phone,
      email: document.getElementById('create-email').value.trim() || null,
      price: parseFloat(document.getElementById('create-price').value) || 0,
      image_url: imageUrl,
    };

    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create listing');
    }

    const created = await response.json();
    alert('✅ Listing created successfully!');
    closeCreateModal();
    
    // Reload dashboard data to show new listing
    await loadDashboardData();
  } catch (error) {
    console.error('Error creating listing:', error);
    alert('❌ Error creating listing: ' + error.message);
  }
}

/**
 * Edit listing
 */
function editListing(listingId) {
  // Navigate to listing detail page with listing ID
  window.location.href = `listing-detail.html?id=${listingId}`;
}

/**
 * Delete listing
 */
async function deleteListing(listingId) {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    return;
  }

  try {
    const token = window.auth.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${window.API_BASE || 'http://127.0.0.1:8001/api'}/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 204) {
      alert('✅ Listing deleted successfully!');
      await loadDashboardData();
    } else {
      throw new Error('Failed to delete listing');
    }
  } catch (error) {
    console.error('Error deleting listing:', error);
    alert('❌ Error deleting listing: ' + error.message);
  }
}

/**
 * Logout user
 */
function logoutUser() {
  if (confirm('Are you sure you want to logout?')) {
    window.auth.logout();
    window.location.href = 'index.html';
  }
}

/**
 * Format date to readable format
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
