import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
    try {
        console.log("getUsers called, userId:", req.userId);
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: req.userId // Exclude current user
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true
            }
        });
        console.log("Found users:", users);
        res.status(200).json(users)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get users!" })
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        res.status(200).json(user)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Faild to get user.! " })
    }
}

export const updateUser = async (req, res) => {

    const id = req.params.id;
    const tokenId = req.userId;
    const { password, avatar, ...inputs } = req.body;

    if (id !== tokenId) {
        return res.status(403).json({ message: "Not Authorized!" })
    }

    let updatedPassword = null;

    try {


        if (password) {
            updatedPassword = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...inputs,
                ...(updatedPassword && { password: updatedPassword }),
                ...(avatar && { avatar })


            },
        })

        const { password: UserPassword, ...rest } = updatedUser;
        res.status(200).json(rest)

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Faild to update user.! " })
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const tokenId = req.userId;

    if (id !== tokenId) {
        return res.status(403).json({ message: "Not Authorized!" })
    }
    try {

        await prisma.user.delete({
            where: { id }
        })
        res.status(200).json({ message: "User Deleted!" })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Faild to delete user.! " })
    }
}

// Save a post for the logged-in user
export const savePost = async (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ message: "Post ID is required" });
    try {
        // Create a SavedPost if it doesn't exist
        await prisma.savedPost.upsert({
            where: { userId_postId: { userId, postId } },
            update: {},
            create: { userId, postId }
        });
        res.status(200).json({ message: "Post saved" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to save post" });
    }
};

// Unsave a post for the logged-in user
export const unsavePost = async (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ message: "Post ID is required" });
    try {
        await prisma.savedPost.delete({
            where: { userId_postId: { userId, postId } }
        });
        res.status(200).json({ message: "Post unsaved" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to unsave post" });
    }
};

// Get all saved posts for the logged-in user
export const getSavedPosts = async (req, res) => {
    const userId = req.userId;
    try {
        const savedPosts = await prisma.savedPost.findMany({
            where: { userId },
            include: { post: true }
        });
        res.status(200).json(savedPosts.map(sp => sp.post));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get saved posts" });
    }
};