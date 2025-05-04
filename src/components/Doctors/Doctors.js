import React, { useState, useEffect } from "react";
import Doctorimage from "../Images/doctor.png";
import Doctors_data from "../Datasets/Doctors_data.json";
import Doctors_real_data from "../Datasets/Doctors_realtimeData.json"

// const doctors_speciality = [...new Set(Doctors_data.map(doctor => doctor.specialty))];

const DoctorCard = ({ doctor }) => {
    return (
        <div className="bg-white shadow-lg shadow-blue-300/50 rounded-lg p-4 flex flex-col justify-between relative">
            <div className="flex-grow">
                <h3 className="text-xl font-semibold">{doctor.name}</h3>
                <p><strong>Speciality:</strong> {doctor.speciality}</p>
                <p><strong>Hospital:</strong> {doctor.hospital_name}</p>
                <p><strong>Location:</strong> {doctor.location}</p>
                <p><strong>Contact:</strong> {doctor.phone_number}</p>
                <img className="h-40 w-40 absolute right-0 top-0" src={doctor.img} alt="Doctor" />
            </div>
            <button className="mt-8 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mx-auto">
                Appointment
            </button>
        </div>
    );
};

function Doctors() {
    const [departmentDoctors, setDepartmentDoctors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("Urologist");

    // Trigger the doctors filter when component mounts and when department changes
    // useEffect(() => {
    //     const findDoctors = (selectedDepartment) => {
    //         const filteredDoctors = Doctors_data.filter((doctor) => doctor.specialty === selectedDepartment);
    //         setDepartmentDoctors(filteredDoctors);  // Update state to trigger re-render
    //     };

    //     findDoctors(selectedDepartment); // Call it initially to filter doctors for Urologist

    // }, [selectedDepartment]);  // Re-run when selectedDepartment changes

    return (
        <div>
            {/* <label htmlFor="doctors_departments" className="block text-md ml-10 mt-10 font-medium text-gray-700">
                Choose Specialist:
            </label>
            <select
                id="doctors_departments"
                name="doctors_departments"
                className="m-10 mt-0 block w-full sm:w-1/4 md:w-1/4 lg:w-1/4 xl:w-1/6 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                }}
            >
                {doctors_speciality.map((specialty, index) => (
                    <option key={index} value={specialty}>
                        {specialty}
                    </option>
                ))}
            </select> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 p-6">
                {Doctors_real_data.length > 0 ? (
                    Doctors_real_data.map((doctor, index) => (
                        <DoctorCard key={index} doctor={doctor} />
                    ))
                ) : (
                    <p className="text-gray-600 col-span-full text-center">No doctors available for this department.</p>
                )}
            </div>
        </div>
    );
}

export default Doctors;
