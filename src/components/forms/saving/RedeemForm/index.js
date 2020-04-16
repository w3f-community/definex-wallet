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
    sm: { span: 8 },
  },
}

export default function RedeemForm(props) {
  const { api } = useSubstrate();
  const [yourBalance, setYourBalance] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState(0)
  const [assetId] = useState(0)

  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const symbolsMapping = props.symbolsMapping;

  useEffect(() => {
    if (accountPair) {
      api.queryMulti([
        api.query.depositLoan.valueOfTokens,
        [api.query.depositLoan.userDtoken, accountPair.address],
      ], ([valueOfTokens, userDtoken]) => {
        setYourBalance(Number(new Decimal(Number(userDtoken)).times(Number(valueOfTokens)).div(10 ** 4).div(10 ** 8).toFixed(8)))
      })
    }
  }, [api, api.query.depositLoan, accountPair]);

  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      setRedeemAmount(0)
    }
  }, [status])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        <Form.Item
          {...formItemLayout}
          label={'Your Balance'}
        >
          <span className="ant-form-text">{yourBalance} {symbolsMapping[assetId]}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Asset'}
        >
          {symbolsMapping[assetId]}
          {/* <Input value={assetId} onChange={event => setAssetId(event.target.value)} /> */}
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
              params: [assetId, Number(new Decimal(redeemAmount).times(10 ** 8))],
              tx: api.tx.depositLoan.redeem
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
