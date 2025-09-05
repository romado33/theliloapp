import cookingClass from '@/assets/cooking-class.jpg';
import pastaMakingClass from '@/assets/pasta-making-class.jpg';
import potteryClass from '@/assets/pottery-class.jpg';
import potteryWorkshop from '@/assets/pottery-workshop.jpg';
import sunsetYoga from '@/assets/sunset-yoga.jpg';
import waterfallHike from '@/assets/waterfall-hike.jpg';
import wineTasting from '@/assets/wine-tasting.jpg';
import farmersMarket from '@/assets/farmers-market.jpg';
import heroImage from '@/assets/hero-image.jpg';

const imageMap: Record<string, string> = {
  '/placeholder-cooking.jpg': cookingClass,
  '/placeholder-pasta.jpg': pastaMakingClass,
  '/placeholder-pottery.jpg': potteryClass,
  '/placeholder-workshop.jpg': potteryWorkshop,
  '/placeholder-yoga.jpg': sunsetYoga,
  '/placeholder-hike.jpg': waterfallHike,
  '/placeholder-wine.jpg': wineTasting,
  '/placeholder-market.jpg': farmersMarket,
  '/placeholder-farm.jpg': farmersMarket,
  '/placeholder-nature.jpg': farmersMarket,
  '/placeholder-experience.jpg': heroImage,
};

export const getImageFromUrl = (url: string): string => {
  return imageMap[url] || url;
};
