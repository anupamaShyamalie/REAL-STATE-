// 4. Updated NewPostPage component with Gemini integration
import { useState, useRef, useEffect } from "react";
import "./newPost.scss";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import CloudinaryUploadWidget from "../../component/upload/CloudinaryUploadWidget";
import { GeminiChatService } from "../../lib/geminiService";
import { MessageCircle, X, Send, Bot, Sparkles, Upload, Home, MapPin, DollarSign, Bed, Bath, Ruler, Building, Car, Users, Calendar, Star, Plus, Trash2, Edit3, Save, ArrowLeft, Check, RefreshCw, Lightbulb, Globe, Wand2 } from 'lucide-react';

function NewPostPage() {
    const [files, setFiles] = useState([]);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Hello! I'm your AI real estate assistant powered by Google Gemini. I can help you create an amazing property listing. What would you like to know?", 
            sender: "ai", 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [geminiService] = useState(() => new GeminiChatService());
    const [currentPropertyData, setCurrentPropertyData] = useState({});
    const [showAiModal, setShowAiModal] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [descriptionGenerated, setDescriptionGenerated] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const params = useParams();
    const location = useLocation();
    const isEditMode = Boolean(params.id);

    // Cloudinary configuration
    const uwConfig = {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dblwkkext",
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "estate",
        multiple: true,
        maxFiles: 10,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
        maxFileSize: 15000000,
        folder: "real-estate-posts"
    };

    // Track form changes for context
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCurrentPropertyData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Auto-fill coordinates when address changes
    const handleAddressChange = async (e) => {
        const address = e.target.value;
        setCurrentPropertyData(prev => ({
            ...prev,
            address: address
        }));

        // Auto-fill coordinates if address is provided
        if (address && address.length > 10) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
                );
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    setCurrentPropertyData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lon
                    }));
                }
            } catch (error) {
                console.log("Error fetching coordinates:", error);
            }
        }
    };

    // Auto-generate description when property details are filled
    useEffect(() => {
        const shouldGenerateDescription = () => {
            const { title, price, address, bedroom, bathroom, size, type, property } = currentPropertyData;
            return title && price && address && bedroom && bathroom && !currentPropertyData.desc && !descriptionGenerated;
        };

        if (shouldGenerateDescription()) {
            generateAutoDescription();
        }
    }, [currentPropertyData.title, currentPropertyData.price, currentPropertyData.address, currentPropertyData.bedroom, currentPropertyData.bathroom, currentPropertyData.size, currentPropertyData.type, currentPropertyData.property]);

    // Generate automatic description
    const generateAutoDescription = async (propertyData) => {
        if (isGeneratingDescription) return;

        setIsGeneratingDescription(true);
        try {
            const prompt = `Create a compelling and detailed property description for a real estate listing based on the following information:

Property Details:
- Title: ${propertyData.title}
- Price: $${propertyData.price}
- Address: ${propertyData.address}
- Bedrooms: ${propertyData.bedroom}
- Bathrooms: ${propertyData.bathroom}
- Size: ${propertyData.size ? propertyData.size + ' sqft' : 'Not specified'}
- Type: ${propertyData.type === 'rent' ? 'For Rent' : 'For Sale'}
- Property Type: ${propertyData.property}
- Utilities: ${propertyData.utilities || 'Not specified'}
- Pet Policy: ${propertyData.pet || 'Not specified'}

Please write a professional, engaging description that:
1. Highlights the key features and benefits
2. Uses persuasive language to attract potential buyers/renters
3. Includes details about the property type and amenities
4. Mentions the location and any notable features
5. Is between 150-250 words
6. Uses a warm, welcoming tone

Write only the description, no additional formatting or labels.`;

            const response = await geminiService.sendMessage(prompt, propertyData);
            
            setCurrentPropertyData(prev => ({
                ...prev,
                desc: response.trim()
            }));
            setDescriptionGenerated(true);
        } catch (error) {
            console.error('Error generating description:', error);
            // Fallback description
            const fallbackDesc = `Welcome to this beautiful ${currentPropertyData.property} located at ${currentPropertyData.address}. This ${currentPropertyData.bedroom}-bedroom, ${currentPropertyData.bathroom}-bathroom property offers comfortable living space${currentPropertyData.size ? ` with ${currentPropertyData.size} square feet` : ''}. Perfect for ${currentPropertyData.type === 'rent' ? 'renting' : 'purchasing'}, this property features modern amenities and a convenient location. Don't miss this opportunity to make this your new home!`;
            
            setCurrentPropertyData(prev => ({
                ...prev,
                desc: fallbackDesc
            }));
            setDescriptionGenerated(true);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    // Prefill state for edit mode
    useEffect(() => {
        if (isEditMode && params.id) {
            apiRequest.get(`/posts/${params.id}`).then(res => {
                const post = res.data;
                setCurrentPropertyData({
                    ...post,
                    ...post.postDetails
                });
                setUploadedImages(post.images || []);
                if (post.postDetails?.desc) {
                    setDescriptionGenerated(true);
                }
            });
        }
    }, [isEditMode, params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        
        // Use currentPropertyData instead of FormData to avoid focusable errors
        if (!currentPropertyData.title || !currentPropertyData.price || !currentPropertyData.address) {
            setError("Please fill in all required fields (Title, Price, Address)");
            setIsSubmitting(false);
            return;
        }

        try {
            const postData = {
                title: currentPropertyData.title,
                price: parseInt(currentPropertyData.price),
                images: uploadedImages,
                address: currentPropertyData.address,
                city: currentPropertyData.city,
                bedroom: parseInt(currentPropertyData.bedroom) || 1,
                bathroom: parseInt(currentPropertyData.bathroom) || 1,
                latitude: currentPropertyData.latitude,
                longitude: currentPropertyData.longitude,
                type: currentPropertyData.type || 'rent',
                property: currentPropertyData.property || 'apartment'
            };

            const postDetails = {
                desc: currentPropertyData.desc || "",
                utilities: currentPropertyData.utilities,
                pet: currentPropertyData.pet,
                income: currentPropertyData.income,
                size: parseInt(currentPropertyData.size) || null,
                school: parseInt(currentPropertyData.school) || null,
                bus: parseInt(currentPropertyData.bus) || null,
                restaurant: parseInt(currentPropertyData.restaurant) || null
            };

            if (isEditMode) {
                await apiRequest.put(`/posts/${params.id}`, {
                    postData,
                    postDetails
                });
                navigate("/list");
            } else {
                const res = await apiRequest.post('/posts', {
                    postData,
                    postDetails
                });

                console.log("Post created successfully:", res.data);
                navigate("/list");
            }
            
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || (isEditMode ? "Failed to update post. Please try again." : "Failed to create post. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (imageUrl) => {
        setUploadedImages(prev => [...prev, imageUrl]);
    };

    const removeUploadedImage = (imageUrl) => {
        setUploadedImages(prev => prev.filter(url => url !== imageUrl));
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || isAiThinking) return;

        const userMessage = {
            id: Date.now(),
            text: newMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage("");
        setIsAiThinking(true);

        try {
            const aiResponse = await geminiService.sendMessage(newMessage, currentPropertyData);
            
            const aiMessage = {
                id: Date.now() + 1,
                text: aiResponse,
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Response Error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleClearChat = () => {
        setMessages([{
            id: 1,
            text: "Hello! I'm your AI real estate assistant powered by Google Gemini. I can help you create an amazing property listing. What would you like to know?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        geminiService.clearHistory();
    };

    // Generate AI suggestions for title and description
    const generateAiSuggestions = async () => {
        if (!currentPropertyData.title || !currentPropertyData.address) {
            setError("Please fill in at least the title and address before generating suggestions.");
            return;
        }

        setIsGeneratingSuggestions(true);
        try {
            const propertyData = {
                ...currentPropertyData,
                images: uploadedImages
            };

            const prompt = `Based on this property data, suggest an improved title and description for a real estate listing. 
            Property Data: ${JSON.stringify(propertyData)}
            
            Please provide:
            1. An attractive, SEO-friendly title
            2. A compelling description that highlights key features
            3. Any additional suggestions for improving the listing
            
            IMPORTANT: Format the response as valid JSON with keys: title, description, suggestions
            Example format:
            {
                "title": "Your suggested title here",
                "description": "Your suggested description here",
                "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
            }`;

            const response = await geminiService.sendMessage(prompt, propertyData);
            
            // Try to extract JSON from the response
            let jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const suggestions = JSON.parse(jsonMatch[0]);
                    setAiSuggestions(suggestions);
                    setShowSuggestionsModal(true);
                } catch (parseError) {
                    console.error('JSON parsing error:', parseError);
                    // Fallback to structured response
                    setAiSuggestions({
                        title: "AI-Generated Title",
                        description: response,
                        suggestions: ["Consider adding more details about amenities", "Include nearby attractions"]
                    });
                    setShowSuggestionsModal(true);
                }
            } else {
                // If no JSON found, create a structured response
                setAiSuggestions({
                    title: "AI-Generated Title",
                    description: response,
                    suggestions: ["Consider adding more details about amenities", "Include nearby attractions"]
                });
                setShowSuggestionsModal(true);
            }
        } catch (error) {
            console.error('Error generating suggestions:', error);
            setError("Failed to generate AI suggestions. Please try again.");
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    // Apply AI suggestions
    const applySuggestion = (type, value) => {
        setCurrentPropertyData(prev => ({
            ...prev,
            [type]: value
        }));
        setShowSuggestionsModal(false); // Close modal after applying suggestion
    };

    const smartSuggestions = geminiService.getSmartSuggestions(currentPropertyData);

    const steps = [
        { id: 1, title: "Basic Info", icon: <Home size={20} /> },
        { id: 2, title: "Details", icon: <Edit3 size={20} /> },
        { id: 3, title: "Images", icon: <Upload size={20} /> },
        { id: 4, title: "Review", icon: <Star size={20} /> }
    ];

    return (
        <div className="newPostPage">
            <div className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>
                    <p>Create an amazing property listing with our AI assistant</p>
                </div>
            </div>

            <div className="progress-steps">
                {steps.map((step, index) => (
                    <div 
                        key={step.id}
                        className={`step ${activeStep >= step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
                        onClick={() => setActiveStep(step.id)}
                    >
                        <div className="step-icon">
                            {activeStep > step.id ? <Check size={16} /> : step.icon}
                        </div>
                        <span className="step-title">{step.title}</span>
                        {index < steps.length - 1 && <div className="step-connector" />}
                    </div>
                ))}
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="property-form">
                    {/* Step 1: Basic Information */}
                    <div className={`form-step ${activeStep === 1 ? 'active' : ''}`}>
                        <div className="step-header">
                            <h2>Basic Information</h2>
                            <p>Start with the essential details about your property</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="title">
                                    <Home size={16} />
                                    Property Title *
                                </label>
                                <input 
                                    id="title" 
                                    name="title" 
                                    type="text" 
                                    required 
                                    value={currentPropertyData.title || ''}
                                    onChange={handleFormChange}
                                    placeholder="Enter property title"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">
                                    <DollarSign size={16} />
                                    Price *
                                </label>
                                <input 
                                    id="price" 
                                    name="price" 
                                    type="number" 
                                    required 
                                    value={currentPropertyData.price || ''}
                                    onChange={handleFormChange}
                                    placeholder="Enter price"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="address">
                                    <MapPin size={16} />
                                    Address *
                                </label>
                                <input 
                                    id="address" 
                                    name="address" 
                                    type="text" 
                                    required 
                                    value={currentPropertyData.address || ''}
                                    onChange={handleAddressChange}
                                    placeholder="Enter full address (coordinates will auto-fill)"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">
                                    <Building size={16} />
                                    City
                                </label>
                                <input 
                                    id="city" 
                                    name="city" 
                                    type="text" 
                                    value={currentPropertyData.city || ''}
                                    onChange={handleFormChange}
                                    placeholder="Enter city"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="type">
                                    <Calendar size={16} />
                                    Type
                                </label>
                                <select 
                                    name="type" 
                                    value={currentPropertyData.type || 'rent'}
                                    onChange={handleFormChange}
                                >
                                    <option value="rent">For Rent</option>
                                    <option value="buy">For Sale</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="property">
                                    <Building size={16} />
                                    Property Type
                                </label>
                                <select 
                                    name="property" 
                                    value={currentPropertyData.property || 'apartment'}
                                    onChange={handleFormChange}
                                >
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="condo">Condo</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="latitude">
                                    <Globe size={16} />
                                    Latitude (Auto-filled)
                                </label>
                                <input 
                                    id="latitude" 
                                    name="latitude" 
                                    type="text" 
                                    value={currentPropertyData.latitude || ''}
                                    onChange={handleFormChange}
                                    placeholder="Will auto-fill from address"
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="longitude">
                                    <Globe size={16} />
                                    Longitude (Auto-filled)
                                </label>
                                <input 
                                    id="longitude" 
                                    name="longitude" 
                                    type="text" 
                                    value={currentPropertyData.longitude || ''}
                                    onChange={handleFormChange}
                                    placeholder="Will auto-fill from address"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="step-actions">
                            <button 
                                type="button" 
                                className="btn-primary"
                                onClick={() => setActiveStep(2)}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Property Details */}
                    <div className={`form-step ${activeStep === 2 ? 'active' : ''}`}>
                        <div className="step-header">
                            <h2>Property Details</h2>
                            <p>Add detailed information about your property</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="bedroom">
                                    <Bed size={16} />
                                    Bedrooms
                                </label>
                                <input 
                                    min={1} 
                                    id="bedroom" 
                                    name="bedroom" 
                                    type="number" 
                                    value={currentPropertyData.bedroom || 1}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bathroom">
                                    <Bath size={16} />
                                    Bathrooms
                                </label>
                                <input 
                                    min={1} 
                                    id="bathroom" 
                                    name="bathroom" 
                                    type="number" 
                                    value={currentPropertyData.bathroom || 1}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="size">
                                    <Ruler size={16} />
                                    Size (sqft)
                                </label>
                                <input 
                                    min={0} 
                                    id="size" 
                                    name="size" 
                                    type="number" 
                                    value={currentPropertyData.size || ''}
                                    onChange={handleFormChange}
                                    placeholder="Enter size"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="utilities">
                                    <Users size={16} />
                                    Utilities Policy
                                </label>
                                <select name="utilities" value={currentPropertyData.utilities || 'owner'} onChange={handleFormChange}>
                                    <option value="owner">Owner is responsible</option>
                                    <option value="tenant">Tenant is responsible</option>
                                    <option value="shared">Shared</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="pet">
                                    <Users size={16} />
                                    Pet Policy
                                </label>
                                <select name="pet" value={currentPropertyData.pet || 'allowed'} onChange={handleFormChange}>
                                    <option value="allowed">Pets Allowed</option>
                                    <option value="not-allowed">No Pets</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="income">
                                    <DollarSign size={16} />
                                    Income Policy
                                </label>
                                <input
                                    id="income"
                                    name="income"
                                    type="text"
                                    placeholder="Enter income requirements"
                                    value={currentPropertyData.income || ''}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="school">
                                    <MapPin size={16} />
                                    School Distance (km)
                                </label>
                                <input min={0} id="school" name="school" type="number" value={currentPropertyData.school || ''} onChange={handleFormChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bus">
                                    <Car size={16} />
                                    Bus Stop Distance (km)
                                </label>
                                <input min={0} id="bus" name="bus" type="number" value={currentPropertyData.bus || ''} onChange={handleFormChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="restaurant">
                                    <MapPin size={16} />
                                    Restaurant Distance (km)
                                </label>
                                <input min={0} id="restaurant" name="restaurant" type="number" value={currentPropertyData.restaurant || ''} onChange={handleFormChange} />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="desc">
                                    <Edit3 size={16} />
                                    Description
                                    {isGeneratingDescription && (
                                        <span className="ai-generating-indicator">
                                            <Wand2 size={14} />
                                            AI Generating...
                                        </span>
                                    )}
                                </label>
                                <div className="description-container">
                                    <textarea 
                                        id="desc" 
                                        name="desc" 
                                        value={currentPropertyData.desc || ''}
                                        onChange={handleFormChange}
                                        placeholder="Describe your property in detail... (AI will auto-generate when you fill the basic details)"
                                        rows={4}
                                        className={isGeneratingDescription ? 'generating' : ''}
                                    />
                                    <div className="description-chips">
                                        <button 
                                            type="button"
                                            className="use-input-chip"
                                            onClick={() => {
                                                const inputData = {
                                                    title: currentPropertyData.title,
                                                    price: currentPropertyData.price,
                                                    address: currentPropertyData.address,
                                                    city: currentPropertyData.city,
                                                    type: currentPropertyData.type,
                                                    property: currentPropertyData.property,
                                                    bedroom: currentPropertyData.bedroom,
                                                    bathroom: currentPropertyData.bathroom,
                                                    size: currentPropertyData.size,
                                                    utilities: currentPropertyData.utilities,
                                                    pet: currentPropertyData.pet,
                                                    income: currentPropertyData.income,
                                                    school: currentPropertyData.school,
                                                    bus: currentPropertyData.bus,
                                                    restaurant: currentPropertyData.restaurant
                                                };
                                                generateAutoDescription(inputData);
                                            }}
                                            disabled={isGeneratingDescription}
                                        >
                                            <Wand2 size={14} />
                                            Use Input Data
                                        </button>
                                    </div>
                                </div>
                                {isGeneratingDescription && (
                                    <div className="description-generating-animation">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <p>AI is crafting a compelling description for your property...</p>
                                    </div>
                                )}
                                {descriptionGenerated && currentPropertyData.desc && !isGeneratingDescription && (
                                    <div className="description-generated-indicator">
                                        <Check size={14} />
                                        <span>AI-generated description ready!</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="step-actions">
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setActiveStep(2)}
                            >
                                Previous
                            </button>
                            <button 
                                type="button" 
                                className="btn-primary"
                                onClick={() => setActiveStep(3)}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>



                    {/* Step 3: Images */}
                    <div className={`form-step ${activeStep === 3 ? 'active' : ''}`}>
                        <div className="step-header">
                            <h2>Property Images</h2>
                            <p>Upload high-quality images of your property</p>
                        </div>

                        <div className="image-upload-section">
                            <div className="upload-area">
                                <CloudinaryUploadWidget 
                                    uwConfig={uwConfig} 
                                    setavatar={handleImageUpload}
                                />
                            </div>
                            
                            {uploadedImages.length > 0 && (
                                <div className="uploaded-images">
                                    <h3>Uploaded Images ({uploadedImages.length})</h3>
                                    <div className="images-grid">
                                        {uploadedImages.map((imageUrl, index) => (
                                            <div key={index} className="image-item">
                                                <img src={imageUrl} alt={`Property ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeUploadedImage(imageUrl)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="step-actions">
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setActiveStep(2)}
                            >
                                Previous
                            </button>
                            <button 
                                type="button" 
                                className="btn-primary"
                                onClick={() => setActiveStep(4)}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>

                    {/* Step 4: Review & Submit */}
                    <div className={`form-step ${activeStep === 4 ? 'active' : ''}`}>
                        <div className="step-header">
                            <h2>Review & Submit</h2>
                            <p>Review your property details and get AI suggestions</p>
                        </div>

                        <div className="review-section">
                            <div className="review-card">
                                <h3>Property Summary</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Title:</span>
                                        <span className="value">{currentPropertyData.title || 'Not specified'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Price:</span>
                                        <span className="value">${currentPropertyData.price || 'Not specified'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Address:</span>
                                        <span className="value">{currentPropertyData.address || 'Not specified'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Type:</span>
                                        <span className="value">{currentPropertyData.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Bedrooms:</span>
                                        <span className="value">{currentPropertyData.bedroom || 1}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Bathrooms:</span>
                                        <span className="value">{currentPropertyData.bathroom || 1}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Images:</span>
                                        <span className="value">{uploadedImages.length} uploaded</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Coordinates:</span>
                                        <span className="value">
                                            {currentPropertyData.latitude && currentPropertyData.longitude 
                                                ? `${currentPropertyData.latitude}, ${currentPropertyData.longitude}`
                                                : 'Not set'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="ai-suggestions-section">
                                <div className="suggestions-header">
                                    <h3>
                                        <Lightbulb size={20} />
                                        AI Suggestions
                                    </h3>
                                    <p>Get AI-powered suggestions to improve your listing</p>
                                </div>
                                
                                <div className="suggestions-actions">
                                    <button 
                                        type="button" 
                                        className="btn-primary"
                                        onClick={generateAiSuggestions}
                                        disabled={isGeneratingSuggestions || !currentPropertyData.title || !currentPropertyData.address}
                                    >
                                        {isGeneratingSuggestions ? (
                                            <>
                                                <div className="loading-spinner"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Get AI Suggestions
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        onClick={() => setShowAiModal(true)}
                                    >
                                        <Bot size={16} />
                                        Chat with AI
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setActiveStep(3)}
                            >
                                Previous
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {isEditMode ? 'Update Property' : 'Create Property'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="error-message">
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Floating AI Chat Button */}
            <div className="floating-ai-button">
                <button 
                    className="ai-chat-trigger"
                    onClick={() => setShowAiModal(true)}
                    title="Open AI Assistant"
                >
                    <div className="button-content">
                        <Bot size={24} />
                        <Sparkles size={16} className="sparkle-icon" />
                    </div>
                    <div className="pulse-ring"></div>
                </button>
            </div>

            {/* AI Suggestions Modal */}
            {showSuggestionsModal && aiSuggestions && (
                <div className="suggestions-modal-overlay" onClick={() => setShowSuggestionsModal(false)}>
                    <div className="suggestions-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <Lightbulb size={24} />
                                <h3>AI Suggestions</h3>
                            </div>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowSuggestionsModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="suggestions-content">
                            <div className="suggestion-section">
                                <div className="suggestion-header">
                                    <h4>Improved Title</h4>
                                    <button 
                                        className="apply-tick-btn"
                                        onClick={() => applySuggestion('title', aiSuggestions.title)}
                                        title="Apply this title"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                                <div className="suggestion-item">
                                    <p>{aiSuggestions.title}</p>
                                </div>
                            </div>

                            <div className="suggestion-section">
                                <div className="suggestion-header">
                                    <h4>Enhanced Description</h4>
                                    <button 
                                        className="apply-tick-btn"
                                        onClick={() => applySuggestion('desc', aiSuggestions.description)}
                                        title="Apply this description"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                                <div className="suggestion-item">
                                    <p>{aiSuggestions.description}</p>
                                </div>
                            </div>

                            {aiSuggestions.suggestions && (
                                <div className="suggestion-section">
                                    <h4>Additional Suggestions</h4>
                                    <div className="suggestions-list">
                                        {aiSuggestions.suggestions.map((suggestion, index) => (
                                            <div key={index} className="suggestion-item">
                                                <div className="suggestion-bullet">
                                                    <span className="bullet-number">{index + 1}</span>
                                                </div>
                                                <p>{suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Chat Modal */}
            {showAiModal && (
                <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <Bot size={24} />
                                <h3>AI Property Assistant</h3>
                            </div>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowAiModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-messages">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`modal-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                                >
                                    <div className="message-bubble">
                                        <p>{message.text}</p>
                                        <span className="message-time">{message.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            
                            {isAiThinking && (
                                <div className="modal-message ai-message">
                                    <div className="message-bubble">
                                        <div className="thinking-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span className="message-time">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="modal-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Ask about your property listing..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isAiThinking}
                            />
                            <button type="submit" disabled={isAiThinking || !newMessage.trim()}>
                                <Send size={18} />
                            </button>
                        </form>

                        <div className="modal-suggestions">
                            {smartSuggestions.map((suggestion, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setNewMessage(suggestion)}
                                    disabled={isAiThinking}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewPostPage;