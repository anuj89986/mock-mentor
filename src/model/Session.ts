import mongoose,{Schema,Document} from "mongoose";

export interface IQuestion {
    questionNumber : number;
    questionText : string;
    questionType : string;
}

export interface ISession extends Document{
    userId : mongoose.Types.ObjectId;
    resumeId : mongoose.Types.ObjectId;
    report?: mongoose.Types.ObjectId;
    interviewStyle : string;
    initialQuestions : IQuestion[];
    status : string;
    createdAt?:Date;
}

const SessionSchema = new Schema<ISession>({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    resumeId:{
        type:mongoose.Types.ObjectId,
        ref:"Resume"
    },
    report:{
        type:mongoose.Types.ObjectId,
        ref:"Report",
        default:undefined
    },
    initialQuestions:{
        type:[{
            questionNumber : Number,
            questionText : String,
            questionType : String
        }],
        default:[]
    },
    interviewStyle:{
        type:String,
        enum:["technical","behavioral","mixed"],
        default:"technical"
    },
    status:{
        type:String,
        enum:["active","completed"],
        default:"active"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const SessionModel = (mongoose.models.Session as mongoose.Model<ISession>) || mongoose.model<ISession>("Session",SessionSchema);
export default SessionModel;
