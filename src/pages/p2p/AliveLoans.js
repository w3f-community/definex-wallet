import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card } from 'antd';
import { useSubstrate } from '../../substrate-lib';
import MakeBorrowForm from '../../components/forms/MakeBorrowForm';
import LendBorrowForm from '../../components/forms/LendBorrowForm';

export default function P2p(props) {
    const { api } = useSubstrate();
    const [loanList, setLoanList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [lendModalVisible, setLendModal] = useState(false);
    const [makeModalVisible, setMakeModal] = useState(false);
    console.log(api)

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
            api.rpc.pToP.aliveLoans(10, 0).then(res => {
                const loanArray = JSON.parse(res)
                console.log(loanArray, 333333)
                loanArray.forEach((item, index) => {
                    item.borrow_asset_symbol = symbolsMapping[item.borrow_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                    if (item.who === accountPair.address) {
                        loanArray.splice(index, 1);
                    }
                })
                setLoanList(loanArray);
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
        title: 'Collateral Balance Original',
        dataIndex: 'collateral_balance_original',
        key: 'collateral_balance_original',
        render: (props, record) => (
            <span>{record.collateral_balance_original / (10 ** 8)}</span>
        )
    },
    {
        title: 'Collateral Balance Available',
        dataIndex: 'collateral_balance_available',
        key: 'collateral_balance_available',
        render: (props, record) => (
            <span>{record.collateral_balance_available / (10 ** 8)}</span>
        )
    },
    {
        title: 'Loan Balance Total',
        dataIndex: 'loan_balance_total',
        key: 'loan_balance_total',
        render: (props, record) => (
            <span>{record.loan_balance_total / (10 ** 8)}</span>
        )
    },
    {
        title: 'Action',
        key: 'action',
        width: '300px',
        render: (props, record) => (
            <Button onClick={() => { setSelectingItem(record); setLendModal(true) }}>Lend</Button>
        )
    }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>Alive Loans</div>
                    <Button type={'primary'} onClick={() => { setMakeModal(true) }}>Make</Button>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={loanList} pagination={false} />
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
