import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProfileVoteCardProps } from '@dao-dao/tstypes/ui/ProfileVoteCard'
import { formatPercentOf100 } from '@dao-dao/utils'

import { Button } from '../Button'
import { MembershipPill } from './MembershipPill'
import { ProfileCardWrapper } from './ProfileCardWrapper'
import { ProfileVoteButton } from './ProfileVoteButton'

export * from '@dao-dao/tstypes/ui/ProfileVoteCard'

export const ProfileVoteCard = <T extends unknown>({
  options,
  currentVote,
  currentVoteDisplay,
  loading,
  votingPower,
  daoName,
  onCastVote,
  ...wrapperProps
}: ProfileVoteCardProps<T>) => {
  const { t } = useTranslation()

  const [selected, setSelected] = useState(currentVote)

  return (
    <ProfileCardWrapper
      compact
      underHeaderComponent={<MembershipPill daoName={daoName} ghost isMember />}
      {...wrapperProps}
    >
      <div className="secondary-text flex flex-row items-center justify-between">
        <p>{t('title.votingPower')}</p>
        <p className="font-mono text-text-primary">
          {formatPercentOf100(votingPower)}
        </p>
      </div>

      <div className="secondary-text mt-3 mb-4 flex flex-row items-center justify-between">
        <p>{t('title.vote')}</p>
        {currentVoteDisplay}
      </div>

      {options.map((option, index) => (
        <ProfileVoteButton
          key={index}
          onClick={() => setSelected(option.value)}
          option={option}
          pressed={option.value === selected}
        />
      ))}

      <Button
        className="mt-4"
        contentContainerClassName={clsx('justify-center', {
          'primary-text': !selected,
        })}
        disabled={!selected}
        loading={loading}
        onClick={() => selected && onCastVote(selected)}
        size="lg"
        variant={!selected || loading ? 'secondary' : 'primary'}
      >
        {t('button.castYourVote')}
      </Button>
    </ProfileCardWrapper>
  )
}