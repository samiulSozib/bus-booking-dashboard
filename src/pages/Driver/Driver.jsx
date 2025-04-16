import React from 'react'
import DriverList from './DriverList'
import PageMeta from '../../components/common/PageMeta'

const Driver = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <DriverList/>
      </div>
    </>
  )
}

export default Driver