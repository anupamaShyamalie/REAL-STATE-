import express from "express";
import { deleteUser, getUser, getUsers, updateUser, savePost, unsavePost, getSavedPosts } from "../controllers/user.controller.js";
import {verifyToken} from "../middleware/verifyToken.js"

const router= express.Router();

router.get("/", verifyToken, getUsers)
router.get("/:id", verifyToken, getUser)
router.put("/:id", verifyToken, updateUser)
router.delete("/:id", verifyToken, deleteUser)
router.get("/saved", verifyToken, getSavedPosts)
router.post("/save", verifyToken, savePost)
router.post("/unsave", verifyToken, unsavePost)

export default router;