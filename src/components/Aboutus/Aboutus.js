import React, { useContext } from 'react';
import { logincontext } from '../Contextapis/Contextapi';

const admins = [
  {
    name: "Adishankar",
    role: "Admin1",
    email: "adishankara.bhat@gmail.com",
    image: "https://icon-library.com/images/admin-icon/admin-icon-12.jpg",
  },
  {
    name: "Surya Teja",
    role: "Admin2",
    email: "akulasuryateja1212@gmail.com",
    image: "https://icon-library.com/images/admin-icon/admin-icon-12.jpg",
  },
  {
    name: "Krishna Teja",
    role: "Admin3",
    email: "krishnateja3197@gmail.com",
    image: "https://icon-library.com/images/admin-icon/admin-icon-12.jpg",
  },
  {
    name: "Pavan Kalyan",
    role: "Admin4",
    email: "pavankalyan142211@gmail.com",
    image: "https://icon-library.com/images/admin-icon/admin-icon-12.jpg",
  },
];

const Admincard = ({ admin }) => {
  let [loginPatient, setLoginPatient] = useContext(logincontext);
  console.log("loginpatient is " + loginPatient);

  return (
    <div className="bg-white w-4/6 h-auto shadow-lg shadow-blue-300/50 rounded-lg p-4 flex flex-col justify-between relative">
      <div className="flex-grow">
        <img className="h-48 w-48 mx-auto" src={admin.image} alt={admin.name} />
        <h3 className="text-xl font-semibold text-center mt-4">{admin.name}</h3>
        <p className="text-lg text-gray-600 text-center">{admin.role}</p>
      </div>
      <a
        className="w-1/2 mx-auto"
        href={`mailto:${admin.email}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full">
          Contact
        </button>
      </a>
    </div>
  );
};

function Aboutus() {
  return (
    <div className="mt-16">
      <h2 className="text-center text-3xl font-semibold mb-10 tracking-wide">Meet Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-10 ml-40">
        {admins.length > 0 ? (
          admins.map((admin, index) => (
            <Admincard key={index} admin={admin} />
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">No admins available.</p>
        )}
      </div>
    </div>
  );
}

export default Aboutus;
