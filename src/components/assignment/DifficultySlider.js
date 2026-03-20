import React, { useState, useEffect } from 'react';
import './DifficultySlider.css';

const DifficultySlider = ({ distribution, onChange }) => {
  const [values, setValues] = useState({
    easy: distribution.easy,
    medium: distribution.medium,
    hard: distribution.hard
  });

  useEffect(() => {
    setValues({
      easy: distribution.easy,
      medium: distribution.medium,
      hard: distribution.hard
    });
  }, [distribution]);

  const handleChange = (difficulty, newValue) => {
    const parsedValue = parseInt(newValue) || 0;
    const clampedValue = Math.min(100, Math.max(0, parsedValue));
    
    // Calculate the total of other values
    const otherKeys = ['easy', 'medium', 'hard'].filter(k => k !== difficulty);
    const otherTotal = otherKeys.reduce((sum, key) => sum + values[key], 0);
    
    // Ensure total doesn't exceed 100
    let finalValue = clampedValue;
    if (clampedValue + otherTotal > 100) {
      finalValue = 100 - otherTotal;
    }

    const newValues = { ...values, [difficulty]: finalValue };
    
    // Auto-adjust remaining if needed
    const total = newValues.easy + newValues.medium + newValues.hard;
    if (total < 100) {
      // Add remaining to medium by default
      newValues.medium += (100 - total);
    }

    setValues(newValues);
    onChange(newValues);
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  return (
    <div className="difficulty-slider">
      <div className="difficulty-bar">
        <div 
          className="difficulty-segment easy" 
          style={{ width: `${values.easy}%` }}
        >
          {values.easy > 10 && <span>Easy {values.easy}%</span>}
        </div>
        <div 
          className="difficulty-segment medium" 
          style={{ width: `${values.medium}%` }}
        >
          {values.medium > 10 && <span>Medium {values.medium}%</span>}
        </div>
        <div 
          className="difficulty-segment hard" 
          style={{ width: `${values.hard}%` }}
        >
          {values.hard > 10 && <span>Hard {values.hard}%</span>}
        </div>
      </div>

      <div className="difficulty-controls">
        <div className="difficulty-control">
          <label className="difficulty-label easy-label">
            <span className="difficulty-dot easy-dot"></span>
            Easy
          </label>
          <input
            type="range"
            name="easy"
            min="0"
            max="100"
            value={values.easy}
            onChange={handleSliderChange}
            className="difficulty-range"
          />
          <span className="difficulty-value">{values.easy}%</span>
        </div>

        <div className="difficulty-control">
          <label className="difficulty-label medium-label">
            <span className="difficulty-dot medium-dot"></span>
            Medium
          </label>
          <input
            type="range"
            name="medium"
            min="0"
            max="100"
            value={values.medium}
            onChange={handleSliderChange}
            className="difficulty-range"
          />
          <span className="difficulty-value">{values.medium}%</span>
        </div>

        <div className="difficulty-control">
          <label className="difficulty-label hard-label">
            <span className="difficulty-dot hard-dot"></span>
            Hard
          </label>
          <input
            type="range"
            name="hard"
            min="0"
            max="100"
            value={values.hard}
            onChange={handleSliderChange}
            className="difficulty-range"
          />
          <span className="difficulty-value">{values.hard}%</span>
        </div>
      </div>
    </div>
  );
};

export default DifficultySlider;
