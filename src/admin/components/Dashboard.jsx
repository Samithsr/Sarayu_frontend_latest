import React, { useEffect, useState } from "react";
import "../index.css";
import apiClient from "../../api/apiClient";
import Loader from "../../users/loader/Loader";
import { useNavigate } from "react-router-dom";
import { FiLayout } from "react-icons/fi";
import LayoutAssign from "./DashboardComponents/LayoutAssign";

const Dashboard = () => {
  const navigate = useNavigate();

  const [companyList, setCompanyList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [managerList, setManagerList] = useState([]);

  const [filteredCompanyList, setFilteredCompanyList] = useState([]);
  const [filteredSupervisorList, setFilteredSupervisorList] = useState([]);
  const [filteredEmployeeList, setFilteredEmployeeList] = useState([]); // Default to empty array
  const [filteredManagerList, setFilteredManagerList] = useState([]);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [queryInput, setQueryInput] = useState({
    company: "",
    manager: "",
    supervisor: "",
    employee: "",
  });

  const [activeCompany, setActiveCompany] = useState("");
  const [activeSupervisor, setActiveSupervisor] = useState(null);
  const [layoutAssignModel, setLayoutAssignModel] = useState(false);
  const [layoutAssignUserId, setLayoutAssignUserId] = useState("");
  const [layoutAssignUserRole, setLayoutAssignUserRole] = useState("");

  useEffect(() => {
    fetchCompanyList();
  }, []);

  const fetchCompanyList = async () => {
    setCompanyLoading(true);
    try {
      const res = await apiClient.get("/auth/companies");
      setCompanyList(res.data);
      setFilteredCompanyList(res.data);
      setCompanyLoading(false);
    } catch (error) {
      console.log(error.message);
      setCompanyLoading(false);
    }
  };

  const handleSetActiveCompany = (companyName, id) => {
    setActiveCompany(companyName);
    fetchAllManagers(id);
    fetchAllSupervisors(id);
    fetchAllEmployees(id);
    setActiveSupervisor(null); // Reset active supervisor when company changes
    setFilteredEmployeeList([]); // Clear employee list when company changes
  };

  const fetchAllManagers = async (id) => {
    setManagerLoading(true);
    try {
      const res = await apiClient(`/auth/getallmanager/${id}`);
      setManagerList(res.data.data);
      setFilteredManagerList(res.data.data);
      setManagerLoading(false);
    } catch (error) {
      console.log(error.message);
      setManagerLoading(false);
    }
  };

  const fetchAllSupervisors = async (id) => {
    setSupervisorLoading(true);
    try {
      const res = await apiClient(`/auth/supervisor/getAllSupervisorOfSameCompany/${id}`);
      setSupervisorList(res.data.data);
      setFilteredSupervisorList(res.data.data);
      console.log("list of employees under supervisors : ", res.data.data[0].employees);
      setSupervisorLoading(false);
    } catch (error) {
      console.log(error.message);
      setSupervisorLoading(false);
    }
  };

  const fetchAllEmployees = async (id) => {
    setEmployeeLoading(true);
    try {
      const res = await apiClient.get(`/auth/employee/getAllEmployeesOfSameCompany/${id}`);
      setEmployeeList(res.data.data);
      // Do not set filteredEmployeeList here to keep it empty by default
      setEmployeeLoading(false);
    } catch (error) {
      console.log(error.message);
      setEmployeeLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQueryInput({ ...queryInput, [name]: value });

    if (name === "company") {
      const filter = companyList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanyList(filter);
    }

    if (name === "manager") {
      const filter = managerList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredManagerList(filter);
    }

    if (name === "supervisor") {
      const filter = supervisorList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSupervisorList(filter);
    }

    if (name === "employee") {
      const filter = filteredEmployeeList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmployeeList(filter);
    }
  };

  const handleLayoutModel = (id, role) => {
    setLayoutAssignUserId(id);
    setLayoutAssignUserRole(role);
    setLayoutAssignModel(true);
  };

  const handleSetActiveSupervisor = (supervisor) => {
    setActiveSupervisor(supervisor);
    // Filter employees based on the selected supervisor's employees array
    setFilteredEmployeeList(supervisor.employees || []);
  };

  return (
    <>
      {layoutAssignModel && (
        <LayoutAssign
          id={layoutAssignUserId}
          role={layoutAssignUserRole}
          setLayoutAssignModel={setLayoutAssignModel}
        />
      )}
      <div className="_admin_dashboard_main_container">
        <div className="_admin_dashboard_grid_company_container mt-4">
          <section>
            <input
              type="text"
              placeholder="Search company..."
              value={queryInput.company}
              name="company"
              onChange={handleInputChange}
            />
            <div className="_admin_dashboard_grid_company_list_container">
              {!companyLoading ? (
                <>
                  {filteredCompanyList?.map((item) => (
                    <li
                      style={{
                        padding: "7px 20px",
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                      key={item?._id}
                      className={
                        activeCompany === item?.name
                          ? "_admin_dashboard_grid_company_list_container_active_li"
                          : ""
                      }
                      onClick={() => handleSetActiveCompany(item?.name, item?._id)}
                    >
                      {item?.name}
                    </li>
                  ))}
                </>
              ) : (
                <Loader />
              )}
            </div>
          </section>

          <section>
            <input
              type="text"
              value={queryInput.supervisor}
              name="supervisor"
              placeholder="Search manager..."
              onChange={handleInputChange}
            />
            <div className="_admin_dashboard_grid_company_list_container">
              {!supervisorLoading ? (
                <>
                  {filteredSupervisorList?.map((item) => (
                    <li key={item?._id}>
                      <p
                        onClick={() => handleSetActiveSupervisor(item)}
                        className={
                          activeSupervisor?._id === item?._id
                            ? "_admin_dashboard_grid_company_list_container_active_li"
                            : ""
                        }
                      >
                        {item?.name}
                      </p>
                      <p onClick={() => handleLayoutModel(item?._id, item?.role)}>
                        <FiLayout />
                      </p>
                    </li>
                  ))}
                </>
              ) : (
                <Loader />
              )}
            </div>
          </section>

          <section>
            <input
              type="text"
              value={queryInput.employee}
              name="employee"
              placeholder="Search user..."
              onChange={handleInputChange}
            />
            <div className="_admin_dashboard_grid_company_list_container">
              {!employeeLoading ? (
                <>
                  {filteredEmployeeList?.map((item) => (
                    <li key={item?._id}>
                      <p>{item?.name}</p>
                      <p onClick={() => handleLayoutModel(item?._id, item?.role)}>
                        <FiLayout />
                      </p>
                    </li>
                  ))}
                </>
              ) : (
                <Loader />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;