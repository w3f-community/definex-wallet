import React, { useState, useEffect } from 'react'
import { Form, Spin } from 'antd'
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

export default function LiquidateBorrowForm(props) {
  const { api } = useSubstrate();
  // const [loanBalance, setLoanBalance] = useState(0);
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const item = props.item;
  const hideModal = props.hideModal;

  // useEffect(() => {
  //   let unsubscribeAll = null;
  //   api.query.genericAsset.freeBalance(item.loan_asset_id, accountPair.address).then(res => {
  //     setLoanBalance(String(res / (10 ** 8)))
  //   }).then(unsub => {
  //     unsubscribeAll = unsub;
  //   })
  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [accountPair.address, api.query.genericAsset, item.loan_asset_id])

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
          <span className="ant-form-text">{item.loan_balance / (10 ** 8)} {item.loan_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Collateral Balance'}
        >
          <span className="ant-form-text">{item.collateral_balance / (10 ** 8)} {item.collateral_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Interest'}
        >
          <span className="ant-form-text">{item.interest_rate / (10 ** 4)} ‱</span>
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
