type SectionProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  className?: string;
};

/**
 * Cabecalho de secao no padrao editorial: rotulo pequeno em caixa alta, titulo
 * grande, e um filete separando. O contraste de escala entre rotulo e titulo e
 * o que da hierarquia — era justamente o que faltava no layout anterior.
 */
export function Section({
  eyebrow,
  title,
  description,
  meta,
  children,
  id,
  className = ""
}: SectionProps) {
  return (
    <section id={id} className={`shell scroll-mt-24 ${className}`}>
      <div className="rule" />
      <div className="flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between md:py-14">
        <div className="max-w-2xl">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2 className="mt-4 text-display text-balance text-white">{title}</h2>
          {description ? (
            <p className="prose-measure mt-5">{description}</p>
          ) : null}
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}
