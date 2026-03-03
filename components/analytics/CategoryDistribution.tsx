import { CATEGORY_ICONS } from '@/lib/categories'

type CategoryRow = {
  category: string
  pct: number
}

interface Props {
  data: CategoryRow[]
}

export function CategoryDistribution({ data }: Props) {
  if (!data.length) return null

  return (
    <div style={{ padding: '0 8px' }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#7B98B8',
          marginBottom: 20,
        }}
      >
        Distribución
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {data.map(({ category, pct }) => (
          <div key={category}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 7,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f9ff' }}>
                {CATEGORY_ICONS[category] ?? '•'} {category}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#38bdf8',
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {pct}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 9999,
                background: 'rgba(148,210,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: '#38bdf8',
                  opacity: 0.6,
                  borderRadius: 9999,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
