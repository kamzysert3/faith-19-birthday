import { mongooseConnect } from "@/lib/mongoose";
import { Progress } from "@/models/Progress";
import { Stories } from "@/models/Stories";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.id) {        
        const story = await Stories.findOne({ _id: req.query.id });
        if (!story) return res.status(200).json("Undefined");
        const unlockedStories = await Progress.findOne()
        const unlockedStory = unlockedStories.unlockedStory.includes(story._id);
        if (!unlockedStory) return res.status(200).json("Locked");
        return res.status(200).json(story);
    } else {
        res.status(200).json( await Stories.find() );
    }
}