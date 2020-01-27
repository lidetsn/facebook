const express =require("express")

const App=express()

const PORT=process.env.PORT||4000


App.listen(PORT,function(){
    console.log(`app is now  listining ${PORT}`)
})