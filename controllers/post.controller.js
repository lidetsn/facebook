const Post =require('../models/post.model')
//import _ from 'lodash'
const errorHandler=require( '../helpers/dbErrorHandler')
const formidable=require('formidable')
const fs=require('fs')

const create =  async (req, res, next) => {
        let form = new formidable.IncomingForm()
        form.keepExtensions = true
          form.parse(req, (err, fields, files) => {
                if (err) {
                  return res.status(400).json({
                    error: "Image could not be uploaded"
                  })
                }
        let post = new Post(fields)
            post.postedBy= req.profile
        if(files.photo){
                post.photo.data = fs.readFileSync(files.photo.path)
                post.photo.contentType = files.photo.type
        }
      post.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
              })
            }
      res.json(result)
    })
  })
}


//list the post by a given user
const listByUser = async(req, res) => {
           await Post.find({postedBy: req.profile._id})
                .populate('comments', 'text created')
                .populate('comments.postedBy', '_id name')
                .populate('postedBy', '_id name')
                .sort('-created')
                .exec((err, posts) => {
                          if (err) {
                                return res.status(400).json({
                                  error: errorHandler.getErrorMessage(err)
                            })
                          }
              res.json(posts)
            })
}
//list all posts and comments by a user and following
const listNewsFeed =async (req, res) => {
          let following = req.profile.following
          following.push(req.profile._id)

          await Post.find({postedBy: { $in : req.profile.following } })
                    .populate('comments', 'text created')
                    .populate('comments.postedBy', '_id name')
                    .populate('postedBy', '_id name')
                    .sort('-created')
                    .exec((err, posts) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
              })
            }
            res.json(posts)
          })
}

const like = async (req, res) => {
            await Post.findByIdAndUpdate(req.body.postId, {$push: {likes: req.user.id}}, {new: true})
                      .exec((err, result) => {
                        if (err) {
                          return res.status(400).json({
                            error: errorHandler.getErrorMessage(err)
                          })
                        }
         res.json(result)
  })
}

const unlike = async (req, res) => {
              await Post.findByIdAndUpdate(req.body.postId, {$pull: {likes: req.user.id}}, {new: true})
                        .exec((err, result) => {
                          if (err) {
                            return res.status(400).json({
                              error: errorHandler.getErrorMessage(err)
                            })
                          }
                res.json(result)
              })
}


const comment = async (req, res) => {
            let comment = req.body.comment
                  comment.postedBy = req.user.id
            await Post.findByIdAndUpdate(req.body.postId, {$push: {comments: comment}}, {new: true})
                      .populate('comments.postedBy', '_id name')
                      .populate('postedBy', '_id name')
                      .exec((err, result) => {
                        if (err) {
                          return res.status(400).json({
                            error: errorHandler.getErrorMessage(err)
                          })
                        }
                        res.json(result)
            })
}
const uncomment = async (req, res) => {
          let comment = req.body.comment
          await Post.findByIdAndUpdate(req.body.postId, {$pull: {comments: {_id: comment._id}}}, {new: true})
                  .populate('comments.postedBy', '_id name')
                  .populate('postedBy', '_id name')
                  .exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
              })
            }
            res.json(result)
          })
}
const remove = async (req, res) => {
  let post = req.post
    await post.remove((err, deletedPost) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
              })
            }
      res.json(deletedPost)
    })
}

const photo = (req, res, next) => {
    res.set("Content-Type", req.post.photo.contentType)
    return res.send(req.post.photo.data)
}

//check a user is the poster of the post
const isPoster = (req, res, next) => {
  let isPoster = req.post  && req.post.postedBy._id == req.user.id
  if(!isPoster){
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}
//*******************************handle param by postId******************************* */
const postByID = (req, res, next, id) => {
  Post.findById(id).populate('postedBy', '_id name').exec((err, post) => {
    if (err || !post)
      return res.status('400').json({
        error: "Post not found"
      })
    req.post = post
    next()
  })
}
//********************************************************************* */

module.exports= {
          listByUser,
          listNewsFeed,
          create,
          postByID,
          remove,
          photo,
          like,
          unlike,
          comment,
          uncomment,
          isPoster
}
