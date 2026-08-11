import React, { ChangeEvent } from 'react'
import classnames from 'classnames'
import Select from './Select'
import __ from '../../locales'

export type CompressionMode = 'quality' | 'size'

interface ICompressionModeSelectProps {
  value: CompressionMode
  onChange(mode: CompressionMode): void
  className?: string
}

export default function CompressionModeSelect({
  value,
  onChange,
  className,
}: ICompressionModeSelectProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as CompressionMode)
  }

  return (
    <Select
      className={classnames('compression-mode-select', className)}
      value={value}
      onChange={handleChange}
    >
      <option value="quality">{__('image_quality')}</option>
      <option value="size">{__('image_size')}</option>
    </Select>
  )
}
