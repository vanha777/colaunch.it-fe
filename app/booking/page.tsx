"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaUser, FaStar, FaPhone } from "react-icons/fa";
import OpenAI from "openai";
import { RiServiceFill } from "react-icons/ri";

// Add these new types above the BookingPage component
interface WorkingHours {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
  days: number[]; // 0-6 representing Sunday-Saturday
}

interface Worker {
  id: string;
  name: string;
  photoUrl: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  workingHours: WorkingHours[];
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
type BookingStep = 'date' | 'professional_time' | 'service' | 'contact';

// Add this interface for the form state
interface BookingFormState {
  date: Date | null;
  time: string | null;
  worker: string;
  serviceCategory: string;
  subServices: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

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
    { id: 'professional_time', label: 'Professional', icon: <FaUser className="w-5 h-5" /> },
    { id: 'service', label: 'Service', icon: <RiServiceFill className="w-5 h-5" /> },
    { id: 'contact', label: 'Contact', icon: <FaPhone className="w-5 h-5" /> },
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
                className={`flex flex-col items-center ${isActive ? 'text-indigo-600' : 'text-gray-400'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${isActive
                  ? 'bg-indigo-100'
                  : 'bg-gray-100'
                  } ${isClickable && !isActive ? 'hover:bg-gray-200' : ''}`}>
                  {step.icon}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </motion.button>
              {/* {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-indigo-600'
                    : 'bg-gray-200'
                  }`} />
              )} */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Move HeroSection outside of BookingPage
const HeroSection = ({ business }: { business: { name: string; image: string; logo: string; rating: number; reviewCount: number; description: string } }) => (
  <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 bg-black/40 z-10" />
    <div
      className="absolute inset-0 bg-cover bg-center z-0"
      style={{ backgroundImage: `url(${business.image})` }}
    />

    {/* Business Info Container */}
    <div className="relative z-20 h-full flex flex-col items-center justify-center p-4 md:p-8">
      {/* Logo Container */}
      <div className="mb-2 md:mb-4">
        <img
          src={business.logo}
          alt={business.name}
          className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-lg"
        />
      </div>

      {/* Business Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-center text-white"
      >
        {business.name}
      </motion.h1>

      {/* Rating and Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-2 md:mb-4"
      >
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400 text-base md:text-xl">
              {i < Math.floor(business.rating) ? "★" : "☆"}
            </span>
          ))}
        </div>
        <span className="text-white text-sm md:text-base">
          {business.rating} ({business.reviewCount} reviews)
        </span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm md:text-base lg:text-lg text-center max-w-2xl text-white"
      >
        {business.description}
      </motion.p>
    </div>
  </div>
);

const BookingPage = () => {
  useEffect(() => {
    console.log("re-render");
  }, [])
  const business = {
    id: "1",
    name: "The Business",
    image: "/business.jpeg",
    logo: "/businessLogo.png",
    rating: 4.9,
    reviewCount: 250,
    description: "Professional services tailored to your needs"
  };

  // Replace individual states with a single form state
  const [formState, setFormState] = useState<BookingFormState>({
    date: null,
    time: null,
    worker: "",
    serviceCategory: "",
    subServices: [],
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    }
  });

  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      id: "nailcare",
      name: "Nail Care",
      subServices: [
        {
          id: "manicure",
          name: "Classic Manicure",
          price: 35,
          duration: "45 min",
          icon: "💅"
        },
        {
          id: "pedicure",
          name: "Deluxe Pedicure",
          price: 45,
          duration: "60 min",
          icon: "👣"
        },
        {
          id: "gel",
          name: "Gel Manicure",
          price: 55,
          duration: "60 min",
          icon: "✨"
        },
        {
          id: "acrylics",
          name: "Full Set Acrylics",
          price: 75,
          duration: "90 min",
          icon: "💎"
        },
        {
          id: "designs",
          name: "Nail Art & Designs",
          price: 25,
          duration: "30 min",
          icon: "🎨"
        }
      ],
      workers: [
        {
          id: "w1",
          name: "Lisa Chen",
          photoUrl: "/founder2.jpeg",
          specialties: ["Nail Art", "Gel Manicure", "Acrylics"],
          rating: 4.9,
          reviewCount: 342,
          workingHours: [
            {
              start: "09:00",
              end: "17:00",
              days: [1, 2, 3, 4, 5] // Monday to Friday
            },
            {
              start: "10:00",
              end: "16:00",
              days: [6] // Saturday
            }
          ]
        },
        {
          id: "w2",
          name: "Maria Rodriguez",
          photoUrl: "/founder11.jpeg",
          specialties: ["Classic Manicure", "Deluxe Pedicure", "Nail Art"],
          rating: 4.8,
          reviewCount: 289,
          workingHours: [
            {
              start: "12:00",
              end: "20:00",
              days: [2, 3, 4, 5, 6] // Tuesday to Saturday
            }
          ]
        },
        {
          id: "w3",
          name: "Jenny Kim",
          photoUrl: "/founder3.jpeg",
          specialties: ["Acrylics", "Gel Manicure", "3D Nail Art"],
          rating: 4.9,
          reviewCount: 156,
          workingHours: [
            {
              start: "09:00",
              end: "17:00",
              days: [1, 2, 3, 4, 6] // Monday to Thursday + Saturday
            }
          ]
        }
      ]
    }
  ];

  // Add this helper function
  const getSelectedService = () => {
    return services.find(s => s.id === formState.subServices[0]);
  };

  // Update form handlers
  const updateForm = (field: string, value: any) => {
    setFormState(prev => {
      if (field in prev.contactInfo) {
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Update the handle submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);

      setTimeout(() => {
        setFormState({
          date: null,
          time: null,
          worker: "",
          serviceCategory: "",
          subServices: [],
          contactInfo: {
            name: "",
            email: "",
            phone: "",
          }
        });
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
            className={`w-4 h-4 ${star <= rating
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
        <FaCalendarAlt className="mr-2 text-indigo-600" /> Select Date
      </h2>

      {/* Month and Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviousMonth}
          className={`p-2 rounded-lg ${currentMonth.getMonth() === new Date().getMonth()
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
            onClick={() => updateForm('date', date)}
            className={`p-4 rounded-lg text-center ${formState.date && date.toDateString() === formState.date.toDateString()
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

  // Add a function to get available time slots based on professional's working hours
  const getAvailableTimeSlots = (worker: Worker, date: Date) => {
    const dayOfWeek = date.getDay();
    const workingHoursForDay = worker.workingHours.find(hours =>
      hours.days.includes(dayOfWeek)
    );

    if (!workingHoursForDay) {
      return []; // Professional doesn't work on this day
    }

    const slots: string[] = [];
    const [startHour] = workingHoursForDay.start.split(':').map(Number);
    const [endHour] = workingHoursForDay.end.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour}:30`);
      }
    }

    return slots;
  };

  // Update the renderProfessionalAndTime function
  const renderProfessionalAndTime = () => {
    const selectedWorker = formState.worker ?
      services[0].workers.find(w => w.id === formState.worker) : null;

    const availableTimeSlots = selectedWorker && formState.date ?
      getAvailableTimeSlots(selectedWorker, formState.date) : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        {/* Professional Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaUser className="mr-2 text-indigo-600" /> Preferred staff
          </h2>

          <div className="relative">
            <div className="carousel carousel-center max-w-full p-4 space-x-4 scrollbar-hide">
              {services[0].workers.map((worker) => (
                <div key={worker.id} className="carousel-item">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      updateForm('time', null);
                      updateForm('worker', worker.id);
                    }}
                    className={`w-[200px] cursor-pointer ${formState.worker === worker.id
                        ? 'ring-2 ring-indigo-500'
                        : 'hover:shadow-lg'
                      } rounded-lg bg-white shadow-sm transition-all duration-300 p-4`}
                  >
                    {/* Profile Photo Container */}
                    <div className="relative flex justify-center mb-3">
                      <div className="relative w-24 h-24">
                        <img
                          src={worker.photoUrl}
                          alt={worker.name}
                          className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md"
                        />
                        {formState.worker === worker.id && (
                          <div className="absolute -top-1 -right-1">
                            <div className="bg-indigo-500 text-white p-1 rounded-full">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">
                        {worker.name}
                      </h3>

                      <div className="flex justify-center mb-2">
                        <div className="flex items-center gap-1">
                          <StarRating rating={worker.rating} />
                          <span className="text-xs text-gray-600">
                            ({worker.reviewCount})
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-1">
                        {worker.specialties.map((specialty, index) => (
                          <div
                            key={index}
                            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full"
                          >
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Selection */}
        {selectedWorker && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-indigo-600" /> Available Time Slots
            </h2>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableTimeSlots.map((time, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateForm('time', time)}
                    className={`p-3 rounded-lg text-center ${time === formState.time
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No available time slots for this date. Please select another date.
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // Update the navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case 'date':
        if (formState.date) setCurrentStep('professional_time');
        break;
      case 'professional_time':
        if (formState.worker && formState.time) setCurrentStep('service');
        break;
      case 'service':
        if (formState.subServices.length > 0) setCurrentStep('contact');
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'professional_time':
        setCurrentStep('date');
        break;
      case 'service':
        setCurrentStep('professional_time');
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
    <div className="flex justify-between">
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
      {currentStep !== 'contact' ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goToNextStep}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto"
        >
          Next
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!formState.date || !formState.time || isSubmitting}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 ${!formState.date || !formState.time || isSubmitting
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
      )}
    </div>
  );

  // Update the renderCurrentStep function
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'date':
        return renderDateSelection();
      case 'professional_time':
        return renderProfessionalAndTime();
      case 'service':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-indigo-600" /> Select Services
            </h2>

            {/* Service Dropdown using Daisy UI */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Category
              </label>
              <div className="dropdown w-full">
                <div
                  tabIndex={0}
                  role="button"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex justify-between items-center bg-white"
                >
                  {formState.serviceCategory ?
                    services.find(s => s.id === formState.serviceCategory)?.name :
                    'Select a service'
                  }
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                  {services.map((service) => (
                    <li key={service.id}>
                      <a
                        onClick={() => {
                          updateForm('serviceCategory', service.id);
                          updateForm('subServices', []); // Clear selected sub-services when changing category
                        }}
                        className={formState.serviceCategory === service.id ? 'bg-indigo-50' : ''}
                      >
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sub-services */}
            {formState.serviceCategory && (
              <div className="grid grid-cols-1 gap-3">
                {services
                  .find(s => s.id === formState.serviceCategory)
                  ?.subServices.map((subService) => (
                    <motion.button
                      key={subService.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFormState(prev => ({
                          ...prev,
                          subServices: prev.subServices.includes(subService.id)
                            ? prev.subServices.filter(id => id !== subService.id)
                            : [...prev.subServices, subService.id]
                        }));
                      }}
                      className={`p-4 rounded-lg border ${formState.subServices.includes(subService.id)
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium block">{subService.name}</span>
                          <span className="text-sm text-gray-500">{subService.duration}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-indigo-600">
                            ${subService.price}
                          </span>
                          {formState.subServices.includes(subService.id) && (
                            <div className="bg-indigo-500 text-white p-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
              </div>
            )}

            {/* Total Price Display */}
            {formState.subServices.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">Total Services: {formState.subServices.length}</h3>
                    <p className="text-sm text-gray-600">
                      {formState.subServices.map(id =>
                        services[0].subServices.find(s => s.id === id)?.name
                      ).join(', ')}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-indigo-600">
                    ${services[0].subServices
                      .filter(s => formState.subServices.includes(s.id))
                      .reduce((total, service) => total + service.price, 0)}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      case 'contact':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
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
                value={formState.contactInfo.name}
                onChange={(e) => updateForm('name', e.target.value)}
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
                value={formState.contactInfo.email}
                onChange={(e) => updateForm('email', e.target.value)}
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
                value={formState.contactInfo.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(123) 456-7890"
              />
            </div>
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
        return true;
      case 'professional_time':
        return !!formState.date;
      case 'service':
        return !!formState.date && !!formState.worker && !!formState.time;
      case 'contact':
        return !!formState.date && !!formState.worker && !!formState.time && formState.subServices.length > 0;
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
    <div className="min-h-screen bg-gray-200">
      {/* Main content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Booking Form Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col p-4 md:p-6">
            {/* Step indicator */}
            <div className="mb-4">
              <StepIndicator
                currentStep={currentStep}
                onStepClick={handleStepClick}
                canNavigateToStep={canNavigateToStep}
              />
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0">
              {renderCurrentStep()}
            </div>

            {/* Navigation/Submit buttons */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <NavigationButtons />
            </div>
          </form>
        </div>

        {/* Hero Section - now below the form */}
        <div className="rounded-2xl overflow-hidden">
          <HeroSection business={business} />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
