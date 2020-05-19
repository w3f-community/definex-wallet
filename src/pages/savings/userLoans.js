import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card } from 'antd';
import { useSubstrate } from 'substrate-lib';
import { useTranslation } from 'react-i18next'
import ApplyLoanForm from 'components/forms/loans/ApplyLoanForm';
import AddCollateralForm from 'components/forms/loans/AddCollateralForm';
import DrawForm from 'components/forms/loans/DrawForm';
import RepayLoanForm from 'components/forms/loans/RepayLoanForm';
import MarkLiquidatedForm from 'components/forms/loans/MarkLiquidatedForm';
import { Decimal } from 'decimal.js'

export default function UserLoans(props) {
    const { api } = useSubstrate();
    const [loanList, setLoanList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [applyLoanModalVisible, setApplyLoanModal] = useState(false);
    const [addCollateralModalVisible, setAddCollateralModal] = useState(false);
    const [drawModalVisible, setDrawModal] = useState(false);
    const [repayLoanModalVisible, setRepayLoanModal] = useState(false);
    const [markLiquidatedModalVisible, setMarkLiquidatedModal] = useState(false);
    let [refreshKey, setRefreshKey] = useState(1);
    const { t } = useTranslation();

    const accountPair = props.accountPair;

    useEffect(() => {
        api.rpc.genericAsset.symbolsList().then(res => {
            const symbolsArray = JSON.parse(res)
            const symbolsObj = {}
            symbolsArray.forEach(item => {
                symbolsObj[item[0]] = item[1]
            })
            setSymbolsMapping(symbolsObj)
        })
    }, [api.rpc.pToP, api.rpc.genericAsset]);

    useEffect(() => {
        if (accountPair) {
            api.rpc.depositLoan.userLoans(accountPair.address, 10, 0).then(res => {
                const loanArray = JSON.parse(res)
                setLoanList(loanArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.depositLoan, accountPair, refreshKey])

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '50px'
        },
        {
            title: t('table.who'),
            dataIndex: 'who',
            key: 'who',
            ellipsis: true,
            width: '120px',
            render: (props, record) => (
                <Tooltip placement="left" title={record.who}>
                    <span>{record.who}</span>
                </Tooltip>
            )
        },
        {
            title: t('table.collateralBalanceOriginal'),
            dataIndex: 'collateral_balance_original',
            key: 'collateral_balance_original',
            render: (props, record) => (
                <span>{Number(new Decimal(record.collateral_balance_original).div(10 ** 8))} {symbolsMapping[1]}</span>
            )
        },
        {
            title: t('table.collateralBalanceAvailable'),
            dataIndex: 'collateral_balance_available',
            key: 'collateral_balance_available',
            render: (props, record) => (
                <span>{Number(new Decimal(record.collateral_balance_available).div(10 ** 8))} {symbolsMapping[1]}</span>
            )
        },
        {
            title: t('table.loanBalanceTotal'),
            dataIndex: 'loan_balance_total',
            key: 'loan_balance_total',
            render: (props, record) => (
                <span>{Number(new Decimal(record.loan_balance_total).div(10 ** 8))} {symbolsMapping[0]}</span>
            )
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: t('table.action'),
            key: 'action',
            render: (props, record) => (
                <div>
                    <Button onClick={() => { setSelectingItem(record); setAddCollateralModal(true); }}>{t('action.addCollateral')}</Button>
                    <Button onClick={() => { setSelectingItem(record); setDrawModal(true); }}>{t('action.draw')}</Button>
                    <Button onClick={() => { setSelectingItem(record); setRepayLoanModal(true); }}>{t('action.repayLoan')}</Button>
                    <Button onClick={() => { setSelectingItem(record); setMarkLiquidatedModal(true); }}>{t('action.liquidateLoan')}</Button>
                </div>
            )
        }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>{t('p2p.userLoans')}</div>
                    <Button type={'primary'} onClick={() => { setApplyLoanModal(true) }}>{t('action.apply')}</Button>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={loanList} pagination={false} />
            </Card>
            {applyLoanModalVisible && <Modal
                title={t('action.applyLoan')}
                visible={true}
                closable
                onCancel={() => { setApplyLoanModal(false) }}
                footer={null}
            >
                <ApplyLoanForm symbolsMapping={symbolsMapping} hideModal={() => { setRefreshKey(++refreshKey); setApplyLoanModal(false) }} accountPair={accountPair} />
            </Modal>}
            {addCollateralModalVisible && <Modal
                title={t('action.addCollateral')}
                visible={true}
                closable
                onCancel={() => { setAddCollateralModal(false) }}
                footer={null}
            >
                <AddCollateralForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setAddCollateralModal(false) }} accountPair={accountPair} />
            </Modal>}
            {drawModalVisible && <Modal
                title={t('action.draw')}
                visible={true}
                closable
                onCancel={() => { setDrawModal(false) }}
                footer={null}
            >
                <DrawForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setDrawModal(false) }} accountPair={accountPair} />
            </Modal>}
            {repayLoanModalVisible && <Modal
                title={t('action.repayLoan')}
                visible={true}
                closable
                onCancel={() => { setRepayLoanModal(false) }}
                footer={null}
            >
                <RepayLoanForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setRepayLoanModal(false) }} accountPair={accountPair} />
            </Modal>}
            {markLiquidatedModalVisible && <Modal
                title={t('action.liquidateLoan')}
                visible={true}
                closable
                onCancel={() => { setMarkLiquidatedModal(false) }}
                footer={null}
            >
                <MarkLiquidatedForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setMarkLiquidatedModal(false) }} accountPair={accountPair} />
            </Modal>}
        </div>
    );
}
