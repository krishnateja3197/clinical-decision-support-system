import React, { useState, useEffect, useContext, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { logincontext } from "../Contextapis/Contextapi";
import axios from "axios";

function PatientHistory() {
    let [loginPatient] = useContext(logincontext);
    let [previousPredictions, setPreviousPredictions] = useState([]);
    let [shapView, setShapView] = useState(null);
    let [displaySymptoms, setDisplaySymptoms] = useState(null);

    useEffect(() => {
        axios
            .post(
                "http://localhost:3500/user-api/get-previous-predictions",
                { user_id: loginPatient.user_id },
                { headers: { "Content-Type": "application/json" } }
            )
            .then((dbres) => {
                if (dbres.status === 201) {
                    const sortedPredictions = dbres.data.previousPredictions.sort((a, b) => {
                        const parseDateTime = (item) => {
                            // item.date is in 'DD/MM/YY' and item.time is in 'HH:mm'
                            const [day, month, year] = item.date.split('/');
                            const fullYear = `20${year}`; // convert '25' to '2025'
                            return new Date(`${fullYear}-${month}-${day}T${item.time}`);
                        };

                        return parseDateTime(b) - parseDateTime(a); // latest first
                    });

                    console.log(sortedPredictions);

                    setPreviousPredictions(sortedPredictions);
                }
            })
            .catch((error) => {
                console.error("Error fetching previous predictions:", error);
            });
    }, []);

    return (
        <div className="bg-sky-950 min-h-screen rounded-3xl flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold text-white">Patient History</h1>
            <div className="mt-8 w-3/4">
                {previousPredictions.length > 0 ? (
                    previousPredictions.map((prediction, index) => (
                        <div
                            key={index}
                            className="mb-6 p-6 bg-gray-100 rounded-lg shadow-lg"
                        >
                            <h2 className="text-xl font-bold text-gray-800">
                                Predicted Disease: {prediction.predicted_disease}
                            </h2>
                            <p className="text-black">
                                <span className="font-semibold">Text Input:</span>{" "}
                                {prediction.text_input}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Date:</span> {prediction.date}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Time:</span> {prediction.time}
                            </p>

                            <div className="text-center mt-6">
                                {/* SHAP Visualization Button */}
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                                    onClick={() => setShapView(shapView === index ? null : index)}
                                >
                                    {shapView === index ? "Hide SHAP" : "View SHAP Visualization"}
                                </button>

                                {/* Symptoms Contribution Button */}
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-4"
                                    onClick={() => setDisplaySymptoms(index)}
                                >
                                    Symptoms Contribution
                                </button>
                            </div>

                            {/* SHAP Visualization Iframe */}
                            {shapView === index && (
                                <div
                                    className="mt-6 flex justify-center"
                                    style={{ overflowX: "visible" }}
                                >
                                    <iframe
                                        src={prediction.image_path.slice(7)}
                                        width="100%"
                                        height="250px"
                                        title="SHAP Force Plot"
                                        style={{
                                            border: "none",
                                            backgroundColor: "white",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center">No previous predictions found.</p>
                )}
            </div>

            {/* Symptoms Contribution Modal */}
            <Transition appear show={displaySymptoms !== null} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setDisplaySymptoms(null)} static>
                    <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
                            <Dialog.Title className="text-lg font-medium text-center">
                                Symptoms Contribution
                            </Dialog.Title>
                            <div className="mt-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="px-4 py-2">Symptom</th>
                                            <th className="px-4 py-2">SHAP Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displaySymptoms !== null &&
                                            Object.entries(previousPredictions[displaySymptoms].symptoms_contribution).map(([key, value], index) => (
                                                <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                                    <td className="px-4 py-2 capitalize">{key.replace("_", " ")}</td>
                                                    <td className="px-4 py-2">{value.toFixed(4)}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => setDisplaySymptoms(null)}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                                >
                                    Close
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

export default PatientHistory;
