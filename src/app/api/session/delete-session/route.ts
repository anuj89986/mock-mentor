import dbConnect from "@/lib/dbConnect";
import SessionModel from "@/model/Session";

export async function DELETE(req: Request) {
  const {sessionId} = await req.json();
  if (!sessionId) {
    return new Response(JSON.stringify({error: "Missing sessionId"}), {status: 400});
  }
  dbConnect();
  try{
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return new Response(JSON.stringify({error: "Session not found"}), {status: 404});
    }
    await SessionModel.findByIdAndDelete(sessionId);
    return new Response(JSON.stringify({message: "Session deleted successfully"}), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({error: "Failed to delete session"}), {status: 500});
  }
}