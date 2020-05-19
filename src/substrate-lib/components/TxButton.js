import React from 'react';
import { Button, message } from 'antd';
import { web3FromSource } from '@polkadot/extension-dapp';

import { useSubstrate } from '../';

const customErrorMapping = {
  0: 'Paused',
  1: 'MinBorrowTerms',
  2: 'MinBorrowInterestRate',
  3: 'CanNotReserve',
  4: 'MultipleAvailableBorrows',
  5: 'BorrowNotAvailable',
  6: 'TradingPairNotAllowed',
  7: 'NotOwnerOfBorrow',
  8: 'UnknownBorrowId',
  9: 'UnknownLoanId',
  10: 'NoLockedBalance',
  11: 'InitialCollateralRateFail',
  12: 'NotEnoughBalance',
  13: 'TradingPairPriceMissing',
  14: 'BorrowNotLoaned',
  15: 'LTVNotMeet',
  16: 'ShouldNotBeLiquidated',
  17: 'ShouldBeLiquidated',
  18: 'LoanNotWell',
  19: 'AddCollateralNotallowed',
  20: 'FailToreserve',
}

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
          let errorMessage = e.toString()
          if (errorMessage.indexOf('Custom') > -1) {
            const errorRaw = errorMessage.match(/{([^}]+)}/g)
            errorMessage = 'Error: ' + customErrorMapping[JSON.parse(errorRaw).Custom]
          }
          message.error(errorMessage);
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
