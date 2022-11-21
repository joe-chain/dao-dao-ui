import { CodeIdConfig } from '@dao-dao/types'

// https://github.com/DA0-DA0/dao-contracts/releases/tag/v2.0.0-beta
const junoTestnet: CodeIdConfig = {
  Cw20Base: 870,
  Cw20Stake: 871,
  Cw4Group: 872,
  CwAdminFactory: 873,
  CwdCore: 875,
  CwdPreProposeMultiple: 876,
  CwdPreProposeSingle: 877,
  CwdProposalMultiple: 878,
  CwdProposalSingle: 879,
  CwdVotingCw20Staked: 880,
  CwdVotingCw4: 881,
  CwdVotingCw721Staked: 882,
  CwdVotingNativeStaked: 883,
}

// TODO(v2): Fill in code IDs once v2 contracts on mainnet.
const junoMainnet: CodeIdConfig = {
  Cw20Base: 435,
  Cw20Stake: 430,
  Cw4Group: 434,
  CwAdminFactory: -1,
  CwdCore: -1,
  CwdPreProposeMultiple: -1,
  CwdPreProposeSingle: -1,
  CwdProposalMultiple: -1,
  CwdProposalSingle: -1,
  CwdVotingCw20Staked: -1,
  CwdVotingCw4: -1,
  CwdVotingCw721Staked: -1,
  CwdVotingNativeStaked: -1,
}

const joeMainnet: CodeIdConfig = {
  Cw20Base: 7,
  Cw20Stake: -1,
  Cw4Group: -1,
  CwAdminFactory: -1,
  CwdCore: -1,
  CwdPreProposeMultiple: -1,
  CwdPreProposeSingle: -1,
  CwdProposalMultiple: -1,
  CwdProposalSingle: -1,
  CwdVotingCw20Staked: -1,
  CwdVotingCw4: -1,
  CwdVotingCw721Staked: -1,
  CwdVotingNativeStaked: -1,
}

export const CodeIdConfigs: Record<string, CodeIdConfig | undefined> = {
  'uni-5': junoTestnet,
  'juno-1': junoMainnet,
  'joe-1': joeMainnet,
}
