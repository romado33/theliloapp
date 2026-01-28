/**
 * Centralized mock experience data for development and testing
 */

import cookingClass from '@/assets/cooking-class.jpg';
import farmersMarket from '@/assets/farmers-market.jpg';
import heroImage from '@/assets/hero-image.jpg';
import pastaMakingClass from '@/assets/pasta-making-class.jpg';
import potteryClass from '@/assets/pottery-class.jpg';
import potteryWorkshop from '@/assets/pottery-workshop.jpg';
import sunsetYoga from '@/assets/sunset-yoga.jpg';
import waterfallHike from '@/assets/waterfall-hike.jpg';
import wineTasting from '@/assets/wine-tasting.jpg';

export interface MockExperience {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  image_urls: string[];
  what_included: string[];
  what_to_bring: string[];
  cancellation_policy: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id: string;
  host_id: string;
  latitude: number;
  longitude: number;
  search_terms: string | null;
  embedding: string | null;
  categories: { name: string };
  profiles: { first_name: string; last_name: string; avatar_url: string | null };
}

export const MOCK_EXPERIENCES: Record<string, MockExperience> = {
  "550e8400-e29b-41d4-a716-446655440001": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Pottery Workshop for Beginners",
    description: "Join us for an authentic pottery experience where you'll learn the basics of clay work and create your own unique piece. This hands-on workshop is perfect for beginners and provides all the materials and guidance needed to create something beautiful.",
    location: "Downtown",
    address: "123 Art Street, Downtown, ON K1A 0A1",
    price: 65,
    duration_hours: 2,
    max_guests: 8,
    image_urls: [potteryClass, potteryWorkshop, cookingClass, sunsetYoga, heroImage],
    what_included: [
      "All pottery materials and tools",
      "Professional instruction", 
      "Firing and glazing of finished pieces",
      "Aprons and cleanup materials",
      "Light refreshments"
    ],
    what_to_bring: [
      "Clothes that can get dirty",
      "Hair tie for long hair", 
      "Enthusiasm for creativity!"
    ],
    cancellation_policy: "Full refund if cancelled 48 hours in advance. No refund for same-day cancellations.",
    status: "approved",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    category_id: "cat1",
    host_id: "host1",
    latitude: 45.4215,
    longitude: -75.6972,
    search_terms: null,
    embedding: null,
    categories: { name: "Arts & Crafts" },
    profiles: { first_name: "Sarah", last_name: "Chen", avatar_url: null }
  },
  "550e8400-e29b-41d4-a716-446655440002": {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Farmers Market Food Tour",
    description: "Explore the local farmers market with an experienced guide who will introduce you to the best vendors, seasonal produce, and local specialties. Perfect for food lovers and families.",
    location: "Market District",
    address: "456 Market Square, Market District, ON K1B 1B2",
    price: 45,
    duration_hours: 3,
    max_guests: 12,
    image_urls: [farmersMarket, heroImage, waterfallHike, sunsetYoga],
    what_included: [
      "Professional guide",
      "Sample tastings from 5+ vendors",
      "Market map and vendor information",
      "Recipes from featured vendors",
      "Small group experience"
    ],
    what_to_bring: [
      "Comfortable walking shoes",
      "Reusable shopping bag",
      "Camera for photos",
      "Appetite for new flavors!"
    ],
    cancellation_policy: "Free cancellation up to 24 hours before the tour.",
    status: "approved",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    category_id: "cat2",
    host_id: "host2",
    latitude: 45.4215,
    longitude: -75.6972,
    search_terms: null,
    embedding: null,
    categories: { name: "Food & Drink" },
    profiles: { first_name: "Miguel", last_name: "Rodriguez", avatar_url: null }
  },
  "550e8400-e29b-41d4-a716-446655440003": {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Italian Cooking Masterclass",
    description: "Learn to cook authentic Italian dishes from a professional chef in this immersive cooking experience. You'll master traditional techniques and enjoy the delicious meal you create.",
    location: "Little Italy",
    address: "789 Culinary Lane, Little Italy, ON K1C 1C3",
    price: 85,
    duration_hours: 4,
    max_guests: 6,
    image_urls: [cookingClass, pastaMakingClass, wineTasting, heroImage, farmersMarket, sunsetYoga],
    what_included: [
      "All ingredients and cooking supplies",
      "Professional chef instruction",
      "Recipe cards to take home",
      "Full 3-course meal",
      "Wine pairing (for adults)",
      "Apron to keep"
    ],
    what_to_bring: [
      "Closed-toe shoes",
      "Hair tie if needed",
      "Enthusiasm for Italian cuisine!"
    ],
    cancellation_policy: "Free cancellation up to 72 hours before class. 50% refund within 72-24 hours.",
    status: "approved",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    category_id: "cat3",
    host_id: "host3",
    latitude: 45.4215,
    longitude: -75.6972,
    search_terms: null,
    embedding: null,
    categories: { name: "Food & Drink" },
    profiles: { first_name: "Marco", last_name: "Rossi", avatar_url: null }
  }
};

// Gallery images for filling in experience photo carousels
export const GALLERY_IMAGES = [
  cookingClass,
  potteryClass, 
  farmersMarket,
  pastaMakingClass,
  potteryWorkshop,
  sunsetYoga,
  waterfallHike,
  wineTasting
];

export const getMockExperience = (id: string): MockExperience | undefined => {
  return MOCK_EXPERIENCES[id];
};
