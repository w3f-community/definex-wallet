import React from 'react'
import Balances from 'components/tests/Balances';
import BlockNumber from 'components/tests/BlockNumber';
import ChainState from 'components/tests/ChainState';
import Events from 'components/tests/Events';
import Extrinsics from 'components/tests/Extrinsics';
import Metadata from 'components/tests/Metadata';
import NodeInfo from 'components/tests/NodeInfo';
import TemplateModule from 'components/tests/TemplateModule';
import Transfer from 'components/tests/Transfer';
import Upgrade from 'components/tests/Upgrade';
// import { useSubstrate } from '../substrate-lib';
import { DeveloperConsole } from 'substrate-lib/components';
import { Container, Grid } from 'semantic-ui-react';

export default function Text(props) {

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
