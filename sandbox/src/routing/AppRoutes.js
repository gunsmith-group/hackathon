import {BrowserRouter, Route, Routes} from "react-router-dom";
import React from "react";

import SandboxWW3E from "./views/SandboxWW3E";
import SandboxManufacturing from "./views/SandboxManufacturing";
import TestNaclView from "./views/TestNaclView";

 const AppRoutes = () => {
    return <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SandboxManufacturing/>} />
                    <Route path="/sandbox/ww3e" element={<SandboxWW3E/>} />
                    <Route path="/sandbox/manufacturing" element={<SandboxManufacturing/>} />
                    <Route path="/dev" element={<TestNaclView/>} />
                </Routes>
            </BrowserRouter>
}

export default AppRoutes;