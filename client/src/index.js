import React from "react";
import "./index.css";
import 'semantic-ui-css/semantic.min.css';
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import routes from "./routes";

const router = createBrowserRouter(routes)

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);

// import './pages/testlayout.css';
// import TestLayout from './pages/TestLayout';

// const root = createRoot(document.getElementById('root'));
// root.render(<TestLayout />);
