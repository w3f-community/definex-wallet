import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Sticky } from 'semantic-ui-react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import { message } from 'antd'

// imoprt pages here
import AvailableBorrows from './pages/p2p/AvailableBorrows';
import MyBorrows from './pages/p2p/MyBorrows';
import AvailableLoans from './pages/p2p/AvailableLoans';
import MyLoans from './pages/p2p/MyLoans';
import Assets from './pages/assets';
import Saving from './pages/savings/saving';
import UserLoans from './pages/savings/userLoans'
import Test from './pages/test';

import 'semantic-ui-css/semantic.min.css';
import { SubstrateContextProvider, useSubstrate } from './substrate-lib';

import AccountSelector from './AccountSelector';
import './assets/custom.css'

// global message config
message.config({
  maxCount: 1,
})

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
            <Route path="/" exact>
              <Redirect to="/assets" />
            </Route>
            <Route path="/assets" exact>
              <Assets accountPair={accountPair} />
            </Route>
            <Route path="/available-borrows">
              <AvailableBorrows accountPair={accountPair} />
            </Route>
            <Route path="/my-borrows">
              <MyBorrows accountPair={accountPair} />
            </Route>
            <Route path="/available-loans">
              <AvailableLoans accountPair={accountPair} />
            </Route>
            <Route path="/my-loans">
              <MyLoans accountPair={accountPair} />
            </Route>
            <Route path="/saving">
              <Saving accountPair={accountPair} />
            </Route>
            <Route path="/user-loans">
              <UserLoans accountPair={accountPair} />
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
