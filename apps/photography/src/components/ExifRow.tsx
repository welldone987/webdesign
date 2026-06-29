type ExifRowProps = {
  label: string;
  value?: string;
  missingText: string;
};

export function ExifRow({ label, value, missingText }: ExifRowProps) {
  return (
    <div className="border-b border-ink/10 pb-4">
      <dt className="font-sans text-xs uppercase tracking-[0.2em] text-ink/42">{label}</dt>
      <dd className="font-numeric-serif mt-1">{value || missingText}</dd>
    </div>
  );
}
