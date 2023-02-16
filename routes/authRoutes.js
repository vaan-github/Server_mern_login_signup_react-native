const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

require('dotenv').config();

router.post('/signup', (req, res) => {
  console.log(req.body);
  // res.send('This is POST(SignUpPage)!');   //cannot send 2 responses to the same request
  const { name, email, password, dob } = req.body;
  if (!name || !email || !password || !dob) {
    return res.status(422).send({ error: 'Please add all the fields' });
  }
  User.findOne({ email: email })
    .then(async (savedUser) => {
      if (savedUser) {
        return res.status(422).send({ error: "Invalid Creditial" });
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

module.exports = router;