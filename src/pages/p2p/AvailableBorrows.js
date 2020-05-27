import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card } from 'antd';
import { useTranslation } from 'react-i18next'
import { useSubstrate } from 'substrate-lib';
import MakeBorrowForm from 'components/forms/p2p/MakeBorrowForm';
import LendBorrowForm from 'components/forms/p2p/LendBorrowForm';
import { Decimal } from 'decimal.js'

export default function P2p(props) {
    const { api } = useSubstrate();
    const [borrowList, setBorrowList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [lendModalVisible, setLendModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);
    const { t } = useTranslation()
    let [refreshKey, setRefreshKey] = useState(1);
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
        api.rpc.pToP.availableBorrows(10, 0).then(res => {
            const borrowArray = JSON.parse(res)
            borrowArray.forEach((item) => {
                item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
            })
            setBorrowList(borrowArray);
        }).catch(error => {
            console.log('errrr', error);
        })
    }, [symbolsMapping, api.rpc.pToP, refreshKey])

    const columns = [{
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
    }, {
        title: t('table.status'),
        dataIndex: 'status',
        key: 'status',
        render: (props, record) => (
            <span>{record.status}</span>
        )
    },
    {
        title: t('table.borrowBalance'),
        dataIndex: 'borrow_balance',
        key: 'borrow_balance',
        render: (props, record) => (
            <span>{String(new Decimal(record.borrow_balance).dividedBy(10 ** 8))} {record.borrow_asset_symbol}</span>
        )
    },
    {
        title: t('table.collateralBalance'),
        dataIndex: 'collateral_balance',
        key: 'collateral_balance',
        render: (props, record) => (
            <span>{String(new Decimal(record.collateral_balance).dividedBy(10 ** 8))} {record.collateral_asset_symbol}</span>
        )
    },
    {
        title: t('table.terms'),
        dataIndex: 'terms',
        key: 'terms',
    },
    {
        title: t('table.interestRate'),
        dataIndex: 'interest_rate',
        key: 'interest_rate',
        render: (props, record) => (<div>
            {String(new Decimal(record.interest_rate).dividedBy(10 ** 4))} ‱
        </div>)
    },
    {
        title: t('table.loanId'),
        dataIndex: 'loan_id',
        key: 'loan_id',
    },
    {
        title: t('table.action'),
        key: 'action',
        render: (props, record) => (
            <div>
                {
                    record.status === 'Available' && record.who !== accountPair.address && (
                        <Button onClick={() => { setSelectingItem(record); setLendModal(true) }}>{t('action.lend')}</Button>
                    )
                }
            </div>
        )
    }
    ]

    const isMobile = document.body.offsetWidth < 992;

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>{t('p2p.availableBorrows')}</div>
                    <Button type={'primary'} onClick={() => { setMakeModal(true) }}>{t('action.make')}</Button>
                </div>
                <Table columns={columns} scroll={isMobile ? { x: true } : {}} rowKey={'id'} dataSource={borrowList} pagination={false} />
            </Card>
            {makeModalVisible && <Modal
                title={t('action.make')}
                visible={true}
                closable
                onCancel={() => { setMakeModal(false) }}
                footer={null}
            >
                <MakeBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setMakeModal(false) }} accountPair={accountPair} item={selectingItem} symbolsMapping={symbolsMapping} />
            </Modal>}
            {lendModalVisible && <Modal
                title={t('action.lend')}
                visible={true}
                closable
                onCancel={() => { setLendModal(false) }}
                footer={null}
            >
                <LendBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setLendModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
