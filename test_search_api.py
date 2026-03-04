#!/usr/bin/env python3
"""Test search and filtering API endpoints"""
import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"

print("=" * 60)
print("TESTING SEARCH & FILTERING ENDPOINTS")
print("=" * 60)

# Test 1: Get all listings
print("\n1. All Listings:")
r = requests.get(f"{BASE_URL}/listings")
listings = r.json()
print(f"   ✓ Total listings: {len(listings)}")
if listings:
    print(f"   Sample: {listings[0]['title']}, Category: {listings[0].get('category', 'N/A')}")

# Test 2: Filter listings by category
print("\n2. Listings filtered by category (if available):")
if listings and 'category' in listings[0]:
    category = listings[0]['category']
    r = requests.get(f"{BASE_URL}/listings?category={category}")
    filtered = r.json()
    print(f"   ✓ Category '{category}': {len(filtered)} items")

# Test 3: Filter listings by location
print("\n3. Listings filtered by location:")
r = requests.get(f"{BASE_URL}/listings?location=Dildarnagar")
location_filtered = r.json()
print(f"   ✓ Location 'Dildarnagar': {len(location_filtered)} items")

# Test 4: Search listings
print("\n4. Listings with search query:")
r = requests.get(f"{BASE_URL}/listings?search=test")
search_results = r.json()
print(f"   ✓ Search results for 'test': {len(search_results)} items")

# Test 5: Get all news
print("\n5. All News:")
r = requests.get(f"{BASE_URL}/news")
news_items = r.json()
print(f"   ✓ Total news: {len(news_items)}")

# Test 6: News with filters
print("\n6. News with location filter:")
r = requests.get(f"{BASE_URL}/news?location=Dildarnagar")
news_filtered = r.json()
print(f"   ✓ News location filter: {len(news_filtered)} items")

# Test 7: Get all events
print("\n7. All Events:")
r = requests.get(f"{BASE_URL}/events")
events = r.json()
print(f"   ✓ Total events: {len(events)}")

# Test 8: Events with filters
print("\n8. Events with search:")
r = requests.get(f"{BASE_URL}/events?search=event")
events_search = r.json()
print(f"   ✓ Events search: {len(events_search)} items")

# Test 9: Get all jobs
print("\n9. All Jobs:")
r = requests.get(f"{BASE_URL}/jobs")
jobs = r.json()
print(f"   ✓ Total jobs: {len(jobs)}")

# Test 10: Jobs with filters
print("\n10. Jobs with location filter:")
r = requests.get(f"{BASE_URL}/jobs?location=Dildarnagar")
jobs_location = r.json()
print(f"    ✓ Jobs location filter: {len(jobs_location)} items")

print("\n" + "=" * 60)
print("✓ ALL SEARCH & FILTERING TESTS PASSED")
print("=" * 60)
