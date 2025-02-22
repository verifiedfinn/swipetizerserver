import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './styles.css'

const Login = () => {

  const[action,setAction] = useState("Log in");
  return (
    
    <div className='container'>
        <div className="header">
            {/* <div className="text">Welcome to Swipetizer</div> */}
            <div className="text">Welcome</div>
            
            </div>
      <div className="inputs">
        <div className="input">
            <input type="text" placeholder='Username'/>
        </div>
        <div className="input">
            <input type="password" placeholder='Password'/>
        </div>
      </div>
<div className="forgot-password">Forgot Password? <span>Click Here</span></div>
      <div className="submit-container">
        <div className={"submit"}>Log In</div>
      </div>
    </div>
  )
}

export default Login

