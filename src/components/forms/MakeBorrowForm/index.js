import React, { useState, useEffect } from 'react'
import { Form, Input, Spin } from 'antd'
import { TxButton } from '../../../substrate-lib/components';
import { useSubstrate } from '../../../substrate-lib';

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

export default function MakeBorrowForm(props) {
  const { api } = useSubstrate();

  const [balance, setBalance] = useState(0);

  // for form
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [terms, setTerms] = useState(0);
  const [interestRate, setInterestRate] = useState(0);

  const [tradingPairs, setTradingPairs] = useState({});
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const symbolsMapping = props.symbolsMapping;
  const hideModal = props.hideModal;

  // get trading pair
  useEffect(() => {
    api.query.pToP.tradingPairs(res => {
      // temporarily get first trading pair
      setTradingPairs(JSON.parse(res)[0])
    })
  }, [api.query.pToP])

  // get balance
  useEffect(() => {
    if (tradingPairs.collateral) {
      let unsubscribeAll = null;
      api.query.genericAsset.freeBalance(tradingPairs.collateral, accountPair.address).then(res => {
        setBalance(String(res / (10 ** 8)))
      }).then(unsub => {
        unsubscribeAll = unsub;
      })
      return () => unsubscribeAll && unsubscribeAll();
    }
  }, [accountPair.address, api.query.genericAsset, tradingPairs])

  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      hideModal()
    }
  }, [status, hideModal])

  const interestChange = (event) => {
    setInterestRate(parseInt(event.target.value ? event.target.value : 0))
  }

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        {tradingPairs && (
          <Form.Item
            {...formItemLayout}
            label={'Collateral'}
          >
            <span className="ant-form-text">
              {symbolsMapping[tradingPairs.collateral]}
            </span>
          </Form.Item>
        )}
        {
          tradingPairs && (
            <Form.Item
              {...formItemLayout}
              label={'Borrow'}
            >
              <span className="ant-form-text">
                {symbolsMapping[tradingPairs.borrow]}
              </span>
            </Form.Item>
          )
        }
        <Form.Item
          {...formItemLayout}
          label={'Balance'}
        >
          <span className="ant-form-text">
            {balance} {symbolsMapping[tradingPairs.collateral]}
          </span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Collateral Balance'}
        >
          <Input value={collateralBalance} onChange={event => { setCollateralBalance(event.target.value) }} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Borrow Amont'}
        >
          <Input value={amount} onChange={event => setAmount(event.target.value)} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Terms'}
        >
          <Input value={terms} onChange={event => setTerms(event.target.value)} suffix="Days" />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Interest Rate'}
        >
          <Input value={interestRate} onChange={interestChange} suffix="‱ Per Day" />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Make'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [Number(collateralBalance * (10 ** 8)), tradingPairs,
              {
                amount: Number(amount * (10 ** 8)),
                terms: Number(terms),
                interest_rate: Number(interestRate * (10 ** 4))
              }
              ],
              tx: api.tx.pToP.make
            }}
          />
        </Form.Item>
      </form>

    </Spin>

  )
}
