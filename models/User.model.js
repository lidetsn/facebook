const mongoose=require("mongoose")
const schema=mongoose.Schema
const UserSchema=new schema({
    name: {
            type: String,
            trim: true,
            required: 'Name is required'
          },
      email: {
            type: String,
            trim: true,
            unique: 'Email already exists',
            match: [/.+\@.+\..+/, 'Please fill a valid email address'],
            required: 'Email is required'
      },
      password: {
                type: String,
                required: "Password is required"
      },
      salt: String,
      updated: Date,

      created: {
                type: Date,
                default: Date.now
      },
      about: {
                type: String,
               // trim: true
      },
      photo: {
                data: Buffer,
                contentType: String
      },
      following: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
      followers: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
    })
    

module.exports=User=mongoose.model("User",UserSchema)