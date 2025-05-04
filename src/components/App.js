import './App.css';
import "@fontsource/open-sans"; // Defaults to 400 weight
import Home from './components/Home/Home';
import Predictor from './components/Predictor/Predictor';
import PatientSignup from './components/PatientSignup/PatientSignup';
import PatientLogin from './components/PatientLogin/PatientLogin';
import Doctors from './components/Doctors/Doctors';
import Aboutus from './components/Aboutus/Aboutus';
import Profile from './components/Profile/Profile';
import PatientHistory from './components/PatientHistory/PatientHistory';
import Appointments from './components/Appointments/Appointments';


import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import RootLayout from './components/Rootlayout/RootLayout';


function App() {

  const router = createBrowserRouter([
    {
      path:"/",
      element:<RootLayout/>,
      children:[
        {
          path:"/",
          element:<Home/>
        },
        {
          path:"/predictor",
          element:<Predictor/>
        },
        {
           path:"/doctors",
           element:<Doctors/>
        },
        {
          path:"/patientlogin",
          element:<PatientLogin/>
        },
        {
          path:"/patientsignup",
          element:<PatientSignup/>
        },
        {
          path:"/aboutus",
          element:<Aboutus/>
        },
        {
          path:"/profile",
          element:<Profile/>
        },
        {
          path:"/patient-history",
          element:<PatientHistory/>
        },
        {
          path:"/appointments",
          element:<Appointments/>
        }
      ]
    }
  ])
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;
