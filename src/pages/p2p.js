import React, { useEffect, useState } from 'react';
import { Table, Button, Divider, Modal, Tooltip, Card } from 'antd';
import { useSubstrate } from '../substrate-lib';
import MakeBorrowForm from '../components/forms/MakeBorrowForm';
import AddBorrowForm from '../components/forms/AddBorrowForm';
import LendBorrowForm from '../components/forms/LendBorrowForm';
import RepayBorrowForm from '../components/forms/RepayBorrowForm';
import CancelBorrowForm from '../components/forms/CancelBorrowForm';
// import Pagination from '../components/pagination'

export default function P2p(props) {
    const { api } = useSubstrate();
    console.log('api is', api);
    const [borrowList, setBorrowList] = useState(0);
    const [userBorrowList, setUserBorrowList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [addModalVisible, setAddModal] = useState(false);
    const [lendModalVisible, setLendModal] = useState(false);
    const [repayModalVisible, setRepayModal] = useState(false);
    const [cancelModalVisible, setCancelModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);

    const accountPair = props.accountPair;

    console.log('account pair', accountPair)

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
            api.rpc.pToP.aliveBorrows(10, 0).then(res => {
                const borrowArray = JSON.parse(res)
                borrowArray.forEach((item, index) => {
                    item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                    // remove self
                    if (item.who === accountPair.address) {
                        borrowArray.splice(index, 1);
                    }
                })
                setBorrowList(borrowArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.pToP, accountPair])

    useEffect(() => {
        if (accountPair) {
            api.rpc.pToP.userBorrows(accountPair.address, 10, 0).then(res => {
                const borrowArray = JSON.parse(res)
                borrowArray.forEach(item => {
                    item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                })
                console.log(borrowArray, '123123123')
                setUserBorrowList(borrowArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.pToP, accountPair])

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
            {record.interest_rate / (10 ** 6)} %
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
        render: (props, record) => {
            if (record.who === accountPair.address) {
                return (
                    <div>
                        {
                            (record.status === 'Taken' || record.status === 'Alive') && (
                                <span>
                                    <Button onClick={() => { setSelectingItem(record); setAddModal(true) }}>Add</Button>
                                </span>
                            )
                        }
                        {
                            record.status === 'Taken' && (
                                <span>
                                    <Divider type="vertical" />
                                    <Button onClick={() => { setSelectingItem(record); setRepayModal(true) }}>Repay</Button>
                                </span>
                            )
                        }
                        {
                            record.status === 'Alive' && (
                                <span>
                                    <Divider type="vertical" />
                                    <Button onClick={() => { setSelectingItem(record); setCancelModal(true) }}>Cancel</Button>
                                </span>
                            )
                        }
                    </div>
                )
            } else {
                return (
                    <Button onClick={() => { setSelectingItem(record); setLendModal(true) }}>Lend</Button>
                )
            }
        }
    }
    ]

    const myBorrowColumns = JSON.parse(JSON.stringify(columns))
    myBorrowColumns.splice(1, 1)

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>Alive Borrow List</div>
                    <Button type={'primary'} onClick={() => { setMakeModal(true) }}>Make</Button>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={borrowList} pagination={false} />
            </Card>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>My Borrow List</div>
                </div>
                <Table columns={myBorrowColumns} rowKey={'id'} dataSource={userBorrowList} pagination={false} />
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
            {addModalVisible && <Modal
                title={'Add'}
                visible={true}
                closable
                onCancel={() => { setAddModal(false) }}
                footer={null}
            >
                <AddBorrowForm hideModal={() => { setAddModal(false) }} accountPair={accountPair} item={selectingItem} />
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
            {repayModalVisible && <Modal
                title={'Repay'}
                visible={true}
                closable
                onCancel={() => { setRepayModal(false) }}
                footer={null}
            >
                <RepayBorrowForm hideModal={() => { setRepayModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
            {cancelModalVisible && <Modal
                title={'Cancel'}
                visible={true}
                closable
                onCancel={() => { setCancelModal(false) }}
                footer={null}
            >
                <CancelBorrowForm hideModal={() => { setCancelModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
