"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import OpenAI from "openai";

// Add these new types above the BookingPage component
interface Worker {
  id: string;
  name: string;
  photoUrl: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

interface SubService {
  id: string;
  name: string;
  price: number;
  duration: string;
  icon: string;
}

interface Service {
  id: string;
  name: string;
  subServices: SubService[];
  workers: Worker[];
}

// Add this new type for steps
type BookingStep = 'date' | 'professional' | 'time' | 'service' | 'contact';

// Add these new components at the top of your file
const StepIndicator = ({ 
  currentStep, 
  onStepClick,
  canNavigateToStep
}: { 
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
  canNavigateToStep: (step: BookingStep) => boolean;
}) => {
  const steps: { id: BookingStep; label: string; icon: JSX.Element }[] = [
    { id: 'date', label: 'Date', icon: <FaCalendarAlt className="w-5 h-5" /> },
    { id: 'professional', label: 'Professional', icon: <FaUser className="w-5 h-5" /> },
    { id: 'time', label: 'Time', icon: <FaClock className="w-5 h-5" /> },
    { id: 'service', label: 'Service', icon: <span className="text-xl">🤝</span> },
    { id: 'contact', label: 'Contact', icon: <FaUser className="w-5 h-5" /> },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isClickable = canNavigateToStep(step.id);
          const isActive = steps.findIndex(s => s.id === currentStep) >= index;
          
          return (
            <div key={step.id} className="flex items-center">
              <motion.button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                className={`flex flex-col items-center ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-100'
                    : 'bg-gray-100'
                } ${isClickable && !isActive ? 'hover:bg-gray-200' : ''}`}>
                  {step.icon}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </motion.button>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${
                  steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-indigo-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedSubService, setSelectedSubService] = useState<string>("");
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');

  // Updated generateDates function
  const generateDates = (baseDate: Date) => {
    const dates = [];
    const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    
    // Get dates for the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), i);
      // Only include dates from today onwards
      if (date >= new Date(new Date().setHours(0, 0, 0, 0))) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    // Only allow going back to current month
    if (newDate.getMonth() >= new Date().getMonth()) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    // Limit to 6 months in the future
    if (newDate <= new Date(new Date().setMonth(new Date().getMonth() + 6))) {
      setCurrentMonth(newDate);
    }
  };

  const availableDates = generateDates(currentMonth);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour}:00`);
      if (hour < endHour) {
        slots.push(`${hour}:30`);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Replace the existing services array with this more detailed structure
  const services: Service[] = [
    {
      id: "consultation",
      name: "Consultation",
      subServices: [
        {
          id: "initial",
          name: "Initial Consultation",
          price: 100,
          duration: "1 hour",
          icon: "🤝"
        },
        {
          id: "followup",
          name: "Follow-up Consultation",
          price: 75,
          duration: "45 min",
          icon: "📋"
        }
      ],
      workers: [
        {
          id: "w1",
          name: "John Smith",
          photoUrl: "/founder2.jpeg",
          specialties: ["Initial Consultation", "Strategy Planning"],
          rating: 4.8,
          reviewCount: 127
        },
        {
          id: "w2",
          name: "Sarah Johnson",
          photoUrl: "/founder11.jpeg",
          specialties: ["Follow-up Consultation", "Implementation Review"],
          rating: 4.9,
          reviewCount: 89
        }
      ]
    },
    // Add more services as needed
  ];

  // Add this helper function
  const getSelectedService = () => {
    return services.find(s => s.id === service);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        name,
        email,
        phone,
        service,
        subService: selectedSubService,
        worker: selectedWorker
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTime(null);
        setName("");
        setEmail("");
        setPhone("");
        setService("");
        setSelectedSubService("");
        setSelectedWorker("");
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add this new component for star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Replace the existing date selection section with this updated version
  const renderDateSelection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaCalendarAlt className="mr-2 text-indigo-600" /> Select Your Preferred Date
      </h2>
      
      {/* Month and Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviousMonth}
          className={`p-2 rounded-lg ${
            currentMonth.getMonth() === new Date().getMonth()
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50"
          }`}
          disabled={currentMonth.getMonth() === new Date().getMonth()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <h3 className="text-xl font-semibold text-gray-800">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextMonth}
          className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Add empty cells for days before the first of the month */}
        {[...Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay())].map((_, index) => (
          <div key={`empty-${index}`} className="p-4" />
        ))}

        {/* Date buttons */}
        {availableDates.map((date, index) => (
          <motion.button
            key={index}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDate(date)}
            className={`p-4 rounded-lg text-center ${
              selectedDate && date.toDateString() === selectedDate.toDateString()
                ? "bg-indigo-600 text-white"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <div className="text-sm font-medium">{date.getDate()}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Replace the professional selection section
  const renderProfessionalSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2 text-indigo-600" /> Choose Your Professional
      </h2>
      
      <div className="relative">
        {/* Carousel container */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-6 p-4 min-w-full">
            {services[0].workers.map((worker) => (
              <motion.div
                key={worker.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedWorker(worker.id)}
                className={`flex-none w-72 cursor-pointer ${
                  selectedWorker === worker.id
                    ? 'ring-4 ring-indigo-500'
                    : 'hover:shadow-lg'
                } rounded-xl bg-white shadow-md transition-all duration-300`}
              >
                <div className="relative">
                  {/* Professional Image */}
                  <div className="h-48 rounded-t-xl overflow-hidden">
                    <img
                      src={worker.photoUrl}
                      alt={worker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedWorker === worker.id && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-indigo-500 text-white p-2 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Professional Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {worker.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={worker.rating} />
                    <span className="text-sm text-gray-600">
                      {worker.rating} ({worker.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-2">
                    {worker.specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="inline-block mr-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                      >
                        {specialty}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add these styles to your global CSS */}
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </motion.div>
  );

  // Add navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case 'date':
        if (selectedDate) setCurrentStep('professional');
        break;
      case 'professional':
        if (selectedWorker) setCurrentStep('time');
        break;
      case 'time':
        if (selectedTime) setCurrentStep('service');
        break;
      case 'service':
        if (selectedSubService) setCurrentStep('contact');
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'professional':
        setCurrentStep('date');
        break;
      case 'time':
        setCurrentStep('professional');
        break;
      case 'service':
        setCurrentStep('time');
        break;
      case 'contact':
        setCurrentStep('service');
        break;
      default:
        break;
    }
  };

  // Add navigation buttons component
  const NavigationButtons = () => (
    <div className="flex justify-between mt-6">
      {currentStep !== 'date' && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goToPreviousStep}
          className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
        >
          Previous
        </motion.button>
      )}
      {currentStep !== 'contact' && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goToNextStep}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto"
        >
          Next
        </motion.button>
      )}
    </div>
  );

  // Modify the form render logic
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'date':
        return (
          <>
            {renderDateSelection()}
            <NavigationButtons />
          </>
        );
      case 'professional':
        return (
          <>
            {renderProfessionalSelection()}
            <NavigationButtons />
          </>
        );
      case 'time':
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaClock className="mr-2 text-indigo-600" /> Choose Available Time
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {timeSlots.map((time, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg text-center ${
                      time === selectedTime
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            </motion.div>
            <NavigationButtons />
          </>
        );
      case 'service':
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Select Service Type
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {services[0].subServices.map((subService) => (
                  <motion.button
                    key={subService.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubService(subService.id)}
                    className={`p-4 rounded-lg border ${
                      selectedSubService === subService.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{subService.icon}</span>
                        <div>
                          <span className="font-medium block">{subService.name}</span>
                          <span className="text-sm text-gray-500">{subService.duration}</span>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-indigo-600">
                        ${subService.price}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
            <NavigationButtons />
          </>
        );
      case 'contact':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUser className="mr-2 text-indigo-600" /> Your Information
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="john@example.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(123) 456-7890"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                !selectedDate || !selectedTime || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Booking Confirmed!
                </span>
              ) : (
                "Confirm Booking"
              )}
            </motion.button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Add this function to check if we can navigate to a step
  const canNavigateToStep = (step: BookingStep): boolean => {
    switch (step) {
      case 'date':
        return true; // Can always go back to date selection
      case 'professional':
        return !!selectedDate;
      case 'time':
        return !!selectedDate && !!selectedWorker;
      case 'service':
        return !!selectedDate && !!selectedWorker && !!selectedTime;
      case 'contact':
        return !!selectedDate && !!selectedWorker && !!selectedTime && !!selectedSubService;
      default:
        return false;
    }
  };

  // Add this function to handle step navigation
  const handleStepClick = (step: BookingStep) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Business Image */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: "url('/images/business-header.jpg')" // Add your business image
          }} 
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 text-center"
          >
            Book Your Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-center max-w-2xl"
          >
            Professional services tailored to your needs
          </motion.p>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <StepIndicator 
              currentStep={currentStep} 
              onStepClick={handleStepClick}
              canNavigateToStep={canNavigateToStep}
            />
            {renderCurrentStep()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
