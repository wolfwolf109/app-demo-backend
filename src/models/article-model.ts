import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        unique: false,
    },
    paragraph: {
        type: String,
        required: [true, 'Please provide the paragraph'],
        unique: false
    }
})

const Article = mongoose.model("Article", articleSchema)

export {Article}