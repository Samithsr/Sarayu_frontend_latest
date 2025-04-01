import React from "react";
import "./LoginLeft.css";
import bannerLogo from "../../authentication/common/LoginBannerLogo/banner6.jpg"


const loginLeft = () => {
  return (
    <div className="col-6 d-md-block d-none col-left">
      <div className="left_img_banner_container">
        <img src={bannerLogo} alt="" />
      </div>
    </div>
  );
};

export default loginLeft;
