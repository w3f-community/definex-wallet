import React, { useState, useEffect } from 'react'
import { Form, Input, Spin } from 'antd'
import { TxButton } from 'substrate-lib/components';
import { useSubstrate } from 'substrate-lib';

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
    sm: { span: 8 },
  },
}

export default function RedeemForm(props) {
  const { api } = useSubstrate();
  const [yourBalance, setYourBalance] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState(0)
  const [assetId, setAssetId] = useState(0)

  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const hideModal = props.hideModal;

  useEffect(() => {
    if (accountPair) {
      api.queryMulti([
        [api.query.depositLoan.userDtoken, accountPair.address],
        api.query.depositLoan.valueOfTokens
      ], (userDtoken, valueOfTokens) => {
        
        console.log(userDtoken, valueOfTokens, '333')
      })
    }
}, [api.query.depositLoan, accountPair]);

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
          label={'Your Balance'}
        >
          <span className="ant-form-text">{yourBalance}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Asset Id'}
        >
          <Input value={assetId} onChange={event => setAssetId(event.target.value)} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Amount'}
        >
          <Input value={redeemAmount} onChange={event => setRedeemAmount(event.target.value)} />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Redeem'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [assetId, redeemAmount],
              tx: api.tx.depositLoan.redeem
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
