import mongoose, { model, Schema } from "mongoose"

const scubscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,  // one who has subscribe
        ref: 'User'
    },
    
    channel: {
        type: Schema.Types.ObjectId,  // one who has subscriber who is subscribing
        ref: 'User'
    }
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription", scubscriptionSchema)