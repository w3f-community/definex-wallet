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

export default function CancelBorrowForm(props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const { t } = useTranslation()
  const item = props.item;
  const hideModal = props.hideModal;

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
          label={t('form.cancel')}
        >
          <span className="ant-form-text">{t('hint.confirmCancel')} borrow_id {item.id}?</span>
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label={t('action.cancel')}
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id],
              tx: api.tx.pToP.cancel
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
