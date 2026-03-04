/**
 * Listings API client
 * Handles all listing operations (fetch, create, update, delete)
 */

window.listings = {
  /**
   * Fetch all active listings with optional filtering
   * @param {Object} options - Query options
   * @param {number} options.skip - Pagination offset (default: 0)
   * @param {number} options.limit - Pagination limit (default: 20)
   * @param {string} options.category - Filter by category
   * @param {string} options.search - Search in title/description
   * @returns {Promise<Array>} Array of listing objects
   */
  async fetchListings(options = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add query parameters if provided
      if (options.skip !== undefined) params.append('skip', options.skip);
      if (options.limit !== undefined) params.append('limit', options.limit);
      if (options.category) params.append('category', options.category);
      if (options.search) params.append('search', options.search);

      const url = params.toString() 
        ? `/listings?${params.toString()}` 
        : '/listings';

      const response = await window.api.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  },

  /**
   * Fetch a single listing by ID
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object>} Listing object
   */
  async fetchListing(listingId) {
    try {
      const response = await window.api.get(`/listings/${listingId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching listing ${listingId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new listing (requires authentication)
   * @param {Object} data - Listing data
   * @param {string} data.title - Business name
   * @param {string} data.description - Description
   * @param {string} data.category - Category
   * @param {string} data.phone - Contact phone
   * @param {string} data.email - Contact email (optional)
   * @param {string} data.location - Business location
   * @param {number} data.price - Price/budget (optional)
   * @param {string} data.image_url - Image URL (optional)
   * @returns {Promise<Object>} Created listing object
   */
  async createListing(data) {
    try {
      const token = window.auth.getToken();
      if (!token) {
        throw new Error('Authentication required to create a listing');
      }

      const response = await window.api.post('/listings', data, {
        'Authorization': `Bearer ${token}`
      });
      return response;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  /**
   * Update an existing listing (owner only)
   * @param {number} listingId - Listing ID
   * @param {Object} data - Update data (partial, only changed fields)
   * @returns {Promise<Object>} Updated listing object
   */
  async updateListing(listingId, data) {
    try {
      const token = window.auth.getToken();
      if (!token) {
        throw new Error('Authentication required to update a listing');
      }

      // Build URL
      const url = `/listings/${listingId}`;

      // Use custom fetch for PUT
      const response = await fetch(`${window.API_BASE || 'http://127.0.0.1:8001/api'}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        const error = new Error(errorBody.detail || 'Update failed');
        error.status = response.status;
        error.data = errorBody;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  /**
   * Delete a listing (owner only)
   * @param {number} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async deleteListing(listingId) {
    try {
      const token = window.auth.getToken();
      if (!token) {
        throw new Error('Authentication required to delete a listing');
      }

      // Build URL
      const url = `/listings/${listingId}`;

      // Use custom fetch for DELETE
      const response = await fetch(`${window.API_BASE || 'http://127.0.0.1:8001/api'}${url}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody.detail || 'Delete failed');
        error.status = response.status;
        error.data = errorBody;
        throw error;
      }

      return null;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

  /**
   * Get categories by analyzing listings
   * @param {Array} listingsList - Array of listings
   * @returns {Array<string>} Unique categories
   */
  getCategories(listingsList) {
    const categories = new Set(listingsList.map(listing => listing.category));
    return Array.from(categories).sort();
  }
};
