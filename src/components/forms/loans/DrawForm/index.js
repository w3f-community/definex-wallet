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

export default function DrawForm(props) {
  const { api } = useSubstrate();
  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const hideModal = props.hideModal;
  const symbolsMapping = props.symbolsMapping;
  const item = props.item;

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
          label={'Loan Id'}
        >
          <span className="ant-form-text">{item.id}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Amount'}
        >
          <Input value={amount} onChange={event => setAmount(event.target.value)} suffix={symbolsMapping[0]} />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Draw'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id, amount && Number(new Decimal(amount).times(10 ** 8))],
              tx: api.tx.depositLoan.draw
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
