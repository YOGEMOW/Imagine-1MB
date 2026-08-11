import React, { ChangeEvent } from 'react'
import { bytesToMb, mbToBytes } from '../../common/utils'

import './TargetSize.less'

interface ITargetSizeProps {
  value: number
  onChange(value: number): void
}

const MIN_MB = 0.1
const MAX_MB = 100

const clampMb = (mb: number) => Math.min(MAX_MB, Math.max(MIN_MB, mb))

export default function TargetSize({ value, onChange }: ITargetSizeProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const mb = Number(e.target.value)
    if (Number.isFinite(mb)) {
      onChange(mbToBytes(clampMb(mb)))
    }
  }

  const mb = value > 0 ? bytesToMb(value) : 1

  return (
    <div className="target-size">
      <input
        type="number"
        min={MIN_MB}
        max={MAX_MB}
        step={0.1}
        value={Number(mb.toFixed(2))}
        onChange={handleChange}
      />
      <span className="target-size-unit">MB</span>
    </div>
  )
}
