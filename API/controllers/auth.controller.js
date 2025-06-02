import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("pwd", hashedPassword);
        //create a new user and create to db
        const newUser = await prisma.user.create({
            data: {
                username, email, password: hashedPassword,
            }
        })

        res.status(201).json("user created successfully")
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Faild to create user!" });
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        //check if user exits
        const user = await prisma.user.findUnique({
            where: { username }
        })
        if (!user) return res.status(401).json("Invalid Credentials");
        //check if the password correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json("Invalid Credentials");
        //generate cookie token and send to the user
        // res.setHeader("Set-Cookie","test=" + "myValue").json("successfully login")
        // to generate random code - openssl rand -base64 32
        const age = 1000 * 60 * 60 * 24 * 7;

        const token = jwt.sign({
            id: user.id,
            isAdmin:false,
        },process.env.JWT_SECRET_KEY,{expiresIn:age});

        const {password:userPassword,...userInfo} = user;

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: age
        }).status(200).json(userInfo)



    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Faild to login!" });
    }
}
export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message:"Logout Successfully"});
}