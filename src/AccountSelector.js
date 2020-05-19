import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'

import {
  Menu,
  Dropdown,
  Container,
} from 'semantic-ui-react';

import { Menu as AntMenu, Dropdown as AntDropdown } from 'antd'
import { Link, useLocation } from 'react-router-dom'

import { useSubstrate } from './substrate-lib';

function Main(props) {
  const { keyring, api } = useSubstrate();
  const { i18n, t } = useTranslation()
  const { setAccountAddress } = props;
  const [accountSelected, setAccountSelected] = useState('');
  const [currentBlockNumber, setCurrentBlockNumber] = useState();
  const currentLocation = useLocation()

  const [language, setLanguage] = useState(i18n.language)

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user'
  }));

  const customAddress = localStorage.getItem('address');

  let initialAddress = ''

  if (customAddress) {
    initialAddress = customAddress
  } else if (keyringOptions.length > 0) {
    initialAddress = keyringOptions[0].value
  }

  useEffect(() => {
    let unsubscribe = null
    api.derive.chain.bestNumber(number => {
      setCurrentBlockNumber(Number(number))
    }).then(unsub => {
      unsubscribe = unsub
    })
    return () => unsubscribe && unsubscribe()
  }, [api.derive.chain])

  //watch language change
  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem('language', language)
  }, [language])

  // Set the initial address
  useEffect(() => {
    setAccountSelected(initialAddress);
    setAccountAddress(initialAddress);
  }, [setAccountAddress, initialAddress]);

  const onChange = address => {
    // Update state with new account address
    // Remember user's choice
    localStorage.setItem('address', address)
    setAccountAddress(address);
    setAccountSelected(address);
  };

  const languageMenu = (
    <AntMenu>
      <AntMenu.Item>
        <a onClick={() => { setLanguage('zh') }}>简体中文</a>
      </AntMenu.Item>
      <AntMenu.Item>
        <a onClick={() => { setLanguage('en') }}>English</a>
      </AntMenu.Item>
    </AntMenu>
  )

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
            <Link to="/assets" style={{ color: '#fff' }}>{t('nav.assets')}</Link>
          </AntMenu.Item>
          <AntMenu.SubMenu title={'P2P'} style={{ color: '#fff' }}>
            <AntMenu.ItemGroup title={t('nav.borrows')}>
              <AntMenu.Item key="available-borrows">
                <Link to="/available-borrows">{t('nav.availableBorrows')}</Link>
              </AntMenu.Item>
              <AntMenu.Item key="my-borrows">
                <Link to="/my-borrows">{t('nav.myBorrows')}</Link>
              </AntMenu.Item>
            </AntMenu.ItemGroup>
            <AntMenu.ItemGroup title={t('nav.loans')}>
              <AntMenu.Item key="available-loans">
                <Link to="/available-loans">{t('nav.availableLoans')}</Link>
              </AntMenu.Item>
              <AntMenu.Item key="my-loans">
                <Link to="/my-loans">{t('nav.myLoans')}</Link>
              </AntMenu.Item>
            </AntMenu.ItemGroup>
          </AntMenu.SubMenu>
          <AntMenu.SubMenu title={t('nav.saving')} style={{ color: '#fff' }}>
            <AntMenu.Item key="saving">
              <Link to="/saving">{t('nav.saving')}</Link>
            </AntMenu.Item>
            <AntMenu.Item key="user-loans">
              <Link to="/user-loans">{t('nav.userLoans')}</Link>
            </AntMenu.Item>
          </AntMenu.SubMenu>
        </AntMenu>
        <Menu.Menu position='right'>

        <AntDropdown overlay={languageMenu}>
            <div style={{ color: '#fff', lineHeight: '38px', marginRight: '16px', cursor: 'pointer'}}>
              {language == 'zh' ? '简体中文 ∨' : 'English ∨'}
            </div>
          </AntDropdown>
          {
            currentBlockNumber && (
              <div style={{ color: '#fff', lineHeight: '38px', marginRight: '16px' }}>
                Block Number: {currentBlockNumber}
              </div>
            )
          }

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
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

export default function AccountSelector(props) {
  const { keyring } = useSubstrate();
  return keyring.getPairs ? <Main {...props} /> : null;
}
