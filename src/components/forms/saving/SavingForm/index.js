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

export default function SavingForm(props) {
  const { api } = useSubstrate();
  const [currentSavingInterestRate, setCurrentSavingInterestRate] = useState(0);
  const [savingAmount, setSavingAmount] = useState(0)
  const [assetId] = useState(0)

  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const symbolsMapping = props.symbolsMapping;

  useEffect(() => {
    if (accountPair) {
      api.query.depositLoan.loanInterestRateCurrent().then(res => {
        setCurrentSavingInterestRate(String(new Decimal(Number(res)).div(10 ** 6)))
      })
    }
  }, [api.query.depositLoan, accountPair]);

  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      setSavingAmount(0)
    }
  }, [status])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        <Form.Item
          {...formItemLayout}
          label={'Current Saving Interest Rate'}
        >
          <span className="ant-form-text">{currentSavingInterestRate} %</span>
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
          <Input value={savingAmount} onChange={event => setSavingAmount(event.target.value)} />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Staking'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [assetId, Number(new Decimal(savingAmount).times(10 ** 8))],
              tx: api.tx.depositLoan.staking
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
