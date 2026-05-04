/**
 * SVG Logo component mimicking the Claude style.
 */
export const ClaudeLogo = ({ className }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <rect
        key={angle}
        x="47"
        y="14"
        width="6"
        height="28"
        rx="3"
        fill="currentColor"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);
