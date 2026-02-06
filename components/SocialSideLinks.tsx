import React from "react";

type SocialLink = {
  name: string;
  href: string;
  className: string;
  icon: React.ReactNode;
};

const IconInstagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Z" />
    <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    <path d="M17.5 6.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
  </svg>
);

const IconWhatsApp = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.91 11.91 0 0 0 12.01 0C5.39 0 .01 5.38.01 12c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.62A11.96 11.96 0 0 0 12.01 24C18.63 24 24 18.62 24 12c0-3.19-1.24-6.19-3.49-8.52zM12.01 22.05c-1.86 0-3.69-.5-5.3-1.44l-.38-.22-3.68.96.98-3.59-.25-.37A9.94 9.94 0 0 1 2.02 12c0-5.51 4.48-9.99 9.99-9.99 2.67 0 5.18 1.04 7.07 2.92A9.93 9.93 0 0 1 22 12c0 5.51-4.48 10.05-9.99 10.05zm5.76-7.47c-.31-.16-1.84-.91-2.12-1.01-.28-.1-.49-.16-.7.16-.21.31-.8 1.01-.98 1.22-.18.21-.36.23-.67.08-.31-.16-1.29-.48-2.46-1.52-.91-.81-1.52-1.81-1.7-2.12-.18-.31-.02-.48.13-.64.13-.13.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.7-1.68-.96-2.31-.25-.6-.5-.52-.7-.53h-.6c-.21 0-.54.08-.83.39-.28.31-1.09 1.07-1.09 2.61s1.12 3.03 1.28 3.24c.16.21 2.2 3.36 5.34 4.71.75.32 1.33.51 1.79.66.75.24 1.43.21 1.97.13.6-.09 1.84-.75 2.1-1.47.26-.72.26-1.33.18-1.47-.08-.13-.28-.21-.6-.36z" />
  </svg>
);

const IconFacebook = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 8h3.2V5.2c0-1.1.3-2 1.1-2.7.8-.7 1.9-1 3.2-1h2.3v3h-1.6c-.6 0-1 .1-1.2.3-.2.2-.3.6-.3 1.1V8h3.1l-.5 3H20v13h-6V11h-3V8h3V5.8c0-2.1.6-3.7 1.8-4.8C17 0 18.7-.6 20.9-.6h2.9V2.4h-2.3c-.8 0-1.3.1-1.6.4-.3.3-.4.8-.4 1.6V8Z" />
  </svg>
);

const IconYouTube = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.5 6.2s-.2-1.7-.8-2.5c-.8-1-1.7-1-2.1-1.1C17.6 2.2 12 2.2 12 2.2h0s-5.6 0-8.6.4c-.4 0-1.3.1-2.1 1.1C.7 4.5.5 6.2.5 6.2S.1 8.2.1 10.3v1.9c0 2.1.4 4.1.4 4.1s.2 1.7.8 2.5c.8 1 1.9 1 2.4 1.1 1.7.2 7.3.4 8.3.4 0 0 5.6 0 8.6-.4.4 0 1.3-.1 2.1-1.1.6-.8.8-2.5.8-2.5s.4-2 .4-4.1v-1.9c0-2.1-.4-4.1-.4-4.1ZM9.6 14.9V7.7l6.4 3.6-6.4 3.6Z" />
  </svg>
);

const SocialSideLinks: React.FC = () => {
  const links: SocialLink[] = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/future_sparkint/",
      className:
        "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:brightness-110",
      icon: <IconInstagram className="w-5 h-5" />,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@FutureSparkInternationalSchool",
      className: "bg-red-600 hover:bg-red-700",
      icon: <IconYouTube className="w-5 h-5" />,
    },
    {
      name: "WhatsApp",
      // replace number if needed
      href: "https://wa.me/918977653606",
      className: "bg-emerald-500 hover:bg-emerald-600",
      icon: <IconWhatsApp className="w-5 h-5" />,
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/futurespark.int/",
      className: "bg-blue-600 hover:bg-blue-700",
      icon: <IconFacebook className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col gap-3">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.name}
          title={l.name}
          className={`group w-11 h-11 rounded-full text-white shadow-xl border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-2xl ${l.className}`}
        >
          {l.icon}
          <span className="sr-only">{l.name}</span>
        </a>
      ))}
    </div>
  );
};

export default SocialSideLinks;
