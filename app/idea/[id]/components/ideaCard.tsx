'use client'
import { useState } from 'react';
import Image from 'next/image';

interface IdeaProps {
  title: string;
  description: string;
  date?: string;
  location?: string;
  industry?: string;
  images?: string[];
  upvotes?: number;
  downvotes?: number;
  dealInfo?: {
    createdDate?: string;
    percentage?: number;
    totalDeals?: number;
    active?: boolean;
    comission?: number;
    type?: string;
    description?: string;
  };
}

export default function IdeaCard({ idea }: { idea: IdeaProps }) {
  // const [idea, setIdea] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Add new state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add handler for opening modal
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-48">
      {/* Carousel Section */}
      {idea.images && idea.images.length > 0 && (
        <div className="relative w-full h-[400px] mb-4 grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 relative h-full">
            <img
              src={idea.images[0]}
              alt="Main image"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handleImageClick(0)}
            />
          </div>
          
          {/* Secondary images */}
          <div className="col-span-2 grid grid-cols-2 gap-2 h-full">
            {idea.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-[196px]">
                <img
                  src={image}
                  alt={`Image ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleImageClick(index + 1)}
                />
              </div>
            ))}
          </div>

          {/* Show all photos button */}
          <button 
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg 
                       text-sm font-medium shadow-md hover:scale-105 transition-transform"
            onClick={() => setIsModalOpen(true)}
          >
            Show all photos
          </button>
        </div>
      )}

      {/* Image Modal */}
      {isModalOpen && idea.images && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-auto">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 rounded-full hover:bg-black/75"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main image */}
            <div className="relative aspect-video">
              <img
                src={idea.images[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Navigation buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75"
              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? idea.images!.length - 1 : prev - 1))}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/75"
              onClick={() => setCurrentImageIndex((prev) => (prev === idea.images!.length - 1 ? 0 : prev + 1))}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {idea.images.length}
            </div>
          </div>
        </div>
      )}

      {/* Split Content */}
      <div className="flex gap-4">
        {/* Left Section - Redesigned */}
        <div className="flex-1 p-0 border border-gray-200 rounded-2xl shadow-lg overflow-hidden bg-white">
          {/* Header with Title and Industry */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  {idea.title}
                </h2>
                <div className="flex gap-3 mt-2">
                  {idea.location && (
                    <span className="inline-flex items-center text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                      <span className="mr-1">📍</span> {idea.location}
                    </span>
                  )}
                  {idea.industry && (
                    <span className="inline-flex items-center text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                      <span className="mr-1">🏢</span> {idea.industry}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Voting System */}
              <div className="flex gap-2">
                <button className="flex items-center gap-1 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <span>⬆️</span>
                  <span className="font-medium">{idea.upvotes || 0}</span>
                </button>
                <button className="flex items-center gap-1 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <span>⬇️</span>
                  <span className="font-medium">{idea.downvotes || 0}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6">
            <div className="prose prose-lg">
              <p className="text-gray-700 leading-relaxed">
                {idea.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Redesigned */}
        <div className="w-1/3 flex flex-col p-0 border border-gray-200 rounded-2xl shadow-lg overflow-hidden bg-white">
          {/* Card Header with Metadata */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold text-gray-800">Deal Information</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {idea.dealInfo?.createdDate && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  📅 {idea.dealInfo.createdDate}
                </span>
              )}
              {idea.dealInfo?.active !== undefined && (
                <span className={`px-2 py-1 rounded-full ${
                  idea.dealInfo.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  ⭐ {idea.dealInfo.active ? 'Active' : 'Inactive'}
                </span>
              )}
              {idea.dealInfo?.type && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  📋 {idea.dealInfo.type}
                </span>
              )}
              {idea.dealInfo?.totalDeals && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  🤝 {idea.dealInfo.totalDeals} deals
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="flex-1 p-6 space-y-6">
            {/* Commission - Highlighted */}
            {idea.dealInfo?.comission && (
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {idea.dealInfo.comission}%
                </div>
                <div className="text-sm text-blue-600">Commission Rate</div>
              </div>
            )}

            {/* Description - Prominent */}
            {idea.dealInfo?.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Deal Details
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {idea.dealInfo.description}
                </p>
              </div>
            )}
          </div>

          {/* Card Action */}
          <div className="p-6 bg-gray-50">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-blue-200 hover:shadow-lg active:transform active:scale-98">
              Make Deal
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              By making a deal, you agree to our terms and conditions. Commission rates are subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}