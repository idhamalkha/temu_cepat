import logoNavSvg from '../assets/Logo-Nav.svg';

export default function LogoNav({ size = 40, className = '' }) {
  return (
    <img
      src={logoNavSvg}
      alt="Logo Nav"
      width={size}
      height={size}
      className={`logo-nav ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
}
