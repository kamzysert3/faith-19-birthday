import { model, models, Schema } from "mongoose";

const PoemSchema = new Schema({
    title: String,
    content: String,
}, {timestamps: true});

export const Poems = models?.Poems || model('Poems', PoemSchema);