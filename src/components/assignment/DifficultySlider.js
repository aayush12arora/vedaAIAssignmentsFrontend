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
    const parsedValue = Number.parseInt(newValue, 10) || 0;
    const targetValue = Math.min(100, Math.max(0, parsedValue));
    const otherKeys = ['easy', 'medium', 'hard'].filter((key) => key !== difficulty);
    const remaining = 100 - targetValue;
    const otherTotal = otherKeys.reduce((sum, key) => sum + values[key], 0);

    const redistributed = {};

    if (otherTotal === 0) {
      const baseShare = Math.floor(remaining / otherKeys.length);
      let leftover = remaining - baseShare * otherKeys.length;

      otherKeys.forEach((key, index) => {
        redistributed[key] = baseShare + (index < leftover ? 1 : 0);
      });
    } else {
      let assigned = 0;

      otherKeys.forEach((key, index) => {
        if (index === otherKeys.length - 1) {
          redistributed[key] = remaining - assigned;
          return;
        }

        const share = Math.round((values[key] / otherTotal) * remaining);
        redistributed[key] = share;
        assigned += share;
      });
    }

    const newValues = {
      ...values,
      ...redistributed,
      [difficulty]: targetValue
    };

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
