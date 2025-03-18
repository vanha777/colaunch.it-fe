'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LocationProps } from '@/app/idea/[id]/components/ideaCard';
import { IoSearch, IoLocationOutline, IoMic } from "react-icons/io5";
import ChatInstruction from './chatInstruction';
import { Db } from '@/app/utils/db';
// Add chart library imports
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from 'recharts';

export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  media: string[] | [];
  upvotes: number;
  downvotes: number;
  address_id: string;
  address_detail: LocationProps;
  industry: string;
  create_at: string;
  verified?: string;
  tags: string[];
  // Add more properties as needed
}

interface IdeaComponentProps {
  industries: {
    id: string;
    label: string;
    icon: React.ElementType;
    selectedIcon: React.ElementType;
  }[];
}

const BusinessComponent: React.FC<IdeaComponentProps> = ({ industries }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Add new state for business metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 156000,
    monthlyGrowth: 12.5,
    activeCustomers: 1250,
    averageOrderValue: 125
  });

  // Simplified mock data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 19000 },
  ];

  const customerSegments = [
    { name: 'New', value: 30 },
    { name: 'Returning', value: 45 },
    { name: 'Loyal', value: 25 },
  ];

  useEffect(() => {
    try {
      setIsLoading(true);
      const fetchIdeas = async () => {
        const { data: ideasData, error: ideasError } = await Db
          .from('ideas')
          .select(`
                  *,
                  address_detail!inner (*)
                `).order('upvotes', { ascending: false }); // Sorting by upvotes descending
        console.log("ideasData", ideasData);
        const ideas = ideasData as Idea[];
        setIdeas(ideas);
      }
      fetchIdeas();
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }

    // fetch token data for selected game
  }, []);

  // Get unique locations from ideas
  const uniqueLocations = ["All Locations", ...new Set(ideas.map(idea =>
    `${idea.address_detail.state}, ${idea.address_detail.country}`
  ))].sort();

  const toggleIndustry = (industryId: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industryId)
        ? prev.filter(i => i !== industryId)
        : [...prev, industryId]
    );
  };

  const handleCardClick = (ideaId: string) => {
    router.push(`/idea/${ideaId}`);
  };

  // Updated search method to handle structured search parameters
  const handleSearchFromChat = async (searchParam: { type: string, value: string, embedding?: number[] }) => {
    const embedding = searchParam.embedding;
    if (!embedding) {
      console.error("No embedding provided");
      return;
    }
    console.log("Embedding:", embedding);
    console.log('Embedding Length:', embedding.length); // Should be 1536
    // Perform vector search if embedding exists
    const { data, error } = await Db.rpc('vector_search_ideas', {
      query_embedding: embedding,
      similarity_threshold: 0.32,
      match_count: 10
    });
    console.log("Vector Search Data:", data);
    const ideas = data as Idea[];
    if (ideas && ideas.length > 0) {
      setIdeas(ideas);
      setShowSearchBar(false);
    } else {
      setShowSearchBar(true);
    }
    if (error) {
      console.error("Vector Search Error:", error);
    }

    // if (!searchParam || !searchParam.type || !searchParam.value) {
    //   setShowSearchBar(true);
    //   return;
    // }

    // setShowSearchBar(false);

    // switch (searchParam.type.toLowerCase()) {
    //   case "name":
    //     setSearchQuery(searchParam.value);
    //     setSearchQuery("");
    //     setSelectedIndustries([]);
    //     break;

    //   case "location":
    //     // Find closest location match
    //     const locationValue = searchParam.value.toLowerCase();
    //     const matchedLocation = uniqueLocations.find(loc => 
    //       loc.toLowerCase() === locationValue || loc.toLowerCase().includes(locationValue)
    //     );

    //     if (matchedLocation) {
    //       setSelectedLocation(matchedLocation);
    //       setSearchQuery("");
    //       setSelectedIndustries([]);
    //     }
    //     break;

    //   case "category":
    //     // Find closest industry/category match
    //     const categoryValue = searchParam.value.toLowerCase();
    //     const matchedIndustry = industries.find(ind => 
    //       ind.label.toLowerCase() === categoryValue || 
    //       ind.label.toLowerCase().includes(categoryValue)
    //     );

    //     if (matchedIndustry) {
    //       // Set new selection instead of adding to existing selection
    //       setSelectedLocation("All Locations");
    //       setSearchQuery("");
    //       setSelectedIndustries([matchedIndustry.id]);
    //     }
    //     break;

    //   default:
    //     // Default to searching by name if type is not recognized
    //     setSearchQuery(searchParam.value);
    // }
  };

  // Update the filteredIdeas logic to support partial location matching
  const filteredIdeas = ideas.filter(idea => {
    const ideaLocation = `${idea.address_detail.state}, ${idea.address_detail.country}`;

    // Search by title
    const matchesSearch = searchQuery === "" ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Location matching - will match state or country independently
    const matchesLocation = selectedLocation === "All Locations" ||
      ideaLocation === selectedLocation ||
      (selectedLocation !== "All Locations" && (
        idea.address_detail?.state?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        idea.address_detail?.country?.toLowerCase().includes(selectedLocation.toLowerCase())
      ));

    // Industry matching
    const matchesIndustry = selectedIndustries.length === 0 ||
      selectedIndustries.includes(idea.industry);

    return matchesSearch && matchesLocation && matchesIndustry;
  });

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      <ChatInstruction onSearch={handleSearchFromChat} />
      
      {/* Friendly Welcome Header */}
      <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h1 className="text-3xl font-bold text-gray-800">👋 Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's how your business is doing today</p>
      </div>

      {/* Simplified Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <div className="bg-blue-50 rounded-2xl p-6 transition-transform hover:scale-105">
          <h3 className="text-blue-600 font-medium">💰 Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-green-600 text-sm mt-1">+{metrics.monthlyGrowth}% this month</p>
        </div>
        
        <div className="bg-purple-50 rounded-2xl p-6 transition-transform hover:scale-105">
          <h3 className="text-purple-600 font-medium">👥 Customers</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {metrics.activeCustomers}
          </p>
          <p className="text-green-600 text-sm mt-1">+5.2% this month</p>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 transition-transform hover:scale-105">
          <h3 className="text-green-600 font-medium">🛍️ Avg. Order</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ${metrics.averageOrderValue}
          </p>
          <p className="text-red-600 text-sm mt-1">-2.1% this month</p>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 transition-transform hover:scale-105">
          <h3 className="text-yellow-600 font-medium">⭐ Satisfaction</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">4.8/5.0</p>
          <p className="text-green-600 text-sm mt-1">+0.3 this month</p>
        </div>
      </div>

      {/* Simplified Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-gray-800 font-medium mb-4">📈 Revenue Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-gray-800 font-medium mb-4">🎯 Customer Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSegments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#4F46E5"
                  label
                >
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Simplified Recent Activity */}
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-gray-800 font-medium mb-4">🔔 Recent Updates</h3>
          <div className="space-y-4">
            {filteredIdeas.slice(0, 3).map((idea) => (
              <div 
                key={idea.id} 
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={idea.media[0]} 
                    alt={idea.title}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-gray-800 font-medium">{idea.title}</h4>
                    <p className="text-gray-500 text-sm">{idea.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-medium">
                    +${Math.floor(Math.random() * 1000)}
                  </p>
                  <p className="text-gray-400 text-sm">Just now</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessComponent;
