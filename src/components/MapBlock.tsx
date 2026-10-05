import React from "react";

const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/SHIVAJI+VIDYAPEETH+FUTURE+SPARK+INTERNATIONAL+SCHOOL/@17.4432549,78.396492,17z";

const EMBED_SRC = "https://www.google.com/maps?q=17.4432549,78.396492&z=17&output=embed";

type Props = {
  title?: string;
  heightClassName?: string; // e.g. "h-[260px]"
};

const MapBlock: React.FC<Props> = ({ title = "Find Us", heightClassName = "h-[280px]" }) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="p-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-brand-dark">{title}</div>
          <div className="mt-1 text-slate-600 text-sm">
            Kavuri Hills, Jubilee Hills, Hyderabad
          </div>
        </div>
        <a
          href={MAPS_PLACE_URL}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-4 py-2 rounded-xl bg-brand-dark text-white font-bold text-sm hover:bg-brand-light transition"
        >
          Open Maps
        </a>
      </div>

      <div className={`w-full ${heightClassName}`}>
        <iframe
          title="Future Spark School Location"
          src={EMBED_SRC}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default MapBlock;
