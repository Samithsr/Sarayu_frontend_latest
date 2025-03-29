import React, { useEffect, useState } from "react";
import "../index.css";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import AllTopicsList from "./DashboardComponents/AllTopicsList";
import { MdDelete } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const TagCreation = () => {
  const [createTagname, setCreateTagname] = useState("");
  const [createUnit, setCreateUnit] = useState("");
  const [createLabel, setCreateLabel] = useState(""); // New state for label
  const [topiCreated, setTopicCreated] = useState(false);
  const [createTagnameValidationError, setCreateTagnameValidationError] =
    useState("");
  const [recetntFiveTopic, setRecentFiveTopic] = useState([]);
  const [showTopicDeleteModel, setShowTopicDeleteModel] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState("");
  const [topicList, setTopicList] = useState([]);
  const [topiListFilter, setTopicListFilter] = useState([]);

  useEffect(() => {
    fetchAllTopics();
  }, [topiCreated]);

  const handleTagnameChange = (e) => {
    setCreateTagnameValidationError("");
    setCreateTagname(e.target.value);
  };

  const handleUnitChange = (e) => {
    setCreateTagnameValidationError("");
    setCreateUnit(e.target.value);
  };

  const handleLabelChange = (e) => { // New handler for label
    setCreateTagnameValidationError("");
    setCreateLabel(e.target.value);
  };

  const validateInputs = () => {
    const tagnameRegex = /^[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+$/;
    if (!tagnameRegex.test(createTagname)) {
      setCreateTagnameValidationError("admin_alltopics_error_color");
      return false;
    }
    if (!createUnit.trim()) {
      setCreateTagnameValidationError("admin_alltopics_error_color");
      return false;
    }
    if (!createLabel.trim()) { // Validate label
      setCreateTagnameValidationError("admin_alltopics_error_color");
      return false;
    }
    return true;
  };

  const storeSubscribedTopic = async (topic) => {
    try {
      await apiClient.post(`/auth/subscribedTopics`, { topic });
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchAllTopics = async () => {
    try {
      const response = await apiClient("/mqtt/get-all-tagname");
      setTopicList(response.data.data.sort((a, b) => b - a));
      setTopicListFilter(response.data.data.sort((a, b) => b - a));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleTopicSearchFilter = (e) => {
    let query = e.target.value;
    const filteredData = topicList.filter((item) =>
      item.topic.toLowerCase().includes(query.toLowerCase())
    );
    setTopicListFilter(filteredData);
  };

  useEffect(() => {
    fetchRecentFiveTopics();
  }, []);

  const fetchRecentFiveTopics = async () => {
    try {
      const res = await apiClient.get("/mqtt/get-recent-5-tagname");
      setRecentFiveTopic(res.data.data);
      setTopicCreated(!topiCreated);
      setShowTopicDeleteModel(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCreateTopic = async () => {
    if (!validateInputs()) return;
    const combinedTopic = `${createTagname}|${createUnit}|${createLabel}`; // Include label in topic

    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: combinedTopic,
        label: createLabel // Pass label to API
      });
      toast.success("TagName created successfully!");
      await fetchRecentFiveTopics();
      setCreateTagname("");
      setCreateUnit("");
      setCreateLabel(""); // Reset label
      setCreateTagnameValidationError("");
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCreateAndSubscribeTopic = async () => {
    if (!validateInputs()) return;
    const combinedTopic = `${createTagname}|${createUnit}|${createLabel}`; // Include label in topic

    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: combinedTopic,
        label: createLabel // Pass label to API
      });
      toast.success("TagName created successfully!");
      await apiClient.post("/mqtt/subscribe", {
        topic: combinedTopic,
      });
      storeSubscribedTopic(combinedTopic);
      toast.success(`Subscribed to ${combinedTopic} successfully!`);
      await fetchRecentFiveTopics();
      setCreateTagname("");
      setCreateUnit("");
      setCreateLabel(""); // Reset label
      setCreateTagnameValidationError("");
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleDeleteTopic = async () => {
    try {
      let encodedTopic = encodeURIComponent(topicToDelete);
      await apiClient.delete(`/mqtt/delete-topic/${encodedTopic}`);
      toast.success(`${topicToDelete} deleted successfully!`);
      await fetchRecentFiveTopics();
      setTopicCreated(!topiCreated);
      setShowTopicDeleteModel(false);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div
      className="dashboard_main_section_container"
      data-aos="zoom-in"
      data-aos-duration="300"
      data-aos-once="true"
    >
      {showTopicDeleteModel && (
        <div className="admin_tagcreation_delete_model">
          <div>
            <div className="my-3">
              <IoIosWarning size={"35"} color="red" />
            </div>
            <p>Are you sure you want to delete tagname : {topicToDelete}</p>
            <div>
              <button onClick={handleDeleteTopic}>Delete</button>
              <button onClick={() => setShowTopicDeleteModel(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="admin_tagcreation_main_container">
        <div className="admin_tagcreation_container">
          <div>
            <h4>Create TagName</h4>
            <p
              className={`admin_tagcreation_container_note ${createTagnameValidationError}`}
            >
              Format: company/device/tagname | unit | label
            </p>
            <input
              type="text"
              value={createTagname}
              className="mt-3"
              onChange={handleTagnameChange}
              placeholder="Enter tagname (e.g., company/device/tagname)"
            />
            <input
              type="text"
              value={createUnit}
              onChange={handleUnitChange}
              placeholder="Enter unit (e.g., m/s)"
              className="mt-3"
            />
            <input
              type="text"
              value={createLabel}
              onChange={handleLabelChange}
              placeholder="Enter label"
              className="mt-3"
            />
            <div className="admin_tagcreation_button_container">
              <button onClick={handleCreateTopic}>Create</button>
              <button onClick={handleCreateAndSubscribeTopic}>
                Create & Subscribe
              </button>
            </div>
            {/* <div className="admin_topiccreation_subscribe_all_button">
              <IoIosWarning size={"20"} /> Subscribe to All TagNames
            </div> */}
          </div>
        </div>
        <div className="admin_tagcreation_all_topics_container">
          <div className="admin_alltopics_searchbar_container">
            <input
              type="text"
              onChange={handleTopicSearchFilter}
              placeholder="Search by tagname"
            />
            <button>
              <IoSearch />
            </button>
          </div>
          <AllTopicsList
            topiCreated={topiCreated}
            setTopicToDelete={setTopicToDelete}
            topiListFilter={topiListFilter}
            topicList={topicList}
            storeSubscribedTopic={storeSubscribedTopic}
            setShowTopicDeleteModel={setShowTopicDeleteModel}
          />
        </div>
      </section>
    </div>
  );
};

export default TagCreation;