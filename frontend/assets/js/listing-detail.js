// Listing Detail Controller
let currentListing = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeDetailPage();

  const editImageInput = document.getElementById('edit-image');
  if (editImageInput) {
    editImageInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      const previewWrapper = document.getElementById('edit-image-preview');
      const previewImg = document.getElementById('edit-preview-img');
      const currentWrapper = document.getElementById('edit-current-image');

      if (!previewWrapper || !previewImg) return;

      if (!file) {
        previewWrapper.style.display = 'none';
        if (currentWrapper && currentListing?.image_url) {
          currentWrapper.style.display = 'block';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target?.result || '';
        previewWrapper.style.display = 'block';
        if (currentWrapper) currentWrapper.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }
});

async function initializeDetailPage() {
  // Check authentication
  const token = localStorage.getItem('dn_auth_token');
  const user = JSON.parse(localStorage.getItem('dn_auth_user') || '{}');

  // Show logout button if authenticated
  if (token) {
    document.getElementById('nav-logout').style.display = 'inline-block';
  }

  // Get listing ID from URL
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get('id');

  if (!listingId) {
    showAlert('Invalid listing ID', 'error');
    setTimeout(() => window.location.href = 'index.html', 2000);
    return;
  }

  // Load listing details
  await loadListingDetails(listingId, user.id);
}

async function loadListingDetails(listingId, userId) {
  try {
    const API_BASE = window.API_BASE || 'http://127.0.0.1:8001/api';
    const response = await fetch(`${API_BASE}/listings/${listingId}`);
    
    if (!response.ok) {
      throw new Error('Listing not found');
    }

    currentListing = await response.json();

    // Populate page with listing details
    populateListingDetails(currentListing, userId);

    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('listing-content').style.display = 'block';
  } catch (error) {
    console.error('Error loading listing:', error);
    showAlert('Failed to load listing details', 'error');
    document.getElementById('loading').style.display = 'none';
  }
}

function populateListingDetails(listing, userId) {
  // Title and Category
  document.getElementById('listing-title').textContent = escapeHtml(listing.title);
  document.getElementById('listing-category').textContent = escapeHtml(listing.category);

  // Image
  const imageEl = document.getElementById('listing-image');
  if (listing.image_url) {
    imageEl.style.backgroundImage = `url('${listing.image_url}')`;
    imageEl.style.backgroundSize = 'cover';
    imageEl.style.backgroundPosition = 'center';
    imageEl.textContent = ''; // Remove emoji
    imageEl.classList.add('has-image');
  }

  // Meta Information
  document.getElementById('listing-location').textContent = listing.location || 'Not specified';
  document.getElementById('listing-price').textContent = listing.price ? `₹ ${formatPrice(listing.price)}` : 'Not specified';
  document.getElementById('listing-status').textContent = listing.is_active ? 'Active' : 'Inactive';
  document.getElementById('listing-date').textContent = formatDate(listing.created_at);

  // Description
  document.getElementById('listing-description').textContent = escapeHtml(listing.description);

  // Contact Details
  document.getElementById('contact-phone').textContent = escapeHtml(listing.phone);
  const emailText = document.getElementById('contact-email').parentElement;
  if (listing.email) {
    document.getElementById('contact-email').textContent = escapeHtml(listing.email);
  } else {
    emailText.style.display = 'none';
  }

  // Show owner actions if this is the current user's listing
  if (userId && listing.user_id === userId) {
    document.getElementById('owner-actions').style.display = 'block';
  }

  // Populate edit form
  populateEditForm(listing);
}

function populateEditForm(listing) {
  document.getElementById('edit-title').value = listing.title;
  document.getElementById('edit-description').value = listing.description;
  document.getElementById('edit-category').value = listing.category;
  document.getElementById('edit-location').value = listing.location || '';
  document.getElementById('edit-phone').value = listing.phone;
  document.getElementById('edit-email').value = listing.email || '';
  document.getElementById('edit-price').value = listing.price || '';

  const fileInput = document.getElementById('edit-image');
  if (fileInput) fileInput.value = '';

  const previewWrapper = document.getElementById('edit-image-preview');
  if (previewWrapper) previewWrapper.style.display = 'none';

  const currentWrapper = document.getElementById('edit-current-image');
  const currentImg = document.getElementById('edit-current-img');
  if (currentWrapper && currentImg) {
    if (listing.image_url) {
      currentImg.src = listing.image_url;
      currentWrapper.style.display = 'block';
    } else {
      currentWrapper.style.display = 'none';
    }
  }
}

function openEditModal() {
  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

async function saveChanges(event) {
  event.preventDefault();

  const token = localStorage.getItem('dn_auth_token');
  if (!token) {
    showAlert('Please login to edit listings', 'error');
    return;
  }

  const title = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-description').value.trim();
  const category = document.getElementById('edit-category').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();

  // Validate required fields
  if (!title || !description || !category || !phone) {
    showAlert('Please fill all required fields', 'error');
    return;
  }

  try {
    const API_BASE = window.API_BASE || 'http://127.0.0.1:8001/api';

    let imageUrl = currentListing?.image_url || null;
    const imageFile = document.getElementById('edit-image')?.files?.[0];
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadResponse = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        throw new Error(uploadError.detail || 'Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      imageUrl = `http://127.0.0.1:8001${uploadResult.url}`;
    }

    const updatedData = {
      title,
      description,
      category,
      location: document.getElementById('edit-location').value.trim(),
      phone,
      email: document.getElementById('edit-email').value.trim() || null,
      price: parseFloat(document.getElementById('edit-price').value) || 0,
      image_url: imageUrl,
    };

    const response = await fetch(`${API_BASE}/listings/${currentListing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update listing');
    }

    const updated = await response.json();
    currentListing = updated;
    
    // Update page with new details
    populateListingDetails(updated, JSON.parse(localStorage.getItem('dn_auth_user') || '{}').id);
    closeEditModal();
    showAlert('Listing updated successfully!', 'success');
  } catch (error) {
    console.error('Error updating listing:', error);
    showAlert(error.message || 'Failed to update listing', 'error');
  }
}

async function deleteListing() {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    return;
  }

  const token = localStorage.getItem('dn_auth_token');
  if (!token) {
    showAlert('Please login to delete listings', 'error');
    return;
  }

  try {
    const API_BASE = window.API_BASE || 'http://127.0.0.1:8001/api';
    const response = await fetch(`${API_BASE}/listings/${currentListing.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete listing');
    }

    showAlert('Listing deleted successfully!', 'success');
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    console.error('Error deleting listing:', error);
    showAlert(error.message || 'Failed to delete listing', 'error');
  }
}

function callBusiness() {
  const phone = currentListing.phone.replace(/\D/g, '');
  window.location.href = `tel:+91${phone}`;
}

function whatsappBusiness() {
  const phone = currentListing.phone.replace(/\D/g, '');
  const message = `Hi, I'm interested in your listing: ${currentListing.title}`;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/91${phone}?text=${encoded}`, '_blank');
}

function emailBusiness() {
  if (!currentListing.email) {
    showAlert('Email not available', 'error');
    return;
  }
  const subject = `Inquiry about: ${currentListing.title}`;
  const body = `Hi,\n\nI'm interested in your listing: ${currentListing.title}\n\nWould you like to tell me more?\n\nThanks`;
  window.location.href = `mailto:${encodeURIComponent(currentListing.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function shareWhatsApp() {
  const text = `Check out this listing on Dildarnagar.in: ${currentListing.title} - ${window.location.href}`;
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

function showAlert(message, type) {
  const alertEl = document.getElementById('alert-message');
  alertEl.textContent = message;
  alertEl.className = `alert show ${type}`;
  setTimeout(() => alertEl.classList.remove('show'), 4000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-IN');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function logoutUser() {
  localStorage.removeItem('dn_auth_token');
  localStorage.removeItem('dn_auth_user');
  window.location.href = 'index.html';
}
