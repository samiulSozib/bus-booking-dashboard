import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import VendorUserRolesList from './VendorUserRolesList'

const VendorUserRoles = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
        <VendorUserRolesList/>
      </div>
    </>
  )
}

export default VendorUserRoles