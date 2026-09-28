import React, { createContext, useContext, useState, useEffect } from 'react';

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  // Initial library data
  const initialLibraryItems = [
    {
      id: 1,
      title: 'Walking in Faith: A Daily Devotional',
      author: 'Pastor Sarah Wilson',
      type: 'book',
      category: 'devotional',
      description: 'A comprehensive 365-day devotional guide for spiritual growth and daily reflection.',
      cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center',
      isFree: true,
      previewContent: 'Faith is the foundation of our spiritual journey. Each day, we have the opportunity to grow closer to God through prayer, scripture reading, and reflection. This devotional guide provides daily insights and practical applications...',
      rating: 4.8,
      downloads: 1250,
      publishDate: '2024-01-01',
      tags: ['devotional', 'daily', 'faith', 'growth'],
      content: 'This devotional provides daily scripture readings, reflections, and practical applications for living a faith-filled life...'
    },
    {
      id: 2,
      title: 'Youth Ministry in the Digital Age',
      author: 'Mike Johnson',
      type: 'book',
      category: 'ministry',
      description: 'Modern approaches to youth ministry using technology and social media platforms.',
      cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop&crop=center',
      isFree: false,
      price: 19.99,
      accessCode: 'YM2024',
      previewContent: 'Youth ministry in today\'s digital age requires a delicate balance between embracing technology and maintaining spiritual depth. This book explores how to leverage social media platforms, mobile apps, and digital tools to connect with young people while preserving the core message of faith...',
      rating: 4.6,
      downloads: 890,
      publishDate: '2023-12-15',
      tags: ['youth', 'ministry', 'technology', 'social media'],
      content: 'Explore innovative ways to engage young people through digital platforms while maintaining spiritual depth...'
    },
    {
      id: 3,
      title: 'Building Strong Relationships',
      author: 'Dr. Emily Brown',
      type: 'blog',
      category: 'relationships',
      description: 'A series of articles on building and maintaining healthy relationships in today\'s world.',
      cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=center',
      isFree: true,
      previewContent: 'Building strong relationships requires intentional effort and biblical wisdom. This series explores the foundations of healthy relationships, communication skills, and conflict resolution from a Christian perspective...',
      rating: 4.7,
      views: 2100,
      publishDate: '2024-01-10',
      tags: ['relationships', 'family', 'marriage', 'friendship'],
      content: 'Healthy relationships are the foundation of a fulfilling life. This series explores biblical principles...'
    },
    {
      id: 4,
      title: 'Prayer Warriors: A Guide to Intercessory Prayer',
      author: 'Rev. David Smith',
      type: 'book',
      category: 'prayer',
      description: 'Learn the art and power of intercessory prayer for yourself and others.',
      cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop&crop=center',
      isFree: false,
      price: 24.99,
      accessCode: 'PW2024',
      previewContent: 'Intercessory prayer is one of the most powerful forms of spiritual warfare. When we pray for others, we become conduits of God\'s grace and mercy. This guide will teach you how to develop a consistent prayer life and intercede effectively for those around you...',
      rating: 4.9,
      downloads: 1560,
      publishDate: '2023-11-20',
      tags: ['prayer', 'intercession', 'spiritual warfare', 'faith'],
      content: 'Discover the transformative power of praying for others and how it can change lives...'
    },
    {
      id: 5,
      title: 'Daily Wisdom Quotes Collection',
      author: 'FOG Community',
      type: 'quotes',
      category: 'wisdom',
      description: 'A curated collection of inspiring quotes from spiritual leaders and scripture.',
      cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop&crop=center',
      isFree: true,
      rating: 4.5,
      views: 3400,
      publishDate: '2024-01-05',
      tags: ['quotes', 'wisdom', 'inspiration', 'daily'],
      content: 'Start each day with wisdom and inspiration from these carefully selected quotes...'
    },
    {
      id: 6,
      title: 'Financial Stewardship for Christians',
      author: 'Financial Ministry Team',
      type: 'book',
      category: 'finance',
      description: 'Biblical principles for managing money and resources according to God\'s plan.',
      cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop&crop=center',
      isFree: false,
      price: 29.99,
      accessCode: 'FS2024',
      previewContent: 'Financial stewardship is not just about managing money—it\'s about honoring God with everything we have. This book provides biblical principles for budgeting, saving, investing, and giving, helping you build a solid financial foundation that glorifies God...',
      rating: 4.4,
      downloads: 720,
      publishDate: '2023-10-30',
      tags: ['finance', 'stewardship', 'biblical', 'money management'],
      content: 'Learn how to honor God with your finances and build a secure financial future...'
    },
    {
      id: 7,
      title: 'Biblical Leadership Principles',
      author: 'Dr. James Anderson',
      type: 'book',
      category: 'leadership',
      description: 'Essential leadership principles drawn from biblical examples and modern applications.',
      cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=400&fit=crop&crop=center',
      isFree: false,
      price: 22.99,
      accessCode: 'BL2024',
      previewContent: 'Biblical leadership is fundamentally different from worldly leadership. It\'s about serving others, leading with humility, and following Christ\'s example. This book examines leadership principles from both the Old and New Testaments...',
      rating: 4.7,
      downloads: 980,
      publishDate: '2023-09-15',
      tags: ['leadership', 'biblical', 'management', 'servant leadership'],
      content: 'Discover how biblical leadership principles can transform your approach to leading others...'
    },
    {
      id: 8,
      title: 'Family Devotionals for All Ages',
      author: 'Family Ministry Team',
      type: 'book',
      category: 'family',
      description: 'Interactive devotionals designed for families to grow together in faith.',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=center',
      isFree: true,
      previewContent: 'Family devotionals create opportunities for spiritual growth and meaningful conversations. These interactive sessions are designed to engage family members of all ages in learning and growing together...',
      rating: 4.6,
      downloads: 2100,
      publishDate: '2024-01-08',
      tags: ['family', 'devotional', 'children', 'togetherness'],
      content: 'Strengthen family bonds through shared spiritual experiences and meaningful conversations...'
    },
    {
      id: 9,
      title: 'Worship Through Music',
      author: 'Worship Ministry',
      type: 'blog',
      category: 'worship',
      description: 'Exploring the power of music in worship and spiritual connection.',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb192ff757?w=300&h=400&fit=crop&crop=center',
      isFree: true,
      previewContent: 'Music has the power to connect us with God in profound ways. This blog explores how different musical styles and worship practices can enhance our spiritual experience and deepen our connection with the divine...',
      rating: 4.8,
      views: 1800,
      publishDate: '2024-01-12',
      tags: ['worship', 'music', 'praise', 'spiritual connection'],
      content: 'Discover how music can deepen your worship experience and connect you with God...'
    }
  ];

  const [libraryItems, setLibraryItems] = useState(initialLibraryItems);

  // Load library items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('fogLibraryItems');
    if (savedItems) {
      try {
        setLibraryItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error loading library items from localStorage:', error);
      }
    }
  }, []);

  // Save library items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fogLibraryItems', JSON.stringify(libraryItems));
  }, [libraryItems]);

  // Add new item
  const addItem = (newItem) => {
    setLibraryItems(prevItems => [newItem, ...prevItems]);
  };

  // Update existing item
  const updateItem = (itemId, updatedData) => {
    setLibraryItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, ...updatedData }
          : item
      )
    );
  };

  // Delete item
  const deleteItem = (itemId) => {
    setLibraryItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const value = {
    libraryItems,
    addItem,
    updateItem,
    deleteItem
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};
