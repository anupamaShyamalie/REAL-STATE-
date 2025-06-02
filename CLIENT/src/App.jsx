
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import ListPage from './pages/listPage/ListPage';
import SinglePage from './pages/singlePage/SinglePage';
import Home from './pages/homePage/HomePage'
import Layout from './pages/layout/Layout';
import Profile from "./pages/profilePage/Profile";
import NewPostPage from "./pages/newPostPage/NewPostPage";
import Login from "./pages/loginPage/Login";
import Register from "./pages/registerPage/Register";

function App() {
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children:[
       {
        path:"/",
        element:<Home/>
       },
       {
        path:"/list",
        element:<ListPage/>
       },
       {
        path:"/:id",
        element:<SinglePage/>
       },
       {
        path:"/profile",
        element:<Profile/>
       },
       {
        path:"/newpost",
        element:<NewPostPage/>
       },
       {
        path:"/login",
        element:<Login/>
       },
       {
        path:"/register",
        element:<Register/>
       },

      ]
    }
   
  ]);

  return (
    <>    
     <RouterProvider router={router} /> 
    </>
  )
}

export default App
