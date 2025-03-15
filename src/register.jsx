import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './styles.css';
import Axios from 'axios';

function Register () {

  const [usernameReg, setUsernameReg] = useState('')
  const [passwordReg, setPasswordReg] = useState('')


  const register = () => {
    Axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg
    }).then((response) => {
      console.log(response);
    });
  };


  return (
    <div className='container'>
      
      
      {/* registration */}
         <div className="header">
            <div className="text">Registration</div> 
         </div>
    
          <div className="inputs">
               <div className="input">
                 <input type="email" placeholder='Email'
                 onChange={(e) =>{
                    setUsernameReg(e.target.value);
                 }}/>
               </div>
              <div className="input">
                  <input type="password" placeholder='Password'
                  onChange={(e) =>{
                    setPasswordReg(e.target.value);
                 }}/>
              </div>
            <button type="submit" onClick={register}>register</button>
          </div>

    </div>
  )
}

export default Register

