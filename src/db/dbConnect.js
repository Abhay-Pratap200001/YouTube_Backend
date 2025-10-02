import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDb Connected !! DB HOST: ✅✌️${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('MongoDb Connecetion Failed ', error);
        process.exit(1)
    }
}