import prisma from "../lib/prisma.js";

export const getPosts = async (req, res) => {
    try {
        // First, let's try a simpler approach - get all posts and handle null users
        const posts = await prisma.post.findMany();
        
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
                type,
                property
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
    
    try {
        const post = await prisma.post.findUnique({
            where: { id }
        });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        await prisma.post.delete({
            where: { id }
        });

        res.status(200).json({ message: "Post deleted!" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to delete post" })
    }
}