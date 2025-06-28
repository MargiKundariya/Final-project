import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ParticipationTable from './ParticipationTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]); // Filtered participation records
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [judge, setJudge] = useState(null); // Judge details

  useEffect(() => {
    const fetchJudgeAndParticipation = async () => {
      try {
        // Fetch judge data from session
        const { data: judgeData } = await axios.get('http://localhost:5000/api/users/session', {
          withCredentials: true,
        });

        if (!judgeData || !judgeData._id) {
          // Prevent the same error toast from appearing repeatedly
          toast.error('Judge not found or invalid session.', { toastId: 'judge-not-found' });
          setLoading(false);
          return;
        }

        setJudge(judgeData);

        // Fetch judge's assigned events
        const { data: judgeDetails } = await axios.get(`http://localhost:5000/api/judges/${judgeData._id}`, {
          withCredentials: true,
        });

        const assignedEvents = judgeDetails.assignedEvents || [];

        if (assignedEvents.length === 0) {
          // Prevent repeating the "No assigned events" toast
          toast.warn('No assigned events for this judge.', { toastId: 'no-assigned-events' });
          setNoData(true);
          setLoading(false);
          return;
        }

        // Fetch participation records filtered by assigned events
        const { data: participationData } = await axios.get('http://localhost:5000/api/participation/present', {
          params: { eventNames: assignedEvents.join(',') },
          withCredentials: true,
        });

        if (participationData.length === 0) {
          // Prevent repeating the "No participation records" toast
          toast.info('No participation records found for your assigned events.', { toastId: 'no-participation-records' });
          setNoData(true);
        } else {
          setStudents(participationData);
          setNoData(false);
          toast.success('Participation records fetched successfully!', { toastId: 'participation-fetched' });
        }
      } catch (error) {
        console.log('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchJudgeAndParticipation();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ToastContainer />
      {noData ? (
        <div>No participation records available for your assigned events.</div>
      ) : (
        <ParticipationTable students={students} />
      )}
    </div>
  );
};

export default ParticipationDetails;
