import Image from "next/image";

export default function BrandHeader() {
  return (
    <div className="mb-8 border-b border-slate-200/70 pb-5">
      <Image
        src="/brand/501-elite-wordmark.png"
        alt="501 Elite Baseball"
        width={180}
        height={118}
        className="h-auto w-[125px] object-contain drop-shadow-[0_8px_16px_rgba(18,62,116,0.10)] sm:w-[145px]"
      />
    </div>
  );
}
