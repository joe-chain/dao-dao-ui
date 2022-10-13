import { PlusIcon } from '@heroicons/react/outline'
import { ExpandCircleDownOutlined } from '@mui/icons-material'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EdamameCrown } from '@dao-dao/icons'
import { TokenCardInfo } from '@dao-dao/tstypes'
import { secondsToWdhms } from '@dao-dao/utils'

import { Button } from './Button'
import { CopyToClipboard, concatAddressStartEnd } from './CopyToClipboard'
import { SpendEmoji, StakeEmoji } from './emoji'
import { IconButton } from './IconButton'
import { ButtonPopup, ButtonPopupSection } from './popup'
import { TokenAmountDisplay } from './TokenAmountDisplay'
import { Tooltip } from './Tooltip'
import { UnstakingModal } from './UnstakingModal'
import { UnstakingTaskStatus } from './UnstakingStatus'

export interface TokenCardProps extends TokenCardInfo {
  onAddToken?: () => void
  onProposeStakeUnstake?: () => void
  onProposeClaim?: () => void
  refreshUnstakingTasks?: () => void
}

export const TokenCard = ({
  crown,
  tokenSymbol,
  tokenDecimals,
  subtitle,
  imageUrl,
  unstakedBalance,
  usdcUnitPrice,
  hasStakingInfo,
  lazyStakingInfo,
  onAddToken,
  onProposeStakeUnstake,
  onProposeClaim,
  refreshUnstakingTasks,
}: TokenCardProps) => {
  const { t } = useTranslation()

  const lazyStakes =
    lazyStakingInfo.loading || !lazyStakingInfo.data
      ? []
      : lazyStakingInfo.data.stakes
  const lazyUnstakingTasks =
    lazyStakingInfo.loading || !lazyStakingInfo.data
      ? []
      : lazyStakingInfo.data.unstakingTasks

  const totalStaked =
    lazyStakes.reduce((acc, stake) => acc + stake.amount, 0) ?? 0
  const totalBalance = unstakedBalance + totalStaked
  const pendingRewards =
    lazyStakes?.reduce((acc, stake) => acc + stake.rewards, 0) ?? 0
  const unstakingBalance =
    lazyUnstakingTasks.reduce(
      (acc, task) =>
        acc +
        // Only include balance of unstaking tasks.
        (task.status === UnstakingTaskStatus.Unstaking ? task.amount : 0),
      0
    ) ?? 0

  const [showUnstakingTokens, setShowUnstakingTokens] = useState(false)

  const buttonPopupSections: ButtonPopupSection[] = useMemo(
    () => [
      ...(onAddToken
        ? [
            {
              label: t('title.token'),
              buttons: [
                {
                  Icon: PlusIcon,
                  label: t('button.addToKeplr'),
                  onClick: onAddToken,
                },
              ],
            },
          ]
        : []),
      ...(onProposeStakeUnstake || onProposeClaim
        ? [
            {
              label: t('title.newProposalTo'),
              buttons: [
                ...(onProposeStakeUnstake
                  ? [
                      {
                        Icon: StakeEmoji,
                        label: t('button.stakeOrUnstake'),
                        onClick: onProposeStakeUnstake,
                      },
                    ]
                  : []),
                ...(onProposeClaim
                  ? [
                      {
                        Icon: SpendEmoji,
                        label: t('button.claim'),
                        onClick: onProposeClaim,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
    ],
    [onAddToken, onProposeClaim, onProposeStakeUnstake, t]
  )

  // Truncate IBC denominations to prevent overflow.
  const originalTokenSymbol = tokenSymbol
  const isIbc = tokenSymbol.toLowerCase().startsWith('ibc')
  tokenSymbol = isIbc ? concatAddressStartEnd(tokenSymbol, 3, 2) : tokenSymbol

  return (
    <>
      <div className="bg-background-tertiary rounded-lg">
        <div className="relative p-5">
          <div className="flex flex-row gap-4 pr-5">
            <div className="relative">
              {/* Image */}
              <div
                className="w-10 h-10 bg-center bg-cover rounded-full"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                }}
              ></div>

              {/* Crown */}
              {!!crown && (
                <EdamameCrown
                  className="absolute -top-4 -left-6 text-secondary stroke-2"
                  height="32px"
                  width="32px"
                />
              )}
            </div>

            {/* Titles */}
            <div className="flex flex-col gap-1">
              {/* We're dealing with an IBC token we don't know about. Instead of showing a long hash, allow the user to copy it. */}
              {isIbc ? (
                <CopyToClipboard
                  className="title-text"
                  takeStartEnd={{
                    start: 8,
                    end: 4,
                  }}
                  value={originalTokenSymbol}
                />
              ) : (
                <p className="title-text">${tokenSymbol}</p>
              )}
              <p className="caption-text">{subtitle}</p>
            </div>
          </div>

          {buttonPopupSections.length > 0 && (
            <div className="absolute top-3 right-3">
              <ButtonPopup
                Trigger={({ open, ...props }) => (
                  <IconButton
                    Icon={ExpandCircleDownOutlined}
                    className="!text-icon-secondary"
                    focused={open}
                    variant="ghost"
                    {...props}
                  />
                )}
                popupClassName="w-[16rem]"
                position="left"
                sections={buttonPopupSections}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 py-4 px-6 border-t border-inactive">
          <div className="flex flex-row gap-8 justify-between items-start">
            <p className="link-text">{t('info.totalHoldings')}</p>
            {/* leading-5 to match link-text's line-height. */}
            <div className="flex flex-col gap-1 items-end font-mono text-right caption-text">
              {/* leading-5 to match link-text's line-height. */}
              <TokenAmountDisplay
                amount={
                  // If staking info has not finished loading, don't show until
                  // it is loaded so this is accurate.
                  hasStakingInfo && lazyStakingInfo.loading
                    ? { loading: true }
                    : totalBalance
                }
                className="leading-5 text-text-body"
                maxDecimals={tokenDecimals}
                symbol={tokenSymbol}
              />

              <TokenAmountDisplay
                amount={
                  // If staking info has not finished loading, don't show until
                  // it is loaded so this is accurate.
                  hasStakingInfo && lazyStakingInfo.loading
                    ? { loading: true }
                    : totalBalance * usdcUnitPrice
                }
                usdc
              />
            </div>
          </div>

          {/* Only display `unstakedBalance` if something is staked, because that means this will differ from `totalBalance` above. */}
          {hasStakingInfo && (
            <div className="flex flex-row gap-8 justify-between items-start">
              <p className="link-text">{t('info.availableBalance')}</p>
              <div className="flex flex-col gap-1 items-end font-mono text-right caption-text">
                {/* leading-5 to match link-text's line-height. */}
                <TokenAmountDisplay
                  amount={unstakedBalance}
                  className="leading-5 text-text-body"
                  maxDecimals={tokenDecimals}
                  symbol={tokenSymbol}
                />

                <TokenAmountDisplay
                  amount={unstakedBalance * usdcUnitPrice}
                  usdc
                />
              </div>
            </div>
          )}
        </div>

        {hasStakingInfo && (lazyStakingInfo.loading || lazyStakingInfo.data) && (
          <div className="flex flex-col gap-2 px-6 pt-4 pb-6 border-t border-inactive">
            <p className="mb-1 link-text">{t('info.stakes')}</p>

            <div className="flex flex-row gap-8 justify-between items-center">
              <p className="secondary-text">{t('title.staked')}</p>

              <TokenAmountDisplay
                amount={
                  lazyStakingInfo.loading ? { loading: true } : totalStaked
                }
                className="font-mono text-right text-text-body caption-text"
                maxDecimals={tokenDecimals}
                symbol={tokenSymbol}
              />
            </div>

            <div className="flex flex-row gap-8 justify-between items-center">
              <p className="secondary-text">{t('title.stakedTo')}</p>

              <p
                className={clsx(
                  'font-mono text-right text-text-body caption-text',
                  lazyStakingInfo.loading && 'animate-pulse'
                )}
              >
                {lazyStakingInfo.loading
                  ? '...'
                  : lazyStakes.length > 0 && (
                      <>
                        {lazyStakes[0].validator.moniker}
                        {lazyStakes.length > 1 && (
                          <>
                            ,{' '}
                            <Tooltip
                              title={
                                <>
                                  {lazyStakes
                                    .slice(1)
                                    .map(({ validator }, index) => (
                                      <p key={index}>{validator.moniker}</p>
                                    ))}
                                </>
                              }
                            >
                              <span className="underline underline-offset-2 cursor-pointer">
                                {t('info.andNumMore', {
                                  count: lazyStakes.length - 1,
                                })}
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </>
                    )}
              </p>
            </div>

            <div className="flex flex-row gap-8 justify-between items-center">
              <p className="secondary-text">{t('title.unstakingTokens')}</p>

              <Button
                className={clsx(
                  'font-mono text-right underline-offset-2 caption-text',
                  unstakingBalance > 0 && 'text-text-body',
                  lazyStakingInfo.loading && '!text-text-body animate-pulse'
                )}
                disabled={lazyStakingInfo.loading}
                onClick={() => setShowUnstakingTokens(true)}
                variant={lazyStakingInfo.loading ? 'none' : 'underline'}
              >
                {lazyStakingInfo.loading
                  ? '...'
                  : t('format.token', {
                      amount: unstakingBalance.toLocaleString(undefined, {
                        notation: 'compact',
                        maximumFractionDigits: tokenDecimals,
                      }),
                      symbol: tokenSymbol,
                    })}
              </Button>
            </div>

            <div className="flex flex-row gap-8 justify-between items-center">
              <p className="secondary-text">{t('info.pendingRewards')}</p>

              <TokenAmountDisplay
                amount={
                  lazyStakingInfo.loading ? { loading: true } : pendingRewards
                }
                className="font-mono text-right text-text-body caption-text"
                maxDecimals={tokenDecimals}
                symbol={tokenSymbol}
              />
            </div>
          </div>
        )}
      </div>

      {!lazyStakingInfo.loading && lazyStakingInfo.data && (
        <UnstakingModal
          onClaim={onProposeClaim}
          onClose={() => setShowUnstakingTokens(false)}
          refresh={refreshUnstakingTasks}
          tasks={lazyStakingInfo.data.unstakingTasks}
          unstakingDuration={
            lazyStakingInfo.data.unstakingDurationSeconds
              ? secondsToWdhms(lazyStakingInfo.data.unstakingDurationSeconds)
              : undefined
          }
          visible={showUnstakingTokens}
        />
      )}
    </>
  )
}
