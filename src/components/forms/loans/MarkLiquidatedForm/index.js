import React, { useState, useEffect } from 'react'
import { Form, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { TxButton } from 'substrate-lib/components';
import { useSubstrate } from 'substrate-lib';

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

export default function MarkLiquidatedForm(props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const hideModal = props.hideModal;
  const { t } = useTranslation()
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
          label={t('form.loanId')}
        >
          <span className="ant-form-text">{item.id}</span>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label={t('form.liquidate')}
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id],
              tx: api.tx.depositLoan.markLiquidated
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
