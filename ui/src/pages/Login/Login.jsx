import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import AuthForm from "../../components/Login/AuthForm";

function Login() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Login" />
      <AuthForm />
      </Container>
    );
}

export default Login;