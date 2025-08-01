import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, city, property, bedroom, bathroom, userId } = req.query;
        
        // Build filter conditions
        const whereConditions = {};
        
        if (type && (type === 'buy' || type === 'rent')) {
            whereConditions.type = type;
        }
        
        if (minPrice || maxPrice) {
            whereConditions.price = {};
            if (minPrice) whereConditions.price.gte = parseInt(minPrice);
            if (maxPrice) whereConditions.price.lte = parseInt(maxPrice);
        }
        
        if (city) {
            whereConditions.city = {
                contains: city,
                mode: 'insensitive'
            };
        }
        
        if (property) {
            whereConditions.property = property;
        }
        
        if (bedroom) {
            whereConditions.bedroom = parseInt(bedroom);
        }
        
        if (bathroom) {
            whereConditions.bathroom = parseInt(bathroom);
        }

        // Add userId filter if provided
        if (userId) {
            whereConditions.userId = userId;
        }
        
        // Get posts with filters
        const posts = await prisma.post.findMany({
            where: whereConditions,
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        // Get user info for each post that has a valid userId
        const postsWithUsers = await Promise.all(
            posts.map(async (post) => {
                try {
                    if (post.userId) {
                        const user = await prisma.user.findUnique({
                            where: { id: post.userId },
                            select: {
                                username: true,
                                avatar: true
                            }
                        });
                        
                        return {
                            ...post,
                            user: user || { username: "Unknown User", avatar: null }
                        };
                    }
                    
                    return {
                        ...post,
                        user: { username: "Unknown User", avatar: null }
                    };
                } catch {
                    return {
                        ...post,
                        user: { username: "Unknown User", avatar: null }
                    };
                }
            })
        );
        
        res.status(200).json(postsWithUsers);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to fetch posts" })
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        // First get the post without including user
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                postDetails: true
            }
        });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Then try to get the user info separately
        let user = null;
        if (post.userId) {
            try {
                user = await prisma.user.findUnique({
                    where: { id: post.userId },
                    select: {
                        username: true,
                        avatar: true
                    }
                });
            } catch (err) {
                console.log("Error fetching user:", err);
            }
        }
        
        // Return post with user info (or default if user not found)
        const postWithUser = {
            ...post,
            user: user || { username: "Unknown User", avatar: null }
        };
        
        res.status(200).json(postWithUser);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to fetch post" })
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    
    try {
        let postData, postDetails;
        
        // Check if the request has nested structure (postData and postDetails)
        if (body.postData) {
            postData = body.postData;
            postDetails = body.postDetails;
        } else {
            // Handle flat structure - extract post fields and detail fields
            const {
                title,
                price,
                images,
                address,
                city,
                bedroom,
                bathroom,
                latitude,
                longitude,
                type,
                property,
                // PostDetail fields
                desc,
                utilities,
                pet,
                income,
                size,
                school,
                bus,
                restaurant,
                ...rest
            } = body;
            
            postData = {
                title,
                price,
                images,
                address,
                city,
                bedroom,
                bathroom,
                latitude,
                longitude,
                type: type || 'rent', // Default to 'rent' if not provided
                property: property || 'apartment' // Default to 'apartment' if not provided
            };
            
            // Only include postDetails if desc is provided or other detail fields exist
            if (desc || utilities || pet || income || size || school || bus || restaurant) {
                postDetails = {
                    desc: desc || "",
                    utilities,
                    pet,
                    income,
                    size,
                    school,
                    bus,
                    restaurant
                };
            }
        }
        
        // Validate required fields
        if (!postData.title) {
            return res.status(400).json({ message: "Title is required" });
        }
        
        // Validate enum values
        const validTypes = ['buy', 'rent'];
        const validProperties = ['apartment', 'house', 'condo', 'land'];
        
        if (postData.type && !validTypes.includes(postData.type)) {
            return res.status(400).json({ message: "Invalid type. Must be 'buy' or 'rent'" });
        }
        
        if (postData.property && !validProperties.includes(postData.property)) {
            return res.status(400).json({ message: "Invalid property type. Must be 'apartment', 'house', 'condo', or 'land'" });
        }
        
        // Create the post
        const createData = {
            ...postData,
            userId: tokenUserId,
        };
        
        // Add postDetails if they exist
        if (postDetails) {
            createData.postDetails = {
                create: postDetails
            };
        }
        
        console.log('Creating post with data:', JSON.stringify(createData, null, 2));
        
        const newPost = await prisma.post.create({
            data: createData,
            include: {
                postDetails: true,
                user: {
                    select: {
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(201).json(newPost)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to add post" })
    }
}

export const updatePost = async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const tokenUserId = req.userId;
    
    try {
        // Check if user owns the post
        const existingPost = await prisma.post.findUnique({
            where: { id }
        });
        
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        if (existingPost.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" });
        }
        
        let postData, postDetails;
        
        // Handle nested or flat structure
        if (body.postData) {
            postData = body.postData;
            postDetails = body.postDetails;
        } else {
            const {
                title,
                price,
                images,
                address,
                city,
                bedroom,
                bathroom,
                latitude,
                longitude,
                type,
                property,
                // PostDetail fields
                desc,
                utilities,
                pet,
                income,
                size,
                school,
                bus,
                restaurant,
                ...rest
            } = body;
            
            postData = {
                title,
                price,
                images,
                address,
                city,
                bedroom,
                bathroom,
                latitude,
                longitude,
                type,
                property
            };
            
            if (desc !== undefined || utilities !== undefined || pet !== undefined || 
                income !== undefined || size !== undefined || school !== undefined || 
                bus !== undefined || restaurant !== undefined) {
                postDetails = {
                    desc,
                    utilities,
                    pet,
                    income,
                    size,
                    school,
                    bus,
                    restaurant
                };
            }
        }
        
        const updateData = {
            ...postData
        };
        
        // Handle postDetails update
        if (postDetails) {
            updateData.postDetails = {
                upsert: {
                    create: postDetails,
                    update: postDetails
                }
            };
        }
        
        const updatedPost = await prisma.post.update({
            where: { id },
            data: updateData,
            include: {
                postDetails: true,
                user: {
                    select: {
                        username: true,
                        avatar: true
                    }
                }
            }
        });
        
        res.status(200).json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to update post" })
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    console.log('Attempting to delete post:', { id, tokenUserId });
    try {
        const post = await prisma.post.findUnique({
            where: { id }
        });
        console.log('Found post:', post);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        // Delete related PostDetail records first
        await prisma.postDetail.deleteMany({
            where: { postId: id }
        });

        // Delete related SavedPost records
        await prisma.savedPost.deleteMany({
            where: { postId: id }
        });

        await prisma.post.delete({
            where: { id }
        });

        res.status(200).json({ message: "Post deleted!" })
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ message: "Failed to delete post", error: err.message })
    }
}

export const getLocations = async (req, res) => {
    try {
        const locations = await prisma.post.findMany({
            select: {
                city: true
            },
            distinct: ['city']
        });
        
        const cities = locations
            .map(location => location.city)
            .filter(city => city && city.trim() !== '')
            .sort();
        
        res.status(200).json(cities);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to fetch locations" });
    }
}