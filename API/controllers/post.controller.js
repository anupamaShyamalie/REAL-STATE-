import prisma from "../lib/prisma.js";


export const getPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany();
        res.status(200).json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Faild to fetch posts" })
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id; // Should be req.params.id, not req.params
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                postDetails: true,
                user: {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
            }
        });
        res.status(200).json(post)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to fetch post" })
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    try {
        const newPost = await prisma.post.create({
            data: {
                ...body.postData,
                userId: tokenUserId,
                postDetails: {
                    create: body.postDetails,
                }
            }
        })

        res.status(200).json(newPost)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Faild to add posts" })
    }
}

export const updatePost = async (req, res) => {


    try {
        res.status(200).json()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Faild to update posts" })
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    try {

        const post = await prisma.post.findUnique({
            where: { id }
        })

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" })
        }

        await prisma.post.delete({
            where: { id }
        })

        res.status(200).json({ message: "Post deleted!" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Faild to delete posts" })
    }
}