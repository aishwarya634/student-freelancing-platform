import React from 'react';

const ScoreCard = ({ label, score }) => (
  <div className="bg-[#E1F5EE] px-4 py-2 rounded-full flex items-center gap-2">
    <span className="text-[#085041] text-sm font-bold uppercase tracking-wider">{label}:</span>
    <span className="text-[#1D9E75] font-extrabold">{score}%</span>
  </div>
);

export default ScoreCard;