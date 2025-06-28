import React from "react";
import { Route,Routes } from "react-router-dom";
import ParticipationDetails from "../components/Judge/ParticipationDetails";
import SNavbar from "../components/Judge/SNavbar";
import InvitationList from "../components/Judge/InvitationList";
function JudgeRouter(){
    return(
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div>
      <SNavbar/>
    </div>
    <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
            <Route path="participation" element={<ParticipationDetails/>} />
            <Route path="invitation" element={<InvitationList/>} />
        </Routes>
    </div>
    </div>
    )
}
export default JudgeRouter;