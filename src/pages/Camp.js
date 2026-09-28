import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowRight,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

 const Camp = () => {
   const [currentSlide, setCurrentSlide] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);
   const [likedPhotos, setLikedPhotos] = useState(new Set());
   const [showComments, setShowComments] = useState({});
   const [showFullImage, setShowFullImage] = useState(false);
   const [photoColors, setPhotoColors] = useState({});
   const [selectedYear, setSelectedYear] = useState('2024');
   const [showNotificationForm, setShowNotificationForm] = useState(false);
   const [notificationEmail, setNotificationEmail] = useState('');
   const [notificationName, setNotificationName] = useState('');
   const [notificationPhone, setNotificationPhone] = useState('');
   const [notificationPreferences, setNotificationPreferences] = useState({
     email: true,
     sms: false,
     whatsapp: false
   });

  // Camp data organized by year
  const campData = {
         '2024': {
       photos: [
         {
           id: 1,
           src: "/images/camp/2024/IMG-20250819-WA0002.jpg",
           alt: "Youth camp moment 1",
           caption: "Amazing worship time under the stars",
           date: "2024-12-15",
           location: "Masvingo",
           likes: 24,
           comments: [
             { id: 1, author: "Sarah M.", content: "This was such a powerful moment! 🙏", date: "2024-12-16" },
             { id: 2, author: "David K.", content: "Never felt closer to God than during this worship", date: "2024-12-16" }
           ]
         },
         {
           id: 2,
           src: "/images/camp/2024/IMG-20250819-WA0004.jpg",
           alt: "Youth camp moment 2",
           caption: "Building strong bonds through teamwork",
           date: "2024-12-14",
           location: "Masvingo",
           likes: 31,
           comments: [
             { id: 3, author: "Mike L.", content: "Best team building exercise ever!", date: "2024-12-15" }
           ]
         },
         {
           id: 3,
           src: "/images/camp/2024/IMG-20250819-WA0005.jpg",
           alt: "Youth camp moment 3",
           caption: "Late night stories and testimonies around the fire",
           date: "2024-12-13",
           location: "Masvingo",
           likes: 28,
           comments: [
             { id: 4, author: "Lisa P.", content: "The testimonies were so inspiring!", date: "2024-12-14" }
           ]
         },
         {
           id: 4,
           src: "/images/camp/2024/IMG-20250819-WA0006.jpg",
           alt: "Youth camp moment 4",
           caption: "Studying God's word in His beautiful creation",
           date: "2024-12-12",
           location: "Masvingo",
           likes: 22,
           comments: []
         },
         {
           id: 5,
           src: "/images/camp/2024/IMG-20250819-WA0007.jpg",
           alt: "Youth camp moment 5",
           caption: "Pushing our limits and trusting God",
           date: "2024-12-11",
           location: "Masvingo",
           likes: 35,
           comments: [
             { id: 5, author: "John D.", content: "This challenge taught me so much about faith!", date: "2024-12-12" }
           ]
         },
         {
           id: 6,
           src: "/images/camp/2024/IMG-20250819-WA0008.jpg",
           alt: "Youth camp moment 6",
           caption: "Creating unforgettable memories together",
           date: "2024-12-10",
           location: "Masvingo",
           likes: 42,
           comments: [
             { id: 6, author: "Emma R.", content: "This camp changed my life forever!", date: "2024-12-11" }
           ]
         },
         {
           id: 7,
           src: "/images/camp/2024/IMG-20250819-WA0009.jpg",
           alt: "Youth camp moment 7",
           caption: "Friendship and fellowship in action",
           date: "2024-12-09",
           location: "Masvingo",
           likes: 38,
           comments: [
             { id: 7, author: "James T.", content: "The friendships we made here are priceless", date: "2024-12-10" }
           ]
         },
         {
           id: 8,
           src: "/images/camp/2024/IMG-20250819-WA0010.jpg",
           alt: "Youth camp moment 8",
           caption: "Spiritual growth and transformation",
           date: "2024-12-08",
           location: "Masvingo",
           likes: 45,
           comments: [
             { id: 8, author: "Maria S.", content: "God moved in powerful ways during this camp", date: "2024-12-09" }
           ]
         },
         {
           id: 9,
           src: "/images/camp/2024/IMG-20250819-WA0011.jpg",
           alt: "Youth camp moment 9",
           caption: "Celebrating our faith journey",
           date: "2024-12-07",
           location: "Masvingo",
           likes: 51,
           comments: [
             { id: 9, author: "Alex K.", content: "This was the highlight of my year!", date: "2024-12-08" }
           ]
         },
         {
           id: 10,
           src: "/images/camp/2024/IMG-20250819-WA0120.jpg",
           alt: "Youth camp moment 10",
           caption: "Final day blessings and goodbyes",
           date: "2024-12-06",
           location: "Masvingo",
           likes: 67,
           comments: [
             { id: 10, author: "Youth Leader", content: "Proud of each and every one of you!", date: "2024-12-07" }
           ]
         }
       ],
      highlights: [
        {
          id: 1,
          title: "Spiritual Growth",
          description: "Over 50 youth experienced breakthrough in their faith journey",
          icon: Star,
          color: "bg-yellow-500"
        },
        {
          id: 2,
          title: "New Friendships",
          description: "Strong bonds formed that will last a lifetime",
          icon: Users,
          color: "bg-blue-500"
        },
        {
          id: 3,
          title: "Leadership Development",
          description: "Youth discovered and developed their leadership potential",
          icon: Star,
          color: "bg-green-500"
        },
        {
          id: 4,
          title: "Memories Created",
          description: "Unforgettable experiences that will be cherished forever",
          icon: Heart,
          color: "bg-red-500"
        }
      ],
      stats: {
        participants: "50+",
        days: "6",
        activities: "15+",
        memories: "100%"
      },
      hero: {
        title: "Youth Camp 2024",
        subtitle: "An unforgettable journey of faith, friendship, and adventure",
        dates: "December 10-15, 2024",
        location: "Camp Site Alpha",
        participants: "50+ Youth Participants"
      }
    },
         '2023': {
       photos: [
         {
           id: 101,
           src: "/images/camp/2023/IMG-20250819-WA0132.jpg",
           alt: "2023 Youth camp moment 1",
           caption: "Connecting with nature",
           date: "2023-12-12",
           location: "Masvingo",
           likes: 18,
           comments: [
             { id: 101, author: "Grace L.", content: "The prayer time was so powerful!", date: "2023-12-13" }
           ]
         },
         {
           id: 102,
           src: "/images/camp/2023/IMG-20250819-WA0133.jpg",
           alt: "2023 Youth camp moment 2",
           caption: "Team building challenges",
           date: "2023-12-11",
           location: "Masvingo",
           likes: 25,
           comments: [
             { id: 102, author: "Tom W.", content: "We learned so much about working together", date: "2023-12-12" }
           ]
         },
         {
           id: 103,
           src: "/images/camp/2023/IMG-20250819-WA0134.jpg",
           alt: "2023 Youth camp moment 3",
           caption: "Brotherhood ",
           date: "2023-12-10",
           location: "Masvingo",
           likes: 22,
           comments: []
         },
         {
           id: 104,
           src: "/images/camp/2023/IMG-20250819-WA0135.jpg",
           alt: "2023 Youth camp moment 4",
           caption: "Adventure activities",
           date: "2023-12-09",
           location: "Masvingo",
           likes: 30,
           comments: [
             { id: 104, author: "Rachel K.", content: "This was my first time camping!", date: "2023-12-10" }
           ]
         },
         {
           id: 105,
           src: "/images/camp/2023/IMG-20250819-WA0136.jpg",
           alt: "2023 Youth camp moment 5",
           caption: "Friendship circle",
           date: "2023-12-08",
           location: "Masvingo",
           likes: 28,
           comments: []
         },
         {
           id: 106,
           src: "/images/camp/2023/IMG-20250819-WA0137.jpg",
           alt: "2023 Youth camp moment 6",
           caption: "Campfire stories and testimonies",
           date: "2023-12-07",
           location: "Masvingo",
           likes: 32,
           comments: [
             { id: 106, author: "Daniel M.", content: "The stories around the fire were unforgettable!", date: "2023-12-08" }
           ]
         },
         {
           id: 107,
           src: "/images/camp/2023/IMG-20250819-WA0138.jpg",
           alt: "2023 Youth camp moment 7",
           caption: "Morning devotionals in the wilderness",
           date: "2023-12-06",
           location: "Masvingo",
           likes: 26,
           comments: [
             { id: 107, author: "Sophie K.", content: "Watching the sunrise while praying was magical", date: "2023-12-07" }
           ]
         },
         {
           id: 108,
           src: "/images/camp/2023/IMG-20250819-WA0139.jpg",
           alt: "2023 Youth camp moment 8",
           caption: "Outdoor cooking and survival skills",
           date: "2023-12-05",
           location: "Masvingo",
           likes: 29,
           comments: [
             { id: 108, author: "Marcus L.", content: "Learning to cook over an open fire was amazing!", date: "2023-12-06" }
           ]
         },
         {
           id: 109,
           src: "/images/camp/2023/IMG-20250819-WA0140.jpg",
           alt: "2023 Youth camp moment 9",
           caption: "Group games and competitions",
           date: "2023-12-04",
           location: "Masvingo",
           likes: 35,
           comments: [
             { id: 109, author: "Emma R.", content: "The team competitions brought us all closer together", date: "2023-12-05" }
           ]
         },
         {
           id: 110,
           src: "/images/camp/2023/IMG-20250819-WA0141.jpg",
           alt: "2023 Youth camp moment 10",
           caption: "Nature walks and exploration",
           date: "2023-12-03",
           location: "Masvingo",
           likes: 24,
           comments: [
             { id: 110, author: "Jacob T.", content: "Discovering God's creation was incredible", date: "2023-12-04" }
           ]
         },
         {
           id: 111,
           src: "/images/camp/2023/IMG-20250819-WA0142.jpg",
           alt: "2023 Youth camp moment 11",
           caption: "Evening worship under the stars",
           date: "2023-12-02",
           location: "Masvingo",
           likes: 38,
           comments: [
             { id: 111, author: "Isabella P.", content: "Worshipping under the starry sky was heavenly", date: "2023-12-03" }
           ]
         },
         {
           id: 112,
           src: "/images/camp/2023/IMG-20250819-WA0143.jpg",
           alt: "2023 Youth camp moment 12",
           caption: "Final day group photo and memories",
           date: "2023-12-01",
           location: "Masvingo",
           likes: 45,
           comments: [
             { id: 112, author: "Youth Leader", content: "What an amazing group of young people!", date: "2023-12-02" }
           ]
         }
       ],
      highlights: [
        {
          id: 1,
          title: "Faith Foundations",
          description: "35 youth built strong spiritual foundations",
          icon: Star,
          color: "bg-purple-500"
        },
        {
          id: 2,
          title: "Community Building",
          description: "Created lasting friendships and support networks",
          icon: Users,
          color: "bg-indigo-500"
        },
        {
          id: 3,
          title: "Skill Development",
          description: "Youth learned camping and survival skills",
          icon: Star,
          color: "bg-teal-500"
        },
        {
          id: 4,
          title: "Personal Growth",
          description: "Many experienced breakthrough in confidence",
          icon: Heart,
          color: "bg-pink-500"
        }
      ],
      stats: {
        participants: "35",
        days: "5",
        activities: "12+",
        memories: "100%"
      },
      hero: {
        title: "Youth Camp 2023",
        subtitle: "Building foundations for faith and friendship",
        dates: "December 8-12, 2023",
        location: "Camp Site Nyanga Troutbeck",
        participants: "35 Youth Participants"
      }
    }
  };

  // Get current camp data based on selected year
  const currentCamp = campData[selectedYear];
  const campPhotos = currentCamp.photos;
  const campHighlights = currentCamp.highlights;
  const campStats = currentCamp.stats;
  const campHero = currentCamp.hero;



  // Auto-play slideshow
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % campPhotos.length);
      }, 8000); // Increased from 3000ms to 8000ms (8 seconds)
    }
    return () => clearInterval(interval);
  }, [isPlaying, campPhotos.length]);

  // Extract colors when photo changes
  useEffect(() => {
    const currentPhotoSrc = campPhotos[currentSlide].src;
    
    if (!photoColors[currentPhotoSrc]) {
      extractImageColors(currentPhotoSrc).then((colors) => {
        setPhotoColors(prev => ({
          ...prev,
          [currentPhotoSrc]: colors
        }));
      });
    }
  }, [currentSlide, campPhotos, photoColors]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campPhotos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + campPhotos.length) % campPhotos.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentSlide(0); // Reset to first photo when switching years
    setIsPlaying(false); // Stop auto-play when switching years
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = (photoId) => {
    setLikedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
        toast.success('Photo unliked');
      } else {
        newSet.add(photoId);
        toast.success('Photo liked! ❤️');
      }
      return newSet;
    });
  };

     const toggleComments = (photoId) => {
     setShowComments(prev => ({
       ...prev,
       [photoId]: !prev[photoId]
     }));
   };

   const handleNotificationSubmit = (e) => {
     e.preventDefault();
     
     // Validate form
     if (!notificationName.trim() || !notificationEmail.trim()) {
       toast.error('Please fill in your name and email');
       return;
     }
     
     // Simulate API call
     toast.success('Thank you! You\'ll be notified about upcoming camps! 🎉');
     
     // Reset form
     setNotificationName('');
     setNotificationEmail('');
     setNotificationPhone('');
     setNotificationPreferences({
       email: true,
       sms: false,
       whatsapp: false
     });
     setShowNotificationForm(false);
   };

   const toggleNotificationForm = () => {
     setShowNotificationForm(!showNotificationForm);
   };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extract dominant colors from image
  const extractImageColors = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Sample colors from different areas of the image
          const colors = [];
          const step = Math.max(1, Math.floor(data.length / 4 / 1000)); // Sample every 1000th pixel
          
          for (let i = 0; i < data.length; i += step * 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Skip very dark or very light colors
            if (r + g + b > 50 && r + g + b < 700) {
              colors.push({ r, g, b });
            }
          }
          
          // Find dominant colors
          const dominantColors = findDominantColors(colors);
          resolve(dominantColors);
        } catch (error) {
          // Fallback to default colors if extraction fails
          resolve({
            primary: { r: 102, g: 126, b: 234 },
            secondary: { r: 118, g: 75, b: 162 }
          });
        }
      };
      img.onerror = () => {
        resolve({
          primary: { r: 102, g: 126, b: 234 },
          secondary: { r: 118, g: 75, b: 162 }
        });
      };
      img.src = imageSrc;
    });
  };

  // Find dominant colors using k-means clustering
  const findDominantColors = (colors) => {
    if (colors.length === 0) {
      return {
        primary: { r: 102, g: 126, b: 234 },
        secondary: { r: 118, g: 75, b: 162 }
      };
    }
    
    // Simple color clustering
    const clusters = [];
    const visited = new Set();
    
    for (let i = 0; i < colors.length; i++) {
      if (visited.has(i)) continue;
      
      const cluster = [colors[i]];
      visited.add(i);
      
      for (let j = i + 1; j < colors.length; j++) {
        if (visited.has(j)) continue;
        
        const distance = Math.sqrt(
          Math.pow(colors[i].r - colors[j].r, 2) +
          Math.pow(colors[i].g - colors[j].g, 2) +
          Math.pow(colors[i].b - colors[j].b, 2)
        );
        
        if (distance < 50) { // Color similarity threshold
          cluster.push(colors[j]);
          visited.add(j);
        }
      }
      
      if (cluster.length > 5) { // Minimum cluster size
        clusters.push(cluster);
      }
    }
    
    // Sort clusters by size and get the two largest
    clusters.sort((a, b) => b.length - a.length);
    
    const primary = clusters[0] ? averageColor(clusters[0]) : { r: 102, g: 126, b: 234 };
    const secondary = clusters[1] ? averageColor(clusters[1]) : { r: 118, g: 75, b: 162 };
    
    return { primary, secondary };
  };

  // Calculate average color from a cluster
  const averageColor = (colorCluster) => {
    const total = colorCluster.reduce((acc, color) => {
      acc.r += color.r;
      acc.g += color.g;
      acc.b += color.b;
      return acc;
    }, { r: 0, g: 0, b: 0 });
    
    return {
      r: Math.round(total.r / colorCluster.length),
      g: Math.round(total.g / colorCluster.length),
      b: Math.round(total.b / colorCluster.length)
    };
  };

  // Get background style for current photo
  const getBackgroundStyle = () => {
    const colors = photoColors[campPhotos[currentSlide].src];
    if (!colors) return {};
    
    return {
      background: `linear-gradient(135deg, 
        rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, 0.1) 0%, 
        rgba(${colors.secondary.r}, ${colors.secondary.g}, ${colors.secondary.b}, 0.05) 100%)`
    };
  };

     return (
     <div className="space-y-6">
             {/* Year Selection Tabs */}
       <div className="flex justify-center mb-6">
         <div className="bg-white rounded-xl p-1 shadow-lg">
           {Object.keys(campData).map((year) => (
             <button
               key={year}
               onClick={() => handleYearChange(year)}
               className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                 selectedYear === year
                   ? 'bg-primary-500 text-white shadow-md'
                   : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
               }`}
             >
               {year} Camp
             </button>
           ))}
         </div>
       </div>

                {/* Hero Section */}
         <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl overflow-hidden">
           <div className="absolute inset-0 bg-black bg-opacity-40"></div>
           <div className="relative p-6 md:p-8 text-white">
           <div className="max-w-4xl">
             <h1 className="text-3xl md:text-5xl font-bold mb-3">
               {campHero.title}
             </h1>
             <p className="text-lg md:text-xl mb-4 opacity-90">
               {campHero.subtitle}
             </p>
             <div className="flex flex-wrap gap-4 text-sm md:text-base">
               <div className="flex items-center space-x-2">
                 <Calendar size={20} />
                 <span>{campHero.dates}</span>
               </div>
               <div className="flex items-center space-x-2">
                 <MapPin size={20} />
                 <span>{campHero.location}</span>
               </div>
               <div className="flex items-center space-x-2">
                 <Users size={20} />
                 <span>{campHero.participants}</span>
               </div>
             </div>
           </div>
         </div>
       </div>

             {/* Photo Slideshow Section */}
       <div className="card">
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Camp Memories</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-sm text-gray-600">
              {currentSlide + 1} / {campPhotos.length}
            </span>
          </div>
        </div>

                 {/* Main Slideshow */}
         <div className="relative mb-4">
                      <div className="relative h-80 md:h-[400px] rounded-xl overflow-hidden">
             <img
               src={campPhotos[currentSlide].src}
               alt={campPhotos[currentSlide].alt}
               className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
               onClick={() => setShowFullImage(true)}
             />
            
            {/* Overlay with caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-xl font-semibold mb-2">
                {campPhotos[currentSlide].caption}
              </h3>
              <div className="flex items-center space-x-4 text-white/80 text-sm">
                <span>{formatDate(campPhotos[currentSlide].date)}</span>
                <span>•</span>
                <span>{campPhotos[currentSlide].location}</span>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => handleLike(campPhotos[currentSlide].id)}
              className={`p-2 rounded-full transition-colors ${
                likedPhotos.has(campPhotos[currentSlide].id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-700'
              }`}
            >
              <Heart size={20} />
            </button>
            <button
              onClick={() => toggleComments(campPhotos[currentSlide].id)}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors"
            >
              <MessageCircle size={20} />
            </button>
            <button className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

                 {/* Thumbnail navigation */}
         <div className="flex space-x-2 overflow-x-auto pb-2">
           {campPhotos.map((photo, index) => (
             <button
               key={photo.id}
               onClick={() => goToSlide(index)}
               className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentSlide
                  ? 'border-primary-500 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Comments section */}
        {showComments[campPhotos[currentSlide].id] && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
            <div className="space-y-3">
              {campPhotos[currentSlide].comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.date}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
              {campPhotos[currentSlide].comments.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

             {/* Camp Highlights */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {campHighlights.map((highlight) => (
          <div key={highlight.id} className="card text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${highlight.color} flex items-center justify-center`}>
              <highlight.icon size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {highlight.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>

             {/* Camp Statistics */}
       <div className="card">
         <h2 className="text-2xl font-bold text-gray-900 mb-6">Camp Impact</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="text-center">
             <div className="text-3xl font-bold text-primary-600 mb-2">{campStats.participants}</div>
             <div className="text-gray-600">Youth Participants</div>
           </div>
           <div className="text-center">
             <div className="text-3xl font-bold text-green-600 mb-2">{campStats.days}</div>
             <div className="text-gray-600">Days of Camp</div>
           </div>
           <div className="text-center">
             <div className="text-3xl font-bold text-blue-600 mb-2">{campStats.activities}</div>
             <div className="text-gray-600">Activities</div>
           </div>
           <div className="text-center">
             <div className="text-3xl font-bold text-purple-600 mb-2">{campStats.memories}</div>
             <div className="text-gray-600">Memories Made</div>
           </div>
         </div>
       </div>

             {/* Call to Action */}
       <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center">
         <h2 className="text-2xl font-bold mb-4">Ready for Next Year's Camp?</h2>
         <p className="text-primary-100 mb-6">
           Join us for another amazing adventure of faith, friendship and fun!
         </p>
         <button 
           onClick={toggleNotificationForm}
           className="btn-secondary bg-white text-primary-600 hover:bg-gray-100"
         >
           Get Notified
           <ArrowRight size={20} className="ml-2" />
         </button>
       </div>

       {/* Notification Form Modal */}
       {showNotificationForm && (
         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-bold text-gray-900">Get Camp Notifications</h3>
               <button
                 onClick={toggleNotificationForm}
                 className="p-2 rounded-full hover:bg-gray-100 transition-colors"
               >
                 <X size={24} className="text-gray-500" />
               </button>
             </div>
             
             <form onSubmit={handleNotificationSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Full Name *
                 </label>
                 <input
                   type="text"
                   value={notificationName}
                   onChange={(e) => setNotificationName(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter your full name"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Email Address *
                 </label>
                 <input
                   type="email"
                   value={notificationEmail}
                   onChange={(e) => setNotificationEmail(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter your email address"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Phone Number (Optional)
                 </label>
                 <input
                   type="tel"
                   value={notificationPhone}
                   onChange={(e) => setNotificationPhone(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter your phone number"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-3">
                   Notification Preferences
                 </label>
                 <div className="space-y-3">
                   <label className="flex items-center">
                     <input
                       type="checkbox"
                       checked={notificationPreferences.email}
                       onChange={(e) => setNotificationPreferences(prev => ({
                         ...prev,
                         email: e.target.checked
                       }))}
                       className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                     />
                     <span className="ml-3 text-gray-700">Email notifications</span>
                   </label>
                   
                   <label className="flex items-center">
                     <input
                       type="checkbox"
                       checked={notificationPreferences.sms}
                       onChange={(e) => setNotificationPreferences(prev => ({
                         ...prev,
                         sms: e.target.checked
                       }))}
                       className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                     />
                     <span className="ml-3 text-gray-700">SMS notifications</span>
                   </label>
                   
                   <label className="flex items-center">
                     <input
                       type="checkbox"
                       checked={notificationPreferences.whatsapp}
                       onChange={(e) => setNotificationPreferences(prev => ({
                         ...prev,
                         whatsapp: e.target.checked
                       }))}
                       className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                     />
                     <span className="ml-3 text-gray-700">WhatsApp notifications</span>
                   </label>
                 </div>
               </div>
               
               <div className="pt-4">
                 <button
                   type="submit"
                   className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                 >
                   Subscribe to Notifications
                 </button>
               </div>
               
               <p className="text-xs text-gray-500 text-center">
                 We'll only send you updates about upcoming camps and youth events.
               </p>
             </form>
           </div>
         </div>
       )}

              {/* Full Image Modal */}
       {showFullImage && (
         <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
           <div className="relative max-w-full max-h-full w-full h-full">
             {/* Close button */}
             <button
               onClick={() => setShowFullImage(false)}
               className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-black bg-opacity-70 text-white transition-colors"
             >
               <X size={24} />
             </button>
             
             {/* Full size image - shows everything that wasn't in the frame */}
             <img
               src={campPhotos[currentSlide].src}
               alt={campPhotos[currentSlide].alt}
               className="w-full h-full object-contain rounded-lg"
             />
             
             {/* Image info overlay */}
             <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
               <h3 className="text-lg font-semibold mb-2">
                 {campPhotos[currentSlide].caption}
               </h3>
               <div className="flex items-center space-x-4 text-sm opacity-90">
                 <span>{formatDate(campPhotos[currentSlide].date)}</span>
                 <span>•</span>
                 <span>{campPhotos[currentSlide].location}</span>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default Camp;
