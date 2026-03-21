import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import RegisterForm from "../../components/Login/RegisterForm";

function Register() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Register" />
      <RegisterForm />
      </Container>
    );
}

export default Register;