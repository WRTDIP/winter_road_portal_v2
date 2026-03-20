import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import ResendEmailValidationForm from "../../components/Login/ResendEmailValidationForm";

function ResendEmailValidation() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Resend Email Validation" />
      <ResendEmailValidationForm />
      </Container>
    );
}

export default ResendEmailValidation;