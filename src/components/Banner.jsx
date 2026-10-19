/**
 * Banner info dari sheet `Settings` key `banner_text`, dalam speech bubble
 * putih berborder gelap (config/design.md §5.1).
 */
export function Banner({ text }) {
  if (!text) return null

  return (
    <div className="relative mx-auto w-fit max-w-[92%]">
      <div className="rounded-2xl border-[3px] border-ink bg-white px-5 py-2.5 shadow-soft">
        <p className="text-center font-round text-base font-semibold text-ink md:text-lg">{text}</p>
      </div>
      <span
        aria-hidden="true"
        className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-white"
      />
    </div>
  )
}
