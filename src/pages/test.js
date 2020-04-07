import React from 'react'
import Balances from '../Balances';
import BlockNumber from '../BlockNumber';
import ChainState from '../ChainState';
import Events from '../Events';
import Extrinsics from '../Extrinsics';
import Metadata from '../Metadata';
import NodeInfo from '../NodeInfo';
import TemplateModule from '../TemplateModule';
import Transfer from '../Transfer';
import Upgrade from '../Upgrade';
// import { useSubstrate } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';
import { Container, Grid } from 'semantic-ui-react';

export default function Text(props) {
    console.log(props)
    console.log('loooooading')
    const accountPair = props.accountPair

    return (
        <Container>
            <Grid stackable columns='equal'>
                <Grid.Row stretched>
                    <NodeInfo />
                    <Metadata />
                    <BlockNumber />
                    <BlockNumber finalized />
                </Grid.Row>
                <Grid.Row stretched>
                    <Balances />
                </Grid.Row>
                <Grid.Row>
                    <Transfer accountPair={accountPair} />
                    <Upgrade accountPair={accountPair} />
                </Grid.Row>
                <Grid.Row>
                    <Extrinsics accountPair={accountPair} />
                    <ChainState />
                    <Events />
                </Grid.Row>
                <Grid.Row>
                    <TemplateModule accountPair={accountPair} />
                </Grid.Row>
            </Grid>
            <DeveloperConsole />
        </Container>
    )
}
