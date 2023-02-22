//React
import React from 'react';

//Style
import './index.css';

function ComponentHeader ({ title }) {
  return (
    <>
      <div className="component_header">
        <span className="title_page_label">{title}</span>
      </div>
    </>
  );
}
export default ComponentHeader;
