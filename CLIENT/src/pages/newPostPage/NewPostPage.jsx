// 4. Updated NewPostPage component with Gemini integration
import { useState, useRef, useEffect } from "react";
import "./newPost.scss";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import CloudinaryUploadWidget from "../../component/upload/CloudinaryUploadWidget";
import { GeminiChatService } from "../../lib/geminiService";

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
            });
        }
    }, [isEditMode, params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        const formData = new FormData(e.target);
        const inputs = Object.fromEntries(formData);
        
        if (!inputs.title || !inputs.price || !inputs.address) {
            setError("Please fill in all required fields (Title, Price, Address)");
            return;
        }

        try {
            const postData = {
                title: inputs.title,
                price: parseInt(inputs.price),
                images: uploadedImages,
                address: inputs.address,
                city: inputs.city,
                bedroom: parseInt(inputs.bedroom) || 1,
                bathroom: parseInt(inputs.bathroom) || 1,
                latitude: inputs.latitude,
                longitude: inputs.longitude,
                type: inputs.type,
                property: inputs.property
            };

            const postDetails = {
                desc: inputs.desc || "",
                utilities: inputs.utilities,
                pet: inputs.pet,
                income: inputs.income,
                size: parseInt(inputs.size) || null,
                school: parseInt(inputs.school) || null,
                bus: parseInt(inputs.bus) || null,
                restaurant: parseInt(inputs.restaurant) || null
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
            // Send message to Gemini with property context
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

    // Generate smart suggestions based on current form data
    const smartSuggestions = geminiService.getSmartSuggestions(currentPropertyData);

    return (
        <div className="newPostPage">
            <div className="formContainer">
                <h1>{isEditMode ? 'Edit Post' : 'Add New Post'}</h1>

                <div className="imageUploadSection">
                    <h3>Property Images</h3>
                    <CloudinaryUploadWidget 
                        uwConfig={uwConfig} 
                        setavatar={handleImageUpload}
                    />
                    
                    {uploadedImages.length > 0 && (
                        <div className="uploadedImagesContainer">
                            <h4>Uploaded Images ({uploadedImages.length})</h4>
                            <div className="uploadedImagesGrid">
                                {uploadedImages.map((imageUrl, index) => (
                                    <div key={index} className="uploadedImageItem">
                                        <img src={imageUrl} alt={`Property ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="removeImageBtn"
                                            onClick={() => removeUploadedImage(imageUrl)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="wrapper">
                    <form onSubmit={handleSubmit}>
                        <div className="item">
                            <label htmlFor="title">Title *</label>
                            <input 
                                id="title" 
                                name="title" 
                                type="text" 
                                required 
                                value={currentPropertyData.title || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="price">Price *</label>
                            <input 
                                id="price" 
                                name="price" 
                                type="number" 
                                required 
                                value={currentPropertyData.price || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="address">Address *</label>
                            <input 
                                id="address" 
                                name="address" 
                                type="text" 
                                required 
                                value={currentPropertyData.address || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item description">
                            <label htmlFor="desc">Description</label>
                            <textarea 
                                id="desc" 
                                name="desc" 
                                className="descriptionTextArea" 
                                value={currentPropertyData.desc || ''}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="item">
                            <label htmlFor="city">City</label>
                            <input 
                                id="city" 
                                name="city" 
                                type="text" 
                                value={currentPropertyData.city || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="bedroom">Bedroom Number</label>
                            <input 
                                min={1} 
                                id="bedroom" 
                                name="bedroom" 
                                type="number" 
                                value={currentPropertyData.bedroom || 1}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="bathroom">Bathroom Number</label>
                            <input 
                                min={1} 
                                id="bathroom" 
                                name="bathroom" 
                                type="number" 
                                value={currentPropertyData.bathroom || 1}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="latitude">Latitude</label>
                            <input 
                                id="latitude" 
                                name="latitude" 
                                type="text" 
                                value={currentPropertyData.latitude || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="longitude">Longitude</label>
                            <input 
                                id="longitude" 
                                name="longitude" 
                                type="text" 
                                value={currentPropertyData.longitude || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="type">Type</label>
                            <select 
                                name="type" 
                                value={currentPropertyData.type || 'rent'}
                                onChange={handleFormChange}
                            >
                                <option value="rent">Rent</option>
                                <option value="buy">Buy</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="property">Property</label>
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
                        <div className="item">
                            <label htmlFor="utilities">Utilities Policy</label>
                            <select name="utilities" value={currentPropertyData.utilities || 'owner'} onChange={handleFormChange}>
                                <option value="owner">Owner is responsible</option>
                                <option value="tenant">Tenant is responsible</option>
                                <option value="shared">Shared</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="pet">Pet Policy</label>
                            <select name="pet" value={currentPropertyData.pet || 'allowed'} onChange={handleFormChange}>
                                <option value="allowed">Allowed</option>
                                <option value="not-allowed">Not Allowed</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="income">Income Policy</label>
                            <input
                                id="income"
                                name="income"
                                type="text"
                                placeholder="Income Policy"
                                value={currentPropertyData.income || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="size">Total Size (sqft)</label>
                            <input 
                                min={0} 
                                id="size" 
                                name="size" 
                                type="number" 
                                value={currentPropertyData.size || ''}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="school">School Distance</label>
                            <input min={0} id="school" name="school" type="number" value={currentPropertyData.school || ''} onChange={handleFormChange} />
                        </div>
                        <div className="item">
                            <label htmlFor="bus">Bus Stop Distance</label>
                            <input min={0} id="bus" name="bus" type="number" value={currentPropertyData.bus || ''} onChange={handleFormChange} />
                        </div>
                        <div className="item">
                            <label htmlFor="restaurant">Restaurant Distance</label>
                            <input min={0} id="restaurant" name="restaurant" type="number" value={currentPropertyData.restaurant || ''} onChange={handleFormChange} />
                        </div>
                        <button className="sendButton" type="submit">
                            {isEditMode ? 'Update Property' : 'Add Property'}
                        </button>
                        {error && <span style={{color:"red", fontSize:"14px", marginTop:"10px", display:"block"}}>{error}</span>}
                    </form>
                </div>
            </div>
            
            <div className="sideContainer">
                <div className="chatbot">
                    <div className="chatHeader">
                        <div className="chatInfo">
                            <div className="aiAvatar">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>
                            </div>
                            <h3>Gemini AI Assistant</h3>
                        </div>
                        <div className="chatActions">
                            <button 
                                className="actionButton"
                                onClick={() => {
                                    setMessages([{
                                        id: 1,
                                        text: "Hello! I'm your AI real estate assistant powered by Google Gemini. I can help you create an amazing property listing. What would you like to know?",
                                        sender: "ai",
                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    }]);
                                    geminiService.clearHistory();
                                }}
                                title="Clear Chat"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="messageContainer">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === 'user' ? 'userMessage' : 'aiMessage'}`}
                            >
                                <div className="messageContent">
                                    <p>{message.text}</p>
                                    <span className="timestamp">{message.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        
                        {isAiThinking && (
                            <div className="message aiMessage">
                                <div className="messageContent">
                                    <div className="thinking-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="timestamp">Thinking...</span>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="messageInput" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Ask about your property listing..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isAiThinking}
                        />
                        <button type="submit" disabled={isAiThinking}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>

                    <div className="suggestionChips">
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
        </div>
    );
}

export default NewPostPage;