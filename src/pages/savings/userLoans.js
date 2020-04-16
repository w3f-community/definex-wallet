import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card, Divider } from 'antd';
import { useSubstrate } from 'substrate-lib';
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
        },
        {
            title: 'Collateral Balance Original',
            dataIndex: 'collateral_balance_original',
            key: 'collateral_balance_original',
            render: (props, record) => (
                <span>{Number(new Decimal(record.collateral_balance_original).div(10 ** 8))} {symbolsMapping[1]}</span>
            )
        },
        {
            title: 'Collateral Balance Available',
            dataIndex: 'collateral_balance_available',
            key: 'collateral_balance_available',
            render: (props, record) => (
                <span>{Number(new Decimal(record.collateral_balance_available).div(10 ** 8))} {symbolsMapping[1]}</span>
            )
        },
        {
            title: 'Loan Balance Total',
            dataIndex: 'loan_balance_total',
            key: 'loan_balance_total',
            render: (props, record) => (
                <span>{Number(new Decimal(record.loan_balance_total).div(10 ** 8))} {symbolsMapping[0]}</span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: 'Action',
            key: 'action',
            width: '560px',
            render: (props, record) => (
                <div>
                    <Button onClick={() => { setSelectingItem(record); setAddCollateralModal(true); }}>Add Collateral</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setDrawModal(true); }}>Draw</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setRepayLoanModal(true); }}>Repay Loan</Button>
                    <Divider type="vertical" />
                    <Button onClick={() => { setSelectingItem(record); setMarkLiquidatedModal(true); }}>Mark Liquidated</Button>
                </div>
            )
        }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>User Loans</div>
                    <Button type={'primary'} onClick={() => { setApplyLoanModal(true) }}>Apply</Button>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={loanList} pagination={false} />
            </Card>
            {applyLoanModalVisible && <Modal
                title={'Apply Loan'}
                visible={true}
                closable
                onCancel={() => { setApplyLoanModal(false) }}
                footer={null}
            >
                <ApplyLoanForm symbolsMapping={symbolsMapping} hideModal={() => { setRefreshKey(++refreshKey); setApplyLoanModal(false) }} accountPair={accountPair} />
            </Modal>}
            {addCollateralModalVisible && <Modal
                title={'Add Collateral'}
                visible={true}
                closable
                onCancel={() => { setAddCollateralModal(false) }}
                footer={null}
            >
                <AddCollateralForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setAddCollateralModal(false) }} accountPair={accountPair} />
            </Modal>}
            {drawModalVisible && <Modal
                title={'Draw'}
                visible={true}
                closable
                onCancel={() => { setDrawModal(false) }}
                footer={null}
            >
                <DrawForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setDrawModal(false) }} accountPair={accountPair} />
            </Modal>}
            {repayLoanModalVisible && <Modal
                title={'Repay Loan'}
                visible={true}
                closable
                onCancel={() => { setRepayLoanModal(false) }}
                footer={null}
            >
                <RepayLoanForm symbolsMapping={symbolsMapping} item={selectingItem} hideModal={() => { setRefreshKey(++refreshKey); setRepayLoanModal(false) }} accountPair={accountPair} />
            </Modal>}
            {markLiquidatedModalVisible && <Modal
                title={'Liquidate Loan'}
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
