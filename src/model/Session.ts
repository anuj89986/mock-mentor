import mongoose,{Schema,Document} from "mongoose";


export interface IQuestion {
    questionNumber : number;
    questionText : string;
}

export interface ISession extends Document{
    userId : mongoose.Types.ObjectId;
    resumeId : mongoose.Types.ObjectId;
    questions : IQuestion[];
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
    questions:{
        type:[{
            questionNumber : Number,
            questionText : String
        }],
        default:[]
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
