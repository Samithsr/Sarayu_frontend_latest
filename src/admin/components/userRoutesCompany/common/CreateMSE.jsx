import React from "react";
import InputField from "./InputField";

const CreateMSE = ({
  title,
  userData,
  userError,
  handleChange,
  handleSubmit,
  showSupervisorDropdown,
  supervisorList,
  selectedSupervisorId,
  setSelectedSupervisorId,
  supervisorError,
}) => {
  return (
    <section
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-once="true"
      className="admin_create_supervisor_second_container"
    >
      <div className="admin_create_supervisor_second_container_input_container">
        <InputField
          label="Name"
          id={`${title.toLowerCase()}name`}
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder={`Enter ${title.toLowerCase()} name here...`}
          error={userError.name}
        />
        <InputField
          label="Email"
          id={`${title.toLowerCase()}email`}
          name="email"
          type="email"
          value={userData.email}
          onChange={handleChange}
          placeholder={`Enter ${title.toLowerCase()} email here...`}
          error={userError.email}
        />
        {showSupervisorDropdown && (
          <div className="admin_create_supervior_employee_select_supervisor_container_input_container">
            <div className="position-relative">
              <label
                htmlFor="selectSupervisor"
                className="mb-0"
                style={{ marginLeft: "15px" }}
              >
                Select Manager (Optional)
              </label>
              <br />
              <select
                id="selectSupervisor"
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
              >
                <option value="">Select...</option>
                {supervisorList?.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item?.name}
                  </option>
                ))}
                {supervisorList?.length === 0 && (
                  <option>No Manager present!</option>
                )}
              </select>
            </div>
          </div>
        )}

        <InputField
          label="Phone number"
          id={`${title.toLowerCase()}phonenumber`}
          name="phonenumber"
          type="number"
          value={userData.phonenumber}
          onChange={handleChange}
          placeholder={`Enter ${title.toLowerCase()} phone number...`}
          optional
          error={userError.phonenumber}
        />
        <InputField
          label="Password"
          id={`${title.toLowerCase()}password`}
          name="password"
          type="password"
          value={userData.password}
          onChange={handleChange}
          placeholder={`Enter ${title.toLowerCase()} password here...`}
          error={userError.password}
        />
        <InputField
          label="Confirm Password"
          id={`${title.toLowerCase()}confirmpassword`}
          name="confirmpassword"
          type="password"
          value={userData.confirmpassword}
          onChange={handleChange}
          placeholder="Re-enter password here..."
          error={userError.confirmpassword}
        />

        {title !== "Create Manager" && (
          <>
            <InputField
              label="HeaderOne"
              id={`${title.toLowerCase()}headerone`}
              name="headerone"
              value={userData.headerone ?? ""} // Fallback to empty string
              onChange={handleChange}
              placeholder={`Enter ${title.toLowerCase()} headerone here...`}
              error={userError.name ?? ""} // Fallback to empty string
            />
            <InputField
              label="HeaderTwo"
              id={`${title.toLowerCase()}headertwo`}
              name="headertwo"
              type="text"
              value={userData.headertwo ?? ""}
              onChange={handleChange}
              placeholder={`Enter ${title.toLowerCase()} headertwo here...`}
              error={userError.email ?? ""}
            />
          </>
        )}

        <div>
          <button onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </section>
  );
};

export default CreateMSE;
