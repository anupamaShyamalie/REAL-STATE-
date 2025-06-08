
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import ListPage from './pages/listPage/ListPage';
import SinglePage from './pages/singlePage/SinglePage';
import Home from './pages/homePage/HomePage'
import { Layout, RequireAuth } from './pages/layout/Layout';
import Profile from "./pages/profilePage/Profile";
import NewPostPage from "./pages/newPostPage/NewPostPage";
import Login from "./pages/loginPage/Login";
import Register from "./pages/registerPage/Register";
import ProfileUpdate from "./pages/profileUpdatePage/ProfileUpdate";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/list",
          element: <ListPage />
        },
        {
          path: "/:id",
          element: <SinglePage />
        },

       
        {
          path: "/login",
          element: <Login />
        },
        {
          path: "/register",
          element: <Register />
        },

      ]
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <Profile />
        },
        {
          path: "/profile/update",
          element: <ProfileUpdate />
        },
         {
          path: "/newpost",
          element: <NewPostPage />
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
