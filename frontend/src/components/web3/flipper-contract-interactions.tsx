import { FC, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormItem, FormLabel } from '@/components/ui/form'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

export const FlipperContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Flipper)
  const [isFlipped, setIsFlipped] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const flip = async () => {
    try {
      await contractTxWithToast(api, activeAccount?.address, contract, 'flip', {}, [])
    } catch (e) {
      console.error(e)
    } finally {
      getState()
    }
  }

  const getState = async () => {
    const result = await contractQuery(api, '', contract, 'get')
    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get')
    if (isError) throw new Error(decodedOutput)
    setIsFlipped(output)
    return output
  }

  const { register, reset, handleSubmit } = form

  return (
    <>
      <div className="flex max-w-[22rem] grow flex-col gap-4">
        <h2 className="text-center font-mono text-gray-400">Flipper Smart Contract</h2>
        <Form {...form}>
          <Card>
            <CardContent className="pt-6">
              <FormItem>
                <FormLabel className="text-base">Flip</FormLabel>
                <div className="flex gap-0"></div>
                <Button type="submit" className="bg-primary font-bold" onClick={flip}>
                  Submit
                </Button>
              </FormItem>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormItem>
                <FormLabel className="text-base">Flip state </FormLabel>
                <div className="flex gap-0"></div>
                <Input value={isFlipped.toString()}></Input>
              </FormItem>
            </CardContent>
          </Card>
        </Form>
        {/* Contract Address */}
        <p className="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
