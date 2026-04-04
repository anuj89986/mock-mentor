import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";

export async function POST(req : Request){
    const {name,email,password} = await req.json();

    if(!email || !password){
        throw new Error("Email and password are required");
    }
    dbConnect();
    const existingUser = await UserModel.findOne({email});
    if(existingUser){
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await UserModel.create({name,email,password:hashedPassword});
    return NextResponse.json({message:"User registered successfully",userId:newUser._id});
}