import { InfoOutlined } from '@mui/icons-material'
import clsx from 'clsx'

import { IconButton, IconButtonProps } from './IconButton'
import { Tooltip, TooltipProps } from './Tooltip'

export type TooltipInfoIconProps = Omit<TooltipProps, 'children'> &
  Pick<IconButtonProps, 'size' | 'className' | 'iconClassName'>

export const TooltipInfoIcon = ({
  size,
  className,
  iconClassName,
  ...props
}: TooltipInfoIconProps) => (
  <Tooltip {...props}>
    <IconButton
      Icon={InfoOutlined}
      // Only change background on hover, and don't outline. Don't make this
      // feel like a clickable button.
      className={clsx(
        'cursor-help !bg-transparent !p-1.5 !outline-none hover:!bg-btn-ghost-hover',
        className
      )}
      iconClassName={iconClassName}
      size={size}
      variant="ghost"
    />
  </Tooltip>
)