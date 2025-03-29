import React, { useEffect, useState } from "react";
import DigitalViewOne from "./../graphs/digitalview/DigitalViewOne";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../loader/Loader";
import "../Body.css";
import { toast } from "react-toastify";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import apiClient from "../../../api/apiClient";
import { VscGraph } from "react-icons/vsc";
import { BiSolidReport } from "react-icons/bi";

import Type2 from "./../../../admin/components/digitalmeters/Type2";
import Type3 from "./../../../admin/components/digitalmeters/Type3";
import Type4 from "../../../admin/components/digitalmeters/Type4";
import { useNavigate } from "react-router-dom";
import Type1 from "../../../admin/components/digitalmeters/Type1";
import Type5 from "../../../admin/components/digitalmeters/Type5";
import Type6 from "../../../admin/components/digitalmeters/Type6";
import Type7 from "../../../admin/components/digitalmeters/Type7";

const DigitalMeter = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const [assignedTopicList, setAssignedTopicList] = useState([]);
  const [topicBasedDigitalMeter, setTopicBasedDigitalMeter] = useState([]);

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
      setAssignedTopicList(res?.data?.data?.topics);
      setTopicBasedDigitalMeter(res?.data?.data?.assignedDigitalMeters);
      dispatch(setUserDetails(res?.data?.data));
      setLocalLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };

  

  if (localLoading) {
    return <Loader />;
  }

  if(topicBasedDigitalMeter?.length === 0){
    return <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"20px",color:"gray"}}> <h3>No Digital Meters Available!</h3> </div>
  }

  const getMeterDetails = (topic) => {
    const meter = topicBasedDigitalMeter.find((meter) => meter.topic === topic);
    if (!meter) return null; // Don't render anything if no meter is assigned

    return (
      <div className="meter-details" style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
        {meter.meterType === "Type1" && (
          <Type1 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type2" && (
          <Type2 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type3" && (
          <Type3 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type4" && (
          <Type4 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type5" && (
          <Type5 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type6" && (
          <Type6 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
        {meter.meterType === "Type7" && (
          <Type7 {...meter} unit={topic.includes("|") ? topic.split("|")[1] : ""} />
        )}
      </div>
    );
  };

  return (
    <div className="allusers_digitalview_main_container">
      {assignedTopicList
        ?.filter((topic) => topicBasedDigitalMeter.some((meter) => meter.topic === topic)) 
        .map((topic, index) => (
          <div key={index} className="topic-container">
            <div className="allusers_digitalview_main_container_header_container">
              <p>{topic.split("|")[0].split("/")[2]}</p>
              <div>
                <div onClick={() => navigate(`/allusers/viewsinglegraph/${encodeURIComponent(topic)}`)}>
                  <VscGraph />
                </div>
                <div onClick={() => navigate(`/allusers/report/${encodeURIComponent(topic)}`)}>
                  <BiSolidReport />
                </div>
              </div>
            </div>
            {getMeterDetails(topic)}
          </div>
        ))}
    </div>
  );
};

export default DigitalMeter;
