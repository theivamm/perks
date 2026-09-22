import logoUrl from '../../assets/logo.svg';

export default function WintuuLogo({ height = 24, className = '' }) {
  return (
    <img
      src={logoUrl}
      alt="Wintuu"
      className={className}
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
