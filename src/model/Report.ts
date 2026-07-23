import mongoose,{Schema,Document} from "mongoose";

interface IReport extends Document{
    sessionId : mongoose.Types.ObjectId;
    userId : mongoose.Types.ObjectId;
    overallScore : number;
    technicalScore : number;
    communicationScore : number;
    confidenceScore : number;
    resumeConsistencyScore : number;
    strengths : string[];
    weaknesses : string[];
    summary : string;
    improvements : string[];
    createdAt?:Date;
}



const ReportSchema = new Schema<IReport>({
    sessionId:{
        type:mongoose.Types.ObjectId,
        ref:"Session",
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    overallScore:{
        type:Number
    },
    technicalScore:{
        type:Number
    },
    communicationScore:{
        type:Number
    },
    confidenceScore:{
        type:Number
    },
    resumeConsistencyScore:{
        type:Number
    },
    strengths:{
        type:[String]
    },
    weaknesses:{
        type:[String]
    },
    summary:{
        type:String
    },
    improvements:{
        type:[String]
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const ReportModel = (mongoose.models.Report as mongoose.Model<IReport>) || mongoose.model<IReport>("Report",ReportSchema);
export default ReportModel;