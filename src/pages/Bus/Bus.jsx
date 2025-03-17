import React from 'react'
import BusList from './BusList'
import PageMeta from '../../components/common/PageMeta'

const Bus = () => {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <BusList/>
      </div>
    </>
  )
}

export default Bus