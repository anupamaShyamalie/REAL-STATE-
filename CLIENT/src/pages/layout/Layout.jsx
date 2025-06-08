
import { useContext, useEffect } from 'react'
import Navbar from '../../component/navbar/Navbar'
import './layout.scss'
import { Navigate, Outlet } from 'react-router'
import { AuthContext } from '../../context/AuthContext'

const Layout = () => {
  return (
    <div className='layout'>
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>


    </div>
  )
}

const RequireAuth = () => {

  const { currentUser } = useContext(AuthContext);

  // useEffect(() => {

  //   if (!currentUser) {
  //     return <Navigate to={"/login"} />
  //   }

  // }, [currentUser])

  return (
    !currentUser ?(
       <Navigate to={"/login"} />
    ):(
      <div className='layout'>
        <div className="navbar">
          <Navbar />
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    )
  )
}

export {Layout, RequireAuth}
export default Layout