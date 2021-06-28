import React from 'react'
import { Helmet } from 'react-helmet'
import ComingSoon from 'components/cleanui/system/Errors/coming-soon'

const SystemComingSoon = () => {
  return (
    <div>
      <Helmet title="Coming Soon" />
      <ComingSoon />
    </div>
  )
}

export default SystemComingSoon
