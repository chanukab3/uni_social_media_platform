import Register from "./Register";
import ForgetPassword from './ForgetPassword';
function Login() {
    return ( 
        <>
        
         
        <Register/>
        <div className="main">
            <h2>Welcome to Mahagedara</h2>
        </div>
        <ForgetPassword/>
        </>
     );
}

export default Login;