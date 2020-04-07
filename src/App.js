import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Sticky } from 'semantic-ui-react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

// imoprt pages here
import P2p from './pages/p2p';
import Test from './pages/test'

import 'semantic-ui-css/semantic.min.css';
import { SubstrateContextProvider, useSubstrate } from './substrate-lib';

import AccountSelector from './AccountSelector';
import './assets/custom.css'

function Main() {
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = text => (
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>
  );

  if (apiState === 'ERROR') return loader('Error connecting to the blockchain');
  else if (apiState !== 'READY') return loader('Connecting to the blockchain');

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Router>
        <Sticky context={contextRef}>
          <AccountSelector setAccountAddress={setAccountAddress} />
        </Sticky>
        <Container>
          <Switch>
            <Route path="/p2p">
              <P2p accountPair={accountPair} />
            </Route>
            <Route path="/test">
              <Test accountPair={accountPair} />
            </Route>
          </Switch>
        </Container>
      </Router>

      {/* <Container>
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
     */}
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
