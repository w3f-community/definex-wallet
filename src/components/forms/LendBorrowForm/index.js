import React, { useState, useEffect } from 'react'
import { Form } from 'antd'
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

export default function LendBorrowForm(props) {
  const { api } = useSubstrate();
  const [borrowBalance, setborrowBalance] = useState(0);
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const item = props.item;

  useEffect(() => {
    let unsubscribeAll = null;
    api.query.genericAsset.freeBalance(item.borrow_asset_id, accountPair.address).then(res => {
      setborrowBalance(String(res / (10 ** 8)))
    }).then(unsub => {
      unsubscribeAll = unsub;
    })
    return () => unsubscribeAll && unsubscribeAll();
  }, [accountPair.address, api.query.genericAsset, item.borrow_asset_id])

  return (
    <form>
      <Form.Item
        {...formItemLayout}
        label={'Balance'}
      >
        <span className="ant-form-text">{borrowBalance} {item.borrow_asset_symbol}</span>
      </Form.Item>

      <Form.Item
        {...formItemLayout}
        label={'Return'}
      >
        <span className="ant-form-text">{item.borrow_balance}</span>
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label={'Interest'}
      >
        <span className="ant-form-text">{item.interest_rate}</span>
      </Form.Item>
      <Form.Item
        {...formItemLayout}
        label={'Fee'}
      >
        <span className="ant-form-text">{item.borrow_balance * item.interest_rate}</span>
      </Form.Item>

      <Form.Item {...tailFormItemLayout}>
        <TxButton
          accountPair={accountPair}
          label='Lend'
          setStatus={setStatus}
          type='TRANSACTION'
          attrs={{
            params: [item.id],
            tx: api.tx.pToP.take
          }}
        />
      </Form.Item>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>

    </form>
  )
}
