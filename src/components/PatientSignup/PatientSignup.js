import React, { useState,useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import { Fragment } from "react";

function PatientSignup() {
  const [darkMode, setDarkMode] = useState(false);
  const [Otp,setOtp]=useState("")
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage,setErrorMessage]=useState(false);
  let navigate=useNavigate();

  //modal states
  let [modal,setModal]=useState(false);
  const [values, setValues] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  // State to hold form values and errors
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    firstName: '',
    email: '',
    phone: '',
    password: ''
  });


  // Validation logic
  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    // Email validation regex (simple pattern for demonstration)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Phone number validation (simple pattern for demonstration)
    const phonePattern = /^[0-9]{10}$/;
    if (!formData.phone || !phonePattern.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    // Password validation (at least 1 uppercase, 1 number, and 1 special character)
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password || !passwordPattern.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one number, and one special character';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };


  let submitform=(formData)=>
    {
      axios.post('http://localhost:3500/user-api/patient-register',formData)
      .then((dbres)=>
      {
        if(dbres.status==200)
         {
           let  newErrors={}
           newErrors.email = 'user with this email already exists';
           setErrors(newErrors);

         }
        else if(dbres.status==201)
        {
           setModal(true);
           setOtp(dbres.data.otp);
           console.log("new user created");

        }
      })
      .catch((error)=>console.log(error))
    }


    let registerNewUser=(formData)=>
      {
        axios.post('http://localhost:3500/user-api/new-patient-register',formData)
        .then((dbres)=>
        {
          if(dbres.status==201)
           {
            setSuccessMessage(true)
          setTimeout(() => {
            
            setSuccessMessage(false);
            navigate("/patientlogin")
          }, 4000);
           }
        
        })
        .catch((error)=>console.log(error))
      }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Form submission logic here
      console.log('Form Submitted:', formData);
      submitform(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  //modal functions 

  const handleModalChange = (index, value) => {
    if (isNaN(value)) return;
    
    let newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    
    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleModalSubmit = () => {
    if (values.every((digit) => digit !== "")) {
       if(values.join("")==Otp.toString())
       {
          registerNewUser(formData);
       }
       else 
       {
        setErrorMessage(true);
        setTimeout(() => {
          
          setErrorMessage(false);
        }, 4000);
       }
    } else  {
      setErrorMessage(true);
      setTimeout(() => {
        
        setErrorMessage(false);
      }, 4000);
    }
  };


  return (
    <div className="flex flex-col justify-center items-center w-full h-[100vh] bg-[#282D2D] px-5 bg-sky-950 min-h-screen rounded-3xl">
      <div className=" flex flex-col items-end justify-start overflow-hidden mb-2 xl:max-w-3xl w-full">
        <div className="flex">
          <label className="inline-flex relative items-center mr-5 cursor-pointer"></label>
        </div>
      </div>
      <div
        className={`xl:max-w-3xl ${darkMode ? 'bg-black' : 'bg-white'} w-full p-5 sm:p-10 rounded-md`}
      >
        <h1
          className={`text-center text-xl sm:text-3xl font-semibold ${darkMode ? 'text-white' : 'text-black'}`}
        >
          Patient Account Registration
        </h1>

        {/* Display errors as small cards */}
        {Object.values(errors).map((error, index) =>
          error ? (
            <div
              key={index}
              className="w-full bg-white text-black p-4 rounded-md shadow-md mb-3 flex justify-between items-center"
            >
              <span>{error}</span>
              <button
                className="text-red-500"
                onClick={() => {
                  const newErrors = { ...errors };
                  newErrors[Object.keys(errors)[index]] = ''; // Clear error
                  setErrors(newErrors);
                }}
              >
                ✖
              </button>
            </div>
          ) : null
        )}

        <div className="w-full mt-8">
          <div className="mx-auto max-w-xs sm:max-w-md md:max-w-lg flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className={`w-full px-5 py-3 rounded-lg font-medium border-2 border-transparent placeholder-gray-500 text-sm focus:outline-none focus:border-2 focus:outline ${darkMode ? 'bg-[#302E30] text-white focus:border-white' : 'bg-gray-100 text-black focus:border-black'}`}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
              />
              <input
                className={`w-full px-5 py-3 rounded-lg font-medium border-2 border-transparent placeholder-gray-500 text-sm focus:outline-none focus:border-2 focus:outline ${darkMode ? 'bg-[#302E30] text-white focus:border-white' : 'bg-gray-100 text-black focus:border-black'}`}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name (Optional)"
              />
            </div>
            <input
              className={`w-full px-5 py-3 rounded-lg font-medium border-2 border-transparent placeholder-gray-500 text-sm focus:outline-none focus:border-2 focus:outline ${darkMode ? 'bg-[#302E30] text-white focus:border-white' : 'bg-gray-100 text-black focus:border-black'}`}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            <input
              className={`w-full px-5 py-3 rounded-lg font-medium border-2 border-transparent placeholder-gray-500 text-sm focus:outline-none focus:border-2 focus:outline ${darkMode ? 'bg-[#302E30] text-white focus:border-white' : 'bg-gray-100 text-black focus:border-black'}`}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            <input
              className={`w-full px-5 py-3 rounded-lg font-medium border-2 border-transparent placeholder-gray-500 text-sm focus:outline-none focus:border-2 focus:outline ${darkMode ? 'bg-[#302E30] text-white focus:border-white' : 'bg-gray-100 text-black focus:border-black'}`}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <button
              onClick={handleSubmit}
              className="mt-5 tracking-wide font-semibold bg-blue-500 text-gray-100 w-full py-4 rounded-lg hover:bg-red-500 /90 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
            >
              <svg
                className="w-6 h-6 -ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
              <span className="ml-3">Register</span>
            </button>
            <p className="mt-6 text-xs text-gray-600 text-center">
              Already have an account?{" "}
              <a href="/patientlogin">
                <span className="text-[#E9522C] font-semibold">Login</span>
              </a>
            </p>
          </div>
        </div>
      </div>
      <Transition appear show={modal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={()=>setModal(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-lg font-medium text-center">Enter OTP for email verification</Dialog.Title>
            <div className="mt-4 flex justify-center gap-2">
              {values.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleModalChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleModalSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>


    <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Registration Successful! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      
    <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Invalid OTP
          </motion.div>
        )}
      </AnimatePresence>

    
    </div>
  );
}

export default PatientSignup;
