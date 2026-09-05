import axios from 'axios';
import { YoutubeVideo } from '../types';

const API_KEY = 'AIzaSyBwZQ3T0z0w3AYzSbtwYSyf6E6vaX2WkxE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const getLanguageRegionCode = (language: string = 'Global'): string => {
  const lang = language.toLowerCase();
  if (lang.includes('tamil')) return 'IN';
  if (lang.includes('spanish')) return 'ES';
  if (lang.includes('hindi')) return 'IN';
  if (lang.includes('japanese')) return 'JP';
  if (lang.includes('korean')) return 'KR';
  if (lang.includes('french')) return 'FR';
  if (lang.includes('german')) return 'DE';
  if (lang.includes('portuguese')) return 'BR';
  return 'US';
};

export const searchYoutubeVideos = async (
  query: string,
  relevanceLanguage: string = 'en'
): Promise<YoutubeVideo[]> => {
  if (!query.trim()) return [];

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 15,
        order: 'relevance',
        relevanceLanguage: relevanceLanguage.toLowerCase(),
        key: API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id?.videoId || '',
      title: decodeHtmlEntities(item.snippet?.title || ''),
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        '',
      channelName: item.snippet?.channelTitle || 'Unknown Channel',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      duration: '',
      viewCount: '0',
      likeCount: '0',
      description: item.snippet?.description || '',
    }));
  } catch (error) {
    console.error('Error fetching search results from YouTube:', error);
    return [];
  }
};

export const getMostPopularMusicVideos = async (
  regionCode: string = 'US',
  language: string = 'Global'
): Promise<YoutubeVideo[]> => {
  try {
    const lang = language.toLowerCase();
    // Targeted query for Tamil music when Tamil is selected
    if (lang.includes('tamil')) {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: 'Tamil Trending Music Songs Official',
          type: 'video',
          videoCategoryId: '10',
          maxResults: 15,
          order: 'viewCount',
          regionCode: 'IN',
          relevanceLanguage: 'ta',
          key: API_KEY,
        },
      });

      return response.data.items.map((item: any) => ({
        id: item.id?.videoId || '',
        title: decodeHtmlEntities(item.snippet?.title || ''),
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          '',
        channelName: item.snippet?.channelTitle || 'Tamil Music Channel',
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        duration: '',
        viewCount: '1000000',
        likeCount: '50000',
        description: item.snippet?.description || '',
      }));
    }

    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        regionCode: regionCode.toUpperCase(),
        videoCategoryId: '10', // Music Category
        maxResults: 15,
        key: API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id,
      title: decodeHtmlEntities(item.snippet?.title || ''),
      thumbnailUrl:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        '',
      channelName: item.snippet?.channelTitle || 'Unknown Channel',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      duration: item.contentDetails?.duration || '',
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0',
      description: item.snippet?.description || '',
    }));
  } catch (error) {
    console.error('Error fetching popular videos from YouTube:', error);
    return [];
  }
};

export const getVideoDetails = async (videoId: string): Promise<YoutubeVideo | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: API_KEY,
      },
    });

    if (!response.data.items || response.data.items.length === 0) return null;

    const item = response.data.items[0];
    return {
      id: item.id,
      title: decodeHtmlEntities(item.snippet?.title || ''),
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        '',
      channelName: item.snippet?.channelTitle || 'Unknown Channel',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      duration: item.contentDetails?.duration || '',
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0',
      description: item.snippet?.description || '',
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};
