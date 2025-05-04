import { useState, Fragment, useContext, useEffect, use } from "react";
import Predictionmotion from "../Predictmotion/Predictmotion";
import { Dialog, Transition } from "@headlessui/react";
import { logincontext } from "../Contextapis/Contextapi";
import { useNavigate } from "react-router-dom";
import Doctors_real_data from "../Datasets/Doctors_realtimeData.json"
import axios from "axios";

export default function Predictor() {
  const [comment, setComment] = useState(""); // User input
  const [predictedDisease, setPredictedDisease] = useState("")
  const [shapImagePath, setShapImagePath] = useState("")
  const [shapView, setShapView] = useState(false)
  const [displaySymptoms, setDisplaySymptoms] = useState(false)
  const [symptomsContribution, setSymptomsContribution] = useState({})
  const [findingOutput, setFindingOutput] = useState(false)
  let [loginPatient, setLoginPatient] = useContext(logincontext);
  const [textInput, setTextInput] = useState("")
  let [recommendedDoctors, setRecommendedDoctors] = useState([])
  let [mailModal, setMailModal] = useState(false)
  let [viewRecommendedDoctors, setViewRecommendedDoctors] = useState(false)
  let [inputErrorModal, setInputErrorModal] = useState(false)
  let [displayBooking, setBooking] = useState(false)
  let [doctorName, setDoctorName] = useState("")
  let [appointmentBooked,setAppointmentBooked]=useState(false)
  let [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });


  const navigate = useNavigate()


  useEffect(() => {
    if (!loginPatient) {
      navigate("/patientlogin")
    }
    console.log("recommended doctors are ", recommendedDoctors)

  }, [recommendedDoctors])


  const findRecommendedDoctors = (disease) => {
    return Doctors_real_data.filter(doctor => doctor.disease_name === disease);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPredictedDisease("")
    setShapView(false)
    setFindingOutput(true)
    if (comment.trim()) {
      console.log("User Input:", comment);
      setTextInput(comment)
      axios.post("http://localhost:3500/user-api/predict-disease",
        { text: comment, user_id: loginPatient.user_id },
        { headers: { "Content-Type": "application/json" } } // Ensure JSON format
      )
        .then((dbres) => {
          if (dbres.status == 201) {
            console.log(dbres.data)
            console.log(dbres.data.predicted_disease)
            const symptomsArray = dbres.data.symptoms_array;
            const zeroCount = symptomsArray.filter(num => num === 0).length;
            if (zeroCount == 132) {
              setInputErrorModal(true)
            }
            const shapImage = dbres.data.shap_results.results.image_path.slice(7);
            setSymptomsContribution(dbres.data.shap_results.results.symptoms_contribution)
            setShapImagePath(shapImage)
            setPredictedDisease(dbres.data.predicted_disease)
            setFindingOutput(false)
            const findDoctors = findRecommendedDoctors(dbres.data.predicted_disease)
            console.log(findDoctors)
            setRecommendedDoctors(findDoctors)
          }
        })

      setComment(""); // Clear input after submission
    }
  };

  const setPredictionsToMail = () => {
    const newPredictionData = {
      text_input: textInput,
      predicted_disease: predictedDisease,
      image_path: shapImagePath
    }
    axios.post("http://localhost:3500/user-api/send-predictions-to-mail",
      { email: loginPatient.email, predictionsData: newPredictionData },
      { headers: { "Content-Type": "application/json" } } // Ensure JSON format
    )
      .then((dbres) => {
        if (dbres.status == 201) {

          setMailModal(true)

        }
      })
      .catch((error) => {

        console.log(error)

      })

  }

  const handleBookAppointment = () => {
    axios.post("http://localhost:3500/user-api/schedule-appointment",

      {
        user_id: loginPatient.user_id,
        doctorName: doctorName,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime
      }
    )
      .then((dbres) => {
        console.log("appointment result is ", dbres)
        setAppointmentBooked(true)
      })
      .catch((err) => {
        console.log("error is ", err)
      })
  }

  const reloadWindow = () => {
    setInputErrorModal(false)
    window.location.reload();
  }

  return (
    <div className="bg-sky-950 min-h-screen rounded-3xl flex justify-center">
      <form className="w-1/2" onSubmit={handleSubmit}>
        <div className="w-full border rounded-lg bg-gray-700 border-gray-500 mt-36">
          <div className="px-4 py-2 rounded-t-lg bg-gray-800">
            <label htmlFor="comment" className="sr-only">
              Enter Text
            </label>
            <textarea
              id="comment"
              rows="10"
              className="w-full px-0 text-lg text-white bg-gray-800 border-0 focus:ring-0 placeholder-gray-300"
              placeholder="Enter text..."
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-600">
            <button
              type="submit"
              className={`py-2.5 px-4 text-xs font-medium text-white bg-blue-700 rounded-lg ${comment.trim() ? "hover:bg-blue-800" : "opacity-50 cursor-not-allowed"
                }`}
              disabled={!comment.trim()}
            >
              Submit
            </button>
          </div>
        </div>
        {
          findingOutput && <Predictionmotion />
        }
        {predictedDisease.length > 0 && !inputErrorModal && (
          <div className="mt-8 ml-28 mr-28 p-4 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">
              Predicted Disease : {predictedDisease}
            </h2>
            <div className="text-center">
              {!shapView &&
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 mt-10" onClick={() => { setShapView(true) }}>
                  Shap Visualization
                </button>
              }
              {
                shapView &&
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 mt-10" onClick={() => { setShapView(false) }}>
                  Hide SHAP
                </button>

              }
              <button className="bg-green-600 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 mt-10 ml-10" onClick={() => { setDisplaySymptoms(true) }}>
                Symptoms Contribution
              </button>
              <button className="items-center gap-2 bg-[#ae1e1e] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 mt-10 ml-10"
                onClick={() => { setPredictionsToMail() }}>
                <img
                  src="https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/112-gmail_email_mail-512.png"
                  className="w-6 h-6 inline mr-1 mb-1"
                  alt="Mail Icon"
                />
                <span>Send Results</span>
              </button>
              <button className="bg-blue-600 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 mt-10" onClick={() => { setViewRecommendedDoctors(true) }}>
                Recommended doctors
              </button>

            </div>
          </div> // ✅ Properly closing the main wrapper div
        )}



        <Transition appear show={displayBooking} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => { }} static>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
                {/* Modal Title */}
                <Dialog.Title className="text-lg font-medium text-center">
                  Schedule Appointment
                </Dialog.Title>

                {/* Booking Details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      placeholder="Dr. John Doe"
                      value={doctorName}
                      readOnly
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    >
                      {["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setBooking(false)}
                    className="bg-red-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    Book Appointment
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>


        {shapView &&
          (<div style={{ overflowX: "visible", marginLeft: "-350px", marginBottom: "100px" }}>
            <iframe
              src={shapImagePath}
              width="130%"
              height="200px"
              title="SHAP Force Plot"
              style={{
                border: "none",
                marginTop: "100px",
                backgroundColor: "white",
              }}
            />
          </div>)
        }

        <Transition appear show={displaySymptoms} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => { }} static>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
                {/* Modal Title */}
                <Dialog.Title className="text-lg font-medium text-center">
                  Symptoms Contribution
                </Dialog.Title>

                {/* Table Displaying Symptoms and SHAP Values */}
                <div className="mt-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="px-4 py-2">Symptom</th>
                        {/* <th className="px-4 py-2">SHAP Value</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(symptomsContribution).map(([key, value], index) => (
                        <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-2 capitalize">{key.replace("_", " ")}</td>
                          {/* <td className="px-4 py-2">{value.toFixed(4)}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Close Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setDisplaySymptoms(false)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={mailModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setMailModal(false)}>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
                <div className="flex items-center">
                  {/* Green tick icon */}
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
                  <Dialog.Title className="text-lg font-medium">
                    Mail sent successfully
                  </Dialog.Title>
                </div>
                <div className="mt-4">
                  <p className="text-center">prediction results has been sent successfully.</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setMailModal(false)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    OK
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={viewRecommendedDoctors} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setViewRecommendedDoctors(false)}>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                  Recommended Doctors
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {recommendedDoctors.length > 0 ? (
                    recommendedDoctors.map((doctor, index) => (
                      <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center border w-80"
                      >
                        <img
                          src={doctor.img}
                          alt={doctor.name}
                          className="w-28 h-28 rounded-full object-cover mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600  mt-2 justify-start">
                          <strong>Speciality:</strong> {doctor.speciality} <br />
                          <strong>Hospital:</strong> {doctor.hospital_name} <br />
                          <strong>Location:</strong> {doctor.location} <br />
                          <strong>Contact:</strong> {doctor.phone_number}
                        </p>
                        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => {
                          setDoctorName(doctor.name)
                          setBooking(true)
                        }
                        }>
                          Appointment
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center w-full">No doctors available for this department.</p>
                  )}
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>;

        <Transition appear show={inputErrorModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => reloadWindow()}>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
                <div className="flex items-center">
                  {/* Red error icon */}
                  <svg
                    className="w-8 h-8 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85L21 7.85c.077-1.034-.691-1.85-1.745-1.85H4.745C3.691 6 2.923 6.816 3 7.85l.083 9.3c.077 1.034.941 1.85 1.995 1.85z"
                    />
                  </svg>
                  <Dialog.Title className="text-lg font-medium text-red-600">
                    Input Error
                  </Dialog.Title>
                </div>
                <div className="mt-4">
                  <p className="text-center text-gray-700">
                    Please specify the problem precisely.
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => reloadWindow()}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                  >
                    OK
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>;

        <Transition appear show={appointmentBooked} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setAppointmentBooked(false)}>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
                <div className="flex items-center">
                  {/* Green checkmark icon */}
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
                    Appointment Booked
                  </Dialog.Title>
                </div>
                <div className="mt-4">
                  <p className="text-center text-gray-700">
                    Your appointment has been successfully booked.
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setAppointmentBooked(false)}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    OK
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>

      </form>
    </div>
  );
}  