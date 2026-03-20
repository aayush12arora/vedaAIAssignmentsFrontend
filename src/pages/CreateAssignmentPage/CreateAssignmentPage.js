import React from 'react';
import { AssignmentForm } from '../../components/assignment';
import './CreateAssignmentPage.css';

const CreateAssignmentPage = () => {
  return (
    <div className="cap-page">
      <div className="cap-header">
        <h1 className="cap-title">Create Assignment</h1>
        <p className="cap-subtitle">Set up a new assignment for your students</p>
      </div>
      <div className="cap-card">
        <AssignmentForm />
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
