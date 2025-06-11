import { useState, useRef, useEffect } from "react";
import "./newPost.scss";
import { useNavigate } from "react-router";
import apiRequest from "../../lib/apiRequest";
import CloudinaryUploadWidget from "../../component/upload/CloudinaryUploadWidget";


function NewPostPage() {
    const [files, setFiles] = useState([]);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI real estate assistant. How can I help you today?", sender: "ai", timestamp: "10:30 AM" },
        { id: 2, text: "I need help filling out this property listing form.", sender: "user", timestamp: "10:31 AM" },
        { id: 3, text: "Of course! I can guide you through each section. What information about your property would you like help with first?", sender: "ai", timestamp: "10:31 AM" },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    // Cloudinary configuration
    const uwConfig = {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dblwkkext",
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "estate",
        multiple: true,
        maxFiles: 10,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
        maxFileSize: 15000000, // 15MB
        folder: "real-estate-posts"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        const formData = new FormData(e.target);
        const inputs = Object.fromEntries(formData);
        
        // Validate required fields
        if (!inputs.title || !inputs.price || !inputs.address) {
            setError("Please fill in all required fields (Title, Price, Address)");
            return;
        }

        try {
            const postData = {
                title: inputs.title,
                price: parseInt(inputs.price),
                images: uploadedImages, // Array of Cloudinary URLs
                address: inputs.address,
                city: inputs.city,
                bedroom: parseInt(inputs.bedroom) || 1,
                bathroom: parseInt(inputs.bathroom) || 1,
                latitude: inputs.latitude,
                longitude: inputs.longitude,
                type: inputs.type, // "buy" or "rent"
                property: inputs.property // "apartment", "house", "condo", "land"
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

            const res = await apiRequest.post('/posts', {
                postData,
                postDetails
            });

            console.log("Post created successfully:", res.data);
            navigate("/list");
            
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Failed to create post. Please try again.");
        }
    };

    // Handle multiple image uploads from Cloudinary
    const handleImageUpload = (imageUrl) => {
        setUploadedImages(prev => [...prev, imageUrl]);
    };

    // Remove uploaded image
    const removeUploadedImage = (imageUrl) => {
        setUploadedImages(prev => prev.filter(url => url !== imageUrl));
    };

    // Auto-scroll to the bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // const handleFileChange = (e) => {
    //     const selectedFiles = Array.from(e.target.files);
    //     addNewFiles(selectedFiles);
    // };

    (newFiles) => {
        // Filter for only image files
        const validImageFiles = newFiles.filter(file =>
            file.type.startsWith('image/') &&
            ['jpeg', 'jpg', 'png', 'gif'].includes(file.type.split('/')[1].toLowerCase())
        );

        // Create preview URLs for the valid files
        const newFilesWithPreview = validImageFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(2),
            preview: URL.createObjectURL(file)
        }));

        setFiles(prevFiles => [...prevFiles, ...newFilesWithPreview]);
    };

    // const handleDragEnter = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setIsDragging(true);
    // };

    // const handleDragLeave = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setIsDragging(false);
    // };

    // const handleDragOver = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if (!isDragging) setIsDragging(true);
    // };

    // const handleDrop = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setIsDragging(false);

    //     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    //         addNewFiles(Array.from(e.dataTransfer.files));
    //     }
    // };

    // const removeFile = (id) => {
    //     setFiles(prevFiles => {
    //         const newFiles = prevFiles.filter(file => file.id !== id);
    //         // Free up memory from the URL
    //         const fileToRemove = prevFiles.find(file => file.id === id);
    //         if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
    //         return newFiles;
    //     });
    // };

    // const triggerFileInput = () => {
    //     fileInputRef.current.click();
    // };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: newMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, userMessage]);
        setNewMessage("");

        // Simulate AI response after a short delay
        setTimeout(() => {
            const aiResponses = [
                "I recommend adding detailed descriptions about the neighborhood amenities to attract more potential buyers.",
                "For rental properties, it's good to mention utilities policy clearly in the description.",
                "Don't forget to add high-quality images of all rooms to showcase your property well.",
                "The average price for similar properties in this area is about $1,200 per month for rentals.",
                "Based on your property details, you might want to highlight the proximity to schools and public transport."
            ];

            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

            const aiMessage = {
                id: messages.length + 2,
                text: randomResponse,
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prevMessages => [...prevMessages, aiMessage]);
        }, 1000);
    };

    return (
        <div className="newPostPage">
            <div className="formContainer">
                <h1>Add New Post</h1>

                {/* Cloudinary Image Upload Section */}
                <div className="imageUploadSection">
                    <h3>Property Images</h3>
                    <CloudinaryUploadWidget 
                        uwConfig={uwConfig} 
                        setavatar={handleImageUpload}
                    />
                    
                    {/* Display uploaded images */}
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
                            <input id="title" name="title" type="text" required />
                        </div>
                        <div className="item">
                            <label htmlFor="price">Price *</label>
                            <input id="price" name="price" type="number" required />
                        </div>
                        <div className="item">
                            <label htmlFor="address">Address *</label>
                            <input id="address" name="address" type="text" required />
                        </div>
                        <div className="item description">
                            <label htmlFor="desc">Description</label>
                            <textarea id="desc" name="desc" className="descriptionTextArea" />
                        </div>

                        <div className="item">
                            <label htmlFor="city">City</label>
                            <input id="city" name="city" type="text" />
                        </div>
                        <div className="item">
                            <label htmlFor="bedroom">Bedroom Number</label>
                            <input min={1} id="bedroom" name="bedroom" type="number" defaultValue="1" />
                        </div>
                        <div className="item">
                            <label htmlFor="bathroom">Bathroom Number</label>
                            <input min={1} id="bathroom" name="bathroom" type="number" defaultValue="1" />
                        </div>
                        <div className="item">
                            <label htmlFor="latitude">Latitude</label>
                            <input id="latitude" name="latitude" type="text" />
                        </div>
                        <div className="item">
                            <label htmlFor="longitude">Longitude</label>
                            <input id="longitude" name="longitude" type="text" />
                        </div>
                        <div className="item">
                            <label htmlFor="type">Type</label>
                            <select name="type" defaultValue="rent">
                                <option value="rent">Rent</option>
                                <option value="buy">Buy</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="property">Property</label>
                            <select name="property" defaultValue="apartment">
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                                <option value="land">Land</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="utilities">Utilities Policy</label>
                            <select name="utilities" defaultValue="owner">
                                <option value="owner">Owner is responsible</option>
                                <option value="tenant">Tenant is responsible</option>
                                <option value="shared">Shared</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="pet">Pet Policy</label>
                            <select name="pet" defaultValue="allowed">
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
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="size">Total Size (sqft)</label>
                            <input min={0} id="size" name="size" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="school">School Distance</label>
                            <input min={0} id="school" name="school" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="bus">Bus Stop Distance</label>
                            <input min={0} id="bus" name="bus" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="restaurant">Restaurant Distance</label>
                            <input min={0} id="restaurant" name="restaurant" type="number" />
                        </div>
                        <button className="sendButton" type="submit">
                            Add Property
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
                                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1 20v-6h2v6h-2zm1-10c-3.3 0-6-2.7-6-6h2c0 2.2 1.8 4 4 4s4-1.8 4-4h2c0 3.3-2.7 6-6 6z" />
                                </svg>
                            </div>
                            <h3>Real Estate Assistant</h3>
                        </div>
                        <div className="chatActions">
                            <button className="actionButton">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                            </button>
                            <button className="actionButton">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
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
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="messageInput" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Ask about your property listing..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>

                    <div className="suggestionChips">
                        <button onClick={() => setNewMessage("What's a good price for my property?")}>
                            Suggest pricing
                        </button>
                        <button onClick={() => setNewMessage("Help me write a description")}>
                            Write description
                        </button>
                        <button onClick={() => setNewMessage("What amenities should I highlight?")}>
                            Key amenities
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewPostPage;