import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import AuthForm from "../../components/Login/AuthForm";

function Register() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Register" />
      <AuthForm signup />
      </Container>
    );
}

export default Register;