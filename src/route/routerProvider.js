import React from "react";
import { createBrowserRouter } from "react-router-dom";

const NotFound = React.lazy(() => import("../pages/NotFound/NotFound"));

const Layout = React.lazy(() => import("../components/Layout/Layout"));
const Employees = React.lazy(() => import("../components/Employees/Employees"));
const Customers = React.lazy(() => import("../components/Customers/Customers"));
const Products = React.lazy(() => import("../components/Products/Products"));
const Reports = React.lazy(() => import("../components/Reports/Reports"));
const Consumptions = React.lazy(() => import("../components/Consumptions/Consumptions"));
const BuyingProducts = React.lazy(() => import("../components/BuyingProducts/BuyingProducts"));
const Sales = React.lazy(() => import("../components/Sales/Sales"));
const Dashboard = React.lazy(() => import("../components/Dashboard/Dashboard"));
const Home = React.lazy(() => import("../components/Home/Home"));
const Settings = React.lazy(() => import("../components/Settings/Settings"));

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/sales",
        element: <Sales />,
      },
      {
        path: "/buying-products",
        element: <BuyingProducts />,
      },
      {
        path: "/buying-products",
        element: <BuyingProducts />,
      },
      {
        path: "/consumptions",
        element: <Consumptions />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/employees",
        element: <Employees />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default browserRouter;