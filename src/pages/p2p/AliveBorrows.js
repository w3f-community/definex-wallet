import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card } from 'antd';
import { useSubstrate } from '../../substrate-lib';
import MakeBorrowForm from '../../components/forms/MakeBorrowForm';
import LendBorrowForm from '../../components/forms/LendBorrowForm';

export default function P2p(props) {
    const { api } = useSubstrate();
    const [borrowList, setBorrowList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [lendModalVisible, setLendModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);

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
        api.rpc.pToP.aliveBorrows(10, 0).then(res => {
            const borrowArray = JSON.parse(res)
            borrowArray.forEach((item, index) => {
                item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
            })
            setBorrowList(borrowArray);
        }).catch(error => {
            console.log('errrr', error);
        })
    }, [symbolsMapping, api.rpc.pToP])

    const columns = [{
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Who',
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
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (props, record) => (
            <span>{record.status}</span>
        )
    },
    {
        title: 'Borrow Balance',
        dataIndex: 'borrow_balance',
        key: 'borrow_balance',
        render: (props, record) => (
            <span>{record.borrow_balance / (10 ** 8)} {record.borrow_asset_symbol}</span>
        )
    },
    {
        title: 'Collateral Balance',
        dataIndex: 'collateral_balance',
        key: 'collateral_balance',
        render: (props, record) => (
            <span>{record.collateral_balance / (10 ** 8)} {record.collateral_asset_symbol}</span>
        )
    },
    {
        title: 'Terms',
        dataIndex: 'terms',
        key: 'terms',
    },
    {
        title: 'Interest Rate',
        dataIndex: 'interest_rate',
        key: 'interest_rate',
        render: (props, record) => (<div>
            {record.interest_rate / (10 ** 8)} ‱
        </div>)
    },
    {
        title: 'Loan Id',
        dataIndex: 'loan_id',
        key: 'loan_id',
    },
    {
        title: 'Action',
        key: 'action',
        width: '300px',
        render: (props, record) => (
            <div>
                {
                    record.status === 'Alive' && record.who !== accountPair.address && (
                        <Button onClick={() => { setSelectingItem(record); setLendModal(true) }}>Lend</Button>
                    )
                }
            </div>
        )
    }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>Alive Borrows</div>
                    <Button type={'primary'} onClick={() => { setMakeModal(true) }}>Make</Button>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={borrowList} pagination={false} />
            </Card>
            {makeModalVisible && <Modal
                title={'Make'}
                visible={true}
                closable
                onCancel={() => { setMakeModal(false) }}
                footer={null}
            >
                <MakeBorrowForm hideModal={() => { setMakeModal(false) }} accountPair={accountPair} item={selectingItem} symbolsMapping={symbolsMapping} />
            </Modal>}
            {lendModalVisible && <Modal
                title={'Lend'}
                visible={true}
                closable
                onCancel={() => { setLendModal(false) }}
                footer={null}
            >
                <LendBorrowForm hideModal={() => { setLendModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
