import React, { useState } from "react";

const DropdownSorting = ({ options = [], value, label, onChange }) => {
  const [selected, setSelected] = useState("");

  const handleSelect = (event) => {
    const value = event.target.value;
    setSelected(value);
    onChange(value);
  };
  console.log("label", options);

  return (
    <div style={{ margin: "1rem 0" }}>
      {/* <label style={{ marginRight: "0.5rem" }}>{label}</label> */}
      <select value={selected} onChange={handleSelect}>
        <option value="" disabled>
          {label}
        </option>
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSorting;
