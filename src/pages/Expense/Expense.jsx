import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import ExpenseList from './ExpenseList'

const Expense = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <ExpenseList/>
      </div>
    </>
  )
}

export default Expense