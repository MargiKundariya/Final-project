import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../../assets/css/reportcomponent.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ReportComponent = () => {
  const [monthWiseData, setMonthWiseData] = useState([]);
  const [eventWiseData, setEventWiseData] = useState([]);
  const [departmentWiseData, setDepartmentWiseData] = useState([]);
  const [yearWiseData, setYearWiseData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/reports/monthly")
      .then((res) => res.json())
      .then((data) => data.success && setMonthWiseData(data.monthlyReport))
      .catch((error) => console.error("Error fetching monthly report:", error));

    fetch("http://localhost:5000/api/reports/events")
      .then((res) => res.json())
      .then((data) => data.success && setEventWiseData(data.eventReport))
      .catch((error) => console.error("Error fetching event-wise report:", error));

    fetch("http://localhost:5000/api/reports/department-wise")
      .then((res) => res.json())
      .then((data) => data.success && setDepartmentWiseData(data.departmentReport))
      .catch((error) => console.error("Error fetching department-wise report:", error));

    fetch("http://localhost:5000/api/reports/year-wise")
      .then((res) => res.json())
      .then((data) => data.success && setYearWiseData(data.yearReport))
      .catch((error) => console.error("Error fetching year-wise report:", error));

    fetch("http://localhost:5000/api/reports/top-performers")
      .then((res) => res.json())
      .then((data) => data.success && setTopPerformers(data.topPerformers))
      .catch((error) => console.error("Error fetching top performers:", error));
  }, []);

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    let yPosition = 10;

    const addSectionToPDF = async (elementId, title) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Skipping: ${elementId} not found`);
        return;
      }
    
      // Ensure yPosition is initialized and within bounds
      if (typeof yPosition !== "number" || yPosition < 0) {
        yPosition = 10; // Default to the starting position
      }
    
      pdf.setFontSize(14);
      
      // Ensure we have valid values for title and yPosition
      if (title && yPosition !== undefined) {
        pdf.text(title, 10, yPosition); // Ensure valid yPosition here
        yPosition += 10;
      } else {
        console.error('Invalid arguments for text in PDF. Title:', title, 'yPosition:', yPosition);
      }
    
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure rendering before capturing
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#fff" });
        const imgData = canvas.toDataURL("image/png");
    
        let imgWidth = pageWidth - 20;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
    
        if (yPosition + imgHeight > pageHeight - 10) {
          pdf.addPage();
          yPosition = 10; // Reset yPosition for a new page
        }
    
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error(`Error capturing ${elementId}:`, error);
      }
    };
    

    setTimeout(async () => {
      await addSectionToPDF("month-report");
      await addSectionToPDF("event-report");
      await addSectionToPDF("department-report");
      await addSectionToPDF("year-report");
      await addSectionToPDF("top-performers");

      pdf.save("Event_Report.pdf");
    }, 1000);
  };

  const barData = {
    labels: monthWiseData.map((entry) => entry.month),
    datasets: [
      {
        data: monthWiseData.map((entry) => entry.eventCount),
        backgroundColor: "#3182ce",
        borderRadius: 5,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (tooltipItem) => `Events: ${tooltipItem.raw}` },
      },
    },
  };

  return (
    <div>
      <button onClick={exportToPDF} className="export-button">Export to PDF</button>
      <div id="report-container" className="report-container">
        <h2>Event Reports</h2>

        <div id="month-report" className="report-section">
          <h3>Month-wise Report</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div id="event-report" className="report-section">
          <h3>Event-wise Report</h3>
          <table className="report-table">
            <thead>
              <tr><th>Event Name</th><th>Date</th><th>Participants</th></tr>
            </thead>
            <tbody>
              {eventWiseData.map((event, index) => (
                <tr key={index}>
                  <td>{event.name}</td>
                  <td>{new Date(event.date).toDateString()}</td>
                  <td>{event.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div id="department-report" className="report-section">
          <h3>Department-wise Report</h3>
          <table className="report-table">
            <thead>
              <tr><th>Department</th><th>Total Participants</th></tr>
            </thead>
            <tbody>
              {departmentWiseData.map((dept, index) => (
                <tr key={index}><td>{dept._id}</td><td>{dept.totalParticipants}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div id="year-report" className="report-section">
          <h3>Year-wise Participation</h3>
          <table className="report-table">
            <thead>
              <tr><th>Year</th><th>Total Participants</th></tr>
            </thead>
            <tbody>
              {yearWiseData.map((year, index) => (
                <tr key={index}><td>{year._id}</td><td>{year.totalParticipants}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div id="top-performers" className="report-section">
          <h3>Top Performers</h3>
          <table className="report-table">
            <thead>
              <tr><th>Name</th><th>Marks</th></tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={index}><td>{performer.name}</td><td>{performer.marks}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportComponent;
