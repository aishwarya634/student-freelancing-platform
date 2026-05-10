import React from 'react';

const ProjectCard = ({ project }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-[#1D9E75] transition-all group">
    <h3 className="text-lg font-bold text-gray-800 mb-2">{project.title}</h3>
    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
    <div className="flex justify-between items-center">
      <span className="text-[#1D9E75] font-semibold">${project.budget}</span>
      <button className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium">
        View Details
      </button>
    </div>
  </div>
);

export default ProjectCard;