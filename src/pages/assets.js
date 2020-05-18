import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal } from 'antd';
import { useSubstrate } from '../substrate-lib';

import BtcIcon from '../assets/btc.png'
import UsdtIcon from '../assets/usdt.png'
import DfxIcon from '../assets/dfx.png'

import TransferForm from 'components/forms/assets/TransferForm';

// import Pagination from '../components/pagination'

export default function P2p(props) {
    const { api } = useSubstrate();
    const [assetsList, setAssetsList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [transferModalVisible, setTransferModal] = useState(false)
    const [selectingItem, setSelectingItem] = useState(0);
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
            let assetArray = []
            // Get generic asset
            api.rpc.genericAsset.userAssets(accountPair.address).then(res => {
                assetArray = JSON.parse(res)
                // Get DFX asset
                api.query.system.account(accountPair.address).then(result => {
                    assetArray.push({ asset_id: '', symbol: 'DFX', balance: Number(result.data.free), isMain: true })
                    setAssetsList(assetArray)
                })
            })
        }
    }, [api.rpc.pToP, api.rpc.genericAsset, api.query.system, symbolsMapping, accountPair, refreshKey]);

    const columns = [
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (props, record) => (
                <div>
                    {record.symbol === 'BTC' && (
                        <img src={BtcIcon} alt="BTC Icon" style={{ width: '30px', height: '30px', marginRight: '8px' }} />
                    )}
                    {record.symbol === 'DUSD' && (
                        <img src={UsdtIcon} alt="DUSD Icon" style={{ width: '30px', height: '30px', marginRight: '8px' }} />
                    )}
                     {record.symbol === 'DFX' && (
                        <img src={DfxIcon} alt="DFX Icon" style={{ width: '30px', height: '30px', marginRight: '8px' }} />
                    )}
                    {record.symbol}
                </div>
            )
        },
        {
            title: 'Asset Id',
            dataIndex: 'asset_id',
            key: 'asset_id',
        },

        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            render: (props, record) => (
                <span>{record.balance / (10 ** 8)} {record.symbol}</span>
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (props, record) => (
                <Button onClick={() => { setSelectingItem(record); setTransferModal(true) }}>Transfer</Button>
            )
        }
    ]

    return (
        <div>
            <Card style={{ margin: '32px auto' }}>
                <div className={'card-head'}>
                    <div className={'card-title'}>Assets</div>
                </div>
                <Table columns={columns} rowKey={'asset_id'} dataSource={assetsList} pagination={false} />
            </Card>
            {transferModalVisible && <Modal
                title={'Transfer'}
                visible={true}
                closable
                onCancel={() => { setTransferModal(false) }}
                footer={null}
            >
                <TransferForm hideModal={() => { setRefreshKey(++refreshKey); setTransferModal(false) }} accountPair={accountPair} item={selectingItem} symbolsMapping={symbolsMapping} />
            </Modal>}
        </div>
    );
}
