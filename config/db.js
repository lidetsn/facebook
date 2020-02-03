const mongoose=require("mongoose")
const config=require("config")

const localURI=config.get("localdb")

const mongoURI=config.get("mongoURI")

const connectDb=async ()=>{
    
    try {
        await mongoose.connect(
                                 localURI,{
                                          useNewUrlParser: true,
                                           useCreateIndex: true,
                                           useFindAndModify: false,
                                           useUnifiedTopology: true
                                           }
                                 );
        console.log("mongo db now connected ")
    } catch (error) {
        console.log(error.message)
        process.exit(1)
        
    }
}
module.exports=connectDb