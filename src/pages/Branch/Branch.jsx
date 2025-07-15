import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import BranchList from './BanchList'

const Branch = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <BranchList/>
      </div>
    </>
  )
}

export default Branch