import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios';
import doctorsData from '../Datasets/Doctors_realtimeData.json'
import { logincontext } from "../Contextapis/Contextapi";

function Appointments() {
    let [loginPatient, setLoginPatient] = useContext(logincontext);
    let [scheduledAppointments, setScheduledAppointments] = useState([])
    const [enrichedAppointments, setEnrichedAppointments] = useState([]);

    useEffect(() => {
        if (scheduledAppointments && scheduledAppointments.length > 0) {
            const enriched = scheduledAppointments.map((appointment) => {
                const matchedDoctor = doctorsData.find(
                    (doc) => doc.name === appointment.doctorName
                );

                return {
                    ...appointment,
                    hospital_name: matchedDoctor?.hospital_name || "N/A",
                    location: matchedDoctor?.location || "N/A",
                    img: matchedDoctor?.img || "",
                };
            });

            setEnrichedAppointments(enriched);
        }
        console.log("enriched appointemens is ", enrichedAppointments)
    }, [scheduledAppointments]);
    useEffect(() => {
        axios.post('http://localhost:3500/user-api/get-appointments',
            {
                user_id: loginPatient.user_id
            }
        )
            .then((dbres) => {
                console.log(dbres.data.appointments)
                setScheduledAppointments(dbres.data.appointments)
            })
            .catch((err) => {
                console.log("error is ", err)
            })


    }, [loginPatient.user_id])


    return (
        <div className="bg-sky-950 min-h-screen rounded-3xl flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold text-white">Scheduled Appointments</h1>
            <div className="mt-8 w-3/4">
                {enrichedAppointments.length > 0 ? (
                    enrichedAppointments.map((appointment, index) => (
                        <div
                            key={index}
                            className="mb-6 p-6 bg-gray-100 rounded-lg shadow-lg relative"
                        >
                            <h2 className="text-xl font-bold text-gray-800">
                                Doctor name : {appointment.doctorName}
                            </h2>
                            <p className="text-black">
                                <span className="font-semibold">Appointment date :</span>{" "}
                                {appointment.appointmentDate}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Appointment time : </span> {appointment.appointmentTime}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Hospital :</span> {appointment.hospital_name}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Location :</span> {appointment.location}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Booked date :</span> {appointment.bookedAt.slice(0, 10)}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Booked time :</span> {appointment.bookedAt.slice(11, 19)}
                            </p>
                            <img
                                className="h-40 w-40 top-8 right-4 absolute  rounded-full object-cover"
                                src={appointment.img}
                                alt="Doctor"
                            />

                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center">No appointments found.</p>
                )}
            </div>
        </div>
    )
}

export default Appointments;
