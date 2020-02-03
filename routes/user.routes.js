const express=require('express')
const userCtrl =require('../controllers/user.controller')
const authCtrl =require( '../middleware/requireAuth')

const router = express.Router()

//api/users
router.route('/')
          .get(userCtrl.list)
          .post(userCtrl.create)

router.route('/follow')
          .put(authCtrl, userCtrl.addFollowing, userCtrl.addFollower)

router.route('/unfollow')
          .put(authCtrl, userCtrl.removeFollowing, userCtrl.removeFollower)

 
router.route('/findpeople/:userId')    
          .get(authCtrl, userCtrl.findPeople)

router.route('/:userId')
          .get(authCtrl, userCtrl.read)
          .delete(authCtrl,userCtrl.remove)//.delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)
          //.put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
     

router.param('userId', userCtrl.userByID)
/*
router.route('/photo/:userId')
  .get(userCtrl.photo, userCtrl.defaultPhoto)
router.route('/defaultphoto')
  .get(userCtrl.defaultPhoto)

*/


module.exports=router