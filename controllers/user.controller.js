const User =require( '../models/user.model')
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// const router = express.Router();
// const gravatar = require('gravatar');
//const { check, validationResult } = require('express-validator/check');
//const errorHandler =require( './../helpers/dbErrorHandler')
//const formidable=require('formidable')
//const fs=require('fs')
//const profileImage =require( './../../client/assets/images/profile-pic.png')

//method 1
const create = async (req, res, next) => {
  
const { name, email, password } = req.body;    
try {
  let user = await User.findOne({ email });

  if (user) {
      return res
               .status(400)
                     .json({ errors: [{ msg: 'User already exists' }] });
     }
  user = new User({
                name,
                email,
                password
          });

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(password, salt);

  await user.save();

console.log(user)
  const payload = {
            user: {
              id: user.id
    }
  };

  jwt.sign(
    payload,
    config.get('jwtSecret'),
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server error');
}
}
//======method 2=============================
const list = async (req, res) => {

  try {
     let users=await User.find()
     if(users){
      res.json(users)
              //.select('name email updated created')
     } 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}
/**
 * Load user and append to req.
 */
//=====================method 3======================
const addFollowing = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {$push: {following: req.body.followId}}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    next()
   // res.json(result)
  })
}
//====================================================
//===========method 4===================
const addFollower = async (req, res) => {
  await User.findByIdAndUpdate(req.body.followId, {$push: {followers: req.user.id}}, {new: true})
  .populate('following', '_id name')
  .populate('followers', '_id name')

  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    // result.hashed_password = undefined
    // result.salt = undefined
    res.json(result)
  })
}
//===============================================
//===========method 5===============
const removeFollowing = async (req, res, next) => {
 await  User.findByIdAndUpdate(req.user.id, {$pull: {following: req.body.unfollowId}}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    next()
  })
}

//================method 6=================
const removeFollower = async (req, res) => {
 await  User.findByIdAndUpdate(req.body.unfollowId, {$pull: {followers: req.user.id}}, {new: true})
  .populate('following', '_id name')
  .populate('followers', '_id name')
  .exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    // result.hashed_password = undefined
    // result.salt = undefined
    res.json(result)
  })
}
//=====method 7 finds people who are not in the  following list ==========
const findPeople = async (req, res) => {
            
        let following = req.profile.following
        console.log(following)
        console.log("--------------------------------")
        console.log(req.profile._id)
        following.push(req.profile._id)
        console.log(following)
        
  await User.find({ _id: { $nin : following } }, (err, users) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.json(users)
  })
}

//====================method 8=====uses userById====read profile
const read = async (req, res) => {
             req.profile.password = undefined
             res.json(req.profile)
}
//=================method 9=======================
const remove = async (req, res, next) => {
  let user = req.profile
            //hasauthorized
            console.log(req.profile._id)
            console.log(req.user.id)
          const authorized = req.profile && req.profile._id == req.user.id
                        if (!(authorized)) {
                          return res.status('403').json({
                            error: "you are not  authorized"
                          })
                        }
  await user.remove((err, deletedUser) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler.getErrorMessage(err)
            })
          }
              deletedUser.hashed_password = undefined
              deletedUser.salt = undefined
              res.json(deletedUser)
        })
}
// ***************finds the followers and following of a user *********************
const userByID = async (req, res, next, id) => {
  await User.findById(id)
            .populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, user) => {
    if (err || !user) return res.status('400').json({
             error: "User not found"
    })
    req.profile = user
    console.log(user)
    next()
  })
}
//************************************************************ */
const update = (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }
    let user = req.profile
    user = _.extend(user, fields)
    user.updated = Date.now()
    if(files.photo){
      user.photo.data = fs.readFileSync(files.photo.path)
      user.photo.contentType = files.photo.type
    }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
      user.hashed_password = undefined
      user.salt = undefined
      res.json(user)
    })
  })
}
const photo = (req, res, next) => {
  if(req.profile.photo.data){
    res.set("Content-Type", req.profile.photo.contentType)
    return res.send(req.profile.photo.data)
  }
  next()
}

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd()+profileImage)
}
module.exports= {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  photo,
  defaultPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople
}
