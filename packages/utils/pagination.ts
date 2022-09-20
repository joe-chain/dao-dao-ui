import { Long } from '@osmonauts/helpers'
import {
  PageRequest,
  PageResponseSDKType,
} from 'interchain/types/codegen/cosmos/base/query/v1beta1/pagination'

export const getAllLcdResponse = async <
  P extends { pagination?: PageRequest; [key: string]: any },
  R extends { pagination?: PageResponseSDKType; [key: string]: any },
  K extends keyof R
>(
  queryFn: (params: P) => Promise<R>,
  params: P,
  key: K
): Promise<R[K]> => {
  let pagination: PageRequest | undefined
  const data = [] as R[K]

  do {
    const response = await queryFn({
      ...params,
      pagination,
    })

    pagination = response.pagination?.next_key?.length
      ? {
          key: response.pagination.next_key,
          offset: Long.ZERO,
          limit: Long.MAX_VALUE,
          countTotal: false,
          reverse: false,
        }
      : undefined

    data.push(...response[key])
  } while (pagination !== undefined)

  return data
}
