import { mongooseConnect } from "@/lib/mongoose";
import { Journey } from "@/models/Journey";
import { Progress } from "@/models/Progress";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.items == "poems") {
        const unlockedPoems = await Progress.findOne()   
        if (!unlockedPoems) return res.status(404).json({ error: "Poem progress not found" });
        return res.status(200).json(unlockedPoems.unlockedPoems);
    } else if (req.query?.items == "stories") {
        const unlockedStories = await Progress.findOne()   
        if (!unlockedStories) return res.status(404).json({ error: "Story progress not found" });
        return res.status(200).json(unlockedStories.unlockedStory);
    } else if (req.query?.items == "journey") {
        const progressBar = await Progress.findOne()  
        const JourneyProgress = await Journey.find()
        if (typeof progressBar.progressBar !== "number" || progressBar.progressBar < 0) {
            return res.status(400).json({ error: "Invalid progress bar value" });
        }             
        const unlockedJourney = JourneyProgress.slice(0, progressBar.progressBar + 1);        
        if (!unlockedJourney) return res.status(404).json({ error: "Journey progress not found" });
        return res.status(200).json(unlockedJourney);
    } else {        
        const progressBar = await Progress.findOne()                
        res.status(200).json( progressBar.progressBar );
    }
}