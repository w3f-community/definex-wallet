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

export default function AddBorrowForm(props) {
  const { api } = useSubstrate();
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const item = props.item;
  const hideModal = props.hideModal;

  useEffect(() => {
    let unsubscribeAll = null;
    api.query.genericAsset.freeBalance(item.collateral_asset_id, accountPair.address).then(res => {
      setCollateralBalance(String(new Decimal(Number(res)).dividedBy(10 ** 8)))
    }).then(unsub => {
      unsubscribeAll = unsub;
    })
    return () => unsubscribeAll && unsubscribeAll();
  }, [accountPair.address, api.query.genericAsset, item.collateral_asset_id])

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
          label={'Balance'}
        >
          <span className="ant-form-text">{collateralBalance} {item.collateral_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Add Collateral'}
        >
          <Input value={collateralAmount} onChange={event => setCollateralAmount(event.target.value)} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Add'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id, Number(new Decimal(collateralAmount).times(10 ** 8))],
              tx: api.tx.pToP.add
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
