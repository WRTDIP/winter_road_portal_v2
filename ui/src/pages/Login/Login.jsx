import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import AuthForm from "../../components/Login/AuthForm";

function Login() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner
        eyebrow="Account"
        title="Login"
        subtitle="Sign in to save data selections and use portal tools."
      />
      <AuthForm />
      </Container>
    );
}

export default Login;
