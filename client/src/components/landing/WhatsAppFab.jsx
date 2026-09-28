const WA = 'https://wa.me/541124026647?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.';

export default function WhatsAppFab() {
  return (
    <a
      href={WA}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribirnos por WhatsApp"
      className="group fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-6px_rgba(37,211,102,0.65)] active:scale-95 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2.5 sm:rounded-full sm:px-5 sm:py-4"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36A9.43 9.43 0 1 1 12.05 21.5m8.03-17.46A11.35 11.35 0 0 0 2.22 17.74L.6 23.5l5.9-1.55A11.35 11.35 0 0 0 20.08 4.04" />
      </svg>
      <span className="hidden text-[15px] font-bold sm:inline">Escribinos</span>
    </a>
  );
}
