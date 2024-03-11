const users = require("../models/userSchema");
const userotp = require("../models/userOtp");
const nodemailer = require("nodemailer"); //#npm i nodemailer

//email config

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.userregister = async (req, res) => {
  const { fname, email, password,address, phoneno } = req.body;

  if (!fname || !email || !password ||!address || !phoneno) {
    res.status(400).json({ error: "Please Enter All Inputs" });
  }
  try {
    const preuser = await users.findOne({ email: email }); //first email is from database and second email is from front-end value
    if (preuser) {
      res.status(400).json({ error: "This User Already Exists." });
    } else {
      const userregister = new users({
        fname,
        email,
        password,
        address,
        phoneno,
      });

      //here passwords hashing
      const storeData = await userregister.save();
      res.status(200).json(storeData);
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

//user send otp
exports.userOtpSend = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Please Enter Your Mail" });
  }
  try {
    const preuser = await users.findOne({ email: email });

    if (preuser) {
      const OTP = Math.floor(100000 + Math.random() * 900000);

      const existEmail = await userotp.findOne({ email: email }); // this condition is to update the otp if the  user is already exist in Db then we upate the otp value respected to the same email id.

      if (existEmail) {
        //if user exits then we will update the otp
        const updateData = await userotp.findByIdAndUpdate(
          { _id: existEmail._id },
          {
            otp: OTP,
          },
          { new: true }
        ); // 1. _id ->we will get from database    2. _id -> this id will be of our existing email.

        await updateData.save();

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "OTP Verification Mail",
         
          text: `Welcome to E-Kirana App, Hope you are doing well. Your Otp for validation is : ${OTP}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "Email not sent" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Email sent Successfully" });
          }
        });
      } else {
        //if it is new user then we will save the otp
        const saveOtpData = new userotp({
          email,
          otp: OTP,
        });
        await saveOtpData.save();

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "OTP Verification Mail",
          text: `Welcome to E-Kirana App, Hope you are doing well. Your Otp for validation is : ${OTP}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "Email not sent" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Hello, Email sent Successfully" });
          }
        });
      }
    } else {
      res.status(400).json({ error: "This User Not Exists In Our DB." });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};


//user Login
exports.userLogin = async(req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    res.status(400).json({ error: "Please Enter Your OTP and Email" });
  }

  try {
    const otpverification = await userotp.findOne({email: email});
    
    if(otpverification.otp ===otp)
    {
      const preuser = await users.findOne({email: email});

      //token generation
      const token = await preuser.generateAuthtoken();
      res.status(200).json({message:"User Login Successfully !",userToken:token});
      
    }
    else{
      res.status(400).json({error:"Invalid OTP"})
    }

  } catch (error) {
    res.status(400).json({error:"Invalid Details",error})
  }

};
