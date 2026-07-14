import Image from "next/image";
import Link from "next/link";

export default function BrandHeader() {
  return (
    <div className="mb-8 border-b border-slate-200/70 pb-5">
      <Link
        href="/"
        aria-label="Return to the 501 Elite home page"
        className="inline-block rounded-xl transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#123E74]/15"
      >
        <Image
          src="/brand/501-elite-wordmark.png"
          alt="501 Elite Baseball"
          width={180}
          height={118}
          priority
          className="h-auto w-[125px] object-contain drop-shadow-[0_8px_16px_rgba(18,62,116,0.10)] sm:w-[145px]"
        />
      </Link>
    </div>
  );
}
