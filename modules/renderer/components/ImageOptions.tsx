import React, { PureComponent } from 'react'
import {
  IOptimizeOptions,
  Empty,
  DEFAULT_MAX_SIZE,
} from '../../common/types'
import { CompressionMode } from './CompressionModeSelect'
import Quality from './Quality'
import TargetSize from './TargetSize'
import __ from '../../locales'

import './ImageOptions.less'

interface ImageOptionsProps {
  options: IOptimizeOptions
  precision: boolean
  mode?: CompressionMode
  onChange(options: IOptimizeOptions): void
}

export default class ImageOptions extends PureComponent<ImageOptionsProps, Empty> {
  handleQualityChange = (quality: number) => {
    this.props.onChange({
      ...this.props.options,
      quality,
    })
  }

  handleTargetSizeChange = (maxSize: number) => {
    this.props.onChange({
      ...this.props.options,
      maxSize,
    })
  }

  renderQuality() {
    const { options, precision } = this.props
    const disabled = !!options.lossless

    return (
      <div className="image-options">
        <div>{__('image_quality')}</div>
        <Quality
          value={options.quality || 0}
          disabled={disabled}
          onChange={this.handleQualityChange}
          nativeStep={precision ? 0.1 : 1}
        />
        <span className="percent-symbol">%</span>
      </div>
    )
  }

  renderTargetSize() {
    return (
      <div className="image-options target-size-row">
        <div>{__('image_size')}</div>
        <TargetSize
          value={this.props.options.maxSize || DEFAULT_MAX_SIZE}
          onChange={this.handleTargetSizeChange}
        />
      </div>
    )
  }

  render() {
    if (this.props.mode === 'size') {
      return this.renderTargetSize()
    }

    return this.renderQuality()
  }
}
