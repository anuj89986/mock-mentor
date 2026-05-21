import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import authOptions from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import SessionModel from '@/model/Session';

export async function POST(request: Request) {
    const {interviewStyle , resumeId} = await request.json();
    const session = await getServerSession(authOptions);
    connectDB();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!interviewStyle || !resumeId) {
        return NextResponse.json({ error: 'Missing interviewStyle or resumeId' }, { status: 400 });
    }
    const userId = session?.user?.id.toString();

    const newSession = await SessionModel.create({ interviewStyle, resumeId, userId });
    if(!newSession){
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
    return NextResponse.json({ sessionId: newSession._id.toString() }, { status: 201 });
    
}