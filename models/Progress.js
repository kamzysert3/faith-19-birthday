import { model, models, Schema } from "mongoose";

const ProgressSchema = new Schema({
    unlockedPoems: {
        type: [Schema.Types.ObjectId],
        ref: 'Poems'
    },
    unlockedStory: {
        type: [Schema.Types.ObjectId],
        ref: 'Story'
    },
    progressBar: {
        type: Number,
        default: 0
    }
});

export const Progress = models?.Progress || model('Progress', ProgressSchema);