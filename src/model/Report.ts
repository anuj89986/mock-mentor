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
    hireRecommendation : {
        decision : string;
        level : string;
        recommendedConfidence : number;
    };
    improvements : string[];
    resumeAnalysis : {
        claimedSkills : string[];
        validatedSkills : string[];
        missingDepthAreas : string[];
        strongAreas : string[];
    };
    questionAnalysis :object[];
    finalVerdict : string;
    createdAt?:Date;
}

const HireRecommendationSchema = new Schema({
    decision:{
        type:String,
    },
    level:{
        type:String,
    },
    recommendedConfidence:{
        type:Number,
    }
});

const ResumeAnalysisSchema = new Schema({
    claimedSkills:{
        type:[String]
    },
    validatedSkills:{
        type:[String]
    },
    missingDepthAreas:{
        type:[String]
    },
    strongAreas:{
        type:[String]
    }
});

const QuestionAnalysisSchema = new Schema({
    question:{
        type:String
    },
    questionType:{
        type:String
    },
    analysis:{
        type:String
    },
    score:{
        type:Number
    }
});

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
    hireRecommendation:{
        type:HireRecommendationSchema
    },
    improvements:{
        type:[String]
    },
    resumeAnalysis:{
        type:ResumeAnalysisSchema
    },
    questionAnalysis:{
        type:[QuestionAnalysisSchema]
    },
    finalVerdict:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const ReportModel = (mongoose.models.Report as mongoose.Model<IReport>) || mongoose.model<IReport>("Report",ReportSchema);
export default ReportModel;