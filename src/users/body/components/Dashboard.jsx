import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../../style.css";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import LiveDataTd from "../common/LiveDataTd";
import { FaRegBookmark, FaDigitalOcean } from "react-icons/fa";
import { BsBookmarkStarFill } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import WeekTd from "../common/WeekTd";
import YestardayTd from "../common/YestardayTd";
import TodayTd from "../common/TodayTd";
import { VscGraph } from "react-icons/vsc";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";

const Dashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userSlice);
  const [favoriteList, setFavoriteList] = useState([]);
  const [graphwlList, setGraphwlList] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timestamps, setTimestamps] = useState({});
  const itemsPerPage = 20;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Function to calculate relative time in IST
  const getRelativeTime = (topic) => {
    const timestamp = timestamps[topic];
    if (!timestamp) return "-";

    const lastUpdateUTC = new Date(timestamp);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const lastUpdateIST = new Date(lastUpdateUTC.getTime() + istOffset);
    const currentTimeIST = new Date(currentTime.getTime() + istOffset);

    const diffSeconds = Math.floor((currentTimeIST - lastUpdateIST) / 1000);

    if (diffSeconds < 0) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  };

  // Handle timestamp updates from LiveDataTd
  const handleTimestampUpdate = useCallback((topic, timestamp) => {
    setTimestamps((prev) => ({
      ...prev,
      [topic]: timestamp,
    }));
  }, []);

  // Fetch user details and operators list
  const fetchUserDetails = useCallback(async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      const userData = res?.data?.data;
      setLoggedInUser(userData);
      dispatch(setUserDetails(userData));
      setFavoriteList(userData?.favorites || []);
      setGraphwlList(userData?.graphwl || []);

      // Fetch operators list if company ID exists
      if (userData?.company?._id) {
        const operatorsRes = await apiClient.get(
          `/auth/employee/getAllEmployeesOfSameCompany/${userData.company._id}`
        );
        setOperatorsList(operatorsRes?.data?.data || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch user details"
      );
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, user.id, user.role]);

  useEffect(() => {
    if (user.id) fetchUserDetails();
  }, [user.id, fetchUserDetails]);

  // Reset current page when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Favorite and graph watchlist handlers
  const handleAddFavorite = useCallback(
    async (topic) => {
      try {
        await apiClient.post(`/auth/${user.role}/${user.id}/favorites`, {
          topic,
        });
        setFavoriteList((prev) => [...prev, topic]);
        toast.success("Tagname added to watchlist");
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Failed to add topic to favorites"
        );
      }
    },
    [user.role, user.id]
  );

  const handleRemoveFavorite = useCallback(
    async (topic) => {
      try {
        await apiClient.delete(`/auth/${user.role}/${user.id}/favorites`, {
          data: { topic },
        });
        setFavoriteList((prev) => prev.filter((fav) => fav !== topic));
        toast.success("Topic removed from watchlist");
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "Failed to remove topic from watchlist"
        );
      }
    },
    [user.role, user.id]
  );

  const handleAddGraphwl = useCallback(
    async (topic) => {
      try {
        await apiClient.post(`/auth/${user.role}/${user.id}/graphwl`, {
          topic,
        });
        setGraphwlList((prev) => [...prev, topic]);
        toast.success("Tagname added to graph watchlist");
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "Failed to add topic to graph watchlist"
        );
      }
    },
    [user.role, user.id]
  );

  const handleRemoveGraphwl = useCallback(
    async (topic) => {
      try {
        await apiClient.delete(`/auth/${user.role}/${user.id}/graphwl`, {
          data: { topic },
        });
        setGraphwlList((prev) => prev.filter((fav) => fav !== topic));
        toast.success("Topic removed from graph watchlist");
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "Failed to remove topic from graph watchlist"
        );
      }
    },
    [user.role, user.id]
  );

  // Pagination handler
  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  // Sorting functionality
  const handleSort = useCallback((key) => {
    setSortConfig((prevSortConfig) => {
      let direction = "asc";
      if (prevSortConfig.key === key) {
        if (prevSortConfig.direction === "asc") {
          direction = "desc";
        } else if (prevSortConfig.direction === "desc") {
          direction = "none";
        }
      }
      return direction === "none"
        ? { key: null, direction: "none" }
        : { key, direction };
    });
  }, []);

  const getSortSymbol = useCallback(
    (key) => {
      if (sortConfig.key === key) {
        return sortConfig.direction === "asc" ? (
          <IoMdArrowDropup />
        ) : sortConfig.direction === "desc" ? (
          <IoMdArrowDropdown />
        ) : (
          "↔"
        );
      }
      return "↔";
    },
    [sortConfig]
  );

  // Parse topics and add dummy data for sorting
  const parsedTopics = useMemo(() => {
    return (
      loggedInUser?.topics?.map((topic) => {
        const [path, unit] = topic.split("|");
        const tagName = path.split("/")[2];
        return {
          topic,
          tagName,
          unit: unit || "-",
          isFFT: unit === "fft",
          weekMax: Math.random() * 100,
          yesterdayMax: Math.random() * 100,
          todayMax: Math.random() * 100,
        };
      }) || []
    );
  }, [loggedInUser?.topics]);

  // Filter topics based on search query
  const filteredParsedTopics = useMemo(() => {
    if (!searchQuery.trim()) return parsedTopics;
    const query = searchQuery.trim().toLowerCase();
    return parsedTopics.filter((topic) =>
      topic.tagName.toLowerCase().includes(query)
    );
  }, [parsedTopics, searchQuery]);

  // Sort topics based on sort configuration
  const sortedParsedTopics = useMemo(() => {
    let sortableItems = [...filteredParsedTopics];
    if (sortConfig.key && sortConfig.direction !== "none") {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredParsedTopics, sortConfig]);

  // Memoize the current page's items
  const currentItems = useMemo(() => {
    const offset = currentPage * itemsPerPage;
    return sortedParsedTopics.slice(offset, offset + itemsPerPage);
  }, [sortedParsedTopics, currentPage, itemsPerPage]);

  // Memoize page count calculation
  const pageCount = useMemo(
    () => Math.ceil(sortedParsedTopics.length / itemsPerPage),
    [sortedParsedTopics, itemsPerPage]
  );

  // Handle operator selection
  const handleOperatorChange = (e) => {
    const operatorId = e.target.value;
    setSelectedOperator(operatorId);
    if (operatorId) {
      navigate(`/allusers/singleuserdashboard/${operatorId}`);
    }
  };

  if (localLoading) return <Loader />;

  return (
    <div className="allusers_dashboard_main_container">
      {/* Search Bar and Operators Dropdown */}
      <div style={{ maxWidth: "100vw", margin: "20px auto", padding: "0 15px" }}>
        <input
          className="allusers_dashboard_search_by_tagname_main_container_"
          type="text"
          placeholder="Search by tag name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "30%",
            borderRadius: "25px",
            padding: "7px 17px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
        <select
          name="operators"
          id="operators"
          className="company-dropdown"
          value={selectedOperator}
          onChange={handleOperatorChange}
        >
          <option value="" disabled>
            Select an Operator
          </option>
          {operatorsList.map((operator) => (
            <option key={operator._id} value={operator._id}>
              {operator.name}     


              {/* ({operator.email})  u want email also in drop down pass email also */}
            </option>
          ))}
        </select>
      </div>

      <div className="alluser_alloperators_container">
        <div className="alluser_alloperators_scrollable-table">
          <table className="alluser_alloperators_table">
            <thead>
              <tr>
                <th style={{ background: "red" }}>TagName</th>
                <th
                  className="allusers_dashboard_live_data_th"
                  style={{ background: "rgb(150, 2, 208)" }}
                >
                  Live
                </th>
                <th>Unit</th>
                <th>Relative</th>
                <th>TodayMax</th>
                <th>YesterdayMax</th>
                <th>WeekMax</th>
                <th>Report</th>
                <th>LayoutView</th>
                <th>Edit/Graph/Digital</th>
                <th>Graph[WL]</th>
                <th>WatchList</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(({ topic, tagName, unit, isFFT }, index) => (
                <tr key={`${topic}-${index}`}>
                  <td style={{ background: "#34495e", color: "white" }}>
                    {tagName}
                  </td>
                  <LiveDataTd
                    topic={topic}
                    onTimestampUpdate={handleTimestampUpdate}
                  />
                  <td style={{ background: "#34495e", color: "white" }}>
                    {unit}
                  </td>
                  <td style={{ background: "#34495e", color: "white" }}>
                    {getRelativeTime(topic)}
                  </td>
                  <TodayTd topic={topic} />
                  <YestardayTd topic={topic} />
                  <WeekTd topic={topic} />
                  <td>
                    {!isFFT && (
                      <BiSolidReport
                        size={20}
                        style={{ cursor: "pointer", color: "gray" }}
                        className="icon"
                        onClick={() =>
                          navigate(
                            `/allusers/report/${encodeURIComponent(topic)}`
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    <LuLayoutDashboard
                      size={20}
                      style={{ cursor: "pointer", color: "gray" }}
                      className="icon"
                      onClick={() =>
                        navigate(
                          `/allusers/layoutview/${encodeURIComponent(topic)}/${
                            loggedInUser?.layout
                          }`
                        )
                      }
                    />
                  </td>
                  <td className="allusers_dashboard_graph_digital_td">
                    <button>
                      {!isFFT && (
                        <MdEdit
                          size={18}
                          style={{ cursor: "pointer" }}
                          className="icon"
                          onClick={() =>
                            navigate(
                              `/allusers/editsinglegraph/${encodeURIComponent(
                                topic
                              )}`
                            )
                          }
                        />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/allusers/viewsinglegraph/${encodeURIComponent(
                            topic
                          )}`
                        )
                      }
                    >
                      <VscGraph />
                    </button>
                    {!isFFT && (
                      <button
                        onClick={() =>
                          navigate(
                            `/allusers/singledigitalmeter/${encodeURIComponent(
                              topic
                            )}/${user.role}/${user.id}`
                          )
                        }
                      >
                        <FaDigitalOcean style={{ cursor: "pointer" }} />
                      </button>
                    )}
                  </td>
                  <td>
                    {graphwlList.includes(topic) ? (
                      <BsBookmarkStarFill
                        color="rgb(158, 32, 189)"
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveGraphwl(topic)}
                      />
                    ) : (
                      <FaRegBookmark
                        color="rgb(158, 32, 189)"
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddGraphwl(topic)}
                      />
                    )}
                  </td>
                  <td>
                    {favoriteList.includes(topic) ? (
                      <BsBookmarkStarFill
                        color="green"
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveFavorite(topic)}
                      />
                    ) : (
                      <FaRegBookmark
                        color="green"
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddFavorite(topic)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-center mt-4 mb-4">
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              breakLabel="..."
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={handlePageClick}
              containerClassName="pagination"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              activeClassName="active"
              disabledClassName="disabled"
              forcePage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;