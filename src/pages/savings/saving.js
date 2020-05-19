import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useSubstrate } from 'substrate-lib';
import { useTranslation } from 'react-i18next'
import SavingForm from 'components/forms/saving/SavingForm'
import RedeemForm from 'components/forms/saving/RedeemForm'

export default function Saving(props) {
    const { api } = useSubstrate();
    const [symbolsMapping, setSymbolsMapping] = useState({});
    const [tabKey, setTabKey] = useState('saving')
    const { t } = useTranslation()
    const accountPair = props.accountPair;

    const tabList = [
        {
            key: 'saving',
            tab: t('p2p.saving')
        },
        {
            key: 'redeem',
            tab: t('p2p.redeem')
        }
    ]

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
                {/* currently only support dusd, asset id is 0 */}
                {tabKey === 'saving' && <SavingForm symbolsMapping={symbolsMapping} accountPair={accountPair} />}
                {tabKey === 'redeem' && <RedeemForm symbolsMapping={symbolsMapping} accountPair={accountPair} />}
            </Card>
        </div>
    );
}
