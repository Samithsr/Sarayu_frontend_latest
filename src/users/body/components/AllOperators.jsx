import React, { useEffect, useState } from "react";
import "../../style.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiClient from "../../../api/apiClient";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import Loader from "../../loader/Loader";
import { useNavigate } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import Users from './../../../admin/components/Users';

const AllOperators = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const [operatorsList, setOperatorsList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
    } catch (error) {
      // toast.error(error?.response?.data?.error);
    }
  };

    useEffect(() => {
      if (loggedInUser) {
        fetchAllEmployees();
      }
    }, [loggedInUser]);

  const fetchAllEmployees = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(
        `/auth/employee/getAllEmployeesOfSameCompany/${loggedInUser?.company?._id}`
      );
      setOperatorsList(res?.data?.data);
      setLocalLoading(false);
    } catch (error) {
      // toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.topics) {
    }
  }, [selectedUser]);

  const navigate = useNavigate();

  const handleUserClick = (id) => {
    navigate(`/allusers/singleuserdashboard/${id}`);
  };

  if (localLoading) {
    return <Loader />;
  }
  console.log(operatorsList);
  return (
    <div className="alluser_alloperators_container">
      <div className="alluser_alloperators_scrollable-table">
        <table className="alluser_alloperators_table">
          <thead>
            <tr>
              <th>Row</th>
              <th>User</th>
              <th>Email</th>
              <th>Company Name</th>
              <th>Address</th>
              <th>Phone No</th>
              {/* <th>Visit</th> */}
            </tr>
          </thead>
          <tbody>
            {operatorsList.map((employee, index) => (
              <tr key={employee._id}>
                <td>{index + 1}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.phonenumber ? employee.phonenumber : "--"}</td>

                
                {/* <td>
                  <FaExternalLinkAlt
                    onClick={() => handleUserClick(employee._id)}
                    style={{ cursor: "pointer", color: "green" }}
                  />
                </td> */}



              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllOperators;
