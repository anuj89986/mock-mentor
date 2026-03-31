import mongoose,{Schema,Document} from "mongoose";

export interface IUser extends Document{
    name:String;
    email:String;
    password?:String;
    createdAt?:Date
}

const UserSchema = new Schema<IUser>({
    name:{
        type:String,
    },
    email:{
        type:String,
        required:[true,"Email is Required"],
        match : [/.+\@.+\..+/,"Please enter valid Email"]
    },
    password:{
        type : String,
        required:[true,"Password is Required"]
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User",UserSchema);
export default UserModel;