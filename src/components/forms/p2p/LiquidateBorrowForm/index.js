import React, { useState, useEffect } from 'react'
import { Form, Spin } from 'antd'
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

export default function LiquidateBorrowForm(props) {
  const { api } = useSubstrate();
  // const [loanBalance, setLoanBalance] = useState(0);
  const [status, setStatus] = useState(null);
  const [discount, setDiscount] = useState(100);
  const accountPair = props.accountPair;
  const item = props.item;
  const hideModal = props.hideModal;

  // get discount info
  useEffect(() => {
      let unsubscribeAll = null;
      api.query.pToP.liquidatorDiscount(res => {
        setDiscount(Number(res))
      }).then(unsub => {
        unsubscribeAll = unsub;
      })
      return () => unsubscribeAll && unsubscribeAll();
  }, [api.query.pToP])

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
          label={'Loan Balance'}
        >
          <span className="ant-form-text">{String(new Decimal(item.loan_balance).div(10 ** 8))} {item.loan_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Discout'}
        >
          <span className="ant-form-text">{discount} %</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Collateral Balance'}
        >
          <span className="ant-form-text">{String(new Decimal(item.collateral_balance).div(10 ** 8))} {item.collateral_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Interest'}
        >
          <span className="ant-form-text">{String(new Decimal(item.interest_rate).div(10 ** 4))} ‱</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Status'}
        >
          <span className="ant-form-text">{item.status}</span>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Liquidate'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id],
              tx: api.tx.pToP.liquidate
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
