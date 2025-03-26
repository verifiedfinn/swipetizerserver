import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css';
import Axios from 'axios';

function Register () {

  const [usernameReg, setUsernameReg] = useState('')
  const [passwordReg, setPasswordReg] = useState('')

  const navigate = useNavigate(); 

  const register = () => {
    Axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg
    }).then((response) => {
      console.log(response);
      navigate('/login'); 
    }).catch((err) => {
      console.error(err);
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

           <div className="submit-container">
           <button type="submit" onClick={register}>Register</button>
           </div>
          </div>

    </div>
  )
}

export default Register

