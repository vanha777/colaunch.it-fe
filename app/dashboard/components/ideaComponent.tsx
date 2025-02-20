import React from 'react';
import { useRouter } from 'next/navigation';

interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  photo: string;
  upvotes: number;
  downvotes: number;
  location: string;
  industry: string;
  tags: string[];
  // Add more properties as needed
}

interface IdeaComponentProps {
  ideas: Idea[];
}

const IdeaComponent: React.FC<IdeaComponentProps> = ({ ideas }) => {
  const router = useRouter();

  const handleCardClick = (ideaId: string) => {
    router.push(`/idea/${ideaId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
      {ideas.map((idea) => (
        <div 
          key={idea.id} 
          className="card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
          onClick={() => handleCardClick(idea.id)}
        >
          <figure className="relative">
            {idea.tags && idea.tags.length > 0 && (
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white bg-opacity-90 text-blue-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <img src={idea.photo} alt={idea.title} className="w-full h-52 object-cover rounded-t-xl" />
          </figure>
          <div className="card-body p-5">
            <div className="flex justify-between items-start">
              <h2 className="card-title text-gray-800 font-semibold">{idea.title}</h2>
              <div className="flex gap-3 text-sm font-medium">
                <span className="flex items-center text-emerald-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  {idea.upvotes}
                </span>
                <span className="flex items-center text-rose-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 8.707l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 011.414 1.414z" clipRule="evenodd" />
                  </svg>
                  {idea.downvotes}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{idea.industry}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {idea.location}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeaComponent;
