import { mongooseConnect } from "@/lib/mongoose";
import { Poems } from "@/models/Poems";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.id) {        
        const poem = await Poems.findOne({ _id: req.query.id });
        if (!poem) return res.status(404).json({ error: "Poem not found" });
        return res.status(200).json(poem);
    } else {
        res.status(200).json( await Poems.find() );
    }
}