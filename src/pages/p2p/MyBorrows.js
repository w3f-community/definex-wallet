import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Card } from 'antd';
import { useSubstrate } from 'substrate-lib';
import { useTranslation } from 'react-i18next'
import MakeBorrowForm from 'components/forms/p2p/MakeBorrowForm';
import AddBorrowForm from 'components/forms/p2p/AddBorrowForm';
import RepayBorrowForm from 'components/forms/p2p/RepayBorrowForm';
import CancelBorrowForm from 'components/forms/p2p/CancelBorrowForm';
import { Decimal } from 'decimal.js'
// import Pagination from '../components/pagination'

export default function P2p(props) {
    const { api } = useSubstrate();
    const [userBorrowList, setUserBorrowList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [addModalVisible, setAddModal] = useState(false);
    const [repayModalVisible, setRepayModal] = useState(false);
    const [cancelModalVisible, setCancelModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);
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
            api.rpc.pToP.userBorrows(accountPair.address, 10, 0).then(res => {
                const borrowArray = JSON.parse(res)
                borrowArray.forEach(item => {
                    item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                })
                setUserBorrowList(borrowArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.pToP, accountPair, refreshKey])

    const columns = [{
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: '50px'
    },
    {
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
                    (record.status === 'Taken' || record.status === 'Available') && (
                        <span>
                            <Button onClick={() => { setSelectingItem(record); setAddModal(true) }}>{t('action.add')}</Button>
                        </span>
                    )
                }
                {
                    record.status === 'Taken' && (
                        <span>
                            <Button onClick={() => { setSelectingItem(record); setRepayModal(true) }}>{t('action.repay')}</Button>
                        </span>
                    )
                }
                {
                    record.status === 'Available' && (
                        <span>
                            <Button onClick={() => { setSelectingItem(record); setCancelModal(true) }}>{t('action.cancel')}</Button>
                        </span>
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
                    <div className={'card-title'}>{t('p2p.myBorrows')}</div>
                    <Button type={'primary'} onClick={() => { setMakeModal(true) }}>{t('action.make')}</Button>
                </div>
                <Table columns={columns} scroll={isMobile ? { x: true } : {}} rowKey={'id'} dataSource={userBorrowList} pagination={false} />
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
            {addModalVisible && <Modal
                title={t('action.add')}
                visible={true}
                closable
                onCancel={() => { setAddModal(false) }}
                footer={null}
            >
                <AddBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setAddModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
            {repayModalVisible && <Modal
                title={t('action.repay')}
                visible={true}
                closable
                onCancel={() => { setRepayModal(false) }}
                footer={null}
            >
                <RepayBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setRepayModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
            {cancelModalVisible && <Modal
                title={t('action.cancel')}
                visible={true}
                closable
                onCancel={() => { setCancelModal(false) }}
                footer={null}
            >
                <CancelBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setCancelModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
