import React, { useEffect, useState } from "react";
import "../../style.css";
import { useNavigate, useParams } from "react-router-dom";
import DigitalViewOne from "../graphs/digitalview/DigitalViewOne";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import BarChart from "../graphs/barchart/BarChart";
import Type2 from "../../../admin/components/digitalmeters/Type2";
import { IoCloseSharp } from "react-icons/io5";
import io from "socket.io-client";
import LayoutStyle1 from "../common/LayoutStyle1";
import LayoutStyle2 from "../common/LayoutStyle2";
import LayoutStyle3 from "../common/LayoutStyle3";

const LayoutView = () => {
  const { topic, layout } = useParams();
  const navigate = useNavigate();

  const [liveMessage, setLiveMessages] = useState();

  useEffect(() => {
    const socket = io("http://65.1.185.30", {
      path: "/socket.io/",  
      transports: ["websocket", "polling"],
    });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      setLiveMessages(data?.message?.message?.message);
    });
    socket.on("noData", (data) => {
      console.warn(data.message);
    });

    socket.on("error", (data) => {
      console.error(data.message);
    });

    return () => {
      socket.emit("unsubscribeFromTopic");
      socket.disconnect();
    };
  }, [topic]);

  return (
    <div className="allusers_layoutview_main_container">
      <header className="allusers_layoutview_header">
        Layout View ({topic?.split("|")[0].split("/")[2]})
        <div className="allusers_layoutview_close_icon">
          <IoCloseSharp onClick={() => navigate(-1)} />
        </div>
      </header>
      {layout === "layout1" && (
        <LayoutStyle1 liveMessage={liveMessage} topic={topic} />
      )}
      {layout === "layout2" && (
        <LayoutStyle2 liveMessage={liveMessage} topic={topic} />
      )}
      {layout === "layout3" && (
        <LayoutStyle3 liveMessage={liveMessage} topic={topic} />
      )}
    </div>
  );
};

export default LayoutView;
