import React, { useContext, useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { logincontext } from '../Contextapis/Contextapi';
import { FaEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import userImage from '../Images/user.png';
import axios from 'axios';

function Profile() {
  const [loginPatient, setLoginPatient] = useContext(logincontext);
  const [editProfileModal, setEditProfileModal] = useState(false);
  let [editSuccessModal, setEditSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!loginPatient) {
      navigate('/');
    } else {
      setFormData({
        firstName: loginPatient.firstName,
        lastName: loginPatient.lastName,
        email: loginPatient.email,
        phone: loginPatient.phone
      });
    }
  }, [loginPatient]);

  useEffect(() => {
    axios.post('http://localhost:3500/user-api/profile-details', 
      { user_id: loginPatient.user_id }
    )
      .then((dbres) => {
        // Assuming dbres.data has the user data
        const updatedProfile = dbres.data.user;

        // Update the loginPatient state and localStorage with the updated profile data
        setLoginPatient(updatedProfile);
        localStorage.setItem('loginPatient', JSON.stringify(updatedProfile));
      })
      .catch((err) => {
        console.error('Error fetching profile details:', err);
      });

  },[])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {

    formData.user_id = loginPatient.user_id;

    axios.put('http://localhost:3500/user-api/edit-profile', formData)
      .then((dbres) => {
        setEditSuccessModal(true)
      })
      .catch((err) => {
        console.error(err);

      });

    setEditProfileModal(false);
  };


  return (
    <div className='flex flex-col justify-center items-center w-full h-[100vh] bg-[#282D2D] px-5 bg-sky-950 min-h-screen rounded-3xl'>
      <div className="max-w-md mx-auto relative bg-white shadow-lg w-1/2 h-1/2 rounded-2xl overflow-hidden p-6">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
            src={userImage}
            alt="Profile"
          />
          <hr className="w-full border-t border-black my-4" />

          <div>
            <h1 className='text-xl mb-5'><strong>First name :</strong> {loginPatient?.firstName}</h1>
            <h1 className='text-xl mb-5'><strong>Last name :</strong> {loginPatient?.lastName}</h1>
            <h1 className='text-xl mb-5'><strong>Email :</strong> {loginPatient?.email}</h1>
            <h1 className='text-xl '><strong>Phone :</strong> {loginPatient?.phone}</h1>
          </div>
        </div>

        <div className="mx-auto flex justify-around absolute bottom-10">
          <button
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => setEditProfileModal(true)}
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Transition appear show={editProfileModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setEditProfileModal(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
              <Dialog.Title className="text-lg font-medium text-blue-600 mb-4">
                Edit Profile
              </Dialog.Title>

              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                  placeholder="First Name"
                />

                <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                  placeholder="Last Name"
                />

                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                  placeholder="Email"
                  readOnly
                />

                <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                  placeholder="Phone Number"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setEditProfileModal(false)}
                  className="bg-red-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
      {/* Profile Updated Successfully Modal */}
      <Transition appear show={editSuccessModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setEditSuccessModal(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
              <div className="flex items-center">
                {/* Green check icon */}
                <svg
                  className="w-8 h-8 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <Dialog.Title className="text-lg font-medium text-green-600">
                  Profile Updated Successfully
                </Dialog.Title>
              </div>
              <div className="mt-4">
                <p className="text-center text-gray-700">
                  Your profile has been updated.
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => { setEditSuccessModal(false); window.location.reload()}}
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  OK
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}

export default Profile;
