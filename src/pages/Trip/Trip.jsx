import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import TripList from './TripList'

const Trip = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <TripList/>
      </div>
    </>
  )
}

export default Trip