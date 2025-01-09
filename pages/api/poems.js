import { mongooseConnect } from "@/lib/mongoose";
import { Progress } from "@/models/Progress";
import { Poems } from "@/models/Poems";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.id) {        
        const poem = await Poems.findOne({ _id: req.query.id });
        if (!poem) return res.status(200).json("Undefined");
        const unlockedPoems = await Progress.findOne()
        const unlockedPoem = unlockedPoems.unlockedPoems.includes(poem._id);
        if (!unlockedPoem) return res.status(200).json("Locked");
        return res.status(200).json(poem);
    } else {
        res.status(200).json( await Poems.find().sort({ id: 1 }) );
    }
}