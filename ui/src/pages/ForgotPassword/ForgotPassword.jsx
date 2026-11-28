import { Container } from "react-bootstrap";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import ForgotPasswordForm from "../../components/Login/ForgotPasswordForm";

function ForgotPassword() {
  return (
    <Container className="p-0" fluid>
      <CoverBanner title="Forgot Password" />
      <ForgotPasswordForm />
    </Container>
  );
}

export default ForgotPassword;
