import { model, models, Schema } from "mongoose";

const JourneySchema = new Schema({
    title: String,
    link: String,
    reward: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    rewardType: {
        type: String,
        enum: ['Poem', 'Story'],
        required: true,
    }
}, {timestamps: true});

export const Journey = models?.Journey || model('Journey', JourneySchema);