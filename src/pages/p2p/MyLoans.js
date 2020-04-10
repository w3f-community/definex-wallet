import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card, Divider } from 'antd';
import { useSubstrate } from '../../substrate-lib';
import AddBorrowForm from '../../components/forms/AddBorrowForm';
import RepayBorrowForm from '../../components/forms/RepayBorrowForm';

export default function P2p(props) {
    const { api } = useSubstrate();
    const [loanList, setLoanList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [addModalVisible, setAddModal] = useState(false);
    const [repayModalVisible, setRepayModal] = useState(false);
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
            api.rpc.pToP.userLoans(accountPair.address, 10, 0).then(res => {
                const loanArray = JSON.parse(res)
                loanArray.forEach((item, index) => {
                    item.loan_asset_symbol = symbolsMapping[item.loan_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                    // give borrow value
                    item.borrow_asset_symbol = symbolsMapping[item.loan_asset_id]
                    item.borrow_asset_id = item.loan_asset_id
                    item.borrow_balance = item.loan_balance
                })
                setLoanList(loanArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.pToP, accountPair])

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Borrow Id',
            dataIndex: 'borrow_id',
            key: 'borrow_id',
        },
        {
            title: 'Borrower Id',
            dataIndex: 'borrower_id',
            key: 'borrower_id',
            ellipsis: true,
            width: '120px',
            render: (props, record) => (
                <Tooltip placement="left" title={record.borrower_id}>
                    <span>{record.borrower_id}</span>
                </Tooltip>
            )
        },
        {
            title: 'Loaner Id',
            dataIndex: 'loaner_id',
            key: 'loaner_id',
            ellipsis: true,
            width: '120px',
            render: (props, record) => (
                <Tooltip placement="left" title={record.loaner_id}>
                    <span>{record.loaner_id}</span>
                </Tooltip>
            )
        },
        {
            title: 'Due',
            dataIndex: 'due',
            key: 'due'
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
            title: 'Loan Balance',
            dataIndex: 'loan_balance',
            key: 'loan_balance',
            render: (props, record) => (
                <span>{record.loan_balance / (10 ** 8)} {record.loan_asset_symbol}</span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
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
            title: 'Liquidation Type',
            dataIndex: 'liquidation_type',
            key: 'liquidation_type'
        },
        {
            title: 'Action',
            key: 'action',
            width: '300px',
            render: (props, record) => (
                <div>
                    <Button onClick={() => { setSelectingItem(record); setAddModal(true) }}>Add</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setRepayModal(true) }}>Repay</Button>
                </div>
            )
        }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>My Loans</div>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={loanList} pagination={false} />
            </Card>
            {addModalVisible && <Modal
                title={'Add'}
                visible={true}
                closable
                onCancel={() => { setAddModal(false) }}
                footer={null}
            >
                <AddBorrowForm hideModal={() => { setAddModal(false) }} accountPair={accountPair} item={selectingItem} />
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
        </div>
    );
}