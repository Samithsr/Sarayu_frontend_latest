import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../../../../api/apiClient";

const HistoryGraph = ({ topic, height }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const thresholdLineSeriesRefs = useRef([]);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [granularity, setGranularity] = useState("minutes");
  const [thresholds, setThresholds] = useState([]);

  const granularityOptions = ["seconds", "minutes", "hours", "days"];

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await apiClient.get(`/mqtt/get?topic=${topic}`);
        if (response.data?.data?.thresholds) {
          setThresholds(response.data.data.thresholds);
        }
      } catch (error) {
        console.error("Error fetching thresholds:", error);
      }
    };
    fetchThresholds();
  }, [topic]);

  useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: { backgroundColor: "#ffffff", textColor: "#000000" },
      grid: { vertLines: { color: "#eeeeee" }, horzLines: { color: "#eeeeee" } },
      priceScale: { borderColor: "#cccccc", scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: "#cccccc", timeVisible: true, secondsVisible: true, rightOffset: 20 },
    });

    areaSeriesRef.current = chartRef.current.addAreaSeries({
      topColor: "rgba(41, 98, 255, 0.3)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: "rgba(41, 98, 255, 0.3)",
      lineWidth: 2,
    });

    const handleResize = () => {
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) chartRef.current.remove();
    };
  }, [height]);

  const fetchGraphData = async () => {
    try {
      const body = { topic, from: fromDate.toISOString(), to: toDate.toISOString(), granularity };
      const response = await apiClient.post("/mqtt/realtime-data/custom-range", body);

      if (response.data.success) {
        const data = response.data.messages
          .map((msg) => {
            const timestamp = new Date(msg.timestamp);
            if (isNaN(timestamp.getTime())) return null;
            return { time: Math.floor(timestamp.getTime() / 1000), value: parseFloat(msg.message) };
          })
          .filter(Boolean)
          .sort((a, b) => a.time - b.time);

        if (data.length > 0) {
          areaSeriesRef.current.setData(data);
          chartRef.current.timeScale().fitContent();
        }
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  return (
    <div>
      <style>
        {`
          ._historygraph_controls {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            max-width: 100%;
          }
          ._historygraph_date-pickers {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          ._historygraph_date-pickers label {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          ._historygraph_date-pickers input {
            width: 140px;
          }
          @media (max-width: 800px) {
            ._historygraph_controls {
              flex-direction: column;
              align-items: center;
            }
            ._historygraph_date-pickers {
              flex-direction: column;
              width: 100%;
              align-items: center;
            }
            ._historygraph_date-pickers input {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="_historygraph_controls">
        <div className="_historygraph_date-pickers">
          <label>
            From: &nbsp;
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              maxDate={toDate}
              showTimeSelect
              style={{ width: "100%" }}
            />
          </label>
          <label>
            To: &nbsp;
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              minDate={fromDate}
              maxDate={new Date()}
              showTimeSelect
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="_historygraph_dropdown">
          <label>
            Granularity: &nbsp;
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              style={{ padding: "5px", fontSize: "14px" }}
            >
              {granularityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        <button className="_historygraph_apply-btn" onClick={fetchGraphData} style={{ padding: "6px 12px",margin:"0 15px", fontSize: "14px" }}>
          Apply
        </button>
        </div>
      </div>

      <div style={{ marginTop: "50px" }} ref={chartContainerRef}></div>
    </div>
  );
};

export default HistoryGraph;
