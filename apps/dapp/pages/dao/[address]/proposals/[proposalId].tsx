// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { useWallet } from '@noahsaso/cosmodal'
import type { GetStaticPaths, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { useActions } from '@dao-dao/actions'
import {
  DaoPageWrapper,
  DaoProposalPageWrapperProps,
  SuspenseLoader,
  useDaoInfoContext,
} from '@dao-dao/common'
import { makeGetDaoProposalStaticProps } from '@dao-dao/common/server'
import {
  CommonProposalInfo,
  ProposalModuleAdapterProvider,
  useProposalModuleAdapterContext,
} from '@dao-dao/proposal-module-adapter'
import { useProfile } from '@dao-dao/state'
import { ActionKey } from '@dao-dao/tstypes'
import {
  Loader,
  Logo,
  PageLoader,
  ProfileDisconnectedCard,
  Proposal,
  ProposalNotFound,
} from '@dao-dao/ui'
import { SITE_URL } from '@dao-dao/utils'
import { useVotingModuleAdapter } from '@dao-dao/voting-module-adapter'

import { ProfileProposalCard } from '@/components'

interface InnerProposalProps {
  proposalInfo: CommonProposalInfo
}

const InnerProposal = ({ proposalInfo }: InnerProposalProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const daoInfo = useDaoInfoContext()
  const { coreAddress, coreVersion } = daoInfo
  const { connected } = useWallet()
  const {
    adapter: {
      components: {
        ProposalStatusAndInfo,
        ProposalActionDisplay,
        ProposalVoteTally,
        ProposalVotes,
      },
      hooks: { useProposalRefreshers },
    },
    common: {
      hooks: { useActions: useProposalModuleActions },
    },
  } = useProposalModuleAdapterContext()
  const {
    hooks: { useActions: useVotingModuleActions },
  } = useVotingModuleAdapter()

  const votingModuleActions = useVotingModuleActions()
  const proposalModuleActions = useProposalModuleActions()
  const actions = useActions(
    coreVersion,
    useMemo(
      () => [...votingModuleActions, ...proposalModuleActions],
      [proposalModuleActions, votingModuleActions]
    )
  )

  const { profile: creatorProfile } = useProfile({
    walletAddress: proposalInfo.createdByAddress,
  })

  // Ensure the last two actions are execute smart contract followed by
  // custom, since a lot of actions are smart contract executions, and custom
  // is a catch-all that will display any message. Do this by assigning values
  // and sorting the actions in ascending order.
  const orderedActions = useMemo(() => {
    const keyToValue = (key: ActionKey) =>
      key === ActionKey.Execute ? 1 : key === ActionKey.Custom ? 2 : 0

    return actions.sort((a, b) => {
      const aValue = keyToValue(a.key)
      const bValue = keyToValue(b.key)
      return aValue - bValue
    })
  }, [actions])

  const { refreshProposalAndAll } = useProposalRefreshers()

  const onVoteSuccess = useCallback(() => {
    refreshProposalAndAll()
    toast.success(t('success.voteCast'))
  }, [refreshProposalAndAll, t])

  const onExecuteSuccess = useCallback(async () => {
    refreshProposalAndAll()
    toast.success(t('success.proposalExecuted'))
    // Manually revalidate DAO static props.
    await fetch(`/api/revalidate?d=${coreAddress}&p=${proposalInfo.id}`)
  }, [coreAddress, proposalInfo.id, refreshProposalAndAll, t])

  const onCloseSuccess = useCallback(() => {
    refreshProposalAndAll()
    toast.success(t('success.proposalClosed'))
  }, [refreshProposalAndAll, t])

  return (
    <Proposal
      ProposalStatusAndInfo={ProposalStatusAndInfo}
      actionDisplay={
        <ProposalActionDisplay
          availableActions={orderedActions}
          onCloseSuccess={onCloseSuccess}
          onDuplicate={(data) =>
            router.push(
              `/dao/${coreAddress}/proposals/create?prefill=${encodeURIComponent(
                JSON.stringify(data)
              )}`
            )
          }
          onExecuteSuccess={onExecuteSuccess}
        />
      }
      creator={{
        name: creatorProfile.loading
          ? creatorProfile
          : {
              ...creatorProfile,
              data: creatorProfile.data.name,
            },
        address: proposalInfo.createdByAddress,
      }}
      daoInfo={daoInfo}
      proposalInfo={proposalInfo}
      rightSidebarContent={
        connected ? (
          <ProfileProposalCard onVoteSuccess={onVoteSuccess} />
        ) : (
          <ProfileDisconnectedCard />
        )
      }
      voteTally={<ProposalVoteTally />}
      votesCast={<ProposalVotes />}
    />
  )
}

const ProposalPage: NextPage<DaoProposalPageWrapperProps> = ({
  children: _,
  ...props
}) => (
  <DaoPageWrapper {...props}>
    <SuspenseLoader fallback={<PageLoader />}>
      {props.proposalInfo && props.serializedInfo ? (
        <ProposalModuleAdapterProvider
          initialOptions={{
            coreAddress: props.serializedInfo.coreAddress,
            Logo,
            Loader,
          }}
          proposalId={props.proposalInfo.id}
          proposalModules={props.serializedInfo.proposalModules}
        >
          <InnerProposal proposalInfo={props.proposalInfo} />
        </ProposalModuleAdapterProvider>
      ) : (
        <ProposalNotFound
          homeHref={
            props.serializedInfo
              ? `/dao/${props.serializedInfo.coreAddress}`
              : '/home'
          }
        />
      )}
    </SuspenseLoader>
  </DaoPageWrapper>
)

export default ProposalPage

// Fallback to loading screen if page has not yet been statically
// generated.
export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: true,
})

export const getStaticProps = makeGetDaoProposalStaticProps({
  getProposalUrlPrefix: ({ address }) =>
    `${SITE_URL}/dao/${address}/proposals/`,
})
