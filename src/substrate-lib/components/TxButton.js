import React from 'react';
import { Button, message } from 'antd';
import { web3FromSource } from '@polkadot/extension-dapp';

import { useSubstrate } from '../';

export default function TxButton({
  accountPair = null,
  label,
  setStatus, // loading, error, complete
  style = null,
  type = null,
  attrs = null,
  disabled = false
}) {
  const { api } = useSubstrate();
  const { params = null, sudo = false, tx = null } = attrs;
  const isQuery = () => type === 'QUERY';

  const transaction = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
    let fromParam;

    // set the signer
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromParam = address;
      api.setSigner(injected.signer);
    } else {
      fromParam = accountPair;
    }

    setStatus('loading');
    message.info('Sending...');

    let txExecute;
    try {
      // Check if tx has params
      if (!params) {
        txExecute = !sudo ? tx() : tx.sudo();
      } else {
        txExecute = !sudo ? tx(...params) : tx.sudo(...params);
      }
    } catch (e) {
      console.error('ERROR forming transaction:', e);
      setStatus('error');
      message.error(e.toString());
    }

    if (txExecute) {
      txExecute
        .signAndSend(fromParam, ({ status }) => {
          if (status.isFinalized) {
            setStatus('complete');
            message.success(`Completed at block hash #${status.asFinalized.toString()}`)
          } else {
            message.info(`Status: ${status.type}`);
          }
        })
        .catch(e => {
          setStatus('error');
          message.error(e.toString());
          console.error(e);
        });
    }
  };

  const query = async () => {
    try {
      setStatus('loading');
      const result = await tx(...params);
      setStatus('complete');
      message.info(result.toString());
    } catch (e) {
      console.error('ERROR query:', e);
      setStatus('error');
      message.error(e.toString());
    }
  };

  return (
    <Button type={'primary'} style={style} onClick={isQuery() ? query : transaction} disabled={disabled || !tx || (!isQuery() && !accountPair)}>
      {label}
    </Button>
  );
}
