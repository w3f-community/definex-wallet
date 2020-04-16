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
    sm: { span: 10 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

export default function ApplyLoanForm(props) {
  const { api } = useSubstrate();
  const [currentSavingInterestRate, setCurrentSavingInterestRate] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)
  const [btcBalance, setBtcBalance] = useState(0)
  const [poolBalance, setPoolBalance] = useState(0)

  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const hideModal = props.hideModal;
  const symbolsMapping = props.symbolsMapping;

  useEffect(() => {
    api.query.genericAsset.freeBalance(1, accountPair.address).then(res => {
      setBtcBalance(String(new Decimal(Number(res)).dividedBy(10 ** 8)))
    })
  }, [accountPair, api.query.genericAsset])

  useEffect(() => {
    api.query.depositLoan.collectionAccountId(res => {
      const poolAddress = String(res);
      api.query.genericAsset.freeBalance(0, poolAddress).then(res => {
        setPoolBalance(String(new Decimal(Number(res)).dividedBy(10 ** 8)))
      })
    })
  }, [accountPair, api.query.genericAsset, api.query.depositLoan])

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
      hideModal()
    }
  }, [status, hideModal])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        <Form.Item
          {...formItemLayout}
          label={'Loan Interest Rate'}
        >
          <span className="ant-form-text">{currentSavingInterestRate} %</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'BTC Balance'}
        >
          <span className="ant-form-text">{btcBalance} {symbolsMapping[1]}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Collaterlal Amount'}
        >
          <Input value={collateralAmount} onChange={event => setCollateralAmount(event.target.value)} suffix={symbolsMapping[1]} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Collection Poll Balance'}
        >
          <span className="ant-form-text">{poolBalance} {symbolsMapping[0]}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Loan Amount'}
        >
          <Input value={loanAmount} onChange={event => setLoanAmount(event.target.value)} suffix={symbolsMapping[0]} />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Apply'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [Number(new Decimal(collateralAmount).times(10 ** 8)), Number(new Decimal(loanAmount).times(10 ** 8))],
              tx: api.tx.depositLoan.applyLoan
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
