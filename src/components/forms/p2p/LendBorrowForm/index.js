import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

export default function LendBorrowForm(props) {
  const { api } = useSubstrate();
  const [borrowBalance, setborrowBalance] = useState(0);
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const { t } = useTranslation()
  const item = props.item;
  const hideModal = props.hideModal;

  useEffect(() => {
    let unsubscribeAll = null;
    api.query.genericAsset.freeBalance(item.borrow_asset_id, accountPair.address).then(res => {
      setborrowBalance(String(new Decimal(Number(res)).dividedBy(10 ** 8)))
    }).then(unsub => {
      unsubscribeAll = unsub;
    })
    return () => unsubscribeAll && unsubscribeAll();
  }, [accountPair.address, api.query.genericAsset, item.borrow_asset_id])

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
          label={t('form.yourBalance')}
        >
          <span className="ant-form-text">{borrowBalance} {item.borrow_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.borrowId')}
        >
          <span className="ant-form-text">{item.id}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.lendAmount')}
        >
          <span className="ant-form-text">{String(new Decimal(item.borrow_balance).dividedBy(10 ** 8))} {item.borrow_asset_symbol}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.interest')}
        >
          <span className="ant-form-text">{String(new Decimal(item.interest_rate).dividedBy(10 ** 4))} ‱</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.terms')}
        >
          <span className="ant-form-text">{item.terms} Days</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.estimatedProfit')}
        >
          <span className="ant-form-text">{String(new Decimal(item.interest_rate).dividedBy(10 ** 8).times(item.terms).times(item.borrow_balance).dividedBy(10 ** 8))} {item.borrow_asset_symbol}</span>
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label={t('action.lend')}
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id],
              tx: api.tx.pToP.take
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
