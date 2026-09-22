export default function PhoneFrame({ children, className = '', width = 240 }) {
  return (
    <div className={`wt-phone ${className}`} style={{ width, maxWidth: '100%' }}>
      <div className="flex h-full flex-col pt-6">{children}</div>
    </div>
  );
}
