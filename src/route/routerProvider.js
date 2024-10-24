import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AddEmployee from "../components/Employees/AddEmployee/AddEmployee";
import Employee from "../components/Employees/Employee/Employee";
import AddCustomer from "../components/Customers/AddCustomer";
import Customer from "../components/Customers/Customer/Customer";
import Product from "../components/Products/Product/Product";
import AddProduct from "../components/Products/AddProduct/AddProducts";
import AddPurchaseProducts from "../components/PurchaseProducts/AddPurchaseProducts/AddPurchaseProducts.tsx";
import AddSaleFactor from "../components/Sales/AddSaleFactor/AddSaleFactor.tsx";
import AddSaleFactorForUnknowCustomer from "../components/Sales/AddSaleFactor/AddSaleFactorForUnknowCustomer";
import { FactorType } from "../constants/FactorStatus";
import Depot from "../components/Depot/Depot.tsx";
import CustomerPaymentsForCustomer from "../components/Customers/CustomerPaymentForCustomer/CustomerPaymentsForCustomer.jsx";
import CustomerFactorsForCustomer from "../components/Customers/CustomerFactorsForCustomer/CustomerFactorsForCustomer.jsx";
import FactorPrintForUsers from "../components/Sales/FactorPrintForUsers/FactorPrintForUsers.jsx";
import CustomerFactorsForVisitor from "../components/Employees/CustomerFactorsForVisitor/CustomerFactorsForVisitor.tsx";
import EmployeePaymentsForEmployee from "../components/Employees/EmployeePaymentsForEmployee/EmployeePaymentsForEmployee.tsx";
import EmployeeCustomersForEmployee from "../components/Employees/EmployeeCustomersForEmployee/EmployeeCustomersForEmployee.jsx";
import EmployeeSalariesForEmployee from "../components/Employees/EmployeeSalariesForEmployee/EmployeeSalariesForEmployee.tsx";
import PersonalInformationForEmployee from "../components/Employees/PersonalInformationForEmployee/PersonalInformationForEmployee.tsx";
import PersonalInformationForCustomer from "../components/Customers/PeronsalInformationForCustomer/PersonalInformationForCustomer.jsx";
import AddConsumptions from "../components/Consumptions/AddConsumptions/AddConsumptions.tsx";
import Partners from "../components/Partners/Partners.tsx";
import AddPartner from "../components/Partners/AddPartner/AddPartner.tsx";
import Partner from "../components/Partners/Partner/Partner.tsx";
import Logs from "../components/Logs/Logs.tsx";
import Representations from "../components/Representations/Representations.tsx";
import AddRepresentor from "../components/Representations/AddRepresentor.tsx";
import Representor from "../components/Representations/Representor.tsx";
const NotFound = React.lazy(() => import("../pages/NotFound/NotFound"));


const Login = React.lazy(() => import("../components/Login/Login"));
const Layout = React.lazy(() => import("../components/Layout/Layout"));
const Employees = React.lazy(() => import("../components/Employees/Employees"));
const Customers = React.lazy(() => import("../components/Customers/Customers"));
const Products = React.lazy(() => import("../components/Products/Products"));
const Reports = React.lazy(() => import("../components/Reports/Reports"));
const Consumptions = React.lazy(() => import("../components/Consumptions/Consumptions"));
const PurchaseProducts = React.lazy(() => import("../components/PurchaseProducts/PurchaseProducts"));
const Sales = React.lazy(() => import("../components/Sales/Sales"));
const Dashboard = React.lazy(() => import("../components/Dashboard/Dashboard"));
const Home = React.lazy(() => import("../pages/Home/Home.jsx"));
const Settings = React.lazy(() => import("../components/Settings/Settings"));
const FilesManagement = React.lazy(() => import("../components/FilesManagement/FilesManagement.tsx"));



const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/Business-Management",
        element: <Home />
      },
      {
        path: "/login",
        element: <Login />,
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
        path: "/sales/add",
        element: <AddSaleFactor />,
      },
      {
        path: "/sales/add-custom",
        element: <AddSaleFactorForUnknowCustomer />,
      },

      {
        path: "/sales/" + FactorType.SUNDRY_FACTOR + "/:saleFactorId",
        element: <AddSaleFactorForUnknowCustomer updateMode={true} />,
      },

      {
        path: "/sales/:saleFactorId/update",
        element: <AddSaleFactor updateMode={true} />,
      },
      {
        path: "/sales/:saleFactorId",
        element: <AddSaleFactor updateMode={true} />,
      },



      {
        path: "/purchase-products",
        element: <PurchaseProducts />,
      },
      {
        path: "/purchase-products/add",
        element: <AddPurchaseProducts />,
      },
      {
        path: "/purchase-products/:purchaseProductId",
        element: <AddPurchaseProducts updateMode={true} />,
      },


      {
        path: "/consumptions",
        element: <Consumptions />,
      },
      {
        path: "/consumptions/add",
        element: <AddConsumptions />,
      },
      {
        path: "/depot",
        element: <Depot />,
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
        path: "/products/add",
        element: <AddProduct />,
      },

      {
        path: "/products/:productId",
        element: <Product />,
      },
      {
        path: "/products/:productId/update",
        element: <AddProduct updateMode={true} />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/customers/add",
        element: <AddCustomer />,
      },
      {
        path: "/customers/:customerId",
        element: <Customer />,
      },
      {
        path: "/customers/:customerId/update",
        element: <AddCustomer updateMode={true} />,
      },
      {
        path: "/partners",
        element: <Partners />,
      },
      {
        path: "/partners/add",
        element: <AddPartner />,
      },

      {
        path: "/partners/:partnerId/update",
        element: <AddPartner updateMode={true} />,
      },

      {
        path: "/partners/:partnerId",
        element: <Partner />,
      },

      {
        path: "/employees",
        element: <Employees />,
      },
      {
        path: "/employees/add",
        element: <AddEmployee />,
      },
      {
        path: "/employees/:employeeId/update",
        element: <AddEmployee updateMode={true} />,
      },
      {
        path: "/employees/:employeeId",
        element: <Employee />,
      },

      {
        path: "/files",
        element: <FilesManagement />,
      },

      {
        path: "/events",
        element: <Logs />,
      },
      {
        path: "/representations",
        element: <Representations />,
      },
      {
        path: "/representations/add",
        element: <AddRepresentor />,
      },
      {
        path: "/representations/:representorId/update",
        element: <AddRepresentor updateMode={true} />,
      },
      {
        path: "/representations/:representorId",
        element: <Representor />,
      },

      {
        path: "/settings",
        element: <Settings />,
      },

      // customer linkes
      {
        path: "/customer-payments",
        element: <CustomerPaymentsForCustomer />,
      },
      {
        path: "/customer-factors",
        element: <CustomerFactorsForCustomer />,
      },
      {
        path: "/customer-factors/print",
        element: <FactorPrintForUsers />,
      },

      {
        path: "/customer-information",
        element: <PersonalInformationForCustomer />,
      },



      // visitor link
      {
        path: "/visitor-receipts",
        element: <EmployeePaymentsForEmployee />,
      },
      {
        path: "/visitor-factors",
        element: <CustomerFactorsForVisitor />,
      },
      {
        path: "/visitor-factors/print",
        element: <FactorPrintForUsers />,
      },
      {
        path: "/visitor-customers",
        element: <EmployeeCustomersForEmployee />,
      },
      {
        path: "/visitor-salaries",
        element: <EmployeeSalariesForEmployee />,
      },
      {
        path: "/visitor-information",
        element: <PersonalInformationForEmployee />,
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default browserRouter;
