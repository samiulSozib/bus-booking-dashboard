import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import VendorUserList from './VendorUserList'

const VendorUser = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <VendorUserList/>
      </div>
    </>
  )
}

export default VendorUser