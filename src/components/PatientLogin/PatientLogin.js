import React, { useState, useContext } from 'react';
import axios from 'axios';
import image1 from '../Images/image1.png';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { logincontext } from '../Contextapis/Contextapi';

function PatientLogin() {
  let navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false)
  let [loginPatient, setLoginPatient] = useContext(logincontext)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validate();

    if (isValid) {
      console.log('Login Successful:', formData);
      submitform(formData);
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Please fill out this field';
      valid = false;
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  let submitform = (formData) => {
    axios
      .post('http://localhost:3500/user-api/patient-login', formData)
      .then((dbres) => {
        console.log("in login component :", dbres);
        if (dbres.status === 200 && dbres.data.flag === 1) {
          setErrors({ email: 'User with this email does not exist' });
        } else if (dbres.status === 200 && dbres.data.flag === 2) {
          setErrors({ password: 'Wrong password' });
        } else if (dbres.status === 201) {
          const loginUser = dbres.data.loginPatient;
          console.log("Setting loginPatient:", loginUser);

          setLoginPatient(loginUser);  // Update context
          localStorage.setItem("loginPatient", JSON.stringify(loginUser)); // Save to localStorage

          setSuccessMessage(true);
          setTimeout(() => {
            setSuccessMessage(false);
            navigate('/');
            window.location.reload();
          }, 4000);
        }
      })
      .catch((error) => console.log(error));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex items-center justify-center h-screen w-full px-5 sm:px-0 bg-sky-950 min-h-screen rounded-3xl">
      <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden max-w-sm lg:max-w-4xl w-full">
        <div
          className="hidden md:block lg:w-1/2 bg-cover bg-blue-700"
          style={{ backgroundImage: `url(${image1})` }}
        ></div>
        <div className="w-full p-8 lg:w-1/2">
          <p className="text-xl text-gray-600 text-center">Welcome back!</p>

          {/* Error messages */}
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

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
            </div>
            <input
              className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {/* <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-900 text-end w-full mt-2"
            >
              Forget Password?
            </a> */}
           <p className="mt-6 text-xs text-gray-600 text-center">
              New user?{" "}
              <a href="/patientsignup">
                <span className="text-[#E9522C] font-semibold">Register here</span>
              </a>
            </p>

          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Login Successful! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PatientLogin;
