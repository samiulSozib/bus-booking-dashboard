import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import DiscountList from './DiscountList'

const Discount = () => {
  return (
    <>
      <PageMeta
        title="Tak Telecom"
        description=""
      />
      <div className="">
          <DiscountList/>
      </div>
    </>
  )
}

export default Discount