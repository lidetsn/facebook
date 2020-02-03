const express =require("express")
const connectDb=require("./config/db")

const App=express()

const PORT=process.env.PORT||4000

connectDb()
App.use(express.json({ extended: false }));
// Define Routes
App.use('/api/users/', require('./routes/user.routes'));
App.use('/api/auth/', require('./routes/auth.routes'));
App.use('/api/posts', require('./routes/post.routes'));


App.listen(PORT,function(){
      console.log(`app is now  listining ${PORT}`)
})