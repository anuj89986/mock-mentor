import mongoose,{Schema,Document} from "mongoose";

export interface IResume extends Document{
    userId : mongoose.Types.ObjectId;
    extractedText : String;
    fileUrl : String;
    createdAt?:Date;
}

const ResumeSchema = new Schema<IResume>({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    extractedText:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const ResumeModel = (mongoose.models.Resume as mongoose.Model<IResume>) || mongoose.model<IResume>("Resume",ResumeSchema);
export default ResumeModel;