import '../styles/checkbox.css';

const CustomCheckbox = ({ label, checked, onChange, color = "blue" }) => {
  return (
    <label className={`ios-checkbox ${color}`}>
      <input 
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <div className="checkbox-wrapper">
        <div className="checkbox-bg"></div>
        <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="3"
            stroke="currentColor"
            d="M4 12L10 18L20 6"
            className="check-path"
          />
        </svg>
      </div>
      <span style={{marginLeft: '8px'}}>{label}</span>
    </label>
  );
};

export default CustomCheckbox;