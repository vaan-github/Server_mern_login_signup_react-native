const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const bcrypt = require('bcrypt');


// NodeMailer
"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function NodeMailer(receiverEmail, otp) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: "varmajay109@gmail.com", // generated ethereal user
      pass: "ogsqlmrcsmsixgbf", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"FaceRecognitionAttendenceApp"<varmajay109@gmail.com>', // sender address
    to: `${receiverEmail}`, // list of receivers
    subject: "Verification OTP", // Subject line
    text: "", // plain text body
    html: `This is your Verification Code <center><b><h1>${otp}</h1></b></center>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}




//

router.post('/signup', async (req, res) => {
  console.log('sent by client ', req.body);
  const { name, email, password, dob } = req.body;
  if (!name || !email || !password || !dob) {
    return res.status(422).send({ error: 'Please add all the fields' });
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
        res.send({message:"User Registered Successfully", token });

      } catch (err) {
        console.log('db err', err)
        return res.status(422).send({ error: err.message });
      }
});

router.post('/verify', (req, res) => {
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
      try {
        let otp = Math.floor(1000 + Math.random() * 9000);
        let user ={
          name,
          email,
          password,
          dob,
          otp,
        }
        await NodeMailer(email, otp).catch(console.error);
        res.send({ message: "OTP sent to your email",Udata:user });
      } catch (err) {
        console.log('OTP error', err)
        return res.status(422).send({ error: err.message });
      }
    })
})

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
    bcrypt.compare(password, savedUser.password, (err, result) => {
      if (result) {
        // console.log('password matched');
        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
        res.send({ token });
      }
      else {
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