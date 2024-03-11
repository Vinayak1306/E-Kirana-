import React, { useState } from "react";
import {NavLink, useNavigate} from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import "../styles/mix.css";
import { sentOtpFunction } from "../services/Apis";
import Spinner from 'react-bootstrap/Spinner';


const Login = () => {

    const [email,setEmail] = useState("");
    const navigate = useNavigate();
    
    const [spinner,setSpinner] = useState(false);

    //sendOTP
    const sendOTP = async (e) =>{
      e.preventDefault();

      if(email ==="")
      {
          toast.error("Please Enter Your Email");
      }
      else if(!email.includes("@") )
      {
        toast.error("Enter a valid Mail")
      }
      else{
        setSpinner(true);
       const data = {
        email : email
       }
       const response = await sentOtpFunction(data);
       
       if(response.status ===200){
        setSpinner(false)
        navigate("/user/otp",{state:email})
       }else{
        toast.error(response.response.data.error);
       }

      }
    }
  return (
    <>
      <section>
        <div className="form_data">
          <div className="form_heading">
            <h1>Welcome, Sign In</h1>
            <p>Hi, We are glad you are here again. Please Procced.</p>
          </div>
          <form>
            <div className="form_input">
              <label htmlFor="email">Email </label>
              <input type="email" name="email"id="" onChange={(e)=> setEmail(e.target.value)} placeholder="Enter your mail here"></input>
            </div>
            <button className="btn" onClick={sendOTP}>Login {
              spinner ?
             <span><Spinner animation="border" role="status"/></span>:"" } </button>
            <p> Don't have an account? <NavLink to="/register">Register Here.</NavLink></p>
          </form>
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default Login;
