import { model, models, Schema } from "mongoose";

const StorySchema = new Schema({
    title: String,
    content: String,
}, {timestamps: true});

export const Stories = models?.Stories || model('Stories', StorySchema);