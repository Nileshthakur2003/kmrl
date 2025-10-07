import CarStream from "../../../models/iotstream";
import connectDb from "../../dbconnect";

export async function POST(req) {
  await connectDb();

  let data;
  try {
    data = await req.json(); // ✅ parse JSON
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), { status: 400 });
  }

  try {
    const doc = await CarStream.create(data);
    return new Response(JSON.stringify({ success: true, doc }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
