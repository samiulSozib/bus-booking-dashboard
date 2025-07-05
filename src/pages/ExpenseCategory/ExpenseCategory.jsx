import React from 'react'
import PageMeta from '../../components/common/PageMeta'
import ExpenseCategoryList from './ExpenseCategoryList'

const ExpenseCategory = () => {
  return (
    <>
      <PageMeta
        title="Bus Booking"
        description=""
      />
      <div className="">
          <ExpenseCategoryList/>
      </div>
    </>
  )
}

export default ExpenseCategory