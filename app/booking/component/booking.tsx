"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaUser, FaStar, FaPhone } from "react-icons/fa";
import OpenAI from "openai";
import { RiServiceFill } from "react-icons/ri";
import { Auth } from "@/app/auth";

// Add these timezone conversion helpers at the top of the file
const convertUTCToMelbourne = (utcDate: Date | string): Date => {
    return new Date(new Date(utcDate).toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }));
};

const convertMelbourneToUTC = (melbourneDate: Date): Date => {
    const utcDate = new Date(melbourneDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offset = melbourneDate.getTime() - utcDate.getTime();
    return new Date(melbourneDate.getTime() - offset);
};

// Add these new types above the BookingPage component
interface CompanyTimetable {
    id: string;
    company_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

// Update the Worker interface to include workingHours
interface WorkingHours {
    start: string;
    end: string;
    days: number[];
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

interface Service {
    id: string;
    name: string;
    description: string;
    duration: string;
    price: number;
}

interface Catalogue {
    id: string;
    name: string;
    services: Service[];
}

interface Specialty {
    id: string;
    text: string;
    created_at: string;
}

interface Staff {
    id: string;
    personal_information: {
        first_name: string;
        last_name: string;
    };
    profile_image: {
        id: string;
        type: string;
        path: string;
    };
    specialties: Specialty[];
}

interface CompanyData {
    company: {
        id: string;
        name: string;
        description: string;
        identifier: string;
        logo: {
            id: string;
            type: string;
            path: string;
        };
        currency: {
            id: string;
            code: string;
            symbol: string;
        };
        timetable: CompanyTimetable[];
        services_by_catalogue: {
            catalogue: {
                id: string;
                name: string;
            };
            services: Service[];
        }[];
    };
    staff: Staff[];
}

interface BookedSlot {
    booked_start: string;
    booked_end: string;
}

// Update this new type for steps with the new order
type BookingStep = 'service' | 'professional' | 'date_time' | 'contact';

// Add this interface for the form state
interface BookingFormState {
    date: Date | null;
    time: string | null;
    worker: string;
    serviceCategory: string;
    subServices: Service[];
    contactInfo: {
        name: string;
        email: string;
        phone: string;
    };
}

// Update the StepIndicator component to fix the z-index issue
const StepIndicator = ({
    currentStep,
    onStepClick,
    canNavigateToStep
}: {
    currentStep: BookingStep;
    onStepClick: (step: BookingStep) => void;
    canNavigateToStep: (step: BookingStep) => boolean;
}) => {
    const steps: { id: BookingStep }[] = [
        { id: 'service' },
        { id: 'professional' },
        { id: 'date_time' },
        { id: 'contact' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="mb-8">
            <div className="relative flex items-center justify-between">
                {/* Connection lines between circles - set to lower z-index */}
                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-0">
                    <div className="h-1 w-full bg-gray-200">
                        <div
                            className="h-full bg-indigo-600"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step circles - higher z-index and with background to cover the line */}
                {steps.map((step, index) => {
                    const isClickable = canNavigateToStep(step.id);
                    const isComplete = index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10" // Ensure this container has a higher z-index
                        >
                            <motion.button
                                type="button"
                                onClick={() => isClickable && onStepClick(step.id)}
                                whileHover={isClickable ? { scale: 1.05 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${isComplete
                                        ? 'bg-indigo-600 text-white'
                                        : isActive
                                            ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                                            : 'bg-gray-200 text-gray-500'
                                    } transition-all duration-200
                  ${isClickable && !isActive && !isComplete ? 'hover:bg-gray-300 cursor-pointer' : ''}
                  ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                  shadow-sm`} // Added shadow to emphasize it's above the line
                            >
                                {isComplete ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="font-bold text-base">{index + 1}</span>
                                )}
                            </motion.button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Move HeroSection outside of BookingPage
const HeroSection = ({ business }: { business: { name: string; image: string; logo: string; rating: number; reviewCount: number; description: string } | null }) => (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${business?.image})` }}
        />

        {/* Business Info Container */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-4 md:p-8">
            {/* Logo Container */}
            <div className="mb-2 md:mb-4">
                <img
                    src={business?.logo}
                    alt={business?.name}
                    className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-lg"
                />
            </div>

            {/* Business Name */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-center text-white"
            >
                {business?.name}
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
                            {i < Math.floor(business?.rating || 0) ? "★" : "☆"}
                        </span>
                    ))}
                </div>
                <span className="text-white text-sm md:text-base">
                    {business?.rating} ({business?.reviewCount} reviews)
                </span>
            </motion.div>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base lg:text-lg text-center max-w-2xl text-white"
            >
                {business?.description}
            </motion.p>
        </div>
    </div>
);

const BookingPage = ({ businessId }: { businessId: string }) => {
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

    useEffect(() => {
        const fetchTimeSlots = async (businessUuid: string) => {
            const { data, error } = await Auth.rpc('get_booked_slots', {
                p_company_id: businessUuid,
                p_staff_id: null,
                p_start_time: new Date().toISOString()
            });
            if (error) {
                console.error('Error fetching booked slots:', error);
            } else {
                setBookedSlots(data);
            }
        };

        const fetchBusiness = async () => {
            const { data, error } = await Auth.rpc('get_company_details_by_identifier', {
                p_identifier: businessId
            });
            if (error) {
                console.error('Error fetching business details:', error);
            } else {
                setCompanyData(data);
                fetchTimeSlots(data.company.id);
            }
        };
        fetchBusiness();
    }, [businessId]);

    // Update business object to use real data
    const business = companyData ? {
        id: companyData.company.id,
        name: companyData.company.name,
        image: "/business.jpeg", // You might want to add this to your company data
        logo: companyData.company.logo.path,
        rating: 4.9, // You might want to add this to your company data
        reviewCount: 250, // You might want to add this to your company data
        description: companyData.company.description
    } : null;

    // Update services to use real data
    const services = companyData ? companyData.company.services_by_catalogue.map(cat => ({
        id: cat.catalogue.id,
        name: cat.catalogue.name,
        subServices: cat.services.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            duration: service.duration,
            // icon: "✨" // You might want to add icons to your service data
        })),
        workers: companyData.staff.map(staff => ({
            id: staff.id,
            name: `${staff.personal_information.first_name} ${staff.personal_information.last_name}`,
            photoUrl: staff.profile_image.path,
            specialties: staff.specialties.map(s => s.text),
            rating: 4.9, // You might want to add this to your staff data
            reviewCount: 156, // You might want to add this to your staff data
            workingHours: companyData.company.timetable.map(tt => ({
                start: tt.start_time,
                end: tt.end_time,
                days: [tt.day_of_week]
            }))
        }))
    })) : [];

    // Replace individual states with a single form state
    const [formState, setFormState] = useState<BookingFormState>({
        date: null,
        time: null,
        worker: "no_preference",
        serviceCategory: "",
        subServices: [],
        contactInfo: {
            name: "",
            email: "",
            phone: "",
        }
    });

    // Change the initial step to 'service'
    const [currentStep, setCurrentStep] = useState<BookingStep>('service');
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

    // Add this helper function
    // const getSelectedService = () => {
    //     return services.find(s => s.id === formState.subServices[0]);
    // };

    // Update form handlers
    const updateForm = (field: string, value: any) => {
        setFormState(prev => {
            if (field === 'serviceCategory') {
                return {
                    ...prev,
                    [field]: value,
                    subServices: [],
                    worker: "no_preference"
                };
            }

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
        // create a customer
        const { data: customerId, error: customerError } = await Auth.rpc('create_or_update_customer', {
            p_phone_number: formState.contactInfo.phone,
            p_company_id: companyData?.company.id,
            p_first_name: formState.contactInfo.name.split(' ')[0],
            p_last_name: formState.contactInfo.name.split(' ').slice(1).join(' ') || formState.contactInfo.name,
            p_email: formState.contactInfo.email
        });
        if (customerError) {
            console.error('Error creating customer:', customerError);
            alert('Error creating customer. Please try again.');
            return;
        } else {
            // Convert selected date and time to UTC before submitting
            if (formState.date && formState.time) {
                const [hours, minutes] = formState.time.split(':').map(Number);
                const melbourneDateTime = new Date(formState.date);
                melbourneDateTime.setHours(hours, minutes, 0, 0);

                const utcDateTime = convertMelbourneToUTC(melbourneDateTime);

                // Now you can use utcDateTime when submitting to your backend
                console.log("Booking form data:", {
                    ...formState,
                    dateTimeUTC: utcDateTime.toISOString()
                });

                // Create bookings for all selected services
                let currentStartTime = utcDateTime;
                const bookingIds = [];

                // Loop through all selected services
                for (const service of formState.subServices) {
                    // Calculate service duration in milliseconds
                    const durationParts = service.duration.split(':').map(Number);
                    const durationMs = (durationParts[0] * 60 * 60 * 1000) + (durationParts[1] * 60 * 1000);
                    
                    // Calculate end time by adding duration to start time
                    const endTime = new Date(currentStartTime.getTime() + durationMs);
                    
                    // Create booking for this service
                    const { data: bookingId, error: bookingError } = await Auth
                        .from('booking')
                        .insert({
                            customer_id: customerId,
                            staff_id: formState.worker === "no_preference" ? null : formState.worker,
                            service_id: service.id,
                            company_id: companyData?.company.id,
                            start_time: currentStartTime.toISOString(),
                            end_time: endTime.toISOString(),
                            status_id: 'dfbd8eb3-4eb4-49b5-b230-a9c7d3a14bca' // Pending
                        })
                        .select('id')
                        .single();
                        
                    if (bookingError) {
                        console.error('Error creating booking:', bookingError);
                        alert('Error creating booking. Please try again.');
                        return;
                    } else {
                        console.log("Booking created:", bookingId);
                        bookingIds.push(bookingId);
                    }
                    
                    // Update start time for next service
                    currentStartTime = endTime;
                }
                
                console.log("All bookings created:", bookingIds);
            }
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSuccess(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccess(false);
            }, 1500);
        }, 1000);
    };

    const formatDate = (date: Date) => {
        const melbourneDate = convertUTCToMelbourne(date);
        return melbourneDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'Australia/Melbourne'
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

    // Add this function near the top with other helper functions
    const getDayAvailability = (date: Date) => {
        const melbourneDate = convertUTCToMelbourne(date);
        const dayOfWeek = melbourneDate.getDay();

        // Get all workers
        const allWorkers = services.flatMap(service => service.workers);

        let totalSlots = 0;
        let availableSlots = 0;

        // Get unique workers by ID to avoid duplicates
        const uniqueWorkers = Array.from(new Set(allWorkers.map(w => w.id)))
            .map(id => allWorkers.find(w => w.id === id));

        uniqueWorkers.forEach(worker => {
            if (!worker) return;

            const workingHoursForDay = worker.workingHours.find(hours =>
                hours.days.includes(dayOfWeek)
            );

            if (workingHoursForDay) {
                const [startHour] = workingHoursForDay.start.split(':').map(Number);
                const [endHour] = workingHoursForDay.end.split(':').map(Number);
                const slotsPerWorker = (endHour - startHour) * 2; // 2 slots per hour (30 min intervals)
                totalSlots += slotsPerWorker;

                // Filter booked slots for this date
                const dateBookedSlots = bookedSlots.filter(slot => {
                    const slotDate = convertUTCToMelbourne(slot.booked_start);
                    return slotDate.toDateString() === melbourneDate.toDateString();
                });

                // Count available slots
                for (let hour = startHour; hour < endHour; hour++) {
                    for (let minute of [0, 30]) {
                        const currentSlot = new Date(melbourneDate);
                        currentSlot.setHours(hour, minute);

                        const isBooked = dateBookedSlots.some(slot => {
                            const slotStart = convertUTCToMelbourne(slot.booked_start);
                            const slotEnd = convertUTCToMelbourne(slot.booked_end);
                            return currentSlot >= slotStart && currentSlot < slotEnd;
                        });

                        if (!isBooked) {
                            availableSlots++;
                        }
                    }
                }
            }
        });

        if (totalSlots === 0) return 'none'; // No working hours for this day

        const availabilityPercentage = (availableSlots / totalSlots) * 100;

        if (availabilityPercentage === 0) return 'full';
        if (availabilityPercentage <= 50) return 'busy';
        return 'available';
    };

    // Replace the existing date selection section with this updated version
    const renderDateSelection = () => (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
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
                {availableDates.map((date, index) => {
                    const availability = getDayAvailability(date);
                    const isSelected = formState.date && date.toDateString() === formState.date.toDateString();

                    return (
                        <motion.button
                            key={index}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateForm('date', date)}
                            className={`p-4 rounded-lg text-center flex flex-col items-center ${isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                            {availability !== 'none' && (
                                <div className={`w-2 h-2 rounded-full
                                    ${isSelected ? 'bg-white' : ''} 
                                    ${!isSelected && availability === 'available' ? 'bg-green' : ''}
                                    ${!isSelected && availability === 'busy' ? 'bg-orange-500' : ''}
                                    ${!isSelected && availability === 'full' ? 'bg-red-500' : ''}`}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    // Update getAvailableTimeSlots to consider booked slots
    const getAvailableTimeSlots = (worker: Worker, date: Date) => {
        const melbourneDate = convertUTCToMelbourne(date);
        const dayOfWeek = melbourneDate.getDay();
        const workingHoursForDay = worker.workingHours.find(hours =>
            hours.days.includes(dayOfWeek)
        );

        if (!workingHoursForDay) {
            return []; // Professional doesn't work on this day
        }

        const slots: string[] = [];
        const [startHour] = workingHoursForDay.start.split(':').map(Number);
        const [endHour] = workingHoursForDay.end.split(':').map(Number);

        // Convert booked slots to Melbourne time for comparison
        const dateBookedSlots = bookedSlots.filter(slot => {
            const slotDate = convertUTCToMelbourne(slot.booked_start);
            return slotDate.toDateString() === melbourneDate.toDateString();
        });

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of [0, 30]) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                // Check if this time slot overlaps with any booked slots
                const isBooked = dateBookedSlots.some(slot => {
                    const slotStart = convertUTCToMelbourne(slot.booked_start);
                    const slotEnd = convertUTCToMelbourne(slot.booked_end);
                    const currentSlot = new Date(melbourneDate);
                    currentSlot.setHours(hour, minute);
                    return currentSlot >= slotStart && currentSlot < slotEnd;
                });

                if (!isBooked) {
                    slots.push(timeString);
                }
            }
        }

        return slots;
    };

    // Add a combined function for date and time selection
    const renderDateAndTimeSelection = () => {
        const selectedWorker = formState.worker === "no_preference" ?
            { id: "no_preference", name: "No Preference", workingHours: [] } as unknown as Worker :
            formState.worker ?
                services[0].workers.find(w => w.id === formState.worker) : null;

        if (!selectedWorker) {
            return (
                <div className="text-center text-gray-500 py-4">
                    Please go back and select a staff member first.
                </div>
            );
        }

        // For "No Preference", combine all workers' available slots
        const availableTimeSlots = selectedWorker && formState.date ?
            selectedWorker.id === "no_preference" ?
                // Get time slots from all available workers for this service/date
                Array.from(new Set(
                    getAvailableWorkers().flatMap(worker =>
                        getAvailableTimeSlots(worker, formState.date!)
                    )
                )).sort() :
                getAvailableTimeSlots(selectedWorker, formState.date) :
            [];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                {/* Date Selection */}
                {renderDateSelection()}

                {/* Time Selection */}
                {formState.date && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaClock className="mr-2 text-indigo-600" /> Available Time
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
            case 'service':
                if (formState.serviceCategory && formState.subServices.length > 0) setCurrentStep('professional');
                break;
            case 'professional':
                if (formState.worker) setCurrentStep('date_time');
                break;
            case 'date_time':
                if (formState.date && formState.time) setCurrentStep('contact');
                break;
            default:
                break;
        }
    };

    const goToPreviousStep = () => {
        switch (currentStep) {
            case 'professional':
                setCurrentStep('service');
                break;
            case 'date_time':
                setCurrentStep('professional');
                break;
            case 'contact':
                setCurrentStep('date_time');
                break;
            default:
                break;
        }
    };

    // Add navigation buttons component
    const NavigationButtons = () => (
        <div className="flex justify-between gap-4">
            {currentStep !== 'service' && (
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPreviousStep}
                    className="px-8 py-3 text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 font-medium"
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
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 font-medium ml-auto"
                >
                    Next
                </motion.button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!formState.date || !formState.time || isSubmitting}
                    className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-300 ${!formState.date || !formState.time || isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
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

    // Update this function to remove specialty filtering
    const getAvailableWorkers = () => {
        if (!formState.serviceCategory) return [];

        const selectedService = services.find(s => s.id === formState.serviceCategory);
        if (!selectedService) return [];

        // Return all workers for the selected service category
        return selectedService.workers;
    };

    // Update the canNavigateToStep function for the new flow
    const canNavigateToStep = (step: BookingStep): boolean => {
        switch (step) {
            case 'service':
                return true;
            case 'professional':
                return formState.serviceCategory !== "" && formState.subServices.length > 0;
            case 'date_time':
                return formState.serviceCategory !== "" && formState.subServices.length > 0 && !!formState.worker;
            case 'contact':
                return formState.serviceCategory !== "" && formState.subServices.length > 0 &&
                    !!formState.worker && !!formState.date && !!formState.time;
            default:
                return false;
        }
    };

    // Update the renderCurrentStep function with the new order
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'service':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                            <RiServiceFill className="mr-3 text-indigo-600" /> Select Services
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
                                                    updateForm('worker', ""); // Clear selected worker when changing service
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
                                {(() => {
                                    const selectedService = services.find(s => s.id === formState.serviceCategory);

                                    if (!selectedService) return null;

                                    return selectedService.subServices.map((subService) => (
                                        <motion.button
                                            key={subService.id}
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setFormState(prev => ({
                                                    ...prev,
                                                    subServices: prev.subServices.some(service => service.id === subService.id)
                                                        ? prev.subServices.filter(service => service.id !== subService.id)
                                                        : [...prev.subServices, subService as Service]
                                                }));
                                            }}
                                            className={`p-4 rounded-lg border ${formState.subServices.some(service => service.id === subService.id)
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-gray-200 hover:border-indigo-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-medium text-left">{subService.name}</div>
                                                    <div className="text-sm text-gray-500 text-left mt-1">{subService.duration}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-semibold text-indigo-600">
                                                        ${subService.price}
                                                    </span>
                                                    {formState.subServices.some(service => service.id === subService.id) && (
                                                        <div className="bg-indigo-500 text-white p-1 rounded-full">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ));
                                })()}
                            </div>
                        )}

                        {/* Total Price Display */}
                        {formState.subServices.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Total Services: {formState.subServices.length}</h3>
                                        <p className="text-sm text-gray-600">
                                            {formState.subServices.map(service => service.name).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-xl font-bold text-indigo-600">
                                        ${formState.subServices.reduce((total, service) => total + service.price, 0)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            case 'professional':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                            <FaUser className="mr-3 text-indigo-600" /> Select Staff
                        </h2>

                        {formState.subServices.length > 0 ? (
                            <div className="relative">
                                <div className="carousel carousel-center max-w-full p-4 space-x-4 scrollbar-hide">
                                    {/* No Preference Card - styled like other staff cards */}
                                    <div className="carousel-item">
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => updateForm('worker', "no_preference")}
                                            className={`w-[200px] cursor-pointer ${formState.worker === "no_preference"
                                                ? 'ring-2 ring-indigo-500'
                                                : 'hover:shadow-lg'
                                                } rounded-lg bg-white shadow-sm transition-all duration-300 p-4`}
                                        >
                                            {/* No Preference Icon Container */}
                                            <div className="relative flex justify-center mb-3">
                                                <div className="relative w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    {formState.worker === "no_preference" && (
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
                                                    No Preference
                                                </h3>

                                                <div className="flex justify-center mb-2">
                                                    <span className="text-xs text-gray-600">
                                                        Next Available
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap justify-center gap-1">
                                                    <div className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                                                        Any Staff
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Regular Staff Cards */}
                                    {getAvailableWorkers().map((worker) => (
                                        <div key={worker.id} className="carousel-item">
                                            <motion.div
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => updateForm('worker', worker.id)}
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
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                Please go back and select services first.
                            </div>
                        )}
                    </motion.div>
                );
            case 'date_time':
                return renderDateAndTimeSelection();
            case 'contact':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                            <FaUser className="mr-3 text-indigo-600" /> Your Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formState.contactInfo.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formState.contactInfo.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formState.contactInfo.phone}
                                    onChange={(e) => updateForm('phone', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="(123) 456-7890"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main content container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <HeroSection business={business} />
                </div>

                {/* Booking Form Section */}
                <div className="bg-white rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col p-6 md:p-8">
                        {/* Step indicator */}
                        <div className="mb-8">
                            <StepIndicator
                                currentStep={currentStep}
                                onStepClick={setCurrentStep}
                                canNavigateToStep={canNavigateToStep}
                            />
                        </div>

                        {/* Content area */}
                        <div className="flex-1 min-h-0 space-y-8">
                            {renderCurrentStep()}
                        </div>

                        {/* Navigation/Submit buttons */}
                        <div className="pt-8 mt-8 border-t border-gray-100">
                            <NavigationButtons />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
