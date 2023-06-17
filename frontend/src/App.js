import React, { Suspense } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { NotificationContainer } from "react-notifications"
import { AppLayout } from "./components/layout/app-layout"
import { UserProvider } from "./context/user-context"
import './style.css'

export const App = () => (
  <UserProvider>
    <Suspense fallback={null}>
      <div className="page-container">
        <Router>
          <AppLayout />
          <NotificationContainer />
        </Router>
      </div>
    </Suspense>
  </UserProvider>
)
