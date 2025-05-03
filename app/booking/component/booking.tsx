"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaUser, FaStar, FaPhone } from "react-icons/fa";
import OpenAI from "openai";
import { RiServiceFill } from "react-icons/ri";
import { Auth } from "@/app/auth";
import HeroSection from './heroSection';
import StepIndicator, { BookingStep } from './StepIndicator';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Replace the hardcoded Melbourne timezone functions with dynamic ones
const getUserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const convertUTCToLocalTimezone = (utcDate: Date | string): Date => {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    const timezone = getUserTimezone();
    return toZonedTime(date, timezone);
};

const convertLocalTimezoneToUTC = (localDate: Date): Date => {
    const timezone = getUserTimezone();
    return fromZonedTime(localDate, timezone);
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
    bookings: Booking[];
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
    bookings: Booking[];
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

interface Booking {
    id: string;
    start_time: string;
    end_time: string;
    status: {
        id: string;
        name: string;
    };
    service: Services[] | null;
}

interface Services {
    id: string;
    name: string;
    duration: string;
    price: number;
}

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

// Add a constant for the relief time (in minutes)
const RELIEF_TIME_MINUTES = 30;

const BookingPage = ({ businessId, bookingId }: { businessId: string, bookingId: string | undefined }) => {
    console.log("Rescheduling booking: ", bookingId);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);

    useEffect(() => {
        const fetchBusiness = async () => {
            const { data, error } = await Auth.rpc('get_company_details_by_identifier', {
                p_identifier: businessId
            });
            if (error) {
                console.error('Error fetching business details:', error);
            } else {
                console.log("Business data:", data);
                setCompanyData(data);
            }
        };
        fetchBusiness();
    }, [businessId]);

    // Update business object to use real data
    const business = companyData ? {
        id: companyData.company.id,
        name: companyData.company.name,
        image: "/business2.png", // You might want to add this to your company data
        logo: companyData.company.logo.path,
        rating: 4.9, // You might want to add this to your company data
        reviewCount: 50, // You might want to add this to your company data
        description: companyData.company.description
    } : null;

    // Update services to use real data and include bookings from staff
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
            })),
            bookings: staff.bookings
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
        setIsSubmitting(true);
        
        // Ensure phone has +61 prefix and correct format
        let phoneNumber = formState.contactInfo.phone;
        if (phoneNumber.startsWith('+610')) {
            // Fix case where +61 was added to a number with leading 0
            phoneNumber = '+61' + phoneNumber.substring(4);
        } else if (!phoneNumber.startsWith('+61')) {
            // Add +61 and remove leading 0 if needed
            phoneNumber = '+61' + phoneNumber.replace(/^0/, '');
        }
        
        console.log("new phone number: ", phoneNumber);
        // create a customer
        const { data: customerId, error: customerError } = await Auth.rpc('create_or_update_customer', {
            p_phone_number: phoneNumber,
            p_company_id: companyData?.company.id,
            p_first_name: formState.contactInfo.name.split(' ')[0],
            p_last_name: formState.contactInfo.name.split(' ').slice(1).join(' ') || formState.contactInfo.name,
            p_email: formState.contactInfo.email
        });
        console.log("Customer ID:", customerId);
        if (customerError) {
            console.error('Error creating customer:', customerError);
            alert('Error creating customer. Please try again.');
            setIsSubmitting(false);
            return;
        } else {
            // Convert selected date and time to UTC before submitting
            if (formState.date && formState.time) {
                const [hours, minutes] = formState.time.split(':').map(Number);

                // Create a date object with the selected date and time in user's local timezone
                const localDateTime = new Date(formState.date);
                localDateTime.setHours(hours, minutes, 0, 0);

                console.log("Original Local date/time:", localDateTime.toLocaleString());

                // Convert local time to UTC for storage
                const utcDateTime = new Date(localDateTime.getTime());

                // Log both dates for verification
                console.log("Local time:", localDateTime.toLocaleString());
                console.log("UTC time for storage:", utcDateTime.toISOString());

                // Calculate total duration for all services
                let totalDurationMs = 0;
                for (const service of formState.subServices) {
                    // Parse the duration correctly based on properly interpreting the format
                    let durationMs = 0;

                    if (service.duration.includes(':')) {
                        // Format is always HH:MM:SS 
                        const parts = service.duration.split(':').map(Number);

                        // Extract hours, minutes, seconds
                        const hours = parts[0];
                        const minutes = parts[1];
                        const seconds = parts[2];

                        // Calculate duration in milliseconds
                        durationMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
                    } else {
                        // Just a number - assume minutes
                        durationMs = parseInt(service.duration) * 60 * 1000;
                    }

                    // Add relief time between services
                    if (totalDurationMs > 0) {
                        totalDurationMs += RELIEF_TIME_MINUTES * 60 * 1000;
                    }

                    totalDurationMs += durationMs;
                }

                // Calculate the end time for the entire booking
                const endTime = new Date(utcDateTime.getTime() + totalDurationMs);

                // Find an available staff member if "no preference" was selected
                const staffId = formState.worker === "no_preference"
                    ? await getRandomAvailableStaff(formState.subServices[0].id, utcDateTime, endTime)
                    : formState.worker;

                // Create one booking for all services
                const { data: bookingData, error: bookingError } = await Auth
                    .from('booking')
                    .insert({
                        customer_id: customerId,
                        staff_id: staffId,
                        service_id: null, // No specific service - using junction table instead
                        company_id: companyData?.company.id,
                        start_time: utcDateTime.toISOString(),
                        end_time: endTime.toISOString(),
                        status_id: '2b6bf1b7-8d4b-4b36-946c-e3bd951f6021' // Confirmed or Pending ?
                    })
                    .select('id')
                    .single();

                if (bookingError) {
                    console.error('Error creating booking:', bookingError);
                    alert('Error creating booking. Please try again.');
                    setIsSubmitting(false);
                    return;
                }

                // Link booking to selected services
                const bookingId = bookingData.id;
                console.log("Booking created:", bookingId);

                // Now create entries in booking_linkable table for each service
                for (const service of formState.subServices) {
                    const { error: linkError } = await Auth
                        .from('booking_linkable')
                        .insert({
                            booking_id: bookingId,
                            linkable_type: 'services',
                            linkable_id: service.id
                        });

                    if (linkError) {
                        console.error('Error linking service to booking:', linkError);
                        alert('Error linking service to booking. Please try again.');
                        setIsSubmitting(false);
                        return;
                    }
                }

                // After all services are linked successfully
                console.log("All services linked to booking:", bookingId);
                setIsSuccess(true);
            }
        }
    };

    // Add this helper function before handleSubmit
    const getRandomAvailableStaff = async (serviceId: string, startTime: Date, endTime: Date): Promise<string | null> => {
        try {
            // Get the service category containing this service
            const serviceCategory = services.find(category =>
                category.subServices.some(service => service.id === serviceId)
            );

            if (!serviceCategory) return null;

            // Get all staff for this service category
            const allStaff = serviceCategory.workers;

            // Check which staff members are available at this time slot
            const availableStaff = allStaff.filter(staff => {
                // Check if staff works on this day
                const bookingDate = new Date(startTime);
                const dayOfWeek = bookingDate.getDay();

                const worksOnThisDay = staff.workingHours.some(hours =>
                    hours.days.includes(dayOfWeek)
                );

                if (!worksOnThisDay) return false;

                // Check if staff doesn't have overlapping bookings
                const hasOverlappingBooking = staff.bookings.some(booking => {
                    const bookingStart = new Date(booking.start_time);
                    const bookingEnd = new Date(booking.end_time);

                    // Add relief time to booking end
                    const bookingEndWithRelief = new Date(bookingEnd);
                    bookingEndWithRelief.setMinutes(bookingEnd.getMinutes() + RELIEF_TIME_MINUTES);

                    // Check for overlap
                    return (
                        (startTime >= bookingStart && startTime < bookingEndWithRelief) ||
                        (endTime > bookingStart && endTime <= bookingEndWithRelief) ||
                        (startTime <= bookingStart && endTime >= bookingEndWithRelief)
                    );
                });

                return !hasOverlappingBooking;
            });

            // If no staff available, return null
            if (availableStaff.length === 0) return null;

            // Randomly select a staff member
            const randomIndex = Math.floor(Math.random() * availableStaff.length);
            return availableStaff[randomIndex].id;
        } catch (error) {
            console.error("Error finding available staff:", error);
            return null;
        }
    };

    // Add this function to handle redirection
    const handleCloseSuccessModal = () => {
        setIsSuccess(false);
        setIsSubmitting(false);
        // Redirect back to the booking page for this business
        window.location.href = `/booking/${businessId}`;
    };

    const formatDate = (date: Date) => {
        const melbourneDate = convertUTCToLocalTimezone(date);
        return melbourneDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: getUserTimezone()
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

    // Update the getDayAvailability function to use staff.bookings instead of bookedSlots
    const getDayAvailability = (date: Date) => {
        const melbourneDate = new Date(date); // We're already working in Melbourne time
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

                // Filter booked slots for this date from worker's bookings
                const dateBookedSlots = worker.bookings.filter(booking => {
                    // Always convert UTC dates to Melbourne time for comparison
                    const bookingDate = convertUTCToLocalTimezone(booking.start_time);

                    return bookingDate.getDate() === melbourneDate.getDate() &&
                        bookingDate.getMonth() === melbourneDate.getMonth() &&
                        bookingDate.getFullYear() === melbourneDate.getFullYear();
                });

                // Count available slots
                for (let hour = startHour; hour < endHour; hour++) {
                    for (let minute of [0, 30]) {
                        const currentSlot = new Date(melbourneDate);
                        currentSlot.setHours(hour, minute);

                        const isBooked = dateBookedSlots.some(booking => {
                            const slotStart = convertUTCToLocalTimezone(booking.start_time);
                            const slotEnd = convertUTCToLocalTimezone(booking.end_time);
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

        if (availableSlots === 0) return 'fully-booked'; // No available slots
        if (availabilityPercentage <= 50) return 'limited'; // Limited availability (≤50%)
        return 'available'; // Good availability (>50%)
    };

    // Update getAvailableTimeSlots to include relief time
    const getAvailableTimeSlots = (worker: Worker, date: Date) => {
        if (!worker || !date) return [];

        // Get the day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = date.getDay();

        // Find the worker's working hours for this day
        const workerHours = worker.workingHours.find(wh => wh.days.includes(dayOfWeek));
        if (!workerHours) return [];

        // Generate all possible time slots based on worker's hours
        const allTimeSlots = generateTimeSlots();

        // Filter to only slots within worker's hours
        const workerStartTime = workerHours.start;
        const workerEndTime = workerHours.end;

        const availableSlots = allTimeSlots.filter(slot => {
            return slot >= workerStartTime && slot < workerEndTime;
        });

        // Get all booked slots for this worker and date from worker.bookings
        const bookedSlotsForDay = worker.bookings.filter(booking => {
            // Always convert UTC dates to Melbourne time before comparing
            const bookingDate = convertUTCToLocalTimezone(booking.start_time);
            const selectedDate = new Date(date);

            return bookingDate.getDate() === selectedDate.getDate() &&
                bookingDate.getMonth() === selectedDate.getMonth() &&
                bookingDate.getFullYear() === selectedDate.getFullYear();
        });

        // Log all booked time slots in Melbourne time
        console.log("Booked time slots for", worker.name, "on UTC", date.toLocaleDateString(), ":", bookedSlotsForDay);
        console.log('Booked time slots for', worker.name, 'on', date.toLocaleDateString(), ':');
        bookedSlotsForDay.forEach(booking => {
            const melbourneStart = convertUTCToLocalTimezone(booking.start_time);
            const melbourneEnd = convertUTCToLocalTimezone(booking.end_time);
            console.log(`${melbourneStart.toLocaleTimeString()} - ${melbourneEnd.toLocaleTimeString()}`);
        });

        // Map available slots to include disabled status
        return availableSlots.map(slot => {
            // Check if this slot is in the past
            const isInPast = (() => {
                const now = new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Only check for past times if the date is today
                if (date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear()) {
                    
                    const [slotHours, slotMinutes] = slot.split(':').map(Number);
                    return (slotHours < now.getHours() || 
                           (slotHours === now.getHours() && slotMinutes <= now.getMinutes()));
                }
                return false;
            })();
            
            // Check if this slot overlaps with any booked slots
            const isBooked = bookedSlotsForDay.some(booking => {
                // Always convert UTC dates to Melbourne time
                const bookedStart = convertUTCToLocalTimezone(booking.start_time);
                const bookedEnd = convertUTCToLocalTimezone(booking.end_time);
                
                // Add relief time to booking end time
                const bookedEndWithRelief = new Date(bookedEnd);
                bookedEndWithRelief.setMinutes(bookedEnd.getMinutes() + RELIEF_TIME_MINUTES);
                
                // Calculate slot start and end times in Melbourne time
                const [slotHours, slotMinutes] = slot.split(':').map(Number);
                const slotStartTime = new Date(date);
                slotStartTime.setHours(slotHours, slotMinutes, 0, 0);
                
                // Calculate service end time based on duration
                const durationMinutes = formState.subServices.length > 0 ? 
                    parseInt(formState.subServices[0].duration.split(':')[0]) * 60 + 
                    parseInt(formState.subServices[0].duration.split(':')[1]) : 60;
                
                const slotEndTime = new Date(slotStartTime);
                slotEndTime.setMinutes(slotStartTime.getMinutes() + durationMinutes);
                
                // Add relief time to slot end time
                const slotEndWithRelief = new Date(slotEndTime);
                slotEndWithRelief.setMinutes(slotEndTime.getMinutes() + RELIEF_TIME_MINUTES);
                
                // Check for overlap including relief time
                return (
                    // Slot starts during a booking (including relief time)
                    (slotStartTime >= bookedStart && slotStartTime < bookedEndWithRelief) ||
                    // Slot ends during a booking (including preparation time)
                    (slotEndTime > bookedStart && slotEndTime <= bookedEndWithRelief) ||
                    // Slot completely contains a booking
                    (slotStartTime <= bookedStart && slotEndTime >= bookedEndWithRelief)
                );
            });
            
            return { time: slot, disabled: isBooked || isInPast };
        });
    };

    // Add a combined function for date and time selection
    const renderDateAndTimeSelection = () => {
        const selectedWorker = formState.worker === "no_preference" ?
            { id: "no_preference", name: "No Preference", workingHours: [], bookings: [] } as unknown as Worker :
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
                <div className="space-y-8 min-h-[55vh] flex flex-col">
                    <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                        <FaCalendarAlt className="mr-2 text-black" /> Select Date
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
                                : "text-black hover:bg-gray-100"
                                }`}
                            disabled={currentMonth.getMonth() === new Date().getMonth()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>

                        <h3 className="text-xl font-semibold text-black">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg text-black hover:bg-gray-100"
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
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <motion.button
                                    key={index}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateForm('date', date)}
                                    className={`p-4 rounded-lg text-center flex flex-col items-center ${
                                        isSelected
                                            ? "bg-black text-white"
                                            : isToday
                                            ? "bg-blue-50 text-blue-600 border-2 border-blue-500"
                                            : "bg-gray-50 hover:bg-gray-100 text-black"
                                    }`}
                                    disabled={isPast}
                                >
                                    <div className="text-sm font-medium mb-1">{date.getDate()}</div>

                                    {/* Availability indicator dot */}
                                    {!isPast && availability !== 'none' && (
                                        <div className={`h-2 w-2 rounded-full mt-1 
                                            ${availability === 'available' ? 'bg-green' :
                                                availability === 'limited' ? 'bg-[#FFA500]' :
                                                    availability === 'fully-booked' ? 'bg-[#FF0000]' : 'bg-transparent'}`}>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Selection */}
                {formState.date && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                            <FaClock className="mr-2 text-black" /> Available Time
                        </h2>
                        {availableTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                {availableTimeSlots.map((slot, index) => (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        whileHover={!slot.disabled ? { scale: 1.05 } : {}}
                                        whileTap={!slot.disabled ? { scale: 0.95 } : {}}
                                        onClick={() => !slot.disabled && updateForm('time', slot.time)}
                                        className={`p-3 rounded-lg text-center relative
                                            ${slot.disabled
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                                                : formState.time === slot.time
                                                    ? 'bg-black text-white border-2 border-black'
                                                    : 'bg-white hover:bg-gray-50 text-black border border-gray-300 hover:border-black'
                                            }`}
                                        disabled={slot.disabled}
                                    >
                                        <span className={`${slot.disabled ? 'opacity-70' : 'font-medium'}`}>
                                            {slot.time}
                                        </span>

                                        {/* Strikethrough for booked slots */}
                                        {slot.disabled && (
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                <div className="w-full h-[1.5px] bg-gray-400 transform rotate-45"></div>
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg border border-gray-200">
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
        <div className="flex justify-between">
            {currentStep !== 'service' && (
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPreviousStep}
                    className="px-6 py-2 text-black border border-black rounded-lg hover:bg-gray-100"
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
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 ml-auto"
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
                        : "bg-black hover:bg-gray-800"
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
                        className="space-y-8 min-h-[55vh] flex flex-col"
                    >
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <RiServiceFill className="mr-3 text-black" /> Select Services
                        </h2>

                        {/* Service Dropdown */}
                        <div className="mb-6">
                            <label className="block text-black text-sm font-medium mb-2">
                                Category
                            </label>
                            <div className="dropdown w-full">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black flex justify-between items-center bg-white"
                                >
                                    {formState.serviceCategory ?
                                        services.find(s => s.id === formState.serviceCategory)?.name :
                                        'Select a service'
                                    }
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-full">
                                    {services.map((service) => (
                                        <li key={service.id}>
                                            <a
                                                onClick={() => {
                                                    updateForm('serviceCategory', service.id);
                                                    updateForm('subServices', []); // Clear selected sub-services when changing category
                                                    updateForm('worker', ""); // Clear selected worker when changing service
                                                }}
                                                className={formState.serviceCategory === service.id ? 'bg-gray-100' : ''}
                                            >
                                                {service.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sub-services */}
                        <div className="flex-grow">
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
                                                    ? "border-black bg-gray-100"
                                                    : "border-gray-200 hover:border-gray-400"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium text-left">{subService.name}</div>
                                                        <div className="text-sm text-gray-500 text-left mt-1">{subService.duration}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-semibold text-black">
                                                            ${subService.price}
                                                        </span>
                                                        {formState.subServices.some(service => service.id === subService.id) && (
                                                            <div className="bg-black text-white p-1 rounded-full">
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
                        </div>

                        {/* Total Price Display */}
                        {formState.subServices.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-black">Total Services: {formState.subServices.length}</h3>
                                        <p className="text-sm text-gray-600">
                                            {formState.subServices.map(service => service.name).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-xl font-bold text-black">
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
                        className="space-y-8 min-h-[55vh] flex flex-col"
                    >
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <FaUser className="mr-3 text-black" /> Select Staff
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
                                                ? 'ring-2 ring-black'
                                                : 'hover:shadow-lg'
                                                } rounded-lg bg-white shadow-sm transition-all duration-300 p-4`}
                                        >
                                            {/* No Preference Icon Container */}
                                            <div className="relative flex justify-center mb-3">
                                                <div className="relative w-24 h-24 rounded-full bg-black flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    {formState.worker === "no_preference" && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <div className="bg-black text-white p-1 rounded-full">
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
                                                    <div className="text-xs px-2 py-1 bg-gray-100 text-black rounded-full">
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
                                                    ? 'ring-2 ring-black'
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
                                                                <div className="bg-black text-white p-1 rounded-full">
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
                                                                className="text-xs px-2 py-1 bg-gray-100 text-black rounded-full"
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
                        className="space-y-8 min-h-[55vh] flex flex-col"
                    >
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <FaUser className="mr-3 text-black" /> Your Information
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                                    Phone Number
                                </label>
                                <div className="flex w-full items-center border-2 border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black focus-within:border-black overflow-hidden">
                                    <div className="bg-gray-100 px-2 py-3 text-gray-600 font-medium border-r-2 border-gray-200">
                                        +61
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formState.contactInfo.phone.startsWith('+61') ? formState.contactInfo.phone.substring(3) : formState.contactInfo.phone}
                                        onChange={(e) => {
                                            // Strip any non-digit characters
                                            const phoneValue = e.target.value.replace(/\D/g, '');
                                            // Store with the +61 prefix
                                            updateForm('phone', '+61' + phoneValue);
                                        }}
                                        className="flex-1 px-4 py-3 focus:outline-none"
                                        placeholder="XXX XXX XXX"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Main content container - reduced padding */}
            <div className="container mx-auto px-1 sm:px-2 lg:px-3 py-2 md:py-4">
                {/* Hero Section */}
                <div className="rounded-xl overflow-hidden mb-4">
                    <HeroSection business={business} />
                </div>

                {/* Booking Form Section - white background fills more space */}
                <div className="bg-white rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col p-3 md:p-5">
                        {/* Step indicator */}
                        <div className="mb-3">
                            <StepIndicator
                                currentStep={currentStep}
                                onStepClick={setCurrentStep}
                                canNavigateToStep={canNavigateToStep}
                            />
                        </div>

                        {/* Content area */}
                        <div className="flex-1 min-h-0">
                            {renderCurrentStep()}
                        </div>

                        {/* Navigation/Submit buttons */}
                        <div className="pt-3 mt-3 border-t border-gray-100">
                            <NavigationButtons />
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal with check animation */}
            {isSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4 relative overflow-hidden">
                                {/* Animated green check mark */}
                                <svg
                                    className="h-14 w-14 text-green-500"
                                    fill="none"
                                    stroke="green"
                                    viewBox="0 0 24 24"
                                    style={{
                                        strokeDasharray: 100,
                                        strokeDashoffset: 0,
                                        animation: "drawCheck 0.5s ease-in-out forwards"
                                    }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>

                                {/* Circular animation */}
                                <div className="absolute inset-0 border-4 border-green rounded-full"
                                    style={{
                                        animation: "scaleIn 0.3s ease-in-out forwards"
                                    }}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                            <p className="text-gray-600 mb-6">
                                Thank you for your booking. We'll send a confirmation to your email address.
                            </p>
                            <button
                                onClick={handleCloseSuccessModal}
                                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add CSS animation keyframes */}
            <style jsx global>{`
                @keyframes drawCheck {
                    0% {
                        stroke-dashoffset: 100;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                
                @keyframes scaleIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingPage;
