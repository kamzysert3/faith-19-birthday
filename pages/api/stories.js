import { mongooseConnect } from "@/lib/mongoose";
import { Stories } from "@/models/Stories";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.id) {        
        const story = await Stories.findOne({ _id: req.query.id });
        if (!story) return res.status(404).json({ error: "Story not found" });
        return res.status(200).json(story);
    } else {
        res.status(200).json( await Stories.find() );
    }
}