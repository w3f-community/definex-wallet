import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tooltip, Card } from 'antd';
import { useSubstrate } from 'substrate-lib';
import { useTranslation } from 'react-i18next'
import LiquidateBorrowForm from 'components/forms/p2p/LiquidateBorrowForm';
import { Decimal } from 'decimal.js'

export default function P2p(props) {
    const { api } = useSubstrate();
    const [loanList, setLoanList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [selectingItem, setSelectingItem] = useState(0);
    const [liquidateModalVisible, setLiquidateModal] = useState(false);
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
        if (accountPair) {
            api.rpc.pToP.availableLoans(10, 0).then(res => {
                const loanArray = JSON.parse(res)
                loanArray.forEach((item, index) => {
                    item.loan_asset_symbol = symbolsMapping[item.loan_asset_id]
                    item.collateral_asset_symbol = symbolsMapping[item.collateral_asset_id]
                })
                setLoanList(loanArray);
            }).catch(error => {
                console.log('errrr', error);
            })
        }
    }, [symbolsMapping, api.rpc.pToP, accountPair, refreshKey])

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '50px'
        },
        {
            title: t('table.borrowId'),
            dataIndex: 'borrow_id',
            key: 'borrow_id',
        },
        {
            title: t('table.borrowerId'),
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
            title: t('table.loanerId'),
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
            title: t('table.dueHeight'),
            dataIndex: 'due_height',
            key: 'due_height'
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
            title: t('table.loanBalance'),
            dataIndex: 'loan_balance',
            key: 'loan_balance',
            render: (props, record) => (
                <span>{String(new Decimal(record.loan_balance).dividedBy(10 ** 8))} {record.loan_asset_symbol}</span>
            )
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status'
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
            title: t('table.expireTime'),
            dataIndex: 'secs_left',
            key: 'secs_left',
            width: '260px',
            render: (props, record) => (<div>
                {new Date(record.secs_left * 1000 + (new Date().valueOf())).toUTCString()}
            </div>)
        },
        // {
        //     title: 'Liquidation Type',
        //     dataIndex: 'liquidation_type',
        //     key: 'liquidation_type'
        // },
        {
            title: t('table.action'),
            key: 'action',
            render: (props, record) => (
                <div>
                    {record.can_be_liquidate && (
                        <Button onClick={() => { setSelectingItem(record); setLiquidateModal(true) }}>Liquidate</Button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>{t('p2p.availableLoans')}</div>
                </div>
                <Table columns={columns} rowKey={'id'} dataSource={loanList} pagination={false} />
            </Card>
            {liquidateModalVisible && <Modal
                title={t('action.liquidate')}
                visible={true}
                closable
                onCancel={() => { setLiquidateModal(false) }}
                footer={null}
            >
                <LiquidateBorrowForm hideModal={() => { setRefreshKey(++refreshKey); setLiquidateModal(false) }} accountPair={accountPair} item={selectingItem} />
            </Modal>}
        </div>
    );
}
