const User =require('../models/user.model')
const jwt =require( 'jsonwebtoken')
//const expressJwt =require('express-jwt')
const config=require('config')
const bcrypt = require('bcryptjs');

//=======method 1=======
const signin=async (req, res,next) => {

  const { email, password } = req.body;

   try {
         let user = await User.findOne({ email });

          if (!user) {
                  return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

           const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
              return res
                .status(400)
                .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

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
//===========
/*
const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

*/

module.exports= {signin} 
  //signout,
 

