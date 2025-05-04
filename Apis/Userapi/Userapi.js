const exp = require("express")

//used to handle errors
const expressAsyncHandler = require("express-async-handler")

const nodemailer = require('nodemailer');

require('dotenv').config();


// const schemes=require("../../src/components/Schemespage/Schemedetails")

const eligibleschemes = []


//used to hash password
const bcryptjs = require("bcryptjs")

const patientApp = exp.Router()

//import jsonwebtoken 
const jwt = require("jsonwebtoken");
const { error } = require("console");

patientApp.use(exp.json())


const { spawn } = require("child_process");
const path = require("path");

async function generate_shap_predictions(symptomsArray) {
    return new Promise((resolve, reject) => {

        // Convert symptoms array to string format for CLI arguments
        const processArgs = symptomsArray.map(String);

        // Spawn Python process to generate SHAP visualization and predict disease
        const process = spawn("python", ["shap_prediction.py", ...processArgs]);

        let outputData = "";
        let errorData = "";

        process.stdout.on("data", (data) => {
            outputData += data.toString();
        });

        process.stderr.on("data", (data) => {
            errorData += data.toString();
        });

        process.on("close", (code) => {
            if (code === 0) {
                let parsedData = JSON.parse(outputData.trim());

                console.log("parsed data in node js file is ", parsedData)
                // Fixing reduce function
                const symptoms_contribution = parsedData.results.symptoms_values.reduce((acc, item) => {
                    const key = item.Feature.replace(/\s+/g, "_"); // Replace spaces with underscores
                    acc[key] = parseFloat(item["SHAP Value"].toFixed(18)); // Keep 18 decimal places
                    return acc;
                }, {}); // Initialize accumulator as an empty object
                parsedData.results.symptoms_contribution = symptoms_contribution
                resolve(parsedData);
                // console.log("Transformed Symptoms Contribution:", symptoms_contribution);
            }
            else {
                reject(new Error(`SHAP generation failed: ${errorData}`));
            }
        });
    });
}



async function sendOTP(email, otp) {

    // Configure Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL, // Your email
            pass: process.env.ADMIN_EMAIL_PASS  // Your app password
        }
    });

    // Email content
    let mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'One-Time-Password',
        html: `<p>Your 4-digit OTP is: <strong>${otp}</strong></p>`
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
        return otp; // Return the generated OTP
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('OTP sending failed');
    }
}


// send predictions to mail

async function sendPredictionsToMail(email, predictionData) {

    // Configure Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL, // Your email
            pass: process.env.ADMIN_EMAIL_PASS  // Your app password
        }
    });


    console.log(predictionData.image_path)

    const fileUrl = "C:/Users/krishna/OneDrive/Desktop/clinical-decision-support-system/public/shap_outputs/shap_force_plot_68.html";



    // Email content
    let mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Prediction results',
        html: `
        <h3>Recent prediction</h3>
        <table border="0" cellpadding="5">
            <tr><td><strong>Text input</strong></td><td>${predictionData.text_input}</td></tr>
            <tr><td><strong>Predicted disease</strong></td><td>${predictionData.predicted_disease}</td></tr>
        </table>
    `,
        attachments: [
            {
                filename: path.basename(predictionData.image_path), // Extracts the file name
                path: predictionData.image_path, // Full path to the file
                contentType: 'text/html' // Ensures it's treated as an HTML file
            }
        ]
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`prediction results sent to ${email}`);
        return true; // Return the generated OTP
    } catch (error) {
        console.error('Error sending results:', error);
        throw new Error('OTP sending failed');
    }
}


//user registeration
patientApp.post('/patient-register', expressAsyncHandler(async (request, response) => {

    //import userscollection obj 
    const patientsCredentialsObj = request.app.get("patientsCredentialsObj")

    //get user obj
    const newuser = request.body

    //get data from collection
    const patientOfDb = await patientsCredentialsObj.findOne({ email: newuser.email })

    //if user exists 
    if (patientOfDb != null)
        response.status(200).send({ message: "user already existed" })



    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();


    await sendOTP(newuser.email, otp);


    response.status(201).send({ message: "new user created", otp: otp })

}))



//user insertion in db
patientApp.post('/new-patient-register', expressAsyncHandler(async (request, response) => {

    //import userscollection obj 
    const patientsCredentialsObj = request.app.get("patientsCredentialsObj")

    //get user obj
    const newuser = request.body

    //hash the password 
    const hashedpassword = await bcryptjs.hash(newuser.password, 5);

    //replace plain password with hashed passowrd 
    newuser.password = hashedpassword;

    const userCount = await patientsCredentialsObj.countDocuments();

    // Generate a unique user_id as count + 1
    const user_id = userCount + 1;

    const newUserObj = {
        user_id,
        ...newuser, // Spread existing user fields
    };

    await patientsCredentialsObj.insertOne(newUserObj);


    // //insert user 
    // await patientsCredentialsObj.insertOne(newuser)

    response.status(201).send({ message: "new user created" })

}))



//user login verification
patientApp.post('/patient-login', expressAsyncHandler(async (request, response) => {
    //import patientsCredentialsObj 
    const patientsCredentialsObj = request.app.get("patientsCredentialsObj")

    const patientCredObj = request.body

    const patientOfDb = await patientsCredentialsObj.findOne({ email: patientCredObj.email })

    //if username is not valid 
    if (patientOfDb == null) {
        response.status(200).send({ flag: 1 })
    }
    //if username match 
    else {

        //if passwords does not match 
        let isequal = await bcryptjs.compare(patientCredObj.password, patientOfDb.password)

        if (isequal == false) {
            response.status(200).send({ flag: 2 })
        }
        //if passwords match 
        else {
            //create a jwt token 
            let jwttoken = await jwt.sign({ username: patientOfDb.username }, 'abcdef', { expiresIn: '1h' })

            let loginPatient = await patientsCredentialsObj.findOne({ email: patientCredObj.email })

            response.status(201).send({ message: "successful user login", loginPatient: loginPatient })

        }
    }
}))



//predict disease


patientApp.post(
    "/predict-disease",
    expressAsyncHandler(async (request, response) => {

        const patientsPredictionsObj = request.app.get("patientsPredictionsObj")
        const inputdata = request.body.text;
        const user_id = request.body.user_id
        console.log("user id in node js is ", user_id)
        if (!inputdata) {
            return response.status(400).json({ error: "Text input is required" });
        }

        const process = spawn("python", ["prediction.py"]);

        let outputData = "";
        let errorData = "";

        // Capture Python stdout (Valid JSON Output)
        process.stdout.on("data", (data) => {
            outputData += data.toString();
        });

        // Capture Python stderr (Errors or Warnings)
        process.stderr.on("data", (data) => {
            errorData += data.toString();
        });

        // Send input data to Python script **before the process ends**
        process.stdin.write(JSON.stringify({ text: inputdata }) + "\n");
        process.stdin.end();

        // ✅ Handle process exit in an `async` function
        process.on("close", async (code) => {
            if (outputData.trim()) {
                try {
                    let parsedData = JSON.parse(outputData.trim());
                    console.log("Text input:", parsedData.text_input);
                    console.log("Extracted symptoms:", parsedData.extracted_symptoms);
                    console.log("Symptoms binary array:", JSON.stringify(parsedData.symptoms_array));
                    console.log("Predicted Disease:", parsedData.disease);

                    try {
                        // ✅ Await inside an `async` function
                        const visualizations = await generate_shap_predictions(parsedData.symptoms_array);
                        console.log("SHAP visualization saved at:", visualizations);

                        if (!response.headersSent) {

                            const moment = require("moment"); // Import moment.js for date & time formatting

                            // Create new object to insert
                            const newPrediction = {
                                user_id: user_id,  // Assuming userId is available from session or request
                                date: moment().format("DD/MM/YY"),  // Get current date in dd/mm/yy format
                                time: moment().format("HH:mm"),  // Get current time in HH:mm format
                                text_input: parsedData.text_input,
                                predicted_disease: parsedData.disease,
                                image_path: visualizations.results.image_path,  // Assuming imagePath is available from request or processing
                                symptoms_contribution: visualizations.results.symptoms_contribution  // Storing symptoms array contribution
                            };

                            await patientsPredictionsObj.insertOne(newPrediction);

                            return response.status(201).json({
                                message: "disease-predicted",
                                predicted_disease: parsedData.disease,
                                extracted_symptoms:parsedData.extracted_symptoms,
                                symptoms_array:parsedData.symptoms_array,
                                shap_results: visualizations,
                            });
                        }
                    } catch (shapError) {
                        console.error("SHAP Generation Error:", shapError);
                        if (!response.headersSent) {
                            return response.status(500).json({ error: "Failed to generate SHAP visualization" });
                        }
                    }
                } catch (error) {
                    console.error("JSON Parsing Error:", error);
                    if (!response.headersSent) {
                        return response.status(500).json({ error: "Invalid response from Python script" });
                    }
                }
                return;
            }

            // ✅ Check if errorData contains real errors (ignore logs/warnings)
            if (errorData.trim() && !errorData.includes("oneDNN") && !errorData.includes("UserWarning")) {
                console.error(`Python script error: ${errorData}`);
                if (!response.headersSent) {
                    return response.status(500).json({ error: "Python script error", details: errorData });
                }
            } else {
                console.log("Non-critical warnings ignored.");
            }
        });
    })
);


//patient previous predictions
patientApp.post('/get-previous-predictions', expressAsyncHandler(async (request, response) => {

    const patientsPredictionsObj = request.app.get("patientsPredictionsObj")

    const user_id = request.body.user_id

    let previousPredictions = await patientsPredictionsObj.find({ user_id: user_id }).toArray();



    return response.status(201).json({
        message: "Previous predictions",
        previousPredictions: previousPredictions
    });


}))


patientApp.post('/send-predictions-to-mail', expressAsyncHandler(async (request, response) => {


    const user_email = request.body.email

    const predictionData = request.body.predictionsData


    const fs = require('fs');



    // Resolve the absolute path
    const imagePath = path.resolve(__dirname, '../../public/', predictionData.image_path);

    predictionData.image_path = imagePath


    await sendPredictionsToMail(user_email, predictionData);

    return response.status(201).json({
        message: "Mail sent successfully",
    });


}))


patientApp.post(
    '/schedule-appointment',
    expressAsyncHandler(async (request, response) => {

      const patientsCollection = request.app.get("patientAppointmentsObj");
  
      const { user_id, doctorName, appointmentDate, appointmentTime } = request.body;
  
      if (!user_id || !doctorName || !appointmentDate || !appointmentTime) {
        return response.status(400).json({ message: "Missing appointment details" });
      }
  
      const appointmentDetails = {
        doctorName,
        appointmentDate,
        appointmentTime,
        bookedAt: new Date().toISOString()
      };

      console.log(appointmentDetails)

      const existingUser = await patientsCollection.findOne({ user_id });
  
      if (existingUser) {
        await patientsCollection.updateOne(
          { user_id },
          { $push: { scheduledAppointments: appointmentDetails } }
        );
      } else {
        await patientsCollection.insertOne({
          user_id,
          scheduledAppointments: [appointmentDetails]
        });
      }
  
      response.status(200).json({ message: "Appointment scheduled successfully" });
    })
  );
  

  patientApp.post(
    '/get-appointments',
    expressAsyncHandler(async (request, response) => {
      const patientsCollection = request.app.get("patientAppointmentsObj");
      const user_id  = request.body.user_id;
  
      if (!user_id) {
        return response.status(400).json({ message: "Missing user_id" });
      }
  
      const userData = await patientsCollection.findOne({ user_id });
  
      if (!userData) {
        return response.status(404).json({ message: "User not found" });
      }
  
      // Sort appointments by appointmentDate and appointmentTime
      const sortedAppointments = userData.scheduledAppointments.sort((a, b) => {
        // Compare by appointment date first (latest date first)
        const dateDiff = new Date(b.appointmentDate) - new Date(a.appointmentDate);
        if (dateDiff !== 0) return dateDiff;
  
        // If dates are the same, compare by appointment time (latest time first)
        const timeA = new Date(`1970-01-01T${a.appointmentTime}`);
        const timeB = new Date(`1970-01-01T${b.appointmentTime}`);
        return timeB - timeA;
      });
  
      response.status(200).json({
        message: "Appointments fetched successfully",
        appointments: sortedAppointments,
      });
    })
  );


  patientApp.put('/edit-profile', expressAsyncHandler(async (request, response) => {
    const patientsCredentialsObj = request.app.get("patientsCredentialsObj");
    const { user_id, firstName, lastName, phone } = request.body;
    if (!user_id || !firstName || !lastName || !phone) {
      return response.status(400).json({ message: "Missing required fields" });
    }
  
    const updateResult = await patientsCredentialsObj.updateOne(
      { user_id },
      { $set: { firstName, lastName, phone } }
    );
  
    if (updateResult.modifiedCount === 0) {
      return response.status(404).json({ message: "User not found or no changes made" });
    }
  
    response.status(200).json({ message: "Profile updated successfully" });
  }));


  patientApp.post('/profile-details', expressAsyncHandler(async (request, response) => {
    const patientsCredentialsObj = request.app.get("patientsCredentialsObj");
    const  user_id  = request.body.user_id;  // Get the user_id from the query parameters

   
    if (!user_id) {
      return response.status(400).json({ message: "User ID is required" });
    }
  
    // Find the user by user_id
    const user = await patientsCredentialsObj.findOne({ user_id });
  
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }
  
    // Return the user profile data
    response.status(200).json({ user });
  }));
  
  
  


module.exports = patientApp