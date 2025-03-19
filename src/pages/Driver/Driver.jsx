import React from 'react'
import DriverList from './DriverList'
import PageMeta from '../../components/common/PageMeta'

const Driver = () => {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <DriverList/>
      </div>
    </>
  )
}

export default Driver