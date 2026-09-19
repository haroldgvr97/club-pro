export function PageHeading({ eyebrow, title, description }: {
  eyebrow: string
  title: string
  description: string
}) {
  return <header className="cp-page-header">
    <div>
      <p className="cp-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  </header>
}
