import { Db } from '@/app/utils/db';
import { useState, FormEvent, ChangeEvent } from 'react';
import { FaImage } from 'react-icons/fa';
import { AppProvider, GameData, useAppContext } from "@/app/utils/AppContext";
import { circIn } from 'framer-motion';

interface CollectionFormData {
    title: string;
    industry: string;
    description: string;
    country: string;
    city: string;
    state: string;
    images: File[];
}

interface CreateCollectionFormProps {
    setShowCreateForm: (show: boolean) => void;
    selectedGame?: GameData;
}

const INDUSTRY_OPTIONS = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Entertainment",
    "Retail",
    "Manufacturing",
    "Transportation",
    "Energy",
    "Real Estate"
];

export default function ManageIdeaForm({ setShowCreateForm, selectedGame }: CreateCollectionFormProps) {
    const { auth, setTokenData, setCollectionData } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [collectionForm, setCollectionForm] = useState<CollectionFormData>({
        title: '',
        industry: '',
        description: '',
        country: '',
        city: '',
        state: '',
        images: [],
    });

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFile = files[0];
        if (newFile.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            e.target.value = '';
            return;
        }

        if (collectionForm.images.length >= 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setCollectionForm(prev => ({
            ...prev,
            images: [...prev.images, newFile]
        }));
    };

    const removeImage = (index: number) => {
        setCollectionForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleCollectionChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    fileInput.value = '';
                    return;
                }
                setCollectionForm(prev => ({
                    ...prev,
                    images: [...prev.images, file]
                }));
            }
        } else {
            setCollectionForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (currentStep !== 2) {
            nextStep();
            return;
        }
        try {
            setIsLoading(true);
            // Handle photo upload to Supabase storage
            let photoUrls: string[] = [];
            // Upload all images
            for (const image of collectionForm.images) {
                const upload_name = `${crypto.randomUUID()}`;
                const { data: uploadData, error: uploadError } = await Db.storage
                    .from('idea_media')
                    .upload(upload_name, image);
                if (uploadError) {
                    console.error('Error uploading photo:', uploadError);
                    continue;
                }
                // Get public URL for the uploaded photo
                const { data: { publicUrl } } = Db.storage
                    .from('idea_media')
                    .getPublicUrl(uploadData.path);
                photoUrls.push(publicUrl);
            }
            console.log("photoUrls", photoUrls)

            const { data: addressData, error: addressError } = await Db
                .from('address_detail')
                .insert([{
                    country: collectionForm.country,
                    suburb: collectionForm.city,
                    state: collectionForm.state,
                }])
                .select()
                .single();


            if (addressError) throw addressError;
            console.log("addressData", addressData)

            // Insert data into ideas table
            const { data: ideaData, error: ideaError } = await Db
                .from('ideas')
                .insert([{
                    title: collectionForm.title,
                    industry: collectionForm.industry,
                    description: collectionForm.description,
                    address_id: addressData.id,
                    upvotes: 0,
                    downvotes: 0,
                    media: photoUrls,
                    user_id: auth?.userData?.id
                }])
                .select()
                .single();

            if (ideaError) throw ideaError;
            console.log("ideaData", ideaData)
            // Close form and reset loading state
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating collection:', error);
            alert('Failed to create idea. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 pt-20">
            <div className="h-screen flex flex-col items-center justify-center relative w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-600">Creating collection...</p>
                    </div>
                ) : (
                    <div className="text-center space-y-8 mb-32 w-full max-w-[800px]">
                        {/* Image Grid Preview */}
                        <div className="w-full max-w-[800px] mx-auto">
                            <div className="grid grid-cols-4 gap-2">
                                {/* Main large image slot */}
                                <div className="col-span-2 row-span-2 relative h-[400px]">
                                    {collectionForm.images.length > 0 ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={URL.createObjectURL(collectionForm.images[0])}
                                                alt="Main preview"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                            <button
                                                onClick={() => removeImage(0)}
                                                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <div className="text-center">
                                                <FaImage className="w-8 h-8 mx-auto text-gray-400" />
                                                <span className="mt-2 block text-sm text-gray-500">Add main image</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {/* Secondary image slots */}
                                <div className="col-span-2 grid grid-cols-2 gap-2">
                                    {[1, 2, 3, 4].map((index) => (
                                        <div key={index} className="relative h-[196px]">
                                            {collectionForm.images[index] ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={URL.createObjectURL(collectionForm.images[index])}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <FaImage className="w-6 h-6 mx-auto text-gray-400" />
                                                        <span className="mt-1 block text-xs text-gray-500">Add image</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Step indicators */}
                        <div className="mt-8 flex justify-center gap-2">
                            {[1, 2].map((step) => (
                                <div
                                    key={step}
                                    className={`w-2 h-2 rounded-full ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-200'}`}
                                />
                            ))}
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="mt-8 w-[480px] mx-auto">
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="title"
                                        value={collectionForm.title}
                                        onChange={handleCollectionChange}
                                        placeholder="Idea Title"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                                        required
                                    />
                                    <select
                                        name="industry"
                                        value={collectionForm.industry}
                                        onChange={handleCollectionChange}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                                        required
                                    >
                                        <option value="">Select Industry</option>
                                        {INDUSTRY_OPTIONS.map((industry) => (
                                            <option key={industry} value={industry}>
                                                {industry}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <textarea
                                        name="description"
                                        value={collectionForm.description}
                                        onChange={handleCollectionChange}
                                        placeholder="Collection Description"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 h-32"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="country"
                                        value={collectionForm.country}
                                        onChange={handleCollectionChange}
                                        placeholder="Idea Country"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="city"
                                        value={collectionForm.city}
                                        onChange={handleCollectionChange}
                                        placeholder="Idea City"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        value={collectionForm.state}
                                        onChange={handleCollectionChange}
                                        placeholder="Idea State"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-all duration-300"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                                >
                                    {currentStep === 2 ? 'Post Idea' : 'Next'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={() => setShowCreateForm(false)}
                    className="absolute top-8 right-8 text-gray-600 hover:text-gray-800 text-4xl font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
