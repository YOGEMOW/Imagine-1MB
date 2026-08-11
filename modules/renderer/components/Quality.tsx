import React from 'react'
import Ranger from './Ranger'

interface IQualityProps {
  value: number
  nativeStep: number
  disabled?: boolean
  onChange(value: number): void
}

const transformInput = (value: number) => value / 10

const transformOutput = (value: number) => value * 10

export default function Quality({
  value,
  nativeStep,
  disabled,
  onChange,
}: IQualityProps) {
  return (
    <Ranger
      min={10}
      max={100}
      value={value}
      nativeStep={nativeStep}
      disabled={disabled}
      onChange={onChange}
      transformInput={transformInput}
      transformOutput={transformOutput}
    />
  )
}
