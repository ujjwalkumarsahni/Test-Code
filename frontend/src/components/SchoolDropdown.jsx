import React, { useEffect, useState } from 'react';
import { schoolAPI } from '../services/api';

const SchoolDropdown = ({ onSelect }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getSchools({ status: 'active' });
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select School</option>
      {schools.map(school => (
        <option key={school._id} value={school._id}>
          {school.name} - {school.city}
        </option>
      ))}
    </select>
  );
};

export default SchoolDropdown;