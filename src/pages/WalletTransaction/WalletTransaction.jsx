import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import WalletTransactionList from './WalletTransactionList'

const WalletTransaction = () => {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <WalletTransactionList/>
      </div>
    </>
  )
}

export default WalletTransaction