import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button className="back-arrow" onClick={() => navigate(-1)}>
      ←
    </button>
  );
};

export default BackButton;