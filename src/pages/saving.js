import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useSubstrate } from '../substrate-lib';
import SavingForm from 'components/forms/saving/SavingForm'
import RedeemForm from 'components/forms/saving/RedeemForm'

const tabList = [
    {
        key: 'saving',
        tab: 'Saving'
    },
    {
        key: 'redeem',
        tab: 'Redeem'
    }
]

export default function Saving(props) {
    const { api } = useSubstrate();
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [tabKey, setTabKey] = useState('saving')
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

    return (
        <div>
            <Card style={{ margin: '32px auto' }} tabList={tabList} activeTabKey={tabKey} onTabChange={key => { setTabKey(key) }}>
                {tabKey === 'saving' && <SavingForm accountPair={accountPair}/>}
                {tabKey === 'redeem' && <RedeemForm accountPair={accountPair}/>}
            </Card>
        </div>
    );
}
