import React, { useState, useContext  } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { IoSearch } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { FcAbout } from "react-icons/fc";
import { IoIosLogIn } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import logo from '../Images/logo.png'
import { logincontext } from "../Contextapis/Contextapi";
import { FaUser } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FaCalendarAlt } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaHistory } from "react-icons/fa";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let [loginPatient,setLoginPatient]=useContext(logincontext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate=useNavigate();

  if(loginPatient)
  console.log(loginPatient.user_id)

  const handleSignOut = () => {
    setLoginPatient(null);
    navigate('/')
    window.location.reload();
  };


  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap justify-between mx-auto p-4">
        {/* Logo Section (Aligned Left) */}
        <a
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse w-full md:w-auto"
        >
          <img
            src={logo}
            className="h-10 w-10"
            alt="Healthcare"
          />
          <span className="self-center font-openSans text-2xl text-[#a33bf8] font-bold whitespace-nowrap dark:text-white">
            Healthcare
          </span>
        </a>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`w-full md:flex md:justify-end md:w-auto ${mobileMenuOpen ? "block" : "hidden"}`}
          id="navbar-default"
        >
          <ul className="font-medium flex flex-col p-4 mt-4 md:p-0 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-12 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <a
                href="/"
                className="flex font-openSans items-center py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <AiOutlineHome className="mr-1 text-blue-700" /> Home
              </a>


            </li>
            <li>
              <a
                href="/predictor"
                className="flex items-center font-openSans py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <IoSearch className="mr-1 text-blue-700" /> Predictor
              </a>


            </li>
            <li>
              <a
                href="/doctors"
                className="flex items-center font-openSans py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <FaUserDoctor className="mr-1 text-blue-700" />Doctors
              </a>
            </li>
            <li>
              <a
                href="/aboutus"
                className="flex items-center font-openSans py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <FcAbout className="mr-1 text-blue-700" />About us
              </a>
            </li>
           {!loginPatient?.email &&
            <li>
            <a
                href="/patientsignup"
                className="flex items-center font-openSans py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <FaRegUser className="mr-1 text-blue-700" />Signup
              </a>
            </li>
           }
           {!loginPatient?.email &&
            <li>
              <a
                href="/patientlogin"
                className="flex items-center font-openSans py-2 px-3 text-2xl font-semibold text-black rounded-sm md:bg-transparent md:p-0 dark:text-white dark:hover:text-blue-500 hover:text-blue-700"
                aria-current="page"
              >
                <IoIosLogIn className="mr-1 text-blue-700" />Login
              </a>
            </li>
          }
          
          {loginPatient?.email && (
              <li className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-2xl font-semibold text-black hover:text-blue-700"
                >
                  <FaUser className="mr-1 text-blue-700" />{loginPatient.firstName}
                  <svg className="w-2 h-3 ml-2" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-44">
                    <ul className="py-2 text-sm text-gray-700">
                      <li>
                        <a href="/profile" className="block px-4 py-2 hover:bg-blue-500 hover:text-white">
                         <CgProfile className="inline  text-blue-700  hover:text-white"/> Profile
                        </a>
                      </li>
                      <li>
                        <a href="/appointments" className="block px-4 py-2 hover:bg-blue-500 hover:text-white">
                          <FaCalendarAlt className="inline  text-blue-700  hover:text-white"/> Appointments
                        </a>
                      </li>
                      <li>
                        <a href="/patient-history" className="block px-4 py-2 hover:bg-blue-500 hover:text-white">
                          <FaHistory className="inline  text-blue-700  hover:text-white"/> History
                        </a>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                           handleSignOut(); // Logout
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white"
                        >
                          <FaSignOutAlt className="inline  text-red-500 hover:text-white"/> Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            )}

          
           
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
