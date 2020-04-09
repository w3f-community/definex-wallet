import React, { useEffect, useState } from 'react';
import { Table, Card } from 'antd';
import { useSubstrate } from '../substrate-lib';

import BtcIcon from '../assets/btc.png'
import UsdtIcon from '../assets/usdt.png'
// import Pagination from '../components/pagination'

export default function P2p(props) {
    const { api } = useSubstrate();
    console.log('api is', api);
    const [assetsList, setAssetsList] = useState(0);
    const [symbolsMapping, setSymbolsMapping] = useState({});
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
            api.rpc.genericAsset.userAssets(accountPair.address).then(res => {
                setAssetsList(JSON.parse(res))
            })
        }
    }, [api.rpc.pToP, api.rpc.genericAsset, symbolsMapping, accountPair]);

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
        </div>
    );
}
