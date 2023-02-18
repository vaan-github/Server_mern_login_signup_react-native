const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
  console.log('sent by client ', req.body);
  const { name, email, password, dob } = req.body;
  if (!name || !email || !password || !dob) {
    return res.status(422).send({ error: 'Please add all the fields' });
  }
  User.findOne({ email: email })
    .then(async (savedUser) => {
      if (savedUser) {
        return res.status(422).send({ error: "Already Existed User" });
      }
      const user = new User({
        name,
        email,
        password,
        dob,
      });
      try {
        await user.save();
        // res.send({ message: "User Saved Successfully" });
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ token });

      } catch (err) {
        console.log('db err', err)
        return res.status(422).send({ error: err.message });
      }
    })
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: 'Please add email or password' });
  }
  const savedUser = await User.findOne({ email: email })
  if (!savedUser) {
    // console.log("Invalid Email")
    return res.status(422).send({ error: 'Invalid Email ' });
  }

  try {
     bcrypt.compare(password, savedUser.password, (err, result) =>{
       if(result){
        // console.log('password matched');
         const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
         res.send({ token });
       } 
      else{
        //  console.log('password not matched')
        return res.status(422).send({ error: 'password not matched' });
      }
    
    });

  }
  catch (err) {
    console.log(err);
  }

});

module.exports = router;