const Logo = ({ ...props }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <rect width="100%" height="100%" rx="16" fill="white" />
    <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22C12.6863 22 10 19.3137 10 16ZM14.5 16C14.5 14.6193 15.6193 13.5 17 13.5C18.3807 13.5 19.5 14.6193 19.5 16C19.5 17.3807 18.3807 18.5 17 18.5C15.6193 18.5 14.5 17.3807 14.5 16Z"
        fill="black"
    />
    <path
        d="M5 16H10M22 16H27"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
    />
</svg>

);

export default Logo;
