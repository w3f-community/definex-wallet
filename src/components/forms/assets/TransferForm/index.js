import React, { useState, useEffect } from 'react'
import { Form, Input, Spin } from 'antd'
import { TxButton } from 'substrate-lib/components';
import { useSubstrate } from 'substrate-lib';
import { Decimal } from 'decimal.js'

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

export default function TransferForm(props) {
  const { api } = useSubstrate();

  const [amount, setAmount] = useState(0);

  const [receiverAddress, setReceiverAddress] = useState('')

  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const symbolsMapping = props.symbolsMapping;
  const hideModal = props.hideModal;

  const currentAsset = props.item
  console.log('curr', currentAsset)

  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      hideModal()
    }
  }, [status, hideModal])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        <Form.Item
          {...formItemLayout}
          label={'Current Address'}
        >
          <span className="ant-form-text">
            {accountPair.address}
          </span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Balance'}
        >
          <span className="ant-form-text">
            {currentAsset.balance / (10 ** 8)} {currentAsset.isMain ? 'DFX' : symbolsMapping[currentAsset.asset_id]}
          </span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Transfer Amount'}
        >
          <Input value={amount} onChange={event => setAmount(event.target.value)} suffix={currentAsset.isMain ? 'DFX' : symbolsMapping[currentAsset.asset_id]} />
        </Form.Item>

        <Form.Item
          {...formItemLayout}
          label={'Receiver Address'}
        >
          <Input value={receiverAddress} onChange={event => setReceiverAddress(event.target.value)} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Transfer'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={currentAsset.isMain ? {
              params: [
                receiverAddress,
                amount && Number(new Decimal(amount).times(10 ** 8)),
              ],
              tx: api.tx.balances.transfer
            } : {
                params: [
                  currentAsset.asset_id,
                  receiverAddress,
                  amount && Number(new Decimal(amount).times(10 ** 8)),
                ],
                tx: api.tx.genericAsset.transfer
              }}
          />
        </Form.Item>
      </form>

    </Spin>

  )
}
