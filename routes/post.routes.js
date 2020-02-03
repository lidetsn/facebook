const express=require('express')
const userCtrl =require( '../controllers/user.controller')
const authCtrl =require('../middleware/requireAuth')
const postCtrl =require( '../controllers/post.controller')

const router = express.Router()

//creating a post 
router.route('/new/:userId')
  .post(authCtrl, postCtrl.create)

  //get post by a user
router.route('/by/:userId')
  .get(authCtrl, postCtrl.listByUser)

  //list newsfeed
router.route('/feed/:userId')
  .get(authCtrl, postCtrl.listNewsFeed)

//like and unlike
router.route('/like')
  .put(authCtrl, postCtrl.like)
router.route('/unlike')
  .put(authCtrl, postCtrl.unlike)

//comment and uncomment
router.route('/comment')
  .put(authCtrl, postCtrl.comment)
router.route('/uncomment')
  .put(authCtrl, postCtrl.uncomment)
  
//remove post
router.route('/:postId')
  .delete(authCtrl, postCtrl.isPoster, postCtrl.remove)

  router.route('/photo/:postId')
  .get(postCtrl.photo)

router.param('userId', userCtrl.userByID)
router.param('postId', postCtrl.postByID)

module.exports=router
