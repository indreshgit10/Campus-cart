import { BrowserRouter, Routes, Route } from " react-router-dom\;
import Home from \./pages/Home\;
import Login from \./pages/Login\;
import Signup from \./pages/Signup\;
import Upload from \./pages/Upload\;
import Layout from \./components/layout/Layout\;

function App() {
 return (
 <BrowserRouter>
 <Layout>
 <Routes>
 <Route path=\/\ element={<Home />} />
 <Route path=\/login\ element={<Login />} />
 <Route path=\/signup\ element={<Signup />} />
 <Route path=\/upload\ element={<Upload />} />
 </Routes>
 </Layout>
 </BrowserRouter>
 );
}

export default App;
