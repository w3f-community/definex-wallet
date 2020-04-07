import React, { useEffect, useState } from 'react';
import { Table, Button, Divider, Modal, Tooltip } from 'antd';
import { useSubstrate } from '../substrate-lib';
import AddBorrowForm from '../components/forms/AddBorrowForm';
// import Pagination from '../components/pagination'

export default function P2p(props) {
    const { api } = useSubstrate();
    console.log('api is', api);
    const [borrowList, setBorrowList] = useState(0);
    const [selectingItem, setSelectingItem] = useState(0);
    const [addModalVisible, setAddModal] = useState(false);
    const [lendModalVisible, setLendModal] = useState(false);
    const [repayModalVisible, setRepayModal] = useState(false);
    const [cancelModalVisible, setCancelModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);

    const accountPair = props.accountPair;

    useEffect(() => {
        api.rpc.genericAsset.symbolsList().then(res => {
            const symbolsArray = JSON.parse(res)
            const symbolsMapping = {}
            symbolsArray.forEach(item => {
                symbolsMapping[item[0]] = item[1]
            })
            api.rpc.pToP.borrows(10, 0).then(res => {
                const borrowArray = JSON.parse(res)
                borrowArray.forEach(item => {
                    item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                })
                setBorrowList(borrowArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        })
    }, [api.rpc.pToP, api.rpc.genericAsset]);

    const columns = [{
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
    }, {
        title: 'Lock Id',
        dataIndex: 'lock_id',
        key: 'lock_id',
    }, {
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
        title: 'Borrow Asset Symbol',
        dataIndex: 'borrow_asset_symbol',
        key: 'borrow_asset_symbol',
        render: (props, record) => (
            <span>{record.borrow_asset_symbol}</span>
        )
    },
    {
        title: 'Collateral Asset Symbol',
        dataIndex: 'collateral_asset_symbol',
        key: 'collateral_asset_symbol',
        render: (props, record) => (
            <span>{record.collateral_asset_symbol}</span>
        )
    },
    {
        title: 'Borrow Balance',
        dataIndex: 'borrow_balance',
        key: 'borrow_balance',
        render: (props, record) => (
            <span>{record.borrow_balance / (10 ** 8)}</span>
        )
    },
    {
        title: 'Collateral Balance',
        dataIndex: 'collateral_balance',
        key: 'collateral_balance',
        render: (props, record) => (
            <span>{record.collateral_balance / (10 ** 8)}</span>
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
    },
    {
        title: 'Dead After',
        dataIndex: 'dead_after',
        key: 'dead_after',
    },
    {
        title: 'Loan Id',
        dataIndex: 'loan_id',
        key: 'loan_id',
    },
    {
        title: 'Action',
        key: 'action',
        width: '360px',
        render: (props, record) => {
            return (
                <div>
                    {
                        record.who === accountPair.address && (
                            <div>
                                <Button onClick={() => { setSelectingItem(record); setAddModal(true) }}>Add</Button>
                                <Divider type="vertical" />
                            </div>
                        )
                    }
                    <Button onClick={() => { setSelectingItem(record); setLendModal(true) }}>Lend</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setRepayModal(true) }}>Repay</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setCancelModal(true) }}>Cancel</Button>
                </div>
            )
        }
    }
    ]

    return (
        <div>
            <h2>Borrow List</h2>
            <Button type={'primary'} style={{ margin: '24px auto 12px' }}>Make</Button>
            <Table columns={columns} rowKey={'id'} dataSource={borrowList} pagination={false} />
            {addModalVisible && <Modal
                title={'Add'}
                visible={true}
                closable
                onCancel={() => { setAddModal(false) }}
                footer={null}
            >
                <AddBorrowForm accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
