export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-surface rounded-xl border border-border p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
