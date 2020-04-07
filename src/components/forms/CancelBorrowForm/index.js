import React, { useState } from 'react'
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
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const item = props.item;

  return (
    <form>
      <Form.Item
        {...formItemLayout}
        label={'Cancel'}
      >
        <span className="ant-form-text">Are you sure to cancel borrow_id {item.id}?</span>
      </Form.Item>

      <Form.Item {...tailFormItemLayout}>
        <TxButton
          accountPair={accountPair}
          label='Cancel'
          setStatus={setStatus}
          type='TRANSACTION'
          attrs={{
            params: [item.id],
            tx: api.tx.pToP.cancel
          }}
        />
      </Form.Item>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>

    </form>
  )
}
