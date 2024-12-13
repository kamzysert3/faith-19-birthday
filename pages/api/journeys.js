import { mongooseConnect } from "@/lib/mongoose";
import { Journey } from "@/models/Journey";
import { Poems } from "@/models/Poems";
import { Stories } from "@/models/Stories";

export default async function handler(req, res) {
    await mongooseConnect();
    if (req.query?.id) {        
        const journey = await Journey.find();
        if (!journey) return res.status(404).json({ error: "Journey not found" });
        
        const RequestedJourney = journey[req.query.id];
        if (!RequestedJourney) return res.status(404).json({ error: "Journey not found" });

        let RequestedJourneyReward;

        if (RequestedJourney.rewardType === 'Poem') {
            RequestedJourneyReward = await Poems.findOne({ _id: RequestedJourney.reward });
        } else if (RequestedJourney.rewardType === 'Story') {
            RequestedJourneyReward = await Stories.findOne({ _id: RequestedJourney.reward });
        } else {
            return res.status(400).json({ error: "Invalid reward type" });
        }

        return res.status(200).json({
            journey: RequestedJourney,
            reward: RequestedJourneyReward,
        });
    } else {
        res.status(200).json( await Journey.find() );
    }
}