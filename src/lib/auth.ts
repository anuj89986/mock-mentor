import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";

const authOptions:NextAuthOptions = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            id: "credentials",
            credentials:{
                email:{label:"Email",type:"text",placeholder:"Enter your email"},
                password:{label:"Password",type:"password",placeholder:"Enter your password"}
            },
            async authorize(credentials,req){
                await dbConnect();
                try {
                    if(!credentials?.email || !credentials?.password){
                        throw new Error("Email and password are required");
                    }
                    const user = await UserModel.findOne({
                        email: credentials.email
                    })
                    if(!user){
                        throw new Error("No user found with the provided email");
                    }
                    if(!user.password){
                        throw new Error("User has no password set");
                    }
                    const IsPasswordValid = await bcrypt.compare(credentials.password,user.password);
                    if(!IsPasswordValid){
                        throw new Error("Invalid password");
                    }
                    return {id: user._id.toString(),
                        email: user.email,
                        name: user.name
                    }
                } catch (error: any) {
                    throw new Error(error?.message || "Error occurred while fetching user");
                }
            }
            }
        ),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],
    callbacks:{
        async signIn({account,user}){
            if(account?.provider == "google"){
                await dbConnect();
                const existingUser = await UserModel.findOne({email: user.email});
                if(!existingUser){
                    const newUser = new UserModel({
                        name: user.name,
                        email: user.email,
                    });
                    await newUser.save();
                }
            }
            return true;
        },
        async jwt({token,account,user}){
            if(account?.provider == "google"){
                await dbConnect();
                const dbUser = await UserModel.findOne({email: token.email});
                if(dbUser){
                    token.id = dbUser._id.toString();
                    token.email = dbUser.email;
                    token.name = dbUser.name;
                }
            } else if(user){
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({session,token}){
            if(token){
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string
                }
            }
            return session;
        }

    },
    session:{
        strategy:"jwt",
        maxAge: 24 * 60 * 60,
    },
    pages:{
        signIn: "/auth/signin",
        error: "/auth/signin"
    },
    secret: process.env.NEXTAUTH_SECRET

}
export default authOptions