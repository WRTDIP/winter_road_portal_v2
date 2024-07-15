import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import LoginForm from "../../components/Login/Login";

function Login() {
    return (
      <Container className="p-0" fluid>
        <CoverBanner title="Login" />
        <LoginForm />
      </Container>
    );
}

export default Login;