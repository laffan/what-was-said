import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Home from "./pages/Home";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import './styles.css';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
 

]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="Home">
    <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);