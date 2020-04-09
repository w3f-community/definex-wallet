import React, { useState, useEffect } from 'react';

import {
  Menu,
  Dropdown,
  Container,
} from 'semantic-ui-react';

import { Menu as AntMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

import { useSubstrate } from './substrate-lib';

function Main(props) {
  const { keyring } = useSubstrate();
  const { setAccountAddress } = props;
  const [accountSelected, setAccountSelected] = useState('');
  const currentLocation = useLocation()

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user'
  }));

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : '';

  // Set the initial address
  useEffect(() => {
    setAccountSelected(initialAddress);
    setAccountAddress(initialAddress);
  }, [setAccountAddress, initialAddress]);

  const onChange = address => {
    // Update state with new account address
    setAccountAddress(address);
    setAccountSelected(address);
  };

  return (
    <Menu
      attached='top'
      tabular
      style={{
        backgroundColor: '#000',
        borderColor: '#fff',
        alignItems: 'center',
      }}
    >
      <Container>
        <Menu.Menu>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {/* TODO: change a way to import */}
            <Link to="/assets">
              <img src="/logo.png" alt="logo" style={{ width: '100px', marginRight: '12px' }} />
            </Link>
          </div>
        </Menu.Menu>
        <AntMenu mode="horizontal" selectedKeys={currentLocation.pathname} style={{ background: '#000', borderBottom: 'unset' }}>
          <AntMenu.Item key="assets">
            <Link to="/assets" style={{ color: '#fff' }}>Assets</Link>
          </AntMenu.Item>
          <AntMenu.SubMenu title={'P2P'} style={{ color: '#fff' }}>
            <AntMenu.ItemGroup title="Borrows">
              <AntMenu.Item key="aliveBorrows">
                <Link to="/alive-borrows">Alive Borrows</Link>
              </AntMenu.Item>
              <AntMenu.Item key="myBorrows">
                <Link to="/my-borrows">My Borrows</Link>
              </AntMenu.Item>
            </AntMenu.ItemGroup>
            <AntMenu.ItemGroup title="Loans">
              <AntMenu.Item key="aliveLoans">
                <Link to="/alive-loans">Alive Loans</Link>
              </AntMenu.Item>
              <AntMenu.Item key="myLoans">
                <Link to="/my-loans">My Loans</Link>
              </AntMenu.Item>
            </AntMenu.ItemGroup>
          </AntMenu.SubMenu>
        </AntMenu>

        <Menu.Menu position='right'>
          {!accountSelected ? (
            <span>
              Add your account with the{' '}
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://github.com/polkadot-js/extension'
              >
                Polkadot JS Extension
              </a>
            </span>
          ) : null}
          {/* <Icon
            name='users'
            size='large'
            circular
            color={accountSelected ? 'green' : 'red'}
          /> */}
          <Dropdown
            search
            selection
            clearable
            placeholder='Select an account'
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={accountSelected}
          />
          {/* {api.query.system && api.query.system.account ? (
            <BalanceAnnotation accountSelected={accountSelected} />
          ) : null} */}
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

// function BalanceAnnotation(props) {
//   const { accountSelected } = props;
//   const { api } = useSubstrate();
//   const [accountBalance, setAccountBalance] = useState(0);

//   // When account address changes, update subscriptions
//   useEffect(() => {
//     let unsubscribe;

//     // If the user has selected an address, create a new subscription
//     accountSelected &&
//       api.query.system
//         .account(accountSelected, ({ data: { free: balance } }) => {
//           setAccountBalance(balance.toString());
//         })
//         .then(unsub => {
//           unsubscribe = unsub;
//         })
//         .catch(console.error);

//     return () => unsubscribe && unsubscribe();
//   }, [accountSelected, api.query.system]);

//   return accountSelected ? (
//     <Label pointing='left' style={{ lineHeight: 'unset' }}>
//       {/* <Icon
//         name='money bill alternate'
//         color={accountBalance > 0 ? 'green' : 'red'}
//       /> */}
//       Balance: {accountBalance}
//     </Label>
//   ) : null;
// }

export default function AccountSelector(props) {
  const { keyring } = useSubstrate();
  return keyring.getPairs ? <Main {...props} /> : null;
}
