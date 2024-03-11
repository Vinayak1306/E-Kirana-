const mongoose = require("mongoose");
const validator = require("validator"); //  # npm i validator
const bcrypt = require("bcryptjs");     //  # npm i bcrypts to import this
const jwt =  require("jsonwebtoken");   //  # npm i jsonwebtoken
const SECRET_KEY = "abcdefghijklmnop";  //secret key is of random choice

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not a valid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  address:{
    type:String,
    requiired:true
  },
  phoneno:{
    type:String,
    required:true,
    minlength:10,
  },
  role:{
    type:Number,
    default:0,

  },
  
  tokens:[
    {
      token : {
        type: String,
        required:true
      } 
    }
]
},{timestamps: true});

//hash password - here we are hasing our password before it is getting save in the DB.
userSchema.pre("save", async function(next){
  if(this.isModified("password")){
      this.password = await bcrypt.hash(this.password,12);
  }
  
  next();
});

//token generates 
userSchema.methods.generateAuthtoken = async function(){
  try {
    let newtoken  = jwt.sign({_id: this._id}, SECRET_KEY,{
      expiresIn:"1d"
    });
    
    this.tokens = this.tokens.concat({token:newtoken});
    await this.save();
    return newtoken;

  } catch (error) {
    res.status(400).json(error)
  }
}

//creating model -- we are creating our collection

const users = new mongoose.model("users", userSchema); //we have users name collection which has userSchema

module.exports = users;
